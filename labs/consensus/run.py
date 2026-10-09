"""Run the AOSA consensus functional suite after explicit Python 3 compatibility conversion."""
import argparse
import time
import statistics
import difflib
import io
import os
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import ROOT, verify, report, run_safely

UPSTREAM = Path(__file__).resolve().parent / 'upstream'


def prepare(target):
    from fissix.refactor import RefactoringTool, get_fixers_from_package
    converter = RefactoringTool(get_fixers_from_package('fissix.fixes'))
    differences = []
    for source in UPSTREAM.rglob('*.py'):
        relative = source.relative_to(UPSTREAM)
        original = source.read_text(encoding='utf-8')
        converted = str(converter.refactor_string(original, str(relative))) if original else ''
        converted = converted.replace('.next.return_value', '.__next__.return_value')
        if relative.as_posix() == 'cluster.py':
            converted = converted.replace('len(peers) / 2', 'len(peers) // 2').replace('len(self.peers) / 2', 'len(self.peers) // 2')
            converted = converted.replace('def __cmp__(self, other):\n        return cmp(self.expires, other.expires)',
                                          'def __lt__(self, other):\n        return self.expires < other.expires')
            # Set iteration was process-dependent even with a fixed network seed.
            converted = converted.replace('for dest in (d for d in destinations if d in self.nodes):',
                                          'for dest in sorted(d for d in destinations if d in self.nodes):')
        out = target / relative
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_text(converted, encoding='utf-8')
        differences.extend(difflib.unified_diff(original.splitlines(True), converted.splitlines(True), str(relative), 'python3/' + str(relative)))
    (target / 'compatibility.patch').write_text(''.join(differences), encoding='utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--submission', help='Directory containing an independent Python 3 cluster.py')
    parser.add_argument('--output')
    args = parser.parse_args()
    manifest = verify(UPSTREAM)
    target = Path(tempfile.mkdtemp(prefix='consensus-', dir=ROOT / 'artifacts'))
    prepare(target)
    if args.submission:
        (target / 'cluster.py').write_bytes((Path(args.submission) / 'cluster.py').read_bytes())
    sys.path.insert(0, str(target))
    sys.modules['mock'] = mock
    suite = unittest.defaultTestLoader.discover(str(target / 'test'), pattern='test_*.py', top_level_dir=str(target))
    output = io.StringIO()
    result = unittest.TextTestRunner(stream=output, verbosity=2).run(suite)
    benchmark=[]
    if result.wasSuccessful():
        samples=[]
        for iteration in range(8):
            repeated=unittest.defaultTestLoader.discover(str(target / 'test'), pattern='test_*.py', top_level_dir=str(target))
            start=time.perf_counter_ns()
            checked=unittest.TextTestRunner(stream=io.StringIO(),verbosity=0).run(repeated)
            elapsed=time.perf_counter_ns()-start
            if not checked.wasSuccessful(): raise RuntimeError('重复场景未通过，不发布性能结果。')
            if iteration: samples.append(elapsed)
        benchmark=[{'name':'46 deterministic functional scenarios','warmups':1,'samples_ns':samples,'median_ms':statistics.median(samples)/1e6,
                    'boundary':'in-process test fixtures, assertions and simulation included; source conversion excluded; not network throughput'}]
    # The original standalone line-count check is an editorial constraint, not functional coverage.
    lines = len((UPSTREAM / 'cluster.py').read_text(encoding='utf-8').splitlines())
    data = report('consensus', manifest, [{'name': 'upstream-functional-suite', 'tests': result.testsRun,
                  'passed': result.wasSuccessful(), 'failures': len(result.failures), 'errors': len(result.errors), 'details': output.getvalue()}],
                  mode='submission' if args.submission else 'reference', output=args.output, benchmark=benchmark,
                  notes=[f'Original test_lines editorial limit is 500; pinned original has {lines} lines. This check is recorded as not met, not reported as passing.',
                         'Python 2 syntax, integer quorum division and iterator mocks ported explicitly; Timer uses __lt__; destinations sorted for reproducible simulation. Assertions are preserved.',
                         'This is a deterministic simulated network, not a production multi-host consensus service.', str(target / 'compatibility.patch')])
    if not data['passed']:
        print(output.getvalue())
    return 0 if data['passed'] else 1


if __name__ == '__main__':
    sys.exit(run_safely('consensus', UPSTREAM, main))
