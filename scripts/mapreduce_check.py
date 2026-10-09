"""Supplemental executable checks, with independent word-count oracles."""
from collections import Counter
from pathlib import Path
import re
import shutil
import statistics
import subprocess
import tempfile
import time
from processes import run as bounded_run

def check_mapreduce(folder, root, log):
    compiler = shutil.which('gcc')
    if not compiler: raise RuntimeError('缺少 gcc；请按 OSTEP 指南准备支持 pthread 的 C 编译器。')
    source = folder/'mapreduce.c'
    if not source.is_file(): raise RuntimeError('请自行实现工作目录中的 mapreduce.c；原课程只提供 API 和要求。')
    results = []
    with tempfile.TemporaryDirectory(prefix='mapreduce-check-') as temporary, log.open('w',encoding='utf-8') as output:
        work = Path(temporary); binary = work/'mapreduce-test'
        build = bounded_run([compiler,'-std=c11','-Wall','-Wextra','-Werror','-O2','-pthread',
                                '-I',str(folder),str(root/'labs/ostep-mapreduce/check.c'),str(source),'-o',str(binary)],
                               stdout=output,stderr=subprocess.STDOUT,timeout=45)
        results.append({'name':'supplemental-build','tests':1,'passed':build.returncode==0,'exitCode':build.returncode})
        if build.returncode: return results
        cases = [
            ('empty-file', [''], 1, 1, False),
            ('single-file-counts', ['c a b a c a'], 1, 1, False),
            ('multiple-inputs', ['a b a','b c',''], 2, 3, False),
            ('custom-partition-and-key-order', ['z b a z c a','b z'], 2, 4, True),
            ('parallel-mappers', ['a b c '*2000]*12, 4, 4, False),
            ('copied-key-and-value-lifetimes', [' '.join('k%02d'%(i%31) for i in range(10000))]*4, 4, 8, True)]
        for name, texts, mappers, reducers, custom in cases:
            files = []
            for i, text in enumerate(texts):
                path = work/(name+'-'+str(i)+'.txt'); path.write_text(text,encoding='ascii'); files.append(str(path))
            expected = Counter(word for text in texts for word in text.split())
            samples=[]
            try:
                for repeat in range(3):
                    start=time.perf_counter_ns()
                    run = bounded_run([str(binary),str(mappers),str(reducers),str(int(custom)),*files],
                                         capture_output=True,text=True,encoding='utf-8',timeout=15)
                    samples.append(time.perf_counter_ns()-start)
                    actual = {}
                    for line in run.stdout.splitlines():
                        key,count,partition=line.split(); count,partition=int(count),int(partition)
                        if key in actual: raise AssertionError('同一 key 被重复 reduce：'+key)
                        actual[key]=count
                        if custom and partition != 0: raise AssertionError('未使用调用者提供的 partitioner')
                    observation = re.search(r'mapped=(\d+) peak=(\d+) order_error=(\d+)',run.stderr)
                    if run.returncode or actual!=dict(expected) or not observation: raise AssertionError('计数、返回码或观察结果不符')
                    mapped,peak,order=map(int,observation.groups())
                    if mapped!=len(texts) or order or peak>mappers: raise AssertionError('输入调度、key 顺序或线程数量不符')
                    if name=='parallel-mappers' and peak<2: raise AssertionError('未观察到并行 mapper')
                results.append({'name':name,'tests':3,'passed':True,'samples_ns':samples,'median_ms':statistics.median(samples)/1e6,
                                'boundary':'process startup, disk input, map, shuffle and reduce included; not a native-kernel benchmark'})
            except Exception as error:
                results.append({'name':name,'tests':3,'passed':False,'error':str(error)})
            output.write(name+' '+str(results[-1])+'\n'); output.flush()
    return results
