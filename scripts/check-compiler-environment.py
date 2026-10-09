"""Compile actual MLIR through IREE's LLVM CPU backend and execute its artifact."""
from datetime import datetime, timezone
import hashlib
from importlib.metadata import version
import json
from pathlib import Path
import platform
import uuid

ROOT = Path(__file__).resolve().parents[1]


def main():
    if not __debug__:
        raise RuntimeError('Verification requires assertions; do not use -O')
    folder = ROOT / 'artifacts' / ('compiler-' + uuid.uuid4().hex)
    folder.mkdir(parents=True)
    result = {'passed': False, 'checks': [], 'checkedAt': datetime.now(timezone.utc).isoformat(),
              'environment': platform.platform(), 'backend': 'llvm-cpu', 'gpuVerified': False,
              'limits': 'CPU compiler/runtime integration; not the complete MLIR Toy course or a GPU backend.'}
    try:
        import numpy as np
        from iree.compiler.tools import compile_str
        from iree import runtime
        result['packages'] = {name: version(name) for name in ['iree-base-compiler', 'iree-base-runtime', 'numpy']}
        source = (ROOT / 'labs/compiler-validation/matmul.mlir').read_text()
        compiled = compile_str(source, target_backends=['llvm-cpu'], extra_args=['--iree-llvmcpu-target-cpu=generic'])
        artifact = folder / 'matmul.vmfb'
        artifact.write_bytes(compiled)
        result['artifactSha256'] = hashlib.sha256(artifact.read_bytes()).hexdigest()
        config = runtime.Config('local-task')
        context = runtime.SystemContext(config=config)
        module = runtime.VmModule.copy_buffer(context.instance, artifact.read_bytes())
        context.add_vm_module(module)
        function = context.modules.matrix['matmul']
        errors = []
        for seed in range(5):
            generator = np.random.default_rng(seed)
            a = generator.normal(size=(8, 16)).astype(np.float32)
            b = generator.normal(size=(16, 4)).astype(np.float32)
            expected, actual = a @ b, function(a, b).to_host()
            np.testing.assert_allclose(actual, expected, rtol=1e-5, atol=1e-5)
            errors.append(float(np.max(np.abs(actual - expected))))
        zero = np.zeros((8, 16), dtype=np.float32)
        np.testing.assert_array_equal(function(zero, b).to_host(), np.zeros((8, 4), dtype=np.float32))
        result['maxAbsoluteErrors'] = errors
        result['checks'].append('MLIR compiles to a persisted LLVM CPU artifact; five independent NumPy oracles and zero input agree')
        try:
            function(np.zeros((7, 16), dtype=np.float32), b).to_host()
            raise AssertionError('Runtime accepted an incompatible tensor shape')
        except (ValueError, RuntimeError):
            result['checks'].append('runtime rejects the wrong input shape')
        try:
            compile_str(source.replace('linalg.matmul', 'linalg.no_such_operation'), target_backends=['llvm-cpu'])
            raise AssertionError('Compiler accepted invalid IR')
        except Exception as error:
            if isinstance(error, AssertionError):
                raise
            assert 'no_such_operation' in str(error)
            result['checks'].append('compiler rejects an invalid operation with a diagnostic')
        # Reload bytes in a fresh context to exercise artifact reuse rather than only in-memory execution.
        restored = runtime.SystemContext(config=runtime.Config('local-task'))
        restored.add_vm_module(runtime.VmModule.copy_buffer(restored.instance, artifact.read_bytes()))
        np.testing.assert_allclose(restored.modules.matrix['matmul'](a, b).to_host(), a @ b, rtol=1e-5, atol=1e-5)
        result['checks'].append('saved artifact reloads and executes in a fresh runtime context')
        result['passed'] = True
    except BaseException as error:
        result['error'] = str(error)
        raise
    finally:
        (ROOT / 'artifacts/compiler-results.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result))


if __name__ == '__main__':
    main()
