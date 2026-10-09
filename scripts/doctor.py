"""Read-only environment diagnosis; no install or driver changes."""
import importlib.metadata
import json
import platform
import shutil
import sys
from pathlib import Path
data = {'python':platform.python_version(),'executable':sys.executable,'pythonSupported':sys.version_info >= (3,10),
        'tools':{name:shutil.which(name) for name in ['node','git','gcc','go','docker','nvidia-smi']},'packages':{}}
for name in ['fissix','portalocker','torch','numpy','pywin32']:
    try: data['packages'][name]=importlib.metadata.version(name)
    except importlib.metadata.PackageNotFoundError: data['packages'][name]=None
try:
    import torch
    data['gpu']={'cudaAvailable':torch.cuda.is_available(),'cuda':torch.version.cuda,
                 'name':torch.cuda.get_device_name(0) if torch.cuda.is_available() else None}
except ImportError: data['gpu']={'cudaAvailable':False,'reason':'未安装可选 PyTorch'}
print(json.dumps(data,ensure_ascii=False,indent=2))
if '--output' in sys.argv:
    output=Path(sys.argv[sys.argv.index('--output')+1]);output.parent.mkdir(parents=True,exist_ok=True)
    output.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
sys.exit(0 if data['pythonSupported'] else 1)
