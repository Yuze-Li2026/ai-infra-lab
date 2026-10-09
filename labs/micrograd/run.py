"""Integrate Karpathy micrograd with preserved PyTorch tests and independent numeric checks."""
import argparse
import importlib.util
import io
import math
from pathlib import Path
import random
import statistics
import sys
import time
import unittest
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from common import verify, report, run_safely

UPSTREAM = Path(__file__).resolve().parent / 'upstream'


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--submission', help='Directory containing independently implemented micrograd package')
    parser.add_argument('--output')
    args = parser.parse_args()
    manifest = verify(UPSTREAM)
    sys.path.insert(0, str(Path(args.submission).resolve() if args.submission else UPSTREAM))
    from micrograd.engine import Value
    from micrograd.nn import MLP
    results = []
    expressions = [('add', lambda x, y: x + y), ('multiply', lambda x, y: x * y),
                   ('reuse', lambda x, y: x*x+x*y+x), ('power', lambda x, y: x**3+y**2),
                   ('divide', lambda x, y: x/y+2/x), ('relu-positive', lambda x, y: (x+y).relu()),
                   ('relu-negative', lambda x, y: (-x-y).relu()), ('composed', lambda x, y: ((x*y+1)**2)/(x+y))]
    for name, expression in expressions:
        try:
            x, y = Value(1.3), Value(2.1)
            expression(x, y).backward()
            numeric = []
            h = 1e-6
            for dx, dy in [(h, 0), (0, h)]:
                plus = expression(Value(1.3+dx), Value(2.1+dy)).data
                minus = expression(Value(1.3-dx), Value(2.1-dy)).data
                numeric.append((plus-minus)/(2*h))
            assert math.isclose(x.grad, numeric[0], rel_tol=1e-5, abs_tol=1e-6)
            assert math.isclose(y.grad, numeric[1], rel_tol=1e-5, abs_tol=1e-6)
            results.append({'name': 'supplemental-gradient-'+name, 'tests': 1, 'passed': True,
                            'analytic': [x.grad, y.grad], 'finiteDifference': numeric})
        except Exception as error:
            results.append({'name': 'supplemental-gradient-'+name, 'tests': 1, 'passed': False, 'error': repr(error)})
    random.seed(42)
    model = MLP(2, [8, 1])
    inputs = [[-1,-1], [-1,1], [1,-1], [1,1]]
    targets = [-1,1,1,-1]
    history = []
    for step in range(600):
        predictions = [model(x) for x in inputs]
        loss = sum((prediction-target)**2 for prediction, target in zip(predictions, targets))/len(inputs)
        model.zero_grad()
        loss.backward()
        for parameter in model.parameters():
            parameter.data -= .03 * parameter.grad
        if step % 100 == 0 or step == 599:
            history.append({'step': step, 'loss': loss.data})
    results.append({'name': 'supplemental-independent-training-check', 'tests': 1,
                    'passed': history[-1]['loss'] < .02, 'history': history,
                    'predictions': [model(x).data for x in inputs], 'seed': 42})
    suite = unittest.TestSuite()
    spec = importlib.util.spec_from_file_location('upstream_engine_tests', UPSTREAM / 'test/test_engine.py')
    module = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(module)
        for name, function in sorted(vars(module).items()):
            if name.startswith('test_') and callable(function):
                suite.addTest(unittest.FunctionTestCase(function))
        output = io.StringIO()
        original = unittest.TextTestRunner(stream=output, verbosity=2).run(suite)
        results.append({'name': 'original-pytorch-comparison-tests', 'tests': original.testsRun,
                        'passed': original.wasSuccessful(), 'details': output.getvalue()})
    except ImportError as error:
        results.append({'name': 'original-pytorch-comparison-tests', 'tests': 0, 'passed': False,
                        'error': str(error), 'status': 'not-run; install the approved PyTorch environment'})
    samples = []
    for i in range(9):
        start = time.perf_counter_ns()
        for _ in range(50):
            value = Value(1.01)
            expression = value
            for _ in range(25):
                expression = expression * value + .01
            expression.backward()
        elapsed = time.perf_counter_ns()-start
        if i >= 2:
            samples.append(elapsed)
    data = report('micrograd', manifest, results,
                  benchmark=[{'workload': '50 graphs, depth 25; forward and backward', 'warmups': 2,
                              'samples_ns': samples, 'median_ms': statistics.median(samples)/1e6}],
                  mode='submission' if args.submission else 'reference', output=args.output,
                  notes=['8 finite-difference cases and training are supplemental integration checks; 2 PyTorch comparisons are the unmodified original tests.',
                         'Scalar teaching engine, not a tensor/GPU backend. Reference training does not establish learner independence.'])
    return 0 if data['passed'] else 1


if __name__ == '__main__':
    sys.exit(run_safely('micrograd', UPSTREAM, main))
