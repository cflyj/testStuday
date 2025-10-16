// 最小可用的“弹窗管理器”示例（JS 版）
// 职责：订阅意图层事件 → 将任务入 AsyncQueue → 管控时序（冻结/解冻/优先级/去重）→ 统一兜底（超时/异常也 resolve）。

import { INTENT } from '../intent/intentLayer';

// 这里用你的 README 队列接口（假设已存在全局单例 AsyncQueue）
// 如果你没有导出类，这里用一个极简 mock 代替（请替换为真实实现）
class AsyncQueueMock {
  constructor() { this.q = []; this.processing = false; this.freezing = false; }
  static instance = null;
  static getInstance() { return this.instance || (this.instance = new AsyncQueueMock()); }
  freeze() { this.freezing = true; }
  unfreeze() { this.freezing = false; this.process(); }
  push(task) { this.q.push(task); this.process(); }
  unshift(task) { this.q.unshift(task); this.process(); }
  clear() { this.q = []; }
  async process() {
    if (this.processing || this.freezing || this.q.length === 0) return;
    this.processing = true;
    const task = this.q.shift();
    try { await task(); } catch(e) { console.error('[queue task failed]', e); }
    this.processing = false;
    await this.process();
  }
}

// 通用兜底：超时也要 resolve；可在 finally 做清理
function withTimeout(taskFn, timeoutMs = 30000, onTimeout) {
  return () => new Promise((resolve) => {
    let done = false;
    const end = () => { if (!done) { done = true; resolve(); } };
    const timer = setTimeout(() => { try { onTimeout && onTimeout(); } finally { end(); } }, timeoutMs);

    Promise.resolve()
      .then(() => taskFn(() => { /* resolve hook for inner */ end(); }))
  .catch((e) => { console.warn('[withTimeout] task error swallowed', e); })
      .finally(() => { clearTimeout(timer); /* 注意：若 taskFn 内已 end，则这里无影响 */ });
  });
}

// 真正的管理器
export function createPopupManager(eventHub, PopupLib, opts = {}) {
  const queue = AsyncQueueMock.getInstance(); // 替换为 AsyncQueue.getInstance()
  const { defaultTimeout = 30000 } = opts;

  // 统一冻结/解冻（示例：页面可见性治理）
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) queue.freeze(); else queue.unfreeze();
  });

  // 登录意图：使用抢占（unshift）插到队首，但不打断正在执行
  eventHub.$on(INTENT.SHOW_LOGIN_POPUP, (payload) => {
    queue.unshift(
      withTimeout((end) => {
        const pop = PopupLib.createLogin(payload || {});
        pop.show();
        pop.on && pop.on('login', () => { /* 登录成功业务... */ });
        pop.on && pop.on('close', () => end());
      }, defaultTimeout, () => {
        // 超时兜底：确保关闭
        try { const p = PopupLib.getCurrent?.('login'); p && p.close && p.close(); } catch (e) { console.debug('[timeout close login failed]', e); }
      })
    );
  });

  // Widget 弹窗意图：普通排队（push）
  eventHub.$on(INTENT.SHOW_WIDGET_POPUP, (params) => {
    queue.push(
      withTimeout((end) => {
        const pop = PopupLib.createWidgetTask(params);
        pop.show();
        pop.on && pop.on('btn-clk', () => { eventHub.$emit('main_btn_click'); end(); });
        pop.on && pop.on('close', () => end());
      }, defaultTimeout, () => {
        try { const p = PopupLib.getCurrent?.('widget'); p && p.close && p.close(); } catch (e) { console.debug('[timeout close widget failed]', e); }
      })
    );
  });

  // 浮层意图：可选择“非阻塞”不入队（按你的规则决定）
  eventHub.$on(INTENT.SHOW_FLOAT_POP, (data) => {
    try {
      const pop = PopupLib.createFloat(data);
      pop.show();
      // 浮层通常自带 duration 自动消失，不阻塞队列
    } catch (e) { console.error('[float pop failed]', e); }
  });

  // 你也可以加：风控/弱网 → queue.clear() + queue.freeze()
  // eventHub.$on('risk', () => { queue.clear(); queue.freeze(); })

  return { queue };
}
