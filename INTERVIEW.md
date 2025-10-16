# 秋招面试速记与演练（基于本仓库 README 项目）

本文件帮你把 README 的项目沉淀成可直接复述的面试话术、问答要点与练习清单。

## 1) 一分钟自我介绍脚本
- 关键词：复杂弹窗编排、异步队列、事件解耦、性能与稳定性。
- 脚本（60s）：
  我在实习中主要负责运营活动里的弹窗编排体系，做了基于 AsyncQueue 的异步队列、优先级/插队与冻结机制，以及 PopupLib 工厂化创建与统一生命周期管理。通过事件总线解耦各模块，实现登录、新人红包、浮层等多种弹窗的稳定协作，并对页面可见性、风控场景做了完整处理。

## 2) 面试官深挖要点（逐题要点）

- AsyncQueue 核心（为什么/怎么做/边界）
  - 目的：串行化异步任务，支持优先级插队、冻结、清空，避免弹窗冲突与打断。
  - 设计：单例 + 环形处理（processQueue 递归/环），isProcessing/Freezing 双状态门控。
  - 边界：异常兜底 resolve、可取消/超时、可观察队列长度，避免饿死与重入。

- PopupLib 架构
  - 静态工厂：统一配置 Talos 参数、动画、可访问性与关闭策略。
  - 生命周期：show/close 事件 + Promise 化，便于队列接续。
  - 优先级：POP_TYPE_RANK 排序 + 队列插入策略；登录具最高优先级可打断。

- 事件总线（解耦）
  - 事件清单统一定义，入口监听/子模块 emit，避免环依赖。
  - 可视状态与风控统一进入队列冻结/清空。

- 可见性与风控
  - document.hidden → freeze；恢复时数据校验后 unfreeze。
  - 风控触发：清空+冻结，提示引导与降级链路。

## 3) 指标与复盘（建议你提前补齐的数据）
- 指标模板（面试时据实说，不编造）：
  - 弹窗冲突率、异常关闭率、平均等待时长、首屏可用时间。
  - Freeze/Unfreeze 触发频率、失败重试次数、风控触发率。
- 复盘模板：问题→定位→修复→验证→沉淀清单（监控、告警、回归用例）。

## 4) 高频问答要点（精简版）
- 为什么用 TDD 做组件/队列：降低回归、规范 API、可测试设计；红-绿-重构流程。
- Vue 响应式：Vue3 用 Proxy + effect/track/trigger；computed 不做异步，异步放 watch。
- KeepAlive 生命周期：deactivated/activated 替代卸载/重挂，定时器在 deact 停、act 恢复。
- 动画：逐帧用 steps(1)；性能用 transform/opacity，避免 left；需要的话用 rAF/GSAP。
- 图片优化：WebP/AVIF、srcset 源集、懒加载、CDN；图标用 SVG。
- 工程化：ESLint/Prettier、Husky+lint-staged、CI 流水线、环境区分。
- Webpack vs Vite：Vite Dev 快（ESM+esbuild），产物 Rollup；Webpack 生态全但 Dev 慢。
- TS 实践：Props/Emit/Store/接口响应建模；可辨识联合、类型守卫；减少 any。
- 安全：XSS（转义/DOMPurify/CSP）、CSRF（SameSite/Token/Origin 校验）、点击劫持防护。
- 网络常识速记：三次握手“+1”为确认 SYN；四次挥手/Time-Wait 2MSL；滑动窗口= min(rwnd,cwnd)。

## 5) 可直接背的 STAR 事例（每段 20-30s）
- 弹窗冲突
  - S：多个活动弹窗同时触发，遮罩穿透、焦点错乱。
  - T：保证顺序与互斥，还要支持高优先级打断。
  - A：队列串行 + 优先级/插队；统一滚动锁与 zIndex；Back 键栈式关闭。
  - R：冲突问题消失；可维护性提升（具体数据请结合你实测）。

- 弱网首屏慢
  - S：白屏与卡顿。
  - A：路由/组件按需、骨架屏、关键图 preload、懒加载；日志验证。
  - R：指标下降（准备你真实数字或区间）。

- 风控链路
  - S：异常流量导致流程混乱。
  - A：统一风控弹窗，队列清空 + 冻结，日志采集与引导页。
  - R：稳定性提升，可控退路。

## 6) Demo 演练建议（5 分钟）
- 展示：
  1) 依次触发多个弹窗 → 观察优先级顺序。
  2) 中途触发登录弹窗 → 展示高优先级打断与恢复。
  3) 切到后台再回来 → 队列冻结/解冻恢复。
- 准备：预置按钮触发 eventHub 事件与队列任务；控制台打印队列状态与生命周期钩子。

## 7) 代码速记（面试白板/伪码）
- AsyncQueue 极简骨架：
```ts
class AsyncQueue {
  queue = [];
  running = false;
  frozen = false;
  async process() {
    if (this.running || this.frozen || !this.queue.length) return;
    this.running = true;
    const task = this.queue.shift();
    try { await task(); } finally { this.running = false; await this.process(); }
  }
  push(task){ this.queue.push(task); this.process(); }
  unshift(task){ this.queue.unshift(task); this.process(); }
  freeze(){ this.frozen = true; }
  unfreeze(){ this.frozen = false; this.process(); }
}
```

- 逐帧动画（steps）：
```css
.sprite { width: W; height: H; background: url(sprite.png); animation: play .8s steps(N) infinite; }
@keyframes play { from { background-position: 0 0; } to { background-position: -W*N 0; } }
```

- Vue 响应式极简示例：
```js
const bucket = new WeakMap();
let activeEffect;
function effect(fn){ activeEffect = fn; fn(); activeEffect = null; }
function track(t,k){ if(!activeEffect) return; let m=bucket.get(t)||bucket.set(t,new Map()).get(t); let s=m.get(k)||m.set(k,new Set()).get(k); s.add(activeEffect); }
function trigger(t,k){ const m=bucket.get(t); if(!m) return; (m.get(k)||[]).forEach(fn=>fn()); }
function reactive(obj){ return new Proxy(obj,{ get(t,k,r){ const v=Reflect.get(t,k,r); track(t,k); return v; }, set(t,k,v,r){ const ok=Reflect.set(t,k,v,r); trigger(t,k); return ok; } }); }
```

## 8) 面试冲刺清单（48 小时内）
- 整理三个 STAR 事例并备真实指标。
- 录一段 60s 自我介绍视频，练到顺畅无停顿。
- 做一个本地 Demo 页触发三种弹窗并打印队列/事件日志。
- 准备 3 个“我问面试官”的问题（如：活动链路监控体系、灰度与回滚策略、A/B 评估口径）。
- 打磨 GitHub/README：在项目开头加一句话电梯摘要与技术要点列表。

—— 祝面试顺利，把以上当作你的“速记卡”，临场按模块展开即可。
