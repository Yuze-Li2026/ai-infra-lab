# GPU：正确性、性能与训练恢复

本实验是依据 [PyTorch 官方 API](https://docs.pytorch.org/docs/stable/index.html) 整合的补充检查，不是原课程评分。GPU 依赖安装与授权记录见[验证方案](gpu-validation-plan.md)。GPU 不是浏览本站或完成前面 CPU 实验的条件。

## 环境与实际结果

本机 NVIDIA GeForce RTX 5060 Laptop GPU，约 8 GB 显存，驱动 596.08，Python 3.12.14，PyTorch 2.10.0+cu128，CUDA runtime 12.8。使用已授权的 `.venv-labs`；没有修改驱动，没有购买云算力或下载模型权重。

```sh
node scripts/lab.mjs gpu
```

四项真实 CUDA 检查通过：FP32 矩阵乘法与 CPU 比较、梯度比较、固定小模型训练、模型及优化器恢复后下一步一致。报告为 `artifacts/gpu-report.json`，属于 reference 模式。它只能证明此集成环境与工作负载可运行，不计入独立作品验收。

## Learn / Design / Build

先修线性代数、数值误差、训练循环和 GPU 执行模型。阅读 [CUDA Programming Guide](https://docs.nvidia.com/cuda/cuda-programming-guide/) 的线程组织、内存与同步主题，以及 PyTorch 的矩阵乘法、自动微分、确定性与保存加载接口。

先设计 CPU oracle、容差、随机种子、计时边界和显存预算。在自己的文件中实现等价验证，保留误差表、训练轨迹和故意破坏恢复状态的失败案例。不要只复制四项检查作为完整 GPU 工程项目。

## Test：避免看似成功

固定种子 2026、关闭 TF32、启用确定性算法，设置 `CUBLAS_WORKSPACE_CONFIG=:4096:8`。矩阵规模为 512×512，FP32 比较使用 `atol=1e-4, rtol=1e-4`；此次最大绝对误差约 `4.96e-5`。训练是合成 64×4 数据与小网络，不是公开模型精度评测。

检查点包含模型、优化器与步数。恢复后先比较预测，再运行下一步比较参数，避免只验证文件能读。没有 CUDA 时明确失败，不把 CPU 结果当 GPU 结果。不要加载来源不明的 checkpoint；本实验使用自己生成的文件和 `weights_only=True`。

## Optimize：明确计时边界

三次预热、九次样本；GPU 前后同步。输入已驻留设备，计时包含 Python 调度及 CUDA 同步，**不包含主机到设备传输**。本次 CPU 单线程中位数 1.9912 ms，GPU 0.0555 ms。完整样本、种子和环境保存在报告；频率、温度、功耗和工作负载会改变结果。

增加自己的不同矩阵规模、传输与计算总耗时对照，测显存峰值与正确性，说明小输入何时受调度开销主导。不能拿此比值外推到训练、服务吞吐或多卡扩展。

## Explain：进入真正的高级项目

说明容差为何合理、确定性有哪些条件、checkpoint 缺少优化器状态会如何改变下一步。单卡验证没有证明 NCCL、多卡故障恢复、内核优化或工业服务指标。原课项目与硬件条件见[高级原课实验](advanced-labs.md)。
