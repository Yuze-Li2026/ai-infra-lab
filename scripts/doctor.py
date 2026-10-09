"""Read-only diagnostics. Never install packages or change driver/system settings."""
import argparse
import importlib
import json
from pathlib import Path
import platform
import shutil
import sys

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', help='Write the diagnosis to a JSON file')
    args = parser.parse_args()
    supported = sys.version_info >= (3, 10)
    data = {'python': platform.python_version(), 'pythonExecutable': sys.executable,
            'pythonSupported': supported, 'platform': platform.platform(),
            'tools': {name: shutil.which(name) for name in ['node', 'git', 'gcc', 'go', 'docker', 'uv', 'nvidia-smi']},
            'packages': {}, 'cudaAvailable': False, 'gpu': None, 'errors': []}
    loaded = {'torch':False, 'portalocker':False, 'fissix':False}
    if supported:
        from importlib import metadata
        for name in ['fissix', 'portalocker', 'torch', 'numpy', 'pywin32', 'pytest']:
            try: data['packages'][name] = metadata.version(name)
            except metadata.PackageNotFoundError: data['packages'][name] = None
        for name in ['portalocker','fissix']:
            if data['packages'].get(name):
                try: importlib.import_module(name); loaded[name]=True
                except Exception as error: data['errors'].append(name+' 未能加载：'+repr(error))
        try:
            import torch
            loaded['torch']=True
            data['cudaAvailable'] = torch.cuda.is_available()
            data['gpu'] = torch.cuda.get_device_name(0) if data['cudaAvailable'] else None
            data['torchCudaRuntime'] = torch.version.cuda
            data['gpuContractVersionSupported']=str(torch.__version__)=='2.10.0+cu128'
        except Exception as error:
            data['errors'].append('PyTorch 未能加载：'+repr(error))
    else:
        data['errors'].append('实验需要 Python 3.10+；建议使用独立 Python 3.12 环境。')
    data['labs'] = {
        'indoor': supported, 'object-model': supported,
        'dbdb': supported and loaded['portalocker'],
        'consensus': supported and loaded['fissix'],
        'micrograd': supported and loaded['torch'],
        'gpu': supported and data['cudaAvailable'] and data.get('gpuContractVersionSupported',False)}
    print(json.dumps(data, ensure_ascii=False, indent=2))
    if args.output:
        target = Path(args.output); target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(json.dumps(data, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
    return 0 if supported else 1

if __name__ == '__main__':
    sys.exit(main())
