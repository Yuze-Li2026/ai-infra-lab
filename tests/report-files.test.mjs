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
