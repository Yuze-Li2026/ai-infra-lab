"""Regression: an exited parent must not leave owned work or held pipes alive."""
from pathlib import Path
import os
import subprocess
import sys
import time

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from processes import run

folder = Path(sys.argv[1])
heartbeat, stopped = folder / 'heartbeat', folder / 'stop'
writer = """import sys,time
from pathlib import Path
beat,stop=map(Path,sys.argv[1:])
deadline=time.monotonic()+20
while not stop.exists() and time.monotonic()<deadline:
    with beat.open('a') as output: output.write('x')
    time.sleep(.03)
"""
parent = """import subprocess,sys,time
from pathlib import Path
subprocess.Popen([sys.executable,'-c',sys.argv[1],sys.argv[2],sys.argv[3]])
deadline=time.monotonic()+5
while not Path(sys.argv[2]).exists():
    if time.monotonic()>deadline: raise RuntimeError('grandchild did not start')
    time.sleep(.01)
"""
survivor = subprocess.Popen([sys.executable, '-c', "import time; time.sleep(3); print('unrelated survived')"],
                            stdout=subprocess.PIPE, text=True)
try:
    start = time.monotonic()
    try:
        run([sys.executable, '-c', parent, writer, str(heartbeat), str(stopped)],
            timeout=2, capture_output=True)
        raise AssertionError('Inherited grandchild pipes should reach the timeout')
    except TimeoutError:
        pass
    assert time.monotonic() - start < 9, 'cleanup exceeded its bounded deadline'
    before = heartbeat.read_text()
    assert before, 'grandchild never executed'
    time.sleep(.25)
    assert heartbeat.read_text() == before, 'orphan still running after the timeout'
    output, _ = survivor.communicate(timeout=5)
    assert survivor.returncode == 0 and output.strip() == 'unrelated survived'
    # A normal captured result and a non-zero exit must retain subprocess semantics.
    normal = run([sys.executable, '-c', 'print(input())'], input='中文 input\n',
                 capture_output=True, text=True, encoding='utf-8', timeout=5,
                 env={**os.environ, 'PYTHONIOENCODING': 'utf-8'})
    assert normal.stdout.strip() == '中文 input' and normal.returncode == 0
    try:
        run([sys.executable, '-c', 'raise SystemExit(7)'], timeout=5, check=True)
        raise AssertionError('non-zero exit was not propagated')
    except subprocess.CalledProcessError as error:
        assert error.returncode == 7
    if os.name == 'nt':
        from windows_job import WindowsJob
        attach = WindowsJob.attach_and_resume
        marker = folder / 'must-not-run'
        def denied(self, pid):
            raise OSError('injected job assignment denial')
        WindowsJob.attach_and_resume = denied
        try:
            try:
                run([sys.executable, '-c', 'from pathlib import Path; import sys; Path(sys.argv[1]).touch()', str(marker)], timeout=5)
                raise AssertionError('job assignment failure was ignored')
            except OSError as error:
                assert 'injected job assignment denial' in str(error)
            assert not marker.exists(), 'learner code ran before job ownership was established'
        finally:
            WindowsJob.attach_and_resume = attach
    print('exited-parent cleanup and unrelated process verified')
finally:
    stopped.write_text('stop')
    if survivor.poll() is None:
        survivor.kill()
    survivor.communicate(timeout=5)
