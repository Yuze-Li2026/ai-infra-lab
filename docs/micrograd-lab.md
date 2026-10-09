# micrograd：亲手实现反向自动微分

原作者 **Andrej Karpathy**，[原项目](https://github.com/karpathy/micrograd)。MIT 代码固定提交 `7bc720e951fe422b8f8814aa5aa1b64121d26b4c`，原许可、engine、nn 和两项原测试位于 `labs/micrograd/upstream`。

## Learn：从导数到计算图

先修 Python 对象、函数与导数、链式法则和梯度下降。阅读原 README 与 engine/nn 说明，对照[术语表](glossary.md)。先在纸上推导一个含重复变量的标量表达式，再画计算图，解释反向遍历顺序与梯度累加。ReLU 在零点不可微，有限差分案例应避开该点，并解释所选约定。

## Design / Build：接口先于答案

在自己的目录实现 `micrograd` 包：`engine.py` 提供 `Value`，`nn.py` 提供与原接口对应的神经网络组件。实现加减乘除、幂、ReLU、反向遍历、参数收集和梯度清零。先提交图与梯度不变量，再写代码；不能以复制原 engine 作为独立完成。

## Test：原测试与补充检查分别计数

```sh
node scripts/lab.mjs micrograd
node scripts/lab.mjs micrograd --submission ./my-micrograd --output artifacts/my-micrograd.json
```

**11 项检查**：8 个有限差分案例、1 项固定种子的 XOR 小网络训练，以及 2 项原作者与 PyTorch 比较的测试。只有最后 2 项是原测试，其他 9 项是本站补充集成检查。有限差分和训练在普通 CPU 上运行；原测试的 PyTorch 对照需要安装 PyTorch。未安装时，运行器明确记录未执行，不能把它报告为 11 项通过。

在自己的实现中增加梯度重复累加、无关节点、饱和/大数、零梯度和清零行为等边界测试。导入 submission JSON；通过报告不能代替推导与独立解释。

## Optimize：正确性优先的对照

性能工作负载为 50 个深度 25 的图，包含前向构图和反向求导；两次预热、七次样本，保存中位数与完整样本。比较拓扑排序、对象分配或中间节点管理，说明重复变量梯度仍正确。小模型使用种子 42、600 次迭代；它的拟合结果不能代表真实数据泛化。

## Explain：理解标量引擎的边界

解释计算图释放、梯度累积、分支不可微、浮点误差与训练循环的关系。micrograd 是标量教学引擎，没有张量广播、GPU 后端、融合、分布式或工业性能。接下来通过 [Deep Learning Systems](https://dlsyscourse.org/) 的原课作业进入张量与后端，见[高级原课实验](advanced-labs.md)。
