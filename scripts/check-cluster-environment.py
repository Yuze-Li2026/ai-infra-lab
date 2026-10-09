"""Create only named, isolated learning clusters; exercise and remove them."""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import platform
import shutil
import sys
import time
import uuid
from processes import run

ROOT = Path(__file__).resolve().parents[1]
VERSIONS = json.loads((ROOT / 'labs/cluster-validation/versions.json').read_text())


def main():
    if not __debug__:
        raise RuntimeError('Verification requires assertions; do not run Python with -O')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('engine', choices=['kubernetes', 'ray'])
    parser.add_argument('--run', action='store_true', help='Create isolated Docker resources; may download pinned images')
    args = parser.parse_args()
    if not args.run:
        print(json.dumps({'engine': args.engine, 'versions': VERSIONS, 'requirements': 'Dedicated Linux Docker host; Kubernetes also requires pinned kind and compatible kubectl. Read docs/cluster-environments.md before --run.'}, indent=2))
        return
    if sys.platform != 'linux' or not shutil.which('docker'):
        raise RuntimeError('Execution requires Linux with an available Docker engine')
    if args.engine == 'kubernetes' and (not shutil.which('kind') or not shutil.which('kubectl')):
        raise RuntimeError('Install the documented kind and kubectl versions before execution')
    name = 'infra-check-' + uuid.uuid4().hex[:12]
    folder = ROOT / 'artifacts' / name
    folder.mkdir(parents=True, mode=0o700)
    env = {**os.environ, 'KUBECONFIG': str(folder / 'kubeconfig'), 'RAY_USAGE_STATS_ENABLED': '0'}
    log, checks = [], []
    result = {'passed': False, 'engine': args.engine, 'checkedAt': datetime.now(timezone.utc).isoformat(),
              'versions': VERSIONS, 'environment': platform.platform(), 'checks': checks,
              'gpuVerified': False, 'limits': VERSIONS['limits']}
    containers, network, kind_created = [], False, False

    def command(argv, *, data=None, expected=0, timeout=120):
        completed = run(argv, input=data, cwd=ROOT, env=env, capture_output=True, text=True,
                        encoding='utf-8', timeout=timeout)
        # Never log kubeconfig or service-account tokens. Commands here contain neither.
        log.append({'command': argv, 'exitCode': completed.returncode,
                    'stdout': completed.stdout[-24000:], 'stderr': completed.stderr[-8000:]})
        if expected is not None and completed.returncode != expected:
            raise RuntimeError('Command failed: ' + ' '.join(argv) + '\n' + completed.stderr[-4000:])
        return completed

    def kubectl(*argv, **options):
        return command(['kubectl', '--context', 'kind-' + name, '-n', name, *argv], **options)

    def apply(*resources, expected=0):
        return kubectl('apply', '-f', '-', data=json.dumps({'apiVersion': 'v1', 'kind': 'List', 'items': resources}), expected=expected)

    def resource(kind, resource_name, **fields):
        return {'apiVersion': 'v1', 'kind': kind, 'metadata': {'name': resource_name, 'namespace': name}, **fields}

    def cleanup_command(argv):
        try:
            return command(argv, expected=None, timeout=120).returncode == 0
        except Exception as error:
            log.append({'command': argv, 'cleanupError': str(error)})
            return False

    try:
        result['docker'] = command(['docker', 'version', '--format', '{{json .Server.Version}}']).stdout.strip()
        if args.engine == 'ray':
            image = VERSIONS['ray']['image']
            command(['docker', 'pull', image], timeout=300)
            command(['docker', 'network', 'create', '--label', 'ai-infra.validation=' + name, name])
            network = True
            for role in ['head', 'worker']:
                container = name + '-' + role
                containers.append(container)
                startup = ['ray', 'start', '--num-cpus=1', '--object-store-memory=100000000', '--disable-usage-stats', '--block']
                startup += ['--head', '--port=6379', '--include-dashboard=false'] if role == 'head' else ['--address=' + name + '-head:6379']
                command(['docker', 'run', '-d', '--name', container, '--network', name,
                         '--label', 'ai-infra.validation=' + name, '--user', '0:0', '--shm-size=256m',
                         '--memory=4g', '--cpus=2', '--security-opt=no-new-privileges',
                         '-e', 'RAY_USAGE_STATS_ENABLED=0', '-v', str(ROOT / 'scripts') + ':/workspace/scripts:ro',
                         '-v', str(folder) + ':/evidence', image, *startup])
                if role == 'head':
                    # The worker retries GCS connection itself; give the head a startup window.
                    time.sleep(5)
            command(['docker', 'exec', name + '-head', 'python', '/workspace/scripts/check-ray-cluster.py', '/evidence/ray-results.json'], timeout=240)
            evidence = json.loads((folder / 'ray-results.json').read_text())
            if not evidence['passed']:
                raise RuntimeError('Ray execution evidence failed')
            result['rayEvidence'] = evidence
            checks.extend(evidence['checks'])
        else:
            config = folder / 'kind.json'
            config.write_text(json.dumps({'kind': 'Cluster', 'apiVersion': 'kind.x-k8s.io/v1alpha4',
                                         'networking': {'apiServerAddress': '127.0.0.1'},
                                         'nodes': [{'role': 'control-plane'}, {'role': 'worker'}, {'role': 'worker'}]}))
            kind_created = True
            command(['kind', 'create', 'cluster', '--name', name, '--config', str(config),
                     '--image', VERSIONS['kubernetes']['image'], '--wait', '180s'], timeout=300)
            kubectl('wait', '--for=condition=Ready', 'nodes', '--all', '--timeout=120s')
            nodes = json.loads(kubectl('get', 'nodes', '-o', 'json').stdout)['items']
            assert len(nodes) == 3
            checks.append('one control-plane and two real worker nodes ready')
            command(['kubectl', '--context', 'kind-' + name, 'create', 'namespace', name])
            apply(resource('ServiceAccount', 'learner'),
                  {'apiVersion': 'rbac.authorization.k8s.io/v1', 'kind': 'Role', 'metadata': {'name': 'reader', 'namespace': name},
                   'rules': [{'apiGroups': [''], 'resources': ['pods'], 'verbs': ['get', 'list']}]},
                  {'apiVersion': 'rbac.authorization.k8s.io/v1', 'kind': 'RoleBinding', 'metadata': {'name': 'reader', 'namespace': name},
                   'subjects': [{'kind': 'ServiceAccount', 'name': 'learner', 'namespace': name}],
                   'roleRef': {'apiGroup': 'rbac.authorization.k8s.io', 'kind': 'Role', 'name': 'reader'}})
            identity = '--as=system:serviceaccount:' + name + ':learner'
            kubectl('get', 'pods', identity)
            denied = kubectl('get', 'secrets', identity, expected=None)
            assert denied.returncode != 0 and 'Forbidden' in denied.stderr
            checks.append('namespace reader lists pods and is denied secret access')
            image = VERSIONS['busybox']['image']
            container = {'name': 'web', 'image': image, 'command': ['sh', '-c', 'mkdir -p /tmp/www; echo infra-v1 > /tmp/www/index.html; exec httpd -f -p 8080 -h /tmp/www'],
                         'ports': [{'containerPort': 8080}], 'resources': {'requests': {'cpu': '50m', 'memory': '16Mi'}, 'limits': {'cpu': '250m', 'memory': '64Mi'}},
                         'readinessProbe': {'httpGet': {'path': '/', 'port': 8080}, 'periodSeconds': 2},
                         'securityContext': {'runAsUser': 1000, 'runAsNonRoot': True, 'allowPrivilegeEscalation': False, 'capabilities': {'drop': ['ALL']}, 'seccompProfile': {'type': 'RuntimeDefault'}}}
            deployment = {'apiVersion': 'apps/v1', 'kind': 'Deployment', 'metadata': {'name': 'web', 'namespace': name},
                          'spec': {'replicas': 2, 'strategy': {'type': 'RollingUpdate', 'rollingUpdate': {'maxSurge': 0, 'maxUnavailable': 1}},
                          'selector': {'matchLabels': {'app': 'web'}}, 'template': {'metadata': {'labels': {'app': 'web'}},
                          'spec': {'automountServiceAccountToken': False, 'containers': [container],
                          'affinity': {'podAntiAffinity': {'requiredDuringSchedulingIgnoredDuringExecution': [
                              {'labelSelector': {'matchLabels': {'app': 'web'}}, 'topologyKey': 'kubernetes.io/hostname'}]}}}}}}
            apply(deployment, resource('Service', 'web', spec={'selector': {'app': 'web'}, 'ports': [{'port': 8080, 'targetPort': 8080}]}))
            kubectl('rollout', 'status', 'deployment/web', '--timeout=120s')
            assert kubectl('exec', 'deployment/web', '--', 'wget', '-qO-', 'http://web.' + name + '.svc.cluster.local:8080').stdout.strip() == 'infra-v1'
            checks.append('non-root workload, readiness, service routing and cluster DNS return actual HTTP content')
            pods = json.loads(kubectl('get', 'pods', '-l', 'app=web', '-o', 'json').stdout)['items']
            assert len({pod['spec']['nodeName'] for pod in pods}) == 2
            old_uid = pods[0]['metadata']['uid']
            kubectl('delete', 'pod', pods[0]['metadata']['name'], '--wait=true')
            kubectl('rollout', 'status', 'deployment/web', '--timeout=120s')
            replacement = json.loads(kubectl('get', 'pods', '-l', 'app=web', '-o', 'json').stdout)['items']
            assert old_uid not in {pod['metadata']['uid'] for pod in replacement} and len(replacement) == 2
            checks.append('deleted replica is replaced with a new Pod UID and service recovers')
            apply(resource('ResourceQuota', 'budget', spec={'hard': {'requests.cpu': '1', 'requests.memory': '256Mi', 'limits.cpu': '2', 'limits.memory': '512Mi'}}))
            oversized = dict(container, name='over-budget', resources={'requests': {'cpu': '10', 'memory': '16Mi'}, 'limits': {'cpu': '10', 'memory': '64Mi'}})
            denied = apply(resource('Pod', 'over-budget', spec={'containers': [oversized]}), expected=None)
            assert denied.returncode != 0 and 'exceeded quota' in denied.stderr
            checks.append('API admission rejects a workload exceeding the namespace CPU budget')
            kubectl('patch', 'deployment', 'web', '--type=json', '-p', json.dumps([{'op': 'replace', 'path': '/spec/template/spec/containers/0/command', 'value': ['sh', '-c', 'exit 23']}]))
            failed = kubectl('rollout', 'status', 'deployment/web', '--timeout=20s', expected=None, timeout=40)
            assert failed.returncode != 0
            failed_pods = json.loads(kubectl('get', 'pods', '-l', 'app=web', '-o', 'json').stdout)['items']
            assert any(status.get(phase, {}).get('terminated', {}).get('exitCode') == 23
                       for pod in failed_pods for status in pod['status'].get('containerStatuses', [])
                       for phase in ['state', 'lastState']), 'Expected the failed revision to actually execute and exit 23'
            kubectl('rollout', 'undo', 'deployment/web')
            kubectl('rollout', 'status', 'deployment/web', '--timeout=120s')
            assert kubectl('exec', 'deployment/web', '--', 'wget', '-qO-', 'http://web:8080').stdout.strip() == 'infra-v1'
            checks.append('failing release is observed and rollback restores the serving revision')
            result['kubernetesVersion'] = json.loads(kubectl('version', '-o', 'json').stdout)['serverVersion']['gitVersion']
        result['passed'] = True
    except BaseException as error:
        result['error'] = str(error)
        raise
    finally:
        cleanup = []
        for container in reversed(containers):
            cleanup_command(['docker', 'logs', '--tail', '80', container])
            cleanup.append(cleanup_command(['docker', 'rm', '-f', container]))
        if network:
            cleanup.append(cleanup_command(['docker', 'network', 'rm', name]))
        if kind_created:
            cleanup.append(cleanup_command(['kind', 'delete', 'cluster', '--name', name]))
        result['cleanupPassed'] = all(cleanup)
        result['passed'] = result['passed'] and result['cleanupPassed']
        (ROOT / 'artifacts' / (args.engine + '-cluster-results.json')).write_text(json.dumps(result, indent=2) + '\n')
        (ROOT / 'artifacts' / (args.engine + '-cluster-log.json')).write_text(json.dumps(log, indent=2) + '\n')
        if not result['cleanupPassed']:
            raise RuntimeError('Owned cluster cleanup failed; inspect the recorded resource name: ' + name)
    print(json.dumps(result))


if __name__ == '__main__':
    main()
