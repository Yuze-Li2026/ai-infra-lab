"""Real Linux Jupyter/SSH acceptance; emits no credentials in logs or report."""
import contextlib
import http.cookiejar
import json
import os
from pathlib import Path
import re
import signal
import socket
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request
import uuid

ROOT = Path(__file__).resolve().parents[1]
LAUNCHER = ROOT / "scripts/private_lab.py"


def free_port():
    with socket.socket() as sock:
        sock.bind(("127.0.0.1", 0))
        return sock.getsockname()[1]


def command(*args, good=True):
    result = subprocess.run([sys.executable, str(LAUNCHER), *map(str, args)], capture_output=True, text=True, timeout=30)
    assert (result.returncode == 0) == good, "Private launcher returned an unexpected status"
    return result


def request(base, path, token=None, body=None, method=None, opener=None):
    headers = {"Authorization": "token " + token} if token else {}
    if body is not None:
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(base + path, data=None if body is None else json.dumps(body).encode(), headers=headers, method=method)
    try:
        with (opener or urllib.request.build_opener()).open(req, timeout=5) as response:
            return response.status, response.read()
    except urllib.error.HTTPError as error:
        return error.code, b""


@contextlib.contextmanager
def running(state, work, port):
    log_path = state / "server.log"
    with log_path.open("wb") as log:
        process = subprocess.Popen([sys.executable, str(LAUNCHER), "serve", "--state", str(state), "--root", str(work), "--port", str(port)], stdout=log, stderr=log, start_new_session=True)
        try:
            for _ in range(90):
                if process.poll() is not None:
                    diagnostic = log_path.read_text(errors="replace")[-12000:]
                    diagnostic = re.sub(r"[0-9a-fA-F]{48,}", "[redacted]", diagnostic)
                    diagnostic = re.sub(r"(?i)(token=)[^\s&]+", r"\1[redacted]", diagnostic)
                    print(diagnostic, file=sys.stderr)
                    raise AssertionError("Jupyter exited before readiness; redacted startup diagnostic printed")
                try:
                    status, _ = request(f"http://127.0.0.1:{port}", "/api/contents")
                    if status == 403:
                        break
                except (OSError, urllib.error.URLError):
                    pass
                time.sleep(0.5)
            else:
                raise AssertionError("Jupyter readiness timed out")
            yield process
        finally:
            if process.poll() is None:
                os.killpg(process.pid, signal.SIGTERM)
                try:
                    process.wait(timeout=20)
                except subprocess.TimeoutExpired:
                    os.killpg(process.pid, signal.SIGKILL)
                    process.wait(timeout=10)


