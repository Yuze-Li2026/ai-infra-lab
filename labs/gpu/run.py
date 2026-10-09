"""Evaluate the selected implementation against independent PyTorch oracles."""
import argparse
import hashlib
import importlib.util
import math
import os
from pathlib import Path
import statistics
import sys
import tempfile
import time
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import report, run_safely

INTERFACES = ['matmul', 'squared_gradient', 'build_model', 'build_optimizer', 'train_step',
              'save_checkpoint', 'load_checkpoint']

def state_equal(left, right, torch):
    if isinstance(left, torch.Tensor):
        # Adam's scalar step state may remain on CPU or be relocated by torch.load.
        return isinstance(right, torch.Tensor) and left.dtype==right.dtype and torch.equal(left.detach().cpu(), right.detach().cpu())
    if isinstance(left, dict):
        return isinstance(right, dict) and left.keys()==right.keys() and all(state_equal(left[k],right[k],torch) for k in left)
    if isinstance(left, (list,tuple)):
        return type(left)==type(right) and len(left)==len(right) and all(state_equal(a,b,torch) for a,b in zip(left,right))
    return left==right

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--submission', help='Python file implementing the seven documented interfaces')
    parser.add_argument('--output')
    args = parser.parse_args()
    os.environ.setdefault('CUBLAS_WORKSPACE_CONFIG', ':4096:8')
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError('CUDA 不可用；不把 CPU 运行冒充 GPU 验证。请查看环境诊断。')
    if str(torch.__version__) != '2.10.0+cu128':
        raise RuntimeError('本契约固定 PyTorch 2.10.0+cu128；请使用对应独立环境，勿把其他版本伪装为已核对版本。')
    path = Path(args.submission).resolve() if args.submission else Path(__file__).with_name('reference.py')
    spec = importlib.util.spec_from_file_location('gpu_implementation', path)
    implementation = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(implementation)
    for name in INTERFACES:
        if not callable(getattr(implementation, name, None)): raise ValueError('缺少实现接口：'+name)
    torch.manual_seed(2026)
    torch.set_num_threads(1)
    torch.backends.cuda.matmul.allow_tf32 = False
    torch.backends.cudnn.allow_tf32 = False
    torch.use_deterministic_algorithms(True)
    device = torch.device('cuda:0')
    results, benchmarks, trained = [], [], {}
    def check(name, tests, function):
        try:
            details = function()
            results.append({'name': name, 'tests': tests, 'passed': True, **(details or {})})
        except Exception as error:
            results.append({'name': name, 'tests': tests, 'passed': False, 'error': repr(error)})
    def products():
        differences = []
        for m, k, n in [(1, 3, 2), (17, 31, 9), (512, 512, 512)]:
            a, b = torch.randn(m, k), torch.randn(k, n)
            left, right = a.to(device), b.to(device)
            before_left, before_right = left.clone(), right.clone()
            actual = implementation.matmul(left, right)
            assert isinstance(actual, torch.Tensor) and actual.device == device and actual.dtype == torch.float32
            assert actual.shape == (m, n) and torch.allclose(a @ b, actual.cpu(), atol=1e-4, rtol=1e-4)
            assert torch.equal(left, before_left) and torch.equal(right, before_right), 'inputs mutated'
            differences.append({'shape': [m, k, n], 'maxAbsError': ((a @ b)-actual.cpu()).abs().max().item()})
        return {'cases': differences}
    def gradients():
        for shape in [(32, 8), (3, 5, 7)]:
            cpu = torch.randn(*shape, requires_grad=True)
            cpu.square().sum().backward()
            inputs = cpu.detach().to(device); before = inputs.clone()
            actual = implementation.squared_gradient(inputs)
            assert isinstance(actual, torch.Tensor) and actual.device == device and actual.dtype == torch.float32
            assert actual.shape == cpu.shape and torch.allclose(cpu.grad, actual.cpu(), atol=1e-6, rtol=1e-6)
            assert torch.equal(inputs, before), 'inputs mutated'
    inputs = torch.randn(64, 4, device=device)
    labels = inputs @ torch.tensor([[1.], [-2.], [.5], [3.]], device=device)
    def training():
        model = implementation.build_model(device)
        assert isinstance(model, torch.nn.Module)
        assert all(p.device==device and p.dtype==torch.float32 for p in model.parameters()), 'model parameters must be CUDA FP32'
        optimizer = implementation.build_optimizer(model)
        assert isinstance(optimizer, torch.optim.Optimizer)
        assert {id(p) for g in optimizer.param_groups for p in g['params']} == {id(p) for p in model.parameters()}
        with torch.no_grad(): initial = torch.nn.functional.mse_loss(model(inputs), labels).item()
        losses = []
        for step in range(150):
            value = float(implementation.train_step(model, optimizer, inputs, labels))
            assert math.isfinite(value), 'non-finite loss'
            if step in [0, 49, 99, 149]: losses.append({'step': step, 'loss': value})
        with torch.no_grad():
            actual = model(inputs)
            assert actual.shape == labels.shape
            final = torch.nn.functional.mse_loss(actual, labels).item()
        assert math.isfinite(final) and final < initial*.05, 'reported loss does not establish convergence'
        trained.update(model=model, optimizer=optimizer)
        return {'initialLoss': initial, 'finalLoss': final, 'losses': losses}
    def checkpoint():
        if not trained: raise RuntimeError('训练失败，无法执行恢复验收。')
        model, optimizer = trained['model'], trained['optimizer']
        with tempfile.TemporaryDirectory(prefix='ai-infra-gpu-') as directory:
            path = Path(directory)/'checkpoint.pt'
            implementation.save_checkpoint(path, model, optimizer, 150)
            assert path.is_file() and path.stat().st_size > 0
            cpu_rng, gpu_rng = torch.get_rng_state().clone(), torch.cuda.get_rng_state().clone()
            restored = implementation.build_model(device)
            restored_optimizer = implementation.build_optimizer(restored)
            for group in restored_optimizer.param_groups: group['lr'] *= .37
            torch.rand(19); torch.rand(19, device=device)
            assert implementation.load_checkpoint(path, restored, restored_optimizer, device) == 150
            assert torch.equal(torch.get_rng_state(), cpu_rng) and torch.equal(torch.cuda.get_rng_state(), gpu_rng), 'RNG not restored'
            assert state_equal(optimizer.state_dict(),restored_optimizer.state_dict(),torch), 'optimizer state/hyperparameters not restored'
            with torch.no_grad(): assert torch.equal(model(inputs), restored(inputs)), 'prediction differs'
            saved_cpu, saved_gpu = torch.get_rng_state(), torch.cuda.get_rng_state_all()
            implementation.train_step(model, optimizer, inputs, labels)
            torch.set_rng_state(saved_cpu); torch.cuda.set_rng_state_all(saved_gpu)
            implementation.train_step(restored, restored_optimizer, inputs, labels)
            left, right = model.state_dict(), restored.state_dict()
            assert left.keys() == right.keys() and all(torch.equal(left[k], right[k]) for k in left), 'next step differs; check optimizer/RNG'
    check('fp32-matmul-correctness', 3, products)
    check('autograd-cpu-gpu-comparison', 2, gradients)
    check('small-model-training', 1, training)
    check('checkpoint-and-exact-next-step', 1, checkpoint)
    if results[0]['passed']:
        a, b = torch.randn(512, 512), torch.randn(512, 512)
        for where in ['cpu', 'cuda']:
            left, right = a.to(where), b.to(where); samples = []
            for i in range(12):
                if where == 'cuda': torch.cuda.synchronize()
                start = time.perf_counter_ns()
                value = left @ right if where == 'cpu' else implementation.matmul(left, right)
                if where == 'cuda': torch.cuda.synchronize()
                elapsed = time.perf_counter_ns()-start
                if i >= 3: samples.append(elapsed)
            benchmarks.append({'device': where, 'shape': [512, 512, 512], 'dtype': 'float32',
                               'warmups': 3, 'samples_ns': samples, 'median_ms': statistics.median(samples)/1e6,
                               'boundary': 'inputs resident on device; Python dispatch and CUDA synchronization included'})
    data = report('gpu', {'commit': 'pytorch-2.10.0+cu128-contract-v2', 'checksumsVerified': False}, results,
                  mode='submission' if args.submission else 'reference', benchmark=benchmarks, output=args.output,
                  notes=[f'{torch.cuda.get_device_name(0)}; PyTorch {torch.__version__}; CUDA {torch.version.cuda}',
                         'Implementation SHA-256: '+hashlib.sha256(path.read_bytes()).hexdigest(),
                         'File execution is not proof of independent authorship. Supplemental checks, not course grading.',
                         'Single GPU bounded workload; does not establish industrial service or multi-GPU scaling.'])
    return 0 if data['passed'] else 1

if __name__ == '__main__':
    sys.exit(run_safely('gpu', None, main))
