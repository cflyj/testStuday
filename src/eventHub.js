// 轻量事件总线，提供 $on / $off / $emit 接口
const listeners = new Map();

function $on(event, handler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event).add(handler);
}

function $off(event, handler) {
  if (!listeners.has(event)) return;
  if (!handler) { listeners.delete(event); return; }
  listeners.get(event).delete(handler);
}

function $emit(event, ...args) {
  const set = listeners.get(event);
  if (!set || set.size === 0) return;
  // 拷贝一次，避免回调内部增删影响本轮派发
  [...set].forEach(fn => {
    try { fn(...args); } catch (e) { console.error('[eventHub handler error]', e); }
  });
}

export default { $on, $off, $emit };