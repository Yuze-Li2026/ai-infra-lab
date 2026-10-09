"""Reference for the supplemental contract; not an original-course solution."""
import torch

def matmul(left, right):
    return left @ right

def squared_gradient(inputs):
    value = inputs.detach().clone().requires_grad_(True)
    value.square().sum().backward()
    return value.grad

def build_model(device):
    return torch.nn.Sequential(torch.nn.Linear(4, 16), torch.nn.Tanh(), torch.nn.Linear(16, 1)).to(device)

def build_optimizer(model):
    return torch.optim.Adam(model.parameters(), lr=.03)

def train_step(model, optimizer, inputs, labels):
    optimizer.zero_grad(set_to_none=True)
    loss = torch.nn.functional.mse_loss(model(inputs), labels)
    loss.backward()
    optimizer.step()
    return loss.detach().item()

def save_checkpoint(path, model, optimizer, step):
    torch.save({'model': model.state_dict(), 'optimizer': optimizer.state_dict(), 'step': step,
                'rng': torch.get_rng_state(), 'cuda_rng': torch.cuda.get_rng_state_all()}, path)

def load_checkpoint(path, model, optimizer, device):
    # Keep RNG/optimizer scalar counters on CPU; loading state casts model/moment tensors as needed.
    state = torch.load(path, map_location='cpu', weights_only=True)
    model.load_state_dict(state['model'])
    optimizer.load_state_dict(state['optimizer'])
    torch.set_rng_state(state['rng'].cpu())
    torch.cuda.set_rng_state_all([value.cpu() for value in state['cuda_rng']])
    return state['step']
