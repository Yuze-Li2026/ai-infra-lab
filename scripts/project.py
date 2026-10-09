"""Prepare pinned original-course workspaces and run their actual checks.

No solutions, dependency installation, grader submissions or cloud operations.
"""
import argparse
import ast
from datetime import datetime, timezone
import hashlib
import io
import json
import os
import re
from pathlib import Path
import shutil
import stat
import subprocess
import sys
import tempfile
import urllib.request
import zipfile
import xml.etree.ElementTree as ET
from uuid import uuid4

sys.path.insert(0, str(Path(__file__).resolve().parent))
from mapreduce_check import check_mapreduce
from processes import run as bounded_run

ROOT = Path(__file__).resolve().parent.parent
MAX_ARCHIVE = 32*1024*1024

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def unpack(data, target):
    """Preflight every member before writing, retaining original source content."""
    with zipfile.ZipFile(io.BytesIO(data)) as archive:
        files, total, names = [], 0, set()
        for item in archive.infolist():
            parts = item.filename.split('/')
            if len(parts) < 2 or item.is_dir(): continue
            parts = parts[1:]
            if any(not p or p in ['.', '..'] or ':' in p or '\\' in p for p in parts):
                raise ValueError('不安全的归档路径')
            relative = Path(*parts)
            destination = (target/relative).resolve()
            mode = item.external_attr >> 16
            if not destination.is_relative_to(target) or stat.S_ISLNK(mode): raise ValueError('拒绝归档链接/越界文件')
            if str(relative).casefold() in names: raise ValueError('归档含重复文件')
            names.add(str(relative).casefold()); total += item.file_size
            if total > 96*1024*1024: raise ValueError('归档解压体积超过预算')
            files.append((item, destination, mode))
        if not files: raise ValueError('空归档')
        for item, destination, mode in files:
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_bytes(archive.read(item))
            if os.name != 'nt': destination.chmod(mode & 0o777 or 0o644)

def fetch(url, expected_size):
    request = urllib.request.Request(url, headers={'User-Agent':'AI-Infra-Lab-course-integration'})
    with urllib.request.urlopen(request, timeout=60) as response:
        data = response.read(min(MAX_ARCHIVE, expected_size)+1)
    if len(data) != expected_size: raise ValueError('下载体积与固定版本不一致；请检查网络，不使用不完整源码。')
    return data

def source_lock(profile, folder):
    # Editable CS336 adapters connect student code; the remaining original tests are immutable.
    tests = {p.relative_to(folder).as_posix():sha(p) for p in folder.rglob('*')
             if p.is_file() and ('tests' in p.relative_to(folder).parts or p.name.endswith('_test.go')) and p.name != 'adapters.py'}
    if profile['kind']=='files':
        tests.update({item['path']:sha(folder/item['path']) for item in profile['files']})
    return {'schemaVersion':1, 'commit':profile['commit'], 'source':profile['url'],
            'archiveSha256':profile.get('sha256'), 'originalTests':tests,
            'scope':'Original starter only. Acquisition is not assignment completion.'}

def prepare(profile, folder, args):
    if folder.exists(): raise ValueError('工作目录已存在，拒绝覆盖作品。请使用 check 或选择一个新的 --directory。')
    folder.parent.mkdir(parents=True, exist_ok=True)
    # Preparation commits only after the entire source has been validated.
    with tempfile.TemporaryDirectory(prefix='course-prepare-', dir=folder.parent) as temporary:
        stage = Path(temporary)/'source'; stage.mkdir()
        if profile['kind'] == 'self-designed':
            (stage/'README.md').write_text('# 我的 CS50 Python 最终项目\n\n填写真实问题、设计、安装、运行、测试和演示。\n', encoding='utf-8')
            (stage/'project.py').write_text('"""自行设计 main 和至少三个额外函数；不得复制课程答案。"""\n\ndef main():\n    raise NotImplementedError("请实现自己的项目")\n\nif __name__ == "__main__":\n    main()\n', encoding='utf-8')
            (stage/'test_project.py').write_text('def test_project_is_implemented():\n    raise NotImplementedError("请为自己的至少三个函数编写行为与边界测试")\n', encoding='utf-8')
            (stage/'requirements.txt').write_text('pytest==9.0.2\n', encoding='utf-8')
        elif profile['kind'] == 'git':
            stage.rmdir()
            bounded_run(['git','clone',profile['url'],str(stage)], check=True, timeout=120)
            bounded_run(['git','checkout','--detach',profile['commit']],cwd=stage,check=True,timeout=30)
            actual = subprocess.check_output(['git','rev-parse','HEAD'],cwd=stage,text=True).strip()
            if actual != profile['commit']: raise ValueError('上游提交不匹配')
        elif profile['kind'] == 'files':
            for item in profile['files']:
                data = fetch(profile['url']+'/'+item['path'], item['bytes'])
                blob = hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
                if blob != item['blob']: raise ValueError('上游文件哈希不匹配：'+item['path'])
                (stage/item['path']).write_bytes(data)
        else:
            data = Path(args.archive).read_bytes() if args.archive else fetch(profile['url'], profile['bytes'])
            if len(data)>MAX_ARCHIVE or hashlib.sha256(data).hexdigest() != profile['sha256']:
                raise ValueError('归档 SHA-256 不匹配；拒绝使用或解压。')
            unpack(data, stage.resolve())
        lock = source_lock(profile, stage)
        (stage/'.project-source.json').write_text(json.dumps(lock, ensure_ascii=False, indent=2)+'\n', encoding='utf-8')
        stage.rename(folder)
    print(json.dumps({'prepared':True,'directory':str(folder),'commit':profile['commit'],
                      'next':'阅读专用指南，创建该课程自己的环境，再独立实现并运行 check。'},ensure_ascii=False))

