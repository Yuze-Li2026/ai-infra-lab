"""Run pinned DBDB tests through unittest with original assertions and fixture semantics."""
import argparse
import importlib
import importlib.util
import io
import os
from pathlib import Path
import sys
import shutil
import subprocess
import random
import statistics
import time
import tempfile
import types
import unittest
from unittest import mock
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import ROOT, verify, report, run_safely

UPSTREAM = Path(__file__).resolve().parent / 'upstream'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--submission', help='Directory containing independently implemented dbdb package')
    parser.add_argument('--output')
    args = parser.parse_args()
    manifest = verify(UPSTREAM)
    source = Path(tempfile.mkdtemp(prefix='dbdb-', dir=ROOT / 'artifacts'))
    original = Path(args.submission).resolve() / 'dbdb' if args.submission else UPSTREAM / 'dbdb'
    shutil.copytree(original, source / 'dbdb')
    physical = source / 'dbdb/physical.py'
    if physical.exists():
        physical.write_text(physical.read_text(encoding='utf-8').replace('import portalocker', 'from dbdb import _locking as portalocker'), encoding='utf-8')
    # Legacy portalocker 0.4 locked from offset zero. Modern msvcrt locking uses current offset.
    (source / 'dbdb/_locking.py').write_text('''import os
import portalocker
if os.name == "nt": portalocker.portalocker.LOCKER = portalocker.portalocker.Win32Locker
LOCK_EX = portalocker.LOCK_EX
def at_zero(function, file, *args):
    position = file.tell()
    try:
        if os.name == "nt": file.seek(0)
        return function(file, *args)
    finally: file.seek(position)
def lock(file, flags): return at_zero(portalocker.lock, file, flags)
def unlock(file): return at_zero(portalocker.unlock, file)
''', encoding='utf-8')
    sys.path.insert(0, str(source))
    os.environ['PYTHONPATH'] = str(source)
    os.environ['PATH'] = str(Path(sys.executable).parent) + os.pathsep + os.environ.get('PATH', '')
    # nose 1.x imports removed Python imp APIs. Only its two assertion aliases are needed.
    nose, tools = types.ModuleType('nose'), types.ModuleType('nose.tools')
    assertions = unittest.TestCase()
    tools.eq_, tools.assert_raises = assertions.assertEqual, assertions.assertRaises
    nose.tools = tools
    sys.modules['nose'], sys.modules['nose.tools'] = nose, tools
    suite = unittest.TestSuite()
    for path in sorted((UPSTREAM / 'dbdb/tests').glob('test_*.py')):
        spec = importlib.util.spec_from_file_location(path.stem, path)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        if hasattr(module, 'TestTool'):
            def tool(instance, *arguments):
                return subprocess.check_output([sys.executable, '-m', 'dbdb.tool', instance.tempfile_name] +
                    [x.decode('utf-8') if isinstance(x, bytes) else x for x in arguments], stderr=subprocess.STDOUT)
            module.TestTool._tool = tool
        if os.name == 'nt' and hasattr(module, 'TestStorage'):
            # Windows temp-file sharing/mandatory locking differs from POSIX. Read fixture
            # bytes through the same handle; persistence is separately checked after reopen.
            def contents(instance):
                instance.f.flush()
                position = instance.f.tell()
                try:
                    instance.f.seek(0)
                    return instance.f.read()
                finally:
                    instance.f.seek(position)
            module.TestStorage._get_f_contents = contents
        for name, cls in vars(module).items():
            if isinstance(cls, type) and name.startswith('Test'):
                for method in sorted(x for x in dir(cls) if x.startswith('test_')):
                    instance = cls()
                    suite.addTest(unittest.FunctionTestCase(getattr(instance, method),
                                  setUp=getattr(instance, 'setup', None), tearDown=getattr(instance, 'teardown', None),
                                  description=f'{path.stem}.{name}.{method}'))
    output = io.StringIO()
    result = unittest.TextTestRunner(stream=output, verbosity=2).run(suite)
    benchmark = []
    if result.wasSuccessful():
        import dbdb
        samples, reads, sizes = [], [], []
        keys = list(range(500)); random.Random(37).shuffle(keys)
        for iteration in range(8):
            path = source / ('benchmark-%d.db' % iteration)
            db = dbdb.connect(str(path)); start = time.perf_counter_ns()
            for key in keys: db[str(key)] = str(key * 3)
            db.commit(); db.close(); elapsed = time.perf_counter_ns()-start
            db = dbdb.connect(str(path)); start = time.perf_counter_ns()
            for key in keys: assert db[str(key)] == str(key * 3)
            read_elapsed = time.perf_counter_ns()-start; db.close()
            if iteration:
                samples.append(elapsed); reads.append(read_elapsed); sizes.append(path.stat().st_size)
        benchmark = [{'name':'500 shuffled inserts + commit + close','seed':37,'warmups':1,'samples_ns':samples,'median_ms':statistics.median(samples)/1e6,'file_bytes':sizes},
                     {'name':'500 reads after reopen; values checked','warmups':1,'samples_ns':reads,'median_ms':statistics.median(reads)/1e6}]
    data = report('dbdb', manifest, [{'name': 'upstream-suite', 'tests': result.testsRun, 'passed': result.wasSuccessful(),
                  'failures': len(result.failures), 'errors': len(result.errors), 'details': output.getvalue()}],
                  mode='submission' if args.submission else 'reference', output=args.output, benchmark=benchmark,
                  notes=['Original source and assertions preserved. nose eq_/assert_raises map to unittest assertions; setup/teardown fixtures are retained.',
                         'portalocker 4.4.0 replaces 0.4; Windows uses Win32Locker and zero-offset compatibility. Physical-test read helper uses the same file handle on Windows; assertions preserved. Submission files are copied, never modified.',
                         'CLI tests explicitly use the current Python executable and decode UTF-8 bytes arguments before process creation; original expected bytes and exit-code assertions preserved.',
                         'Teaching database: no production isolation, compaction or full power-loss durability guarantee.'])
    if not data['passed']:
        print(output.getvalue())
    return 0 if data['passed'] else 1


if __name__ == '__main__':
    sys.exit(run_safely('dbdb', UPSTREAM, main))
