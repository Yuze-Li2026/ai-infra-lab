"""Owner-only Jupyter launcher. Run on Linux; no install or cloud API calls."""
import argparse
import contextlib
import json
import os
from pathlib import Path
import re
import secrets
import stat
import sys


def private_directory(value, create=False):
    path = Path(value).expanduser().absolute()
    # Refuse links, including a link in an existing parent, before touching secrets.
    for item in (path, *path.parents):
        if item.is_symlink():
            raise ValueError("Private paths must not contain symbolic links")
    if create:
        path.mkdir(parents=True, mode=0o700, exist_ok=True)
    info = path.stat()
    if not stat.S_ISDIR(info.st_mode):
        raise ValueError("Expected a private directory")
    if info.st_uid != os.getuid() or info.st_mode & 0o077:
        raise ValueError("Private directory must be owned by this user with mode 0700")
    return path


def load_credentials(folder):
    path = folder / "credentials.json"
    info = path.lstat()
    if not stat.S_ISREG(info.st_mode) or info.st_uid != os.getuid() or info.st_mode & 0o077 or info.st_nlink != 1:
        raise ValueError("Credential file must be a private, single-link regular file")
    if info.st_size > 4096:
        raise ValueError("Invalid credential file size")
    data = json.loads(path.read_text(encoding="utf-8"))
    if data.get("schemaVersion") != 1 or any(not re.fullmatch(r"[0-9a-f]{64}", data.get(k, "")) for k in ("token", "cookieSecret")):
        raise ValueError("Invalid credentials; do not substitute an example password")
    return data


def write_credentials(folder, rotate=False):
    target = folder / "credentials.json"
    if rotate:
        load_credentials(folder)
    elif target.exists() or target.is_symlink():
        raise ValueError("Credentials already exist; init never overwrites them")
    temporary = folder / ("credentials-" + secrets.token_hex(12) + ".tmp")
    data = {"schemaVersion": 1, "token": secrets.token_hex(32), "cookieSecret": secrets.token_hex(32)}
    fd = os.open(temporary, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as stream:
            json.dump(data, stream)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, target)
    finally:
        if temporary.exists():
            temporary.unlink()


@contextlib.contextmanager
def exclusive(folder):
    import fcntl
    descriptor = os.open(folder / "server.lock", os.O_CREAT | os.O_RDWR | os.O_NOFOLLOW, 0o600)
    try:
        info = os.fstat(descriptor)
        if info.st_uid != os.getuid() or info.st_mode & 0o077 or info.st_nlink != 1:
            raise ValueError("Unsafe lock file")
        try:
            fcntl.flock(descriptor, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error:
            raise ValueError("Server is running; stop it before rotating credentials") from error
        yield
    finally:
        os.close(descriptor)


def serve(folder, root, port, allow_root):
    from jupyterlab.labapp import LabApp
    from traitlets.config import Config
    data = load_credentials(folder)
    if root == folder or folder.is_relative_to(root):
        raise ValueError("Credentials must be outside the notebook directory")
    runtime = private_directory(folder / "runtime", create=True)
    # Dedicated config paths prevent a user's old notebook configuration from
    # silently relaxing these settings. No CLI config overrides are accepted.
    config_dir = private_directory(folder / "config", create=True)
    os.environ["JUPYTER_CONFIG_DIR"] = str(config_dir)
    os.environ["JUPYTER_RUNTIME_DIR"] = str(runtime)
    config = Config()
    config.ServerApp.ip = "127.0.0.1"
    config.ServerApp.port = port
    config.ServerApp.port_retries = 0
    config.ServerApp.root_dir = str(root)
    config.ServerApp.open_browser = False
    config.ServerApp.allow_root = allow_root
    config.ServerApp.allow_remote_access = False
    config.ServerApp.allow_origin = ""
    config.ServerApp.allow_origin_pat = ""
    config.ServerApp.disable_check_xsrf = False
    config.ServerApp.trust_xheaders = False
    config.ServerApp.cookie_secret = bytes.fromhex(data["cookieSecret"])
    config.ServerApp.log_level = "WARNING"
    config.IdentityProvider.token = data["token"]
    config.PasswordIdentityProvider.hashed_password = ""
    config.PasswordIdentityProvider.password_required = False
    app = LabApp.instance(config=config)
    app.initialize([])
    server = app.serverapp
    # Inspect effective traits after all config loading, before listening.
    if (server.ip != "127.0.0.1" or server.port != port or server.port_retries != 0
            or server.allow_origin or server.allow_origin_pat or server.disable_check_xsrf
            or server.allow_remote_access or server.trust_xheaders
            or server.identity_provider.token != data["token"]
            or server.identity_provider.hashed_password
            or server.cookie_secret != bytes.fromhex(data["cookieSecret"])):
        raise ValueError("An external Jupyter configuration changed the private access policy")
    print("Private lab ready on loopback; connect through your SSH tunnel. No cloud billing changes.", flush=True)
    app.start()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("action", choices=["init", "serve", "rotate"])
    parser.add_argument("--state", required=True, help="Private 0700 directory outside the notebook root")
    parser.add_argument("--root", help="Notebook/work directory (serve only)")
    parser.add_argument("--port", type=int, default=8888)
    parser.add_argument("--allow-root", action="store_true", help="Explicitly allow a provider's root-only container")
    args = parser.parse_args()
    if os.name != "posix":
        parser.error("Run this server launcher on Linux; use OpenSSH on the Windows client")
    if not 1024 <= args.port <= 65535:
        parser.error("Choose an unprivileged port between 1024 and 65535")
    if args.action == "serve" and not args.root:
        parser.error("serve requires --root")
    os.umask(0o077)
    folder = private_directory(args.state, create=args.action == "init")
    with exclusive(folder):
        if args.action in ("init", "rotate"):
            write_credentials(folder, rotate=args.action == "rotate")
            print("Private credentials created; token and cookies changed." if args.action == "rotate" else "Private credentials created; existing files preserved.")
        else:
            root = private_directory(args.root, create=True)
            serve(folder, root, args.port, args.allow_root)


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, ImportError) as error:
        print("Private lab stopped: " + str(error), file=sys.stderr)
        sys.exit(1)