def course_check(key, profile, folder, args):
    now = datetime.now(timezone.utc).isoformat()
    target = Path(args.output) if args.output else ROOT/'artifacts'/('course-'+key+'-'+datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%S%f')+'.json')
    target.parent.mkdir(parents=True, exist_ok=True)
    evidence = target.parent/(target.stem+'-'+uuid4().hex)
    log = evidence.with_suffix('.log'); junit = evidence.with_suffix('.xml')
    results = []
    try:
        lock = json.loads((folder/'.project-source.json').read_text(encoding='utf-8'))
        if lock['commit'] != profile['commit']: raise ValueError('课程版本不匹配。')
        for path, expected in lock['originalTests'].items():
            source = (folder/path).resolve()
            if not source.is_relative_to(folder) or sha(source) != expected: raise ValueError('原测试已变化：'+path)
        if profile['kind']=='files':
            for item in profile['files']:
                content=(folder/item['path']).read_bytes()
                blob=hashlib.sha1(b'blob '+str(len(content)).encode()+b'\0'+content).hexdigest()
                if blob!=item['blob']: raise ValueError('原 API/要求已变化：'+item['path'])
        local = folder/'.venv'/('Scripts/python.exe' if os.name=='nt' else 'bin/python')
        python = args.python or (str(local) if local.is_file() else None)
        environment = {**os.environ,'PYTHONOPTIMIZE':'','PYTHONDONTWRITEBYTECODE':'1'}
        environment.pop('PYTEST_ADDOPTS',None)
        if profile['kind'] == 'self-designed':
            module = ast.parse((folder/'project.py').read_text(encoding='utf-8-sig'))
            functions = {n.name for n in module.body if isinstance(n, (ast.FunctionDef,ast.AsyncFunctionDef))}
            tests = ast.parse((folder/'test_project.py').read_text(encoding='utf-8-sig'))
            test_functions = {n.name for n in tests.body if isinstance(n,ast.FunctionDef)}
            eligible = [name for name in functions if name != 'main' and 'test_'+name in test_functions]
            valid = 'main' in functions and len(eligible)>=3 and (folder/'README.md').is_file() and (folder/'requirements.txt').is_file()
            results.append({'name':'project-structure-supplement','tests':1,'passed':valid,'testedFunctions':eligible})
            if not valid: raise ValueError('原题结构尚未齐备：main、至少三个额外函数及同名 test_ 测试、README 和 requirements.txt。')
        if profile['kind'] in ['pytest','self-designed']:
            if not python: raise ValueError('尚未创建该课程自己的 .venv。按指南安装小型依赖，或用 --python 指定已有课程解释器。')
            environment['PYTHONPATH'] = os.pathsep.join(str(folder/p) for p in profile.get('pythonPath', []))
            command = [python,'-m','pytest',profile['testDirectory'],'-o','addopts=','--junitxml='+str(junit)]
        elif profile['kind']=='uv':
            if not local.is_file(): raise ValueError('尚未完成原课 uv sync --frozen；check 不自动安装大规模依赖。')
            # Execute exactly the environment prepared by uv; no implicit Python/dependency downloads.
            command = [str(local),'-m','pytest',profile['testDirectory'],'-o','addopts=','--junitxml='+str(junit)]
        elif profile['kind']=='git':
            if sys.platform=='win32': raise ValueError('原课要求 Linux/WSL2；原生 Windows 不满足此实验条件。')
            if not all(shutil.which(name) for name in ['go','make','gcc']): raise ValueError('缺少 Go、make 或 C 编译器；请按原课环境页准备。')
            command = ['make','raft1','RUN=','RACE=-race','VERB=-v']
        elif profile['kind']=='files':
            results.extend(check_mapreduce(folder, ROOT, log))
            command = None
        else:
            raise ValueError('未知课程执行类型。')
        if command is None:
            run = None
        else:
            with log.open('w',encoding='utf-8') as output:
                run = bounded_run(command,cwd=folder/profile['testDirectory'] if profile['kind']=='git' else folder,
                                     env=environment,stdout=output,stderr=subprocess.STDOUT,timeout=600)
        if junit.is_file():
            cases = ET.parse(junit).getroot().findall('.//testcase')
            skipped = sum(c.find('skipped') is not None for c in cases)
            failures = sum(c.find('failure') is not None or c.find('error') is not None for c in cases)
            results.append({'name':'original-course-suite' if profile['kind']!='self-designed' else 'learner-project-tests',
                            'tests':len(cases),'passed':run.returncode==0 and bool(cases) and skipped==0 and failures==0,
                            'skipped':skipped,'failures':failures,'exitCode':run.returncode})
        elif profile['kind']=='git' and run:
            text = log.read_text(encoding='utf-8', errors='replace')
            passed_names = re.findall(r'^--- PASS: (Test\S+)',text,re.MULTILINE)
            results.append({'name':'original-raft1-make-target','tests':len(set(passed_names)),
                            'passed':run.returncode==0 and bool(passed_names),'exitCode':run.returncode})
        elif run:
            results.append({'name':'original-course-command','tests':0,'passed':False,'exitCode':run.returncode,
                            'note':'保留原始日志；没有机器可核对的完整测试范围，不标记为验收通过。'})
    except Exception as error:
        results.append({'name':'preparation-or-runtime-error','tests':0,'passed':False,'error':str(error)})
    data = {'schemaVersion':1,'kind':'course-execution','project':key,'commit':profile['commit'],
            'createdAt':now,'passed':bool(results) and all(r['passed'] for r in results),'results':results,
            'log':str(log) if log.exists() else None,'junit':str(junit) if junit.exists() else None,
            'limits':'课程执行记录。不是官方评分、能力认证或本站六项实验的导入报告。'}
    target.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({**data,'report':str(target)},ensure_ascii=False))
    return 0 if data['passed'] else 1

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('project', choices=['python-project','needle','systems','raft','ostep-project'])
    parser.add_argument('action', choices=['plan','prepare','check'])
    parser.add_argument('--part')
    parser.add_argument('--directory'); parser.add_argument('--archive'); parser.add_argument('--python'); parser.add_argument('--output')
    args = parser.parse_args()
    if sys.version_info < (3,10): parser.error('需要 Python 3.10+。')
    key = args.project
    if key == 'needle': key += '-'+(args.part or 'hw0')
    elif key == 'systems': key += '-'+(args.part or 'a1')
    elif args.part: parser.error('这个项目不支持 --part。')
    config = json.loads((ROOT/'labs/projects.json').read_text(encoding='utf-8'))
    if key not in config['profiles']: parser.error('未知原课部分。Needle: hw0/hw1/hw2；CS336: a1/a2。')
    profile = config['profiles'][key]
    if args.archive and (args.action!='prepare' or profile['kind'] not in ['pytest','uv']):
        parser.error('--archive 只用于固定归档课程的 prepare。')
    if args.python and (args.action!='check' or profile['kind'] not in ['pytest','self-designed']):
        parser.error('--python 只用于 Python 本地课程的 check；CS336 使用自己准备的 .venv。')
    if args.output and args.action!='check': parser.error('--output 只用于 check 执行记录。')
    folder = Path(args.directory).resolve() if args.directory else ROOT/'workspaces'/key
    if args.action == 'plan':
        print(json.dumps({'project':key,'directory':str(folder),**profile,
                          'limits':'不安装、不下载、不评分。prepare 仅准备固定原课起始源码。'},ensure_ascii=False,indent=2)); return 0
    if args.action == 'prepare':
        prepare(profile,folder,args); return 0
    return course_check(key,profile,folder,args)

if __name__=='__main__':
    try: sys.exit(main())
    except Exception as error:
        print('课程工具失败：'+str(error),file=sys.stderr); sys.exit(1)
