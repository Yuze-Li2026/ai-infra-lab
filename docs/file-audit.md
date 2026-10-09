# 0.4.0 逐文件审查与覆盖复核

日期：2026-10-09。以 0.3.0 提交 `0971a646038203b161183cf084358a52ee1e51db` 的 144 个受版本控制文件为基线，新增四个文件，逐项审查维护源码、文档、目录、测试、配置和冻结上游。下表逐文件列出审查对象与方法；不能以文件数量证明没有缺陷。

## 学习完整性怎样复查

按 CMU DLSys、Stanford CS336、MLSysBook 单机卷/规模卷及官方系统机制交叉核对，补齐 21 个任务和 8 项来源：当前 45 节点、41 来源、11 实验入口、6 项本地流程。20 类领域对应见[覆盖矩阵](coverage.md)，共同基础与六条工程方向见[学习路径](learning-paths.md)，所有任务的精读与作品见[选章指南](curriculum.md)。本机 PyTorch 固定 2.10，API 文档与滚动教程分别标注。

## 实际发现与修复

|问题|处理与验证方式|
|---|---|
|单个对象模型阶段通过曾可计为完整作品|声明 `requiredChecks`，核对四阶段 5/6/8/9 项及其他项目的全部名称和测试数；保留旧摘要但要求重新导入范围|
|对象模型独立提交缺少一次运行全部阶段的入口|支持四子目录一次提交；参考源码只用于运行器测试夹具，不声称真实独立作品|
|首次运行 DBDB/共识时 artifacts 不存在|共享入口先创建输出目录；从新源码副本无输出目录启动复验|
|Python 优化会移除原断言|共享运行器拒绝 `-O`；三个项目增加失败回归检查；对象模型原有拒绝保留|
|GPU 固定检查点可能覆盖已有文件或互相干扰|每次运行使用独立临时目录；实际 CUDA 保存/恢复再次验证|
|旧迁移工具可能重复追加或覆盖新版目录|检查特定历史输入版本后才执行；拒绝当前版本|
|第三方更新可能写入非锁定版本|复制前预检全部包版本；冻结浏览器文件继续校验 SHA-256|
|清理器在不支持的浏览器可能原样返回输入|站内阅读先检查支持，失败时停止渲染；增加浏览器回归|
|历史文档数量被写成当前状态|更新当前文档、保留 0.2/0.3 历史快照并标注版本；新增结构覆盖检查|
|原参考测试的覆盖边界不够明确|记录 DBDB pickle/flush、共识弱断言与模拟边界、micrograd 形状/梯度边界，不篡改上游测试|

## 审查范围与方法

维护文件按全文及变更复核。冻结对象模型相邻阶段重复测试采用已读基线加完整差异复核；空包文件检查零字节与哈希。其余精选上游源码、测试、许可和清单阅读，并用运行器检验冻结文件。Marked 分发文件是生成压缩代码，分段阅读解析/渲染流程；DOMPurify 分段阅读配置、属性、节点、模板、命名空间、清理和返回路径，并检查本站调用限制。这是本项目集成审查，不是第三方独立安全认证。

`node_modules`、4 GB 级虚拟环境和历史生成产物按依赖锁、诊断、清单及实际执行核查，不声称逐行阅读其全部依赖源码。`dist` 按公开白名单、逐文件大小与 SHA-256 检查；个人数据、提示词和本地报告不公开。冻结源码仅为清单选定的文件，未镜像整个上游仓库或全部课件。

## 逐文件记录

