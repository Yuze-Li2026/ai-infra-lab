"""Bounded subprocess execution with ownership independent of the parent PID."""
from contextlib import contextmanager
import os
import signal
import subprocess


def stop_group(child):
    try:
        os.killpg(child.pid, signal.SIGKILL)
    except ProcessLookupError:
        pass


@contextmanager
def owned_process(command, **kwargs):
    job, child = None, None
    try:
        if os.name == 'nt':
            from windows_job import WindowsJob
            job = WindowsJob()
            kwargs['creationflags'] = kwargs.get('creationflags', 0) | subprocess.CREATE_NO_WINDOW | 0x4
        else:
            kwargs['start_new_session'] = True
        child = subprocess.Popen(command, **kwargs)
        if job:
            job.attach_and_resume(child.pid)
        yield child
    finally:
        # Closing the job also stops descendants whose direct parent has exited.
        # POSIX children remain in the session's process group unless they explicitly detach.
        if job:
            job.close()
        elif child:
            stop_group(child)
        if child:
            if child.poll() is None:
                child.kill()
            try:
                child.communicate(timeout=5)
            except subprocess.TimeoutExpired as error:
                # Do not fall back to an unbounded communicate()/Popen.__exit__().
                raise RuntimeError('进程清理超过 5 秒；无法确认输出管道已关闭。') from error
            finally:
                # Windows communicate() uses reader threads. Closing a buffered pipe
                # still held by such a thread could itself block indefinitely.
                readers = [getattr(child, name, None) for name in ('_stdout_thread', '_stderr_thread')]
                if not any(thread and thread.is_alive() for thread in readers):
                    for stream in (child.stdin, child.stdout, child.stderr):
                        if stream:
                            stream.close()


def run(command, timeout, **kwargs):
    check = kwargs.pop('check', False)
    data = kwargs.pop('input', None)
    if kwargs.pop('capture_output', False):
        if 'stdout' in kwargs or 'stderr' in kwargs:
            raise ValueError('capture_output cannot be combined with stdout or stderr')
        kwargs['stdout'], kwargs['stderr'] = subprocess.PIPE, subprocess.PIPE
    if data is not None:
        if 'stdin' in kwargs:
            raise ValueError('input cannot be combined with stdin')
        kwargs['stdin'] = subprocess.PIPE
    try:
        with owned_process(command, **kwargs) as child:
            stdout, stderr = child.communicate(input=data, timeout=timeout)
            result = subprocess.CompletedProcess(command, child.returncode, stdout, stderr)
    except subprocess.TimeoutExpired as error:
        raise TimeoutError('运行超过 ' + str(timeout) + ' 秒，已停止本次启动的进程树。') from error
    if check:
        result.check_returncode()
    return result
