"""Implement these interfaces in your own file, then use --submission <file>.

The evaluator owns the data, CPU oracle, tolerances, workload and report.
This template deliberately contains no solutions. See docs/gpu-lab.md.
"""

def matmul(left, right):
    raise NotImplementedError('Return the FP32 matrix product on the input device.')

def squared_gradient(inputs):
    raise NotImplementedError('Return the gradient of sum(inputs ** 2), preserving the input.')

def build_model(device):
    raise NotImplementedError('Return a torch.nn.Module mapping a batch of four features to one output.')

def build_optimizer(model):
    raise NotImplementedError('Return an optimizer over the supplied model parameters.')

def train_step(model, optimizer, inputs, labels):
    raise NotImplementedError('Perform one training step and return its finite scalar loss.')

def save_checkpoint(path, model, optimizer, step):
    raise NotImplementedError('Save model, optimizer, step and CPU/CUDA RNG states.')

def load_checkpoint(path, model, optimizer, device):
    raise NotImplementedError('Restore the full state and return the saved step.')