|文件|审查内容与方式|
|---|---|
|`.gitattributes`|配置全文：命令、固定依赖/Actions、权限、换行、忽略范围及编辑器契约|
|`.github/workflows/pages.yml`|配置全文：命令、固定依赖/Actions、权限、换行、忽略范围及编辑器契约|
|`.github/workflows/validate.yml`|配置全文：命令、固定依赖/Actions、权限、换行、忽略范围及编辑器契约|
|`.gitignore`|配置全文：命令、固定依赖/Actions、权限、换行、忽略范围及编辑器契约|
|`.vscode/settings.json`|配置全文：命令、固定依赖/Actions、权限、换行、忽略范围及编辑器契约|
|`CONTRIBUTING.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`CREDITS.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`LICENSE`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`README.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`SECURITY.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/acceptance.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/advanced-labs.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/architecture.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/consensus-lab.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/coverage.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/curriculum.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/dbdb-lab.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/extensions.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/faq.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/file-audit.md`|审查范围、实际发现、逐文件清单与验证边界；检查自述是否符合证据|
|`docs/getting-started.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/glossary.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/gpu-lab.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/gpu-validation-plan.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/index.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/learning-paths.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/maintainer-tutorial.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/maintenance.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/micrograd-lab.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/object-model-lab.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/optimization-review.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/path-evidence.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/release-complete.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/release-v02.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/requirements-audit.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/research.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`docs/verification.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`labs/common.py`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`labs/consensus/run.py`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`labs/consensus/upstream/LICENSE.md`|许可原文、署名与保留范围；不改写上游|
|`labs/consensus/upstream/cluster.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/extract_code.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/manifest.json`|来源、固定提交、逐文件大小与 SHA-256；运行器完整性复验|
|`labs/consensus/upstream/run.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/__init__.py`|包初始化与字节内容；空文件确认零字节|
|`labs/consensus/upstream/test/fake_network.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_acceptor.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_bootstrap.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_commander.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_integration.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_leader.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_lines.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_member.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_network.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_replica.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_requester.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_scout.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/test_seed.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/consensus/upstream/test/utils.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/run.py`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`labs/dbdb/upstream/LICENSE.md`|许可原文、署名与保留范围；不改写上游|
|`labs/dbdb/upstream/dbdb/__init__.py`|包初始化与字节内容；空文件确认零字节|
|`labs/dbdb/upstream/dbdb/binary_tree.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/upstream/dbdb/interface.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/upstream/dbdb/logical.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/upstream/dbdb/physical.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/upstream/dbdb/tests/__init__.py`|包初始化与字节内容；空文件确认零字节|
|`labs/dbdb/upstream/dbdb/tests/test_binary_tree.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/upstream/dbdb/tests/test_integration.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/upstream/dbdb/tests/test_physical.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/upstream/dbdb/tool.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/upstream/manifest.json`|来源、固定提交、逐文件大小与 SHA-256；运行器完整性复验|
|`labs/dbdb/upstream/requirements.txt`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/dbdb/upstream/setup.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/gpu/run.py`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`labs/micrograd/run.py`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`labs/micrograd/upstream/LICENSE`|许可原文、署名与保留范围；不改写上游|
|`labs/micrograd/upstream/README.md`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/micrograd/upstream/manifest.json`|来源、固定提交、逐文件大小与 SHA-256；运行器完整性复验|
|`labs/micrograd/upstream/micrograd/__init__.py`|包初始化与字节内容；空文件确认零字节|
|`labs/micrograd/upstream/micrograd/engine.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/micrograd/upstream/micrograd/nn.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/micrograd/upstream/test/test_engine.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/object-model/README.md`|全文阅读：来源、步骤、命令、版本、数量、许可和实际验证边界；链接与网页阅读复验|
|`labs/object-model/run.py`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`labs/object-model/upstream/LICENSE.md`|许可原文、署名与保留范围；不改写上游|
|`labs/object-model/upstream/manifest.json`|来源、固定提交、逐文件大小与 SHA-256；运行器完整性复验|
|`labs/object-model/upstream/objmodel/README.txt`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/object-model/upstream/objmodel/code/01-smalltalk-like/objmodel.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/object-model/upstream/objmodel/code/01-smalltalk-like/test_objmodel.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/object-model/upstream/objmodel/code/02-attr-based/objmodel.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/object-model/upstream/objmodel/code/02-attr-based/test_objmodel.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/object-model/upstream/objmodel/code/03-customizable/objmodel.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/object-model/upstream/objmodel/code/03-customizable/test_objmodel.py`|已读前阶段完整基线与本阶段完整差异；原测试复验|
|`labs/object-model/upstream/objmodel/code/04-maps/objmodel.py`|精选原始源码/测试/说明全文，接口、断言和教学边界；保留哈希|
|`labs/object-model/upstream/objmodel/code/04-maps/test_objmodel.py`|已读前阶段完整基线与本阶段完整差异；原测试复验|
|`labs/requirements-ci.txt`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`labs/requirements-cpu.txt`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`labs/requirements-gpu-windows-lock.txt`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`labs/requirements-gpu.txt`|运行器/依赖锁全文：路径、原测试、失败报告、模式、断言、计时、检查点与原始文件保护|
|`package-lock.json`|配置全文：命令、固定依赖/Actions、权限、换行、忽略范围及编辑器契约|
|`package.json`|配置全文：命令、固定依赖/Actions、权限、换行、忽略范围及编辑器契约|
|`schemas/catalog.schema.json`|配置全文：命令、固定依赖/Actions、权限、换行、忽略范围及编辑器契约|
|`scripts/build.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/check-coverage.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/check-docs.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/check-links.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/complete-catalog.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/create-catalog.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/credits.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/doctor.py`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/grade.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/lab.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/refactor-v02.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/research-v02.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/serve.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/validate.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/vendor-object-model.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/vendor-stage-projects.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/vendor-web.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/verify-dist.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`scripts/verify-vendor.mjs`|全文：输入与文件边界、错误恢复、版本/白名单、子进程与校验；对应自动检查|
|`site/app.js`|全文：状态/路由/呈现/存储、安全文本与文档、范围筛选、键盘/屏宽、错误处理|
|`site/catalog.json`|全部资源元数据与定性评估、45 节点范围/先修/步骤/产物、实验与里程碑；DAG/覆盖/报告契约校验|
|`site/core.js`|全文：状态/路由/呈现/存储、安全文本与文档、范围筛选、键盘/屏宽、错误处理|
|`site/documents.js`|全文：状态/路由/呈现/存储、安全文本与文档、范围筛选、键盘/屏宽、错误处理|
|`site/index.html`|全文：状态/路由/呈现/存储、安全文本与文档、范围筛选、键盘/屏宽、错误处理|
|`site/reports.js`|全文：状态/路由/呈现/存储、安全文本与文档、范围筛选、键盘/屏宽、错误处理|
|`site/storage.js`|全文：状态/路由/呈现/存储、安全文本与文档、范围筛选、键盘/屏宽、错误处理|
|`site/styles.css`|全文：状态/路由/呈现/存储、安全文本与文档、范围筛选、键盘/屏宽、错误处理|
|`site/vendor/dompurify/LICENSE`|原许可或版本/来源/字节哈希清单；构建核验|
|`site/vendor/dompurify/purify.es.mjs`|生成分发代码分段审阅；解析/清理调用、许可、版本、哈希与浏览器负面输入|
|`site/vendor/manifest.json`|原许可或版本/来源/字节哈希清单；构建核验|
|`site/vendor/marked/LICENSE`|原许可或版本/来源/字节哈希清单；构建核验|
|`site/vendor/marked/marked.esm.js`|生成分发代码分段审阅；解析/清理调用、许可、版本、哈希与浏览器负面输入|
|`site/views.js`|全文：状态/路由/呈现/存储、安全文本与文档、范围筛选、键盘/屏宽、错误处理|
|`start.cmd`|配置全文：命令、固定依赖/Actions、权限、换行、忽略范围及编辑器契约|
|`tests/browser-check.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/build.test.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/complete-browser.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/core.test.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/grade.test.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/live-browser.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/object-model.test.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/optimization-browser.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/release-browser.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/reports.test.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|
|`tests/stage-labs.test.mjs`|全部测试与夹具：断言、真实失败路径、跳过条件、临时数据、屏宽和报告范围|

## 本轮复验

25 项自动测试通过，0 失败、0 跳过；44 组本地浏览器检查通过；真实 GPU 四项再次通过。DBDB 21 项与共识 46 项还分别从没有 artifacts 的独立副本启动通过。四个历史迁移脚本拒绝当前目录且目录字节不变。49 个外部入口经过定向重试全部可达，保留首轮超时记录。构建包含 46 项公开内容文件及一份构建清单；内容逐项校验，清单本身另核对。

同提交 Windows/Linux CI、源码恢复、Pages 与 HTTPS 逐文件复验的具体提交和结果，见[验证记录](verification.md)及[0.4.0 发布附件](https://github.com/Yuze-Li2026/ai-infra-lab/releases/tag/v0.4.0)中的 verification JSON。高级多卡、集群、设备和全部原课作业仍需实际实施；不能以节点、链接或参考实现的通过替代这些成果。
