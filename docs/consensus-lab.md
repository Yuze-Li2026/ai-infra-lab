# 共识：可重现的失效与恢复

原作者 **Dustin J. Mitchell**。先阅读 [Clustering by Consensus](https://aosabook.org/en/500L/clustering-by-consensus.html)。它采用 Multi-Paxos 思路，不能当作 Raft 教材替代品。精选 MIT 源码固定为 aosabook/500lines 提交 `fba689d101eb5600f5c8f4d7fd79912498e950e2`，位于 `labs/consensus/upstream`。

## Learn：明确故障模型

先完成操作系统并发、网络、状态机与多数派基础。阅读原章 Distributed State Machines、Consensus by Paxos、Introducing Cluster 与测试部分。用三节点示例说明安全性与活性的区别、为什么多数派相交、节点失效与领导者失效时哪些状态需要保留。不要把“所有测试通过”解释为共识协议已经被形式化证明。

## Design / Build：让状态可检查

先画角色、消息、定时器和日志槽位之间的状态变化。在自己的目录实现 Python 3 `cluster.py`，接口与原测试对应；保留状态不变量、消息轨迹和设计取舍。先用最小模拟网络，再逐步增加角色；不以复制参考实现作为独立作品。

## Test：故障不是附加题

安装固定 CPU 依赖后，从项目目录执行：

```sh
node scripts/lab.mjs consensus
node scripts/lab.mjs consensus --submission ./my-consensus --output artifacts/my-consensus.json
```

**46 项原功能测试**在本机通过，包含节点失效、领导者失效与集成场景。模拟日志中的 `KILLED BY TESTS` 是主动故障注入输出，以最终报告的 `passed` 判断检查结果。自行加入重复消息、延迟消息、掉线节点重新加入等场景，说明预期状态与实际轨迹。

原项目为 Python 2。运行器在独立 artifacts 目录使用 fissix 转换，修复整数多数派除法、比较协议与迭代器 mock，固定目的节点顺序。原始文件和原断言不改写，每次留下 `compatibility.patch`。

原始独立 `test_lines` 要求不超过 500 行，但固定原源码有 536 行。这项**编辑约束未满足**，不会冒充第 47 项通过检查。功能测试与编辑约束分别记录。

逐文件审查还确认原 `test_INVOKE_repeat` 没有真正调用重复请求操作；领导者失效集成场景对被杀节点的结果作了夹具补齐。这些原测试仍保留不变，46 项通过不能证明任意重复请求或真实故障都能恢复。独立作品需补充操作与状态断言、延迟/重复消息和持久化恢复证据。`extract_code.py` 是原作者提取章节的辅助工具，依赖未打包的章节文件；它不是本站实验入口。

## Optimize：测量场景成本

功能通过后，一次预热、七次重复运行整套功能场景，保留纳秒样本与中位数。边界包括同进程夹具、模拟网络和断言，不包括源码转换。这是场景执行成本，不是网络吞吐、真实 RTT 或多主机性能。优化消息数、事件队列或重复工作时，应同时报告消息轨迹、正确性和相同模拟条件下的测量。

## Explain：从教学系统进入实际系统

导入自己的 submission 报告，提交安全性/活性不变量、故障轨迹和恢复解释。这个确定性模拟器不验证真正的磁盘崩溃、多主机网络分区或工业部署。继续进入 [MIT 6.5840 原课程](https://pdos.csail.mit.edu/6.5840/) 前，应补齐 Go、并发测试与原课程许可要求，见[高级原课实验](advanced-labs.md)。
