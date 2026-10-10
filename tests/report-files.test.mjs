import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {mkdir,mkdtemp,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {runProcess} from '../scripts/process.mjs';

test('empty checks cannot pass and an interrupted report replacement preserves the last valid report',async()=>{
 const local=resolve('.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
 const python=process.env.LAB_TEST_PYTHON||(existsSync(local)?local:process.platform==='win32'?'python':'python3');
 await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/report-file-'));
 const script=join(folder,'check.py');
 await writeFile(script,`import json,sys\nfrom pathlib import Path\nfrom unittest.mock import patch\nsys.path.insert(0,sys.argv[1])\nfrom common import report, atomic_json\nfolder=Path(sys.argv[2]); output=folder/'report.json'\nfor results in [[],[{'passed':True,'tests':0}]]:\n    assert report('test',{'commit':'test'},results,output=output)['passed'] is False\nreport('test',{'commit':'test'},[{'passed':True,'tests':1}],output=output)\noriginal=output.read_bytes()\nfor failure in ['replace','serialization']:\n    try:\n        if failure=='replace':\n            with patch('common.os.replace',side_effect=PermissionError('write interrupted')):\n                atomic_json(output,{'passed':False})\n        else:\n            atomic_json(output,{'bad':float('nan')})\n        raise AssertionError('failure was swallowed')\n    except (PermissionError,ValueError):\n        pass\n    assert output.read_bytes()==original\n    assert not list(folder.glob('*.tmp'))\nassert json.loads(output.read_text())['passed'] is True\nprint('previous complete report preserved')\n`);
 const result=await runProcess(python,[script,resolve('labs'),folder],{timeout:15000});
 assert.equal(result.code,0,result.stderr);assert.match(result.stdout,/previous complete report preserved/);
});

test('atomic reports retry bounded Windows sharing failures without removing the old file',async()=>{
 const local=resolve('.venv-labs',process.platform==='win32'?'Scripts/python.exe':'bin/python');
 const python=process.env.LAB_TEST_PYTHON||(existsSync(local)?local:'python');
 await mkdir('artifacts',{recursive:true});const folder=await mkdtemp(resolve('artifacts/report-sharing-'));
 const script=join(folder,'check.py');
 await writeFile(script,`import json,sys,os
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,sys.argv[1])
from common import atomic_json
folder=Path(sys.argv[2]); output=folder/'report.json'
atomic_json(output,{'version':1}); original=output.read_bytes()
real_replace=os.replace
def denied():
 error=PermissionError('sharing violation'); error.winerror=32; return error
calls=[]
def transient(source,target):
 calls.append(1)
 assert output.read_bytes()==original
 if len(calls)<3: raise denied()
 return real_replace(source,target)
with patch('common.sys.platform','win32'),patch('common.os.replace',side_effect=transient),patch('common.time.sleep') as sleep:
 atomic_json(output,{'version':2})
 assert len(calls)==3 and sleep.call_count==2
assert json.loads(output.read_text())['version']==2
original=output.read_bytes()
with patch('common.sys.platform','win32'),patch('common.os.replace',side_effect=denied()) as replace,patch('common.time.sleep') as sleep:
 try: atomic_json(output,{'version':3})
 except PermissionError: pass
 else: raise AssertionError('persistent write failure was swallowed')
 assert replace.call_count==6 and sleep.call_count==5
assert output.read_bytes()==original and not list(folder.glob('*.tmp'))
if os.name=='nt':
 import ctypes,threading
 from ctypes import wintypes
 kernel=ctypes.WinDLL('kernel32',use_last_error=True)
 kernel.CreateFileW.argtypes=[wintypes.LPCWSTR,wintypes.DWORD,wintypes.DWORD,wintypes.LPVOID,wintypes.DWORD,wintypes.DWORD,wintypes.HANDLE]
 kernel.CreateFileW.restype=wintypes.HANDLE
 kernel.CloseHandle.argtypes=[wintypes.HANDLE]; kernel.CloseHandle.restype=wintypes.BOOL
 handle=kernel.CreateFileW(str(output),0x80000000,1,None,3,0,None)
 assert handle not in (None,ctypes.c_void_p(-1).value)
 timer=threading.Timer(0.1,lambda:kernel.CloseHandle(handle)); timer.start()
 try: atomic_json(output,{'version':4})
 finally: timer.join()
 assert json.loads(output.read_text())['version']==4
print('bounded retry and prior report retention verified')
`);
 const result=await runProcess(python,[script,resolve('labs'),folder],{timeout:15000});
 assert.equal(result.code,0,result.stderr);assert.match(result.stdout,/bounded retry/);
});
