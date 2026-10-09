# GPU：正确性、性能与训练恢复

本实验是依据 [PyTorch 官方 API](https://docs.pytorch.org/docs/stable/index.html) 整合的补充检查，不是原课程评分。GPU 依赖安装与授权记录见[验证方案](gpu-validation-plan.md)。GPU 不是浏览本站或完成前面 CPU 实验的条件。

## 环境与实际结果

本机 NVIDIA GeForce RTX 5060 Laptop GPU，约 8 GB 显存，驱动 596.08，Python 3.12.14，PyTorch 2.10.0+cu128，CUDA runtime 12.8。使用已授权的 `.venv-labs`；没有修改驱动，没有购买云算力或下载模型权重。

```sh
node scripts/lab.mjs gpu
```

首版四项真实 CUDA 检查通过：FP32 矩阵乘法与 CPU 比较、梯度比较、固定小模型训练、模型及优化器恢复后下一步一致。当前验收契约 v2 在相同四类下检查 7 个案例：3 个矩阵形状、2 个梯度形状、训练、完整恢复。默认报告为 `artifacts/gpu-report.json`，属于 reference 模式，只证明此环境与工作负载可运行。默认文件会覆盖上次同名报告，个人作品建议用 `--output` 保存独立文件。

## 实际验收自己的 GPU 实现

创建自己的接口文件，完成七个接口；模板没有答案。下面的命令适用于 Windows/Linux/macOS，已有目录会拒绝覆盖作品：

```sh
node scripts/lab.mjs gpu --init workspaces/my-gpu
node scripts/lab.mjs gpu --submission workspaces/my-gpu/implementation.py --output artifacts/my-gpu-report.json
```

准备命令用独占创建目录和文件，不依赖 shell 遇错后是否继续执行。初次检查会产生明确失败，因为模板尚未实现。自己实现后复跑，把 `artifacts/my-gpu-report.json` 导入工程实验的 GPU 卡片。`--submission` 接受一个 `.py` 文件，检查器实际调用该文件的函数；不会把你写的布尔“成功”当验收结果。

|接口|输入与返回契约|检查器负责的验收|
|---|---|---|
|`matmul(left, right)`|返回输入设备上的 FP32 矩阵乘积，不改写输入|非方阵、小矩阵和 512 方阵，对照 CPU oracle|
|`squared_gradient(inputs)`|返回 `sum(inputs ** 2)` 的梯度，不改写输入|两种张量形状，对照 CPU autograd|
|`build_model(device)`|返回 4 特征到 1 输出的 `torch.nn.Module`，放在指定设备|输出形状、真实 MSE 和状态|
|`build_optimizer(model)`|返回管理该模型所有参数的 PyTorch 优化器|参数归属与恢复后的实际更新|
|`train_step(model, optimizer, inputs, labels)`|执行一个训练步，返回有限标量 loss|150 步后真实预测 MSE 低于初始值的 5%；伪造 loss 不计通过|
|`save_checkpoint(path, model, optimizer, step)`|把模型、优化器、步数和 CPU/CUDA RNG 写到指定文件|每次运行使用自己的临时检查点，不覆盖已有作品文件|
|`load_checkpoint(path, model, optimizer, device)`|完整恢复并返回存储的步数|扰动 RNG 后恢复、预测相同、下一训练步的完整模型状态完全相同|

工作负载是确定性回归，模型应支持固定输入和恢复对照；不能用随机层的未固定预测绕过状态检查。结果保留实现文件的 SHA-256、环境、误差、真实训练轨迹和性能样本。参考实现位于 `labs/gpu/reference.py`，可以研究 API，但复制它跑 submission 只证明执行路由，不能证明独立实现。课程报告不作真实性签名。

报告版本现在是 `pytorch-2.10.0+cu128-contract-v2`，范围为 7 个案例。旧版报告不能满足新范围，需要重新运行；旧学习备份继续保留。缺少接口、错误乘积或梯度、没有真正更新参数、遗漏优化器或 RNG 状态都会生成失败记录。

## Learn / Design / Build

先修线性代数、数值误差、训练循环和 GPU 执行模型。阅读 [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/) 的线程组织、内存与同步主题，以及 PyTorch 的矩阵乘法、自动微分、确定性与保存加载接口。

先设计 CPU oracle、容差、随机种子、计时边界和显存预算。在自己的文件中完成上述接口，保留误差表、训练轨迹和故意破坏恢复状态的失败案例。不要只复制补充检查作为完整 GPU 工程项目。

## Test：避免看似成功

固定种子 2026、关闭 TF32、启用确定性算法，设置 `CUBLAS_WORKSPACE_CONFIG=:4096:8`。矩阵包含小尺寸、非方阵和 512×512，FP32 比较使用 `atol=1e-4, rtol=1e-4`；实际误差逐形状保存在报告。训练是合成 64×4 数据与小网络，不是公开模型精度评测。

检查点包含模型、优化器与步数。恢复后先比较预测，再运行下一步比较参数，避免只验证文件能读。没有 CUDA 时明确失败，不把 CPU 结果当 GPU 结果。不要加载来源不明的 checkpoint；本实验使用自己生成的文件和 `weights_only=True`。

## Optimize：明确计时边界

三次预热、九次样本；GPU 前后同步。输入已驻留设备，计时包含 Python 调度及 CUDA 同步，**不包含主机到设备传输**。首版测量 CPU 单线程中位数 1.9912 ms，GPU 0.0555 ms；当前值以最近报告及卡片的实际样本为准。完整样本、种子和环境保存在报告；频率、温度、功耗和工作负载会改变结果。

增加自己的不同矩阵规模、传输与计算总耗时对照，测显存峰值与正确性，说明小输入何时受调度开销主导。不能拿此比值外推到训练、服务吞吐或多卡扩展。

## Explain：进入真正的高级项目

说明容差为何合理、确定性有哪些条件、checkpoint 缺少优化器状态会如何改变下一步。单卡验证没有证明 NCCL、多卡故障恢复、内核优化或工业服务指标。原课项目与硬件条件见[高级原课实验](advanced-labs.md)。
