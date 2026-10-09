"""Shared report and integrity helpers. No learner code runs in the website."""
import hashlib
import json
import platform
import sys
from pathlib import Path
from datetime import datetime, timezone

ROOT = Path(__file__).resolve().parent.parent


def verify(folder):
    folder = Path(folder).resolve()
    manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
    for item in manifest['files']:
        target = (folder / item['path']).resolve()
        if not target.is_relative_to(folder) or hashlib.sha256(target.read_bytes()).hexdigest() != item['sha256']:
            raise ValueError('原始文件校验失败: ' + item['path'])
    return manifest


def report(lab, manifest, results, benchmark=None, mode='reference', notes=None, output=None):
    value = {'schemaVersion': 1, 'lab': lab, 'mode': mode, 'commit': manifest['commit'],
             'createdAt': datetime.now(timezone.utc).isoformat(), 'python': platform.python_version(),
             'platform': platform.platform(), 'upstreamChecksumsVerified': manifest.get('checksumsVerified', True),
             'passed': all(r['passed'] for r in results), 'results': results,
             'benchmark': benchmark or [], 'notes': notes or [],
             'limits': 'Local report, not independent certification. Learner code runs with user permissions.'}
    target = Path(output) if output else ROOT / 'artifacts' / (lab + '-report.json')
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({'lab': lab, 'passed': value['passed'], 'tests': sum(r.get('tests', 1) for r in results), 'report': str(target)}))
    return value


def run_safely(lab, upstream, main):
    """Turn setup/runtime failures into an explicit failed local report."""
    import sys
    try:
        if sys.version_info < (3, 10):
            raise RuntimeError('实验需要 Python 3.10 或更新版本。')
        if not __debug__:
            raise RuntimeError('禁止 -O / PYTHONOPTIMIZE：它会移除原测试的 assert 断言。')
        (ROOT / 'artifacts').mkdir(parents=True, exist_ok=True)
        return main()
    except Exception as error:
        manifest = {'commit':'pytorch-2.10.0+cu128-contract-v2' if lab == 'gpu' else 'unknown', 'checksumsVerified':False}
        if upstream:
            try:
                manifest['commit'] = json.loads((Path(upstream) / 'manifest.json').read_text(encoding='utf-8'))['commit']
            except (OSError, ValueError, KeyError):
                pass
        output = None
        if '--output' in sys.argv:
            index = sys.argv.index('--output') + 1
            if index < len(sys.argv): output = sys.argv[index]
        report(lab, manifest, [{'name':'setup-or-runtime-error','tests':1,'passed':False,'error':repr(error)}],
               mode='submission' if '--submission' in sys.argv else 'reference',output=output,
               notes=['准备或运行失败，没有完成原测试。请查看错误、环境诊断与对应实验指南。'])
        print(str(error), file=sys.stderr)
        return 1
