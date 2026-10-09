"""Bounded single-GPU correctness, timing and checkpoint validation using PyTorch APIs."""
import argparse
import json
import os
from pathlib import Path
import platform
import statistics
import sys
import time
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import ROOT, report, run_safely


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--output')
    args = parser.parse_args()
    os.environ.setdefault('CUBLAS_WORKSPACE_CONFIG', ':4096:8')
    import torch
    if not torch.cuda.is_available():
        raise RuntimeError('CUDA 不可用；不把 CPU 运行冒充 GPU 验证。请查看环境诊断。')
    torch.manual_seed(2026)
    torch.set_num_threads(1)
    torch.backends.cuda.matmul.allow_tf32 = False
    torch.backends.cudnn.allow_tf32 = False
    torch.use_deterministic_algorithms(True)
    device = torch.device('cuda:0')
    results = []
    a, b = torch.randn(512,512), torch.randn(512,512)
    cpu = a @ b
    gpu = a.to(device) @ b.to(device)
    torch.cuda.synchronize()
    difference = (cpu-gpu.cpu()).abs().max().item()
    results.append({'name': 'fp32-matmul-correctness', 'tests': 1,
                    'passed': torch.allclose(cpu, gpu.cpu(), atol=1e-4, rtol=1e-4), 'maxAbsError': difference})
    x = torch.randn(32,8,requires_grad=True)
    target = x.detach().clone().to(device).requires_grad_(True)
    (x.square().sum()).backward()
    (target.square().sum()).backward()
    results.append({'name': 'autograd-cpu-gpu-comparison', 'tests': 1,
                    'passed': torch.allclose(x.grad, target.grad.cpu(), atol=1e-6, rtol=1e-6)})
    benchmarks = []
    for where in ['cpu', 'cuda']:
        left, right = a.to(where), b.to(where)
        samples = []
        for i in range(12):
            if where == 'cuda': torch.cuda.synchronize()
            start = time.perf_counter_ns()
            value = left @ right
            if where == 'cuda': torch.cuda.synchronize()
            elapsed = time.perf_counter_ns()-start
            if i >= 3: samples.append(elapsed)
        ordered = sorted(samples)
        benchmarks.append({'device': where, 'shape': [512,512,512], 'dtype': 'float32',
                           'warmups': 3, 'samples_ns': samples, 'median_ms': statistics.median(samples)/1e6,
                           'min_ms': min(samples)/1e6, 'max_ms': max(samples)/1e6,
                           'boundary': 'inputs already on device; Python dispatch and CUDA synchronization included'})
    inputs = torch.randn(64,4,device=device)
    labels = inputs @ torch.tensor([[1.],[-2.],[.5],[3.]],device=device)
    model = torch.nn.Sequential(torch.nn.Linear(4,16), torch.nn.Tanh(), torch.nn.Linear(16,1)).to(device)
    optimizer = torch.optim.Adam(model.parameters(), lr=.03)
    losses = []
    for step in range(150):
        optimizer.zero_grad(set_to_none=True)
        loss = torch.nn.functional.mse_loss(model(inputs),labels)
        loss.backward()
        optimizer.step()
        if step in [0,49,99,149]: losses.append({'step':step,'loss':loss.item()})
    results.append({'name':'small-model-training','tests':1,'passed':losses[-1]['loss']<losses[0]['loss']*.05,'losses':losses})
    checkpoint = ROOT / 'artifacts/gpu-checkpoint.pt'
    torch.save({'model':model.state_dict(),'optimizer':optimizer.state_dict(),'step':150},checkpoint)
    restored = torch.nn.Sequential(torch.nn.Linear(4,16), torch.nn.Tanh(), torch.nn.Linear(16,1)).to(device)
    restored_optimizer = torch.optim.Adam(restored.parameters(),lr=.03)
    state = torch.load(checkpoint,map_location=device,weights_only=True)
    restored.load_state_dict(state['model'])
    restored_optimizer.load_state_dict(state['optimizer'])
    with torch.no_grad(): equality=torch.equal(model(inputs),restored(inputs))
    for net,opt in [(model,optimizer),(restored,restored_optimizer)]:
        opt.zero_grad(set_to_none=True)
        torch.nn.functional.mse_loss(net(inputs),labels).backward()
        opt.step()
    results.append({'name':'checkpoint-and-exact-next-step','tests':1,
                    'passed':equality and all(torch.equal(a,b) for a,b in zip(model.parameters(),restored.parameters()))})
    # The source here is an integration harness based on public PyTorch APIs, not an upstream course test.
    data=report('gpu',{'commit':'pytorch-2.10.0+cu128','checksumsVerified':False},results,benchmark=benchmarks,output=args.output,
                notes=[f'{torch.cuda.get_device_name(0)}; capability {torch.cuda.get_device_capability(0)}; PyTorch {torch.__version__}; CUDA {torch.version.cuda}',
                       'All four checks are supplemental integration checks using PyTorch APIs. No claim of original-course grading.',
                       'Single GPU only. Does not establish multi-GPU scaling or industrial service performance.'])
    return 0 if data['passed'] else 1


if __name__=='__main__':
    sys.exit(run_safely('gpu', None, main))
