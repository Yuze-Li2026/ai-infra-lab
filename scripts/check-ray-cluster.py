"""Execute inside the head container of the isolated two-container Ray cluster."""
from pathlib import Path
import json
import os
import sys
import time
import ray
from ray.util.placement_group import placement_group, remove_placement_group
from ray.util.scheduling_strategies import PlacementGroupSchedulingStrategy

if not __debug__:
    raise RuntimeError('Verification requires assertions; do not run Python with -O')

output = Path(sys.argv[1])
result = {'passed': False, 'rayVersion': ray.__version__, 'checks': [], 'gpuVerified': False,
          'limits': 'Two real Ray nodes in Docker on one CPU host; no head-node failover or multi-machine claim.'}
group = None
try:
    deadline = time.monotonic() + 90
    while True:
        try:
            ray.init(address='auto', logging_level='ERROR')
            break
        except ConnectionError:
            if time.monotonic() >= deadline:
                raise
            time.sleep(1)
    while len([node for node in ray.nodes() if node['Alive']]) != 2:
        if time.monotonic() >= deadline:
            raise RuntimeError('Expected two independently running Ray nodes')
        time.sleep(1)
    nodes = [node for node in ray.nodes() if node['Alive']]
    assert len({node['NodeManagerAddress'] for node in nodes}) == 2
    result['nodes'] = [{'id': node['NodeID'], 'address': node['NodeManagerAddress'], 'resources': node['Resources']} for node in nodes]
    result['checks'].append('two independently addressed Ray nodes registered')

    @ray.remote(num_cpus=1)
    def square(value):
        return {'value': value * value, 'node': ray.get_runtime_context().get_node_id()}

    group = placement_group([{'CPU': 1}, {'CPU': 1}], strategy='STRICT_SPREAD')
    ray.get(group.ready(), timeout=60)
    tasks = [square.options(scheduling_strategy=PlacementGroupSchedulingStrategy(
        placement_group=group, placement_group_bundle_index=index)).remote(value)
        for index, value in enumerate([11, 17])]
    values = ray.get(tasks, timeout=30)
    assert [entry['value'] for entry in values] == [121, 289]
    assert len({entry['node'] for entry in values}) == 2
    result['checks'].append('gang resources reserve both nodes and tasks execute on distinct nodes')
    remove_placement_group(group)
    group = None

    @ray.remote(num_cpus=1, max_restarts=1, max_task_retries=0)
    class CheckpointedCounter:
        def __init__(self, file):
            self.file = Path(file)
            self.value = int(self.file.read_text()) if self.file.exists() else 0

        def increment(self):
            self.value += 1
            temporary = self.file.with_suffix('.tmp')
            temporary.write_text(str(self.value))
            temporary.replace(self.file)
            return self.state()

        def state(self):
            return {'value': self.value, 'pid': os.getpid(), 'node': ray.get_runtime_context().get_node_id()}

    actor = CheckpointedCounter.remote(str(output.parent / 'counter.checkpoint'))
    before = ray.get(actor.increment.remote(), timeout=60)
    assert before['value'] == 1
    ray.kill(actor, no_restart=False)
    deadline = time.monotonic() + 60
    while True:
        try:
            after = ray.get(actor.state.remote(), timeout=5)
            break
        except (ray.exceptions.RayActorError, ray.exceptions.GetTimeoutError):
            if time.monotonic() >= deadline:
                raise
            time.sleep(.5)
    assert after['value'] == 1 and (after['pid'], after['node']) != (before['pid'], before['node'])
    assert ray.get(actor.increment.remote(), timeout=30)['value'] == 2
    result['checks'].append('killed actor restarts as a new process and restores persisted application state')

    @ray.remote
    def rejected():
        raise ValueError('deliberate invalid input')

    try:
        ray.get(rejected.remote(), timeout=30)
        raise AssertionError('Remote error was silently accepted')
    except ray.exceptions.RayTaskError as error:
        assert 'deliberate invalid input' in str(error)
    result['checks'].append('invalid remote task propagates its error to the driver')
    ray.kill(actor)
    result['passed'] = True
except BaseException as error:
    result['error'] = str(error)
    raise
finally:
    if group is not None:
        remove_placement_group(group)
    ray.shutdown()
    output.write_text(json.dumps(result, indent=2) + '\n')
print(json.dumps(result))
