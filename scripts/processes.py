"""Bounded subprocess execution; timeout stops only the spawned process tree."""
import os
import signal
import subprocess

def run(command, timeout, **kwargs):
    check = kwargs.pop('check',False)
    if kwargs.pop('capture_output',False):
        kwargs['stdout'],kwargs['stderr']=subprocess.PIPE,subprocess.PIPE
    if os.name!='nt': kwargs['start_new_session']=True
    else: kwargs.setdefault('creationflags',subprocess.CREATE_NO_WINDOW)
    with subprocess.Popen(command,**kwargs) as child:
        try:
            stdout,stderr=child.communicate(timeout=timeout)
        except (subprocess.TimeoutExpired,KeyboardInterrupt) as error:
            if os.name=='nt' and child.poll() is None:
                try:
                    subprocess.run(['taskkill','/PID',str(child.pid),'/T','/F'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,timeout=10)
                except subprocess.TimeoutExpired:
                    child.kill()
            elif os.name!='nt':
                try: os.killpg(child.pid,signal.SIGKILL)
                except ProcessLookupError: pass
            if child.poll() is None: child.kill()
            child.communicate()
            if isinstance(error,KeyboardInterrupt): raise
            raise TimeoutError('运行超过 '+str(timeout)+' 秒，已停止本次启动的进程树。')
        result=subprocess.CompletedProcess(command,child.returncode,stdout,stderr)
        if check: result.check_returncode()
        return result