def run():
    if os.name != "posix":
        raise RuntimeError("Linux acceptance requires Linux, not a skipped test")
    checks = []
    with tempfile.TemporaryDirectory(prefix="private-lab-") as folder:
        root = Path(folder)
        state, work = root / "private", root / "work"
        work.mkdir(mode=0o700)
        command("init", "--state", state)
        credentials = state / "credentials.json"
        old = json.loads(credentials.read_text())
        command("init", "--state", state, good=False)
        assert json.loads(credentials.read_text()) == old
        assert credentials.stat().st_mode & 0o777 == 0o600
        checks.append("unique credentials, owner-only mode, repeat init preserves data")
        unsafe = root / "unsafe"
        unsafe.mkdir(mode=0o755)
        unsafe.chmod(0o755)
        command("init", "--state", unsafe, good=False)
        alias = root / "link"
        alias.symlink_to(state, target_is_directory=True)
        command("rotate", "--state", alias, good=False)
        checks.append("unsafe permissions and symlinks rejected")
        port = free_port()
        base = f"http://127.0.0.1:{port}"
        with running(state, work, port):
            command("rotate", "--state", state, good=False)
            assert request(base, "/api/contents")[0] == 403
            assert request(base, "/api/contents", "wrong-key")[0] == 403
            assert request(base, "/api/kernels", body={}, method="POST")[0] == 403
            assert request(base, "/api/contents", old["token"])[0] == 200
            checks.append("anonymous and wrong-key reads/execution denied; owner accepted")
            contents = {"type": "file", "format": "text", "content": "persistent owner note"}
            assert request(base, "/api/contents/owner-note.txt", old["token"], contents, "PUT")[0] == 201
            assert request(base, "/api/contents/../private/credentials.json", old["token"])[0] in (400, 403, 404)
            # Start a real kernel and execute over Jupyter's WebSocket channel.
            import websocket
            status, body = request(base, "/api/kernels", old["token"], {"name": "python3"}, "POST")
            assert status == 201
            kernel = json.loads(body)["id"]
            connection = websocket.create_connection(f"ws://127.0.0.1:{port}/api/kernels/{kernel}/channels", header=["Authorization: token " + old["token"]], origin=base, timeout=15)
            message_id = uuid.uuid4().hex
            connection.send(json.dumps({"header": {"msg_id": message_id, "username": "owner", "session": uuid.uuid4().hex, "msg_type": "execute_request", "version": "5.3"}, "parent_header": {}, "metadata": {}, "channel": "shell", "content": {"code": "print(6 * 7)", "silent": False, "store_history": False, "user_expressions": {}, "allow_stdin": False, "stop_on_error": True}}))
            output, finished = "", False
            deadline = time.monotonic() + 30
            while time.monotonic() < deadline:
                message = json.loads(connection.recv())
                if message.get("parent_header", {}).get("msg_id") != message_id:
                    continue
                if message["msg_type"] == "stream":
                    output += message["content"]["text"]
                if message["msg_type"] == "execute_reply":
                    assert message["content"]["status"] == "ok"
                    finished = True
                if finished and "42" in output:
                    break
            connection.close()
            assert finished and "42" in output
            assert request(base, "/api/kernels/" + kernel, old["token"], method="DELETE")[0] == 204
            checks.append("real Python kernel executes and closes; notebook file saved")
            jar = http.cookiejar.CookieJar()
            opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))
            assert request(base, "/lab?token=" + old["token"], opener=opener)[0] == 200
            assert request(base, "/api/contents", opener=opener)[0] == 200
            assert request(base, "/api/kernels", body={}, method="POST", opener=opener)[0] == 403
            checks.append("cookie login works; cookie-only mutation without XSRF denied")
            # CI provides an isolated real sshd; this client key is disposable.
            ssh_config = os.environ.get("PRIVATE_LAB_TEST_SSH_CONFIG")
            if not ssh_config:
                raise RuntimeError("Real SSH acceptance needs PRIVATE_LAB_TEST_SSH_CONFIG")
            forwarded = free_port()
            tunnel = subprocess.Popen(["ssh", "-F", ssh_config, "-N", "-L", f"127.0.0.1:{forwarded}:127.0.0.1:{port}", "private-test"], stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True)
            try:
                for _ in range(50):
                    if tunnel.poll() is not None:
                        raise AssertionError("SSH tunnel exited: " + tunnel.stderr.read()[-2000:])
                    try:
                        if request(f"http://127.0.0.1:{forwarded}", "/api/contents", old["token"])[0] == 200:
                            break
                    except (OSError, urllib.error.URLError):
                        pass
                    time.sleep(0.1)
                else:
                    raise AssertionError("SSH tunnel did not become usable")
                assert request(f"http://127.0.0.1:{forwarded}", "/api/contents")[0] == 403
            finally:
                tunnel.terminate()
                tunnel.wait(timeout=10)
            checks.append("real SSH key tunnel works and retains Jupyter authentication")
            backup, restored = root / "downloaded-work", root / "restored-work"
            # Match the documented download and fresh-directory restore. SCP
            # uses the same verified SSH identity, with forwarding disabled.
            for source, destination in [(f"private-test:{work}", str(backup)), (str(backup), f"private-test:{restored}")]:
                subprocess.run(["scp", "-F", ssh_config, "-o", "ClearAllForwardings=yes", "-r", source, destination],
                               check=True, capture_output=True, text=True, timeout=20)
            assert (backup / "owner-note.txt").read_text() == "persistent owner note"
            assert (restored / "owner-note.txt").read_text() == "persistent owner note"
            assert not (backup / "credentials.json").exists()
            assert (work / "owner-note.txt").read_text() == "persistent owner note"
            checks.append("SCP downloads work and restores to a separate directory without credentials or overwriting originals")
            # /proc records listening sockets; no wildcard listener for this port.
            for table in (Path("/proc/net/tcp"), Path("/proc/net/tcp6")):
                for line in table.read_text().splitlines()[1:]:
                    fields = line.split()
                    if fields[3] == "0A" and int(fields[1].split(":")[1], 16) == port:
                        assert fields[1].split(":")[0] == "0100007F"
            checks.append("server listener is IPv4 loopback only")
        command("rotate", "--state", state)
        new = json.loads(credentials.read_text())
        assert new["token"] != old["token"] and new["cookieSecret"] != old["cookieSecret"]
        with running(state, work, port):
            assert request(base, "/api/contents", old["token"])[0] == 403
            assert request(base, "/api/contents", opener=opener)[0] == 403
            assert request(base, "/api/contents", new["token"])[0] == 200
            assert (work / "owner-note.txt").read_text() == "persistent owner note"
        checks.append("restart preserves work; rotation revokes both old token and old cookies")
    return checks


if __name__ == "__main__":
    report = {"passed": False, "kind": "private-lab-integration", "gpuVerified": False}
    try:
        report["checks"] = run()
        report["passed"] = True
    except Exception as error:
        report["error"] = type(error).__name__ + ": " + str(error)
        raise
    finally:
        (ROOT / "artifacts").mkdir(exist_ok=True)
        (ROOT / "artifacts/private-cloud-results.json").write_text(json.dumps(report, indent=2) + "\n")
        print(json.dumps(report))
