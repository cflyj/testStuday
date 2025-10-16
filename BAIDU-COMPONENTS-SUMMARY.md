# 百度实习期组件沉淀与实践总结

> 来源：`reeadme4.md` 提炼。聚焦组件化设计、可复用性、性能优化与移动端适配。

## 概览
- 场景：营销/活动页等业务中通用的可视化组件建设。
- 代表组件：进度条（含粒子动效、事件回传、插槽自定义）。
- 技术栈：San + TypeScript、Less/CSS、SVG/动画。

---

## 进度条组件（c-progress-bar）

### 功能
- 进度展示：根据 `currentPoints/totalPoints` 计算并渲染进度；支持百分比动画。
- 动效增强：
  - 粒子效果：随进度流动的光粒，阈值触发（>23%）。
  - 结束反馈：进度到达 100% 触发完成事件。
  - 过程反馈：进度提升触发 increase 事件，便于业务方联动“飞入”等动画。
- 样式与扩展：
  - 配置化：颜色（bgColor）、尺寸（containerWidth/Height）、边框/背景、动画时长（barDuration）。
  - 插槽：`slot="img"` 自定义资产图/金额等内容。

### 使用示例（精简）
```html
<c-progress-bar
  current-points="{{curPoint}}"
  totalPoints="{{total}}"
  bgColor="{{bgColor}}"
  lineBorder="{{lineBorder}}"
  containerWidth="810"
  containerHeight="54"
  containerBgColor="#D9D9D999"
  barDuration="0.5"
  hasParticle
  on-increase="increaseEarning"
  on-finish="finishEarning"
>
  <div slot="img"> ... </div>
</c-progress-bar>
```

### 关键实现
- 计算属性：根据 `currentPoints/totalPoints` 计算 `currentProgress`，驱动渲染；监听变化触发动画与事件。
- 粒子系统：
  - 水平位置累积+随机间距，确保不重叠且排列自然；
  - 垂直分布采用分段概率密度（10% 顶部、85% 中部、5% 底部）；
  - CSS 变量 `--x/--y` + keyframes 形成错落流动（translate+scale）。
- 动画与性能：
  - transform/opacity 优先；粒子仅在阈值内渲染；
  - `debounce` 控制进度更新频率（~16ms，约 60fps）；
  - 合成层优化（will-change/translateZ），减少重排重绘。
- 生命周期：组件销毁时清理 watch/防抖，避免内存泄漏；过渡事件 `on-transitionend` 幂等处理。

### 响应式与移动端
- vw 适配：通过 postcss-px-to-viewport 将设计稿尺寸转换为 vw；
- 运行时 CSS 变量：`--mkt-base-font-size` 支持不同屏宽细调；
- 最小尺寸兜底：在极小屏幕下保证可用性。

---

## 组件化与工程实践
- 单一职责：视图与业务分离（积分计算/渲染解耦）。
- 事件驱动：increase/finish 与父级交互，组件对业务解耦。
- 可复用性：通过 props/插槽 + 主题变量让同一组件覆盖多场景。
- 性能策略：条件渲染、GPU 友好属性、并发/频率控制、动画合成层、生命周期清理。

---

## 简历可用描述（中文）
通用组件建设与性能优化（百度｜前端实习）
- 沉淀 c-progress-bar 进度条组件（阈值粒子动效、事件回传、插槽扩展、主题化配置），适配多业务场景。
- 通过 transform/opacity、条件渲染与防抖等手段优化渲染性能；封装计算属性与生命周期管理提升稳定性与复用度。

## Resume snippet (EN)
Reusable Components & Performance (Intern @ Baidu)
- Built a configurable progress-bar component with a particle effect, event hooks, and slot-based extension, reused across campaigns.
- Optimized rendering with transform/opacity, conditional rendering, and debounced updates; strengthened stability via computed state and lifecycle cleanup.
