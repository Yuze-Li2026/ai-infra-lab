# 本机 GPU 验证方案

2026-10-09 实测硬件：NVIDIA GeForce RTX 5060 Laptop GPU，8,151 MiB 显存，驱动 596.08。项目环境现已安装 PyTorch 2.10.0+cu128；未安装 CUDA C++ 编译工具链，不能据此声称原生 CUDA 作业已复现。

## 具体安装范围

仅向项目的 `.venv-labs` 虚拟环境安装 `labs/requirements-gpu.txt`：官方 PyTorch 2.10.0+cu128（Windows x64、CPython 3.12）及 NumPy 2.2.6。官方 wheel 索引已核对；PyTorch 单包 2,867,409,626 字节，SHA-256 固定于 requirements。其他 Python 依赖由 pip 解析并记录安装报告，安装后保存最终冻结版本。

预估下载约 3 GB，建议预留 10 GB 磁盘空间；使用 `--no-cache-dir` 避免额外保留 pip 下载缓存。不修改驱动、系统 Python、PATH，不下载模型权重。若实际依赖显著超过这个范围，停止并重新核对。

```powershell
.venv-labs/Scripts/python.exe -m pip install --no-cache-dir --report artifacts/gpu-install.json -r labs/requirements-gpu.txt
```

此次大规模下载经项目所有者明确授权后完成，没有额外软件费用，没有购买云资源。该授权仅针对上述本机安装，不延伸到新的下载或其他使用者的设备。最终版本锁为 `labs/requirements-gpu-windows-lock.txt`，只适用于 Windows x64 / CPython 3.12。

## 验证内容

1. CUDA 设备识别、实际设备运算和同步；错误时记录原始异常，不把驱动信息当作可运行证明。
2. 固定输入的 CPU/GPU FP32 矩阵乘法与梯度对照，声明容差与 TF32 设置。
3. 预热后进行多次独立计时，报告中位数、最小/最大值和完整样本；区分设备计算与数据传输。
4. 训练一个小型合成数据模型，保存和恢复状态，比较恢复后的预测及继续训练结果。
5. 运行 micrograd 原作者保留的 PyTorch 对照测试；保留结果与版本。

数据规模限制在本机显存范围内，不占用付费云资源。单卡结果不能证明多卡通信、集群恢复或分布式训练性能；这些分支另有环境条件与验收规范。

官方来源：[PyTorch 安装说明](https://pytorch.org/get-started/locally/)、[CUDA 12.8 wheel 索引](https://download.pytorch.org/whl/cu128/torch/)。

## 实际结果

2026-10-09 首轮 CUDA 四类补充检查与 micrograd 两项原 PyTorch 对照测试通过。后续 GPU 运行器细化为七个检查用例，当前名称与条件见[GPU 指南](gpu-lab.md)；首轮记录不替代后续版本复验。报告分别写入 artifacts/gpu-report.json 与 artifacts/micrograd-report.json，测量边界随报告保留。本次安装不代表安装了所有高级课程工具，也不证明多卡性能。
