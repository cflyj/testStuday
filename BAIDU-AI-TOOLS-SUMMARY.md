# 百度实习期 AI 工具与落地总结

> 来源：`readme3.md` 提炼。聚焦工具目标、能力与工程化要点，便于对外呈现与复用。

## 概览
- 场景：内部研发提效、内容生产与数据查询等 AI 工具链建设。
- 角色：前端实习生，侧重 Prompt 工程、MCP 工具接入、任务编排与性能/可靠性。
- 产出：页面 D2C 生成辅助、活动退场逻辑生成与重构、Talos PV 查询 MCP 工具、Jest 单测助手、PDF 工具链等。

---

## 1. 页面视觉 D2C 生成辅助（Cosmic D2C）
- 目标：快速生成页面大体结构骨架，缩短从原型到可运行页面的时间。
- 方法：通过 Prompt 规范化页面语义（区块/层级/命名），生成结构代码，再人工补齐样式与交互。
- 评估：结构正确率较高；样式/尺寸/滚动需手调；适合“70%生成 + 30%打磨”的工作流。

## 2. 活动“退场”逻辑生成与工程化落地
- 目标：为营销活动提供可配置的“退场”判定（一次展现退场、7天无点击退场等）。
- 方案 A（Zulu/Deepseek 生成 + 本地完善）
  - 存储：localStorage 持久化；按活动周期隔离数据。
  - 机制：
    - 单次展现即退场（强曝光场景）。
    - 7 天无交互退场（留存场景）。
  - 周期：自动生成周期 ID（基于时间），或用户传入周期（更灵活）。
  - API：recordImpression/recordClick/shouldExit 等，简洁易用。
- 工程要点：
  - 自动清理过期周期数据；默认周期与内容隔离（contentId 粒度）。
  - 通过 Prompt 反复迭代让模型输出接近“可落地”的代码，再做手工收敛。

## 3. Talos PV 查询 MCP 工具（运营自助数据检索）
- 目标：基于 Model Context Protocol（MCP）封装内部接口，按“最近 N 天”批量查询弹窗曝光 PV，并按日期聚合导出。
- 能力：
  - 批量请求 + 节流（Promise 批处理 + 间隔休眠）。
  - 失败收集与重试；结果分组导出 txt。
  - 工具注册与服务连接：统一在 MCP Server 中暴露 `talos-pv` 工具。
- 价值：替代手动查询，显著降低运营同学的重复工作量；对话式调用，易推广。

## 4. Jest 单测辅助工具（MCP 插件）
- 目标：给大模型提供“库上下文 + 规范 + mock 用法 + 示例”，提升测试代码生成质量。
- 实现：
  - 注册 `jest_helper` 工具，返回项目规范、Mock 约定、示例片段等。
  - 模型据此生成更贴合仓库风格的测试代码；支持异步/Mock/边界等场景。
- 注意：客户端连接由 VS Code/Comate 等承担，工具侧只需注册与暴露接口。

## 5. PDF 工具链（限流调度 + Canvas 拼接截图）
- 目标：
  - 并发控制：页面翻译请求过多时，限制同并发量、按需出队。
  - 截屏拼接：多页/多列拼接导出图片，贴合实际渲染尺寸。
- 实现：
  - 通用并发队列：入队/执行池/Promise.race + 递归出队，支持 `waitAll()`。
  - Canvas merge：以 clientWidth/clientHeight 取真实尺寸，支持裁剪与导出。

---

## Prompt 工程与经验
- 逻辑更清晰的 Prompt → 更高可用度代码（尤其工具函数/类）。
- 复杂业务重构时，模型的代码理解易偏差：需要“分段-定位-示例-约束-增量微调”的节奏。
- 总结：
  - Zulu/Deepseek 适合工具方法与结构搭建；对复杂耦合模块需多轮引导 + 人工整合。

## 工程化通用要点
- 批处理与节流：Promise 批次 + sleep；失败收集与重试；过程日志。
- 数据持久化与隔离：localStorage + 周期/内容维度；过期清理。
- 输出标准化：MCP 工具注册/描述/参数；统一导出格式（txt/JSON）。
- 性能与稳定性：transform/opacity 优先、真实尺寸获取、并发上限配置、兜底与幂等处理。

---

## 简历可用描述（中文）
AI 工具链与研发提效实践（百度｜前端实习）
- 基于 MCP 构建 Talos PV 自助查询工具，实现批量请求、节流与按日导出，替代运营手工查询。
- 产出 Jest 单测辅助工具，向大模型提供库上下文/规范/Mock 用法，提升测试代码生成质量与一致性。
- 推动活动“退场”逻辑工程化（展现退场、7日无交互退场、周期隔离、过期清理），API 简洁可复用。
- 搭建 PDF 工具链（并发队列 + Canvas 拼接截图），并支持 D2C 页面生成流程（结构生成 + 人工打磨）。

## Resume snippet (EN)
AI Tools & Dev Productivity (Intern @ Baidu)
- Built an MCP-based tool to batch query Talos popup PV, with throttling and date-grouped export for operations teams.
- Created a Jest testing assistant (MCP) that provides project context/specs/mocks, improving code-gen quality and consistency.
- Engineered campaign “exit” logic (one-shot exposure, 7-day inactivity, period isolation, data cleanup) with a simple API.
- Developed a PDF pipeline (concurrency queue + canvas merge) and supported D2C page generation (structure-first, human-polished).
