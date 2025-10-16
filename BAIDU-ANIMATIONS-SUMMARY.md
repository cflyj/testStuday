# 百度高考主页动效项目总结（实习期）

> 基于 `reeadme2.md` 中的实现与注释提炼。内容聚焦交互目标、技术实现与工程化实践，便于复盘与在简历中呈现。

## 项目概览
- 场景：百度高考主页/活动页动效与新手引导体验。
- 目标：在保证性能与稳定性的前提下，提供具备品牌调性的高质量动效，提升页面吸引力与完成关键引导动作（曝光/点击）。
- 技术栈：San + TypeScript、Less/CSS、SVG、GSAP、APNG、事件总线（eventHub）与埋点系统（曝光/点击）。

## 动效模块清单与亮点

### 1) 主按钮组动效：呼吸 + 扫光 + 背景流动
- 交互目标：突出主行动按钮；根据任务状态动态展示标题与奖励文案；支持新手引导态点击穿透。
- 关键实现：
  - CSS Keyframes 组合动画（`transform: scale/translate`、`opacity`、背景位移）形成呼吸与扫光效果。
  - 图层管理：左右“学分/心情”副按钮层级高于主按钮；引导态加 `z-index` 覆盖层实现全域点击。
  - 组件化：`c-log` 统一曝光打点，`btnClick` 分类型上报（普通态、品牌任务态 `brand_guide`）。
- 工程要点：
  - 动画解耦为背景滚动、脉动缩放与扫光三段，可独立调参与按需开关。
  - 仅用 GPU 友好属性（transform/opacity），减少重排重绘。

### 2) 异形心形容器动效（心情值/健康值）
- 交互目标：以心形容器承载状态变化（等级/进度/反馈）。
- 关键实现：
  - SVG Path 动态生成与渐变填充，配合 mask 与滤镜增强质感。
  - 进入/出场与形变动画使用 `requestAnimationFrame` 自定义循环，控制帧率与时间差，保证流畅度。
- 工程要点：
  - 数学曲线与路径插值的精度控制；多动画系统（CSS/SVG/rAF）协同。
  - 生命周期管理（created/attached/detached），及时释放观察者与定时器。

### 3) 进度条粒子效果（数学分布 + CSS 变量）
- 交互目标：进度增长时呈现光粒流动的“能量感”。
- 关键实现：
  - 粒子水平位置累积递增，垂直方向按分段概率密度随机（中间 85% 概率聚集，边缘稀疏），避免重叠并保证最小间距。
  - 每个粒子使用 CSS 变量控制延迟与透明度，形成波浪感；双层渐变叠加制造高光层次；径向渐变模拟真实光斑。
  - 进度阈值控制：仅在宽度达标时渲染/展示粒子，避免无谓开销。
- 工程要点：
  - 状态驱动显示与过渡（translate/scale 合成层），保证性能与可维护性。

### 4) 雪碧图帧动画（GSAP 时间轴）
- 交互目标：角色/物体的逐帧动态演绎，适配不同状态与阶段。
- 关键实现：
  - GSAP 主时间轴（Master Timeline）统一管理多段子动画，支持顺序/并行、标签化与统一控制。
  - 使用 `background-position` + `ease: steps(1)` 实现纯帧切换，避免插值引入的模糊。
  - 事件驱动：统一在进入/离开/完成时触发回调，避免多动画失步。
- 工程要点：
  - 单一属性动画策略（只改 background-position），降低重绘成本；根据状态动态调整参数（引导态/常规态）。

### 5) APNG 多段联动（浇水主 IP + 树生长）
- 交互目标：浇水—激活—成长的连贯剧情式反馈，增强参与感。
- 关键实现：
  - APNG 资源转 Blob URL 并缓存；按当前等级预加载所需动效，降低首帧等待。
  - 多段组合播放：水壶飞起浇水 + 树体激活动画；非循环 APNG 通过受控播放保证只播一次。
- 工程要点：
  - 资源管理与预加载时机；失败兜底与重试；与页面其他动画错峰初始化（避免首屏拥堵）。

## 系统与工程化实践
- 埋点体系：
  - 曝光（element_show）与点击（click）全覆盖；品牌任务 `brand_guide` 专属事件名切换；引导关闭后复曝。
- 事件解耦：
  - `eventHub` 用于组件间通信（步骤推进、主按钮联动、新手引导开关）。
- 状态管理：
  - 任务标题/收益文案/是否完成等派生状态通过 `computed` 动态计算，避免重复渲染与逻辑散落。
- 性能优化：
  - 尽量使用 `transform/opacity`、合成层、延迟与条件渲染、rAF 控制节流；移动端优先的帧稳定性。
- 可靠性：
  - 引导态与常规态交互隔离，点击穿透与 z-index 管控；动画结束与过渡事件的幂等处理。

## 可迁移与复用
- 动画可拆分为“效果粒度组件”（呼吸/扫光/流动/粒子/帧动画），通过统一时间轴/事件总线拼装。
- 数学分布 + CSS 变量的粒子系统可复用到加载、能量条、流水线状态等场景。
- APNG Blob 缓存与按需预加载策略可迁移到任何需要一次性非循环动画的场景。

---

## 简历可用描述（中文）
动画动效与交互体验优化（百度｜高考主页）
- 参与主页动效体系搭建，独立完成主按钮组（呼吸/扫光/流动）、异形心形容器、进度条粒子、雪碧图帧动画与 APNG 剧情动效等模块。
- 基于 San + TypeScript、SVG/GSAP/CSS 动画与事件总线实现组件化与状态驱动的动效编排，完善曝光/点击埋点与新手引导闭环。
- 通过 transform/opacity、rAF 循环与资源预加载等手段优化性能与稳定性，保障多端流畅体验。

## Resume snippet (EN)
Interactive Animations for Baidu Gaokao Homepage (Intern)
- Built multiple production-ready animations: breathing/glossy CTAs, SVG heart-shaped morphing, progress bar particle system, sprite sheet frame animations (GSAP), and APNG-based storyline effects.
- Adopted componentized and state-driven orchestration with San + TypeScript, SVG/CSS/GSAP, and an event bus; implemented full exposure/click tracking and onboarding flows.
- Optimized runtime with transform/opacity-only animations, rAF loops, and resource preloading to ensure smooth experiences on mobile devices.
