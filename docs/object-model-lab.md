# 阶段项目：理解一个对象运行时

来源：Carl Friedrich Bolz，《500 Lines or Less》[A Simple Object Model](https://aosabook.org/en/500L/a-simple-object-model.html)。代码固定为 aosabook/500lines 的 `fba689d101eb5600f5c8f4d7fd79912498e950e2`。原代码与原测试不做修改；MIT 软件许可和 CC BY 3.0 文字许可原文保存在 `upstream/LICENSE.md`。Copyright (c) Carl Friedrich Bolz。本站新增运行适配器和中文实验组织说明。

先修：Python 函数、类、字典、递归、异常、模块、测试和复杂度基础。普通 CPU，Python 3.10+，无需第三方包、账号、GPU 或联网。项目是教学运行时，不能直接当作工业解释器。

## Learn → Design → Build → Test → Optimize → Explain

1. 阅读原章节的设计问题，先画出对象、类、元类和属性查找关系，再查看对应测试。参考实现放在 upstream 中；不要先复制它再声称独立完成。
2. 在自己的目录编写 `objmodel.py`，依次实现原课四阶段：消息派发、绑定方法、可定制属性、共享 map。每阶段记录设计决策和原测试暴露的边界。
3. 运行原测试。适配器将原始无参数 `test_*` 函数交给 Python 标准库 unittest，未替换原测试断言；每阶段独立子进程，防止同名模块污染。
4. 增加自己的反例：同名实例属性、继承覆盖、缺失属性、不同写入顺序、共享布局后各实例值的独立性。说明原测试没覆盖什么。
5. 对比字典存储与 map 存储，记录对象数、内存、预热、七次测量及校验和。解释测量噪声；结果可能没有速度提升，不允许只报告最好一次。
6. 提交设计文档、独立代码、原测试与新增测试结果、性能数据及至少一次失败后的修复说明。

## 先复现参考实现

在项目根目录执行：

```sh
node scripts/lab.mjs object-model --benchmark
```

结果保存 `artifacts/object-model-report.json`，包含固定版本、文件校验、平台、Python、各阶段原测试和性能数据。`mode: reference` 仅证明参考实现能运行，不代表你完成实验。

## 验收自己的实现

```sh
node scripts/lab.mjs object-model --stage 01-smalltalk-like --submission ./my-object-model
```

目录必须包含自行实现的 `objmodel.py`。后续阶段名依次是 `02-attr-based`、`03-customizable`、`04-maps`。每阶段需要完整实现该阶段的公共接口。提交模式标为 `submission`，不能与参考 benchmark 混在一起。

阶段复核需要四阶段的完整报告。将四份独立实现分别放入 `my-object-model/01-smalltalk-like/objmodel.py`、`02-attr-based/objmodel.py`、`03-customizable/objmodel.py`、`04-maps/objmodel.py`，省略 `--stage` 运行：

```sh
node scripts/lab.mjs object-model --submission ./my-object-model --output artifacts/my-object-model.json
```

完整范围要求四组分别通过 5、6、8、9 项原测试，共 28 项。单阶段通过可保存为阶段性进展，不能计入完整作品验收。

指定的本人代码会以当前用户权限运行；隔离解释器启动和超时不构成安全沙箱。不要运行未知提交。原始代码完整性会在执行前校验；修改 upstream 时检查会失败，应将个人实现放到单独目录。

## 能力验收

- 正确性：所选阶段原测试全部通过，新增至少三类有解释的边界测试。
- 设计：能画出查找和绑定过程，说明为什么类也是对象。
- 性能：报告参考环境、重复测量和正确性校验；自己优化的版本需用相同方法测量。
- 解释：描述教学简化之处及与真实 Python 的差异，说明 map 共享为何可能节省内存。
- 独立性：保存自己的提交历史，能现场修改需求并解释实现。跑过参考代码不能代替这些成果。

本项目足以验证程序抽象和运行时入门能力，不能独自证明整个 AI Infra 阶段或工业编译器能力。

## 报告与阶段材料

运行后在实验台导入对应 JSON；参考报告不会计入个人作品。平台核对模式、版本和规定测试范围，摘要保留各组名称与计数。旧备份仍可恢复，旧报告摘要没有范围时需要重新导入原 JSON；不能仅凭总计数补成通过。评审仍需检查四阶段设计、独立代码、额外边界与测量材料。
