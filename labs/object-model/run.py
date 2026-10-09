"""Run pinned AOSA tests with Python's unittest; no extra packages required.

This is an integration adapter, not a replacement course or security sandbox.
"""
import argparse
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import platform
import statistics
import subprocess
import sys
import time
import tracemalloc
import unittest

ROOT = Path(__file__).resolve().parent
UPSTREAM = ROOT / "upstream"
STAGES = ["01-smalltalk-like", "02-attr-based", "03-customizable", "04-maps"]


def load(name, path):
    spec = importlib.util.spec_from_file_location(name, str(path))
    module = importlib.util.module_from_spec(spec)
    sys.modules[name] = module
    spec.loader.exec_module(module)
    return module


def verify():
    manifest = json.loads((UPSTREAM / "manifest.json").read_text(encoding="utf-8"))
    for item in manifest["files"]:
        path = (UPSTREAM / item["path"]).resolve()
        if not path.is_relative_to(UPSTREAM.resolve()):
            raise ValueError("Invalid manifest path")
        if hashlib.sha256(path.read_bytes()).hexdigest() != item["sha256"]:
            raise ValueError("Upstream checksum mismatch: " + item["path"])
    return manifest


def child(stage, submission):
    folder = UPSTREAM / "objmodel" / "code" / stage
    model = load("objmodel", Path(submission) / "objmodel.py" if submission else folder / "objmodel.py")
    tests = load("upstream_tests", folder / "test_objmodel.py")
    suite = unittest.TestSuite(unittest.FunctionTestCase(fn) for name, fn in sorted(vars(tests).items())
                               if name.startswith("test_") and callable(fn))
    output = io.StringIO()
    result = unittest.TextTestRunner(stream=output, verbosity=2).run(suite)
    return {"stage": stage, "tests": result.testsRun, "passed": result.wasSuccessful(),
            "failures": len(result.failures), "errors": len(result.errors), "details": output.getvalue()}


def benchmark():
    results = []
    for stage in ["03-customizable", "04-maps"]:
        model = load("benchmark_" + stage[:2], UPSTREAM / "objmodel" / "code" / stage / "objmodel.py")
        cls = model.Class(name="Point", base_class=model.OBJECT, fields={}, metaclass=model.TYPE)
        tracemalloc.start()
        points = []
        for i in range(10000):
            point = model.Instance(cls)
            point.write_attr("x", i)
            point.write_attr("y", i + 1)
            points.append(point)
        current, peak = tracemalloc.get_traced_memory()
        tracemalloc.stop()
        timings = []
        for repeat in range(8):
            start = time.perf_counter_ns()
            checksum = sum(p.read_attr("x") + p.read_attr("y") for p in points)
            elapsed = time.perf_counter_ns() - start
            assert checksum == 100000000
            if repeat:  # Warm up once; retain seven separate measurements.
                timings.append(elapsed)
        results.append({"stage": stage, "objects": len(points), "retained_bytes": current,
                        "peak_bytes": peak, "read_ns_samples": timings,
                        "read_ns_median": statistics.median(timings), "checksum": checksum})
        del points
    return results


def main():
    parser = argparse.ArgumentParser(description="AOSA object-model reproducibility adapter")
    parser.add_argument("--stage", choices=STAGES)
    parser.add_argument("--submission", help="Independent implementation directory; with --stage contains objmodel.py, otherwise contains all four stage directories")
    parser.add_argument("--benchmark", action="store_true", help="Measure pinned reference stages 3 and 4")
    parser.add_argument("--output", default="artifacts/object-model-report.json")
    parser.add_argument("--child", action="store_true", help=argparse.SUPPRESS)
    args = parser.parse_args()
    if sys.version_info < (3, 10):
        parser.error("Python 3.10 or newer is required")
    if not __debug__:
        parser.error("Do not disable assertions with -O")
    if args.submission and args.benchmark:
        parser.error("--submission cannot be combined with reference --benchmark")
    if args.child:
        print(json.dumps(child(args.stage, args.submission), ensure_ascii=True))
        return
    manifest = verify()
    results = []
    for stage in ([args.stage] if args.stage else STAGES):
        command = [sys.executable, "-I", "-B", str(Path(__file__).resolve()), "--child", "--stage", stage]
        if args.submission:
            submission = Path(args.submission).resolve()
            if not args.stage:
                submission = submission / stage
            command += ["--submission", str(submission)]
        try:
            proc = subprocess.run(command, capture_output=True, text=True, encoding="utf-8", timeout=15)
            if proc.returncode:
                results.append({"stage": stage, "passed": False, "error": proc.stderr[-6000:]})
            else:
                results.append(json.loads(proc.stdout))
        except (subprocess.TimeoutExpired, json.JSONDecodeError) as error:
            results.append({"stage": stage, "passed": False, "error": str(error)})
    report = {"schemaVersion": 1, "lab": "object-model", "mode": "submission" if args.submission else "reference",
              "commit": manifest["commit"], "upstreamChecksumsVerified": True,
              "python": sys.version, "platform": platform.platform(), "processor": platform.processor(),
              "logicalCpus": os.cpu_count(), "createdAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
              "passed": all(r["passed"] for r in results), "results": results,
              "benchmark": benchmark() if args.benchmark and all(r["passed"] for r in results) else [],
              "limits": "Reference reproduction is not learner mastery. Tests are not exhaustive. Python-level measurements do not establish native-runtime performance. No sandbox."}
    target = Path(args.output)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"mode": report["mode"], "passed": report["passed"], "tests": sum(r.get("tests", 0) for r in results),
                      "report": str(target)}, ensure_ascii=True))
    sys.exit(0 if report["passed"] else 1)


if __name__ == "__main__":
    main()
