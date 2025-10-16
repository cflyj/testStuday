// 一个最小可用的 PopupLib stub，基于 DOM 实现事件(on)与关闭(close)
// 仅用于本地演示串行与超时兜底；真实项目请替换为正式弹窗库

function createEmitter() {
  const map = new Map();
  return {
    on(event, cb) {
      if (!map.has(event)) map.set(event, new Set());
      map.get(event).add(cb);
    },
    off(event, cb) {
      if (!map.has(event)) return;
      map.get(event).delete(cb);
    },
    emit(event, ...args) {
      const set = map.get(event);
      if (!set) return;
      [...set].forEach(fn => fn(...args));
    }
  };
}

let current = new Map(); // key -> instance

function mountModal({ title = 'Modal', content = '', actions = [] }) {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;';
  const box = document.createElement('div');
  box.style.cssText = 'background:#fff;border-radius:8px;min-width:280px;max-width:80vw;padding:16px;box-shadow:0 8px 24px rgba(0,0,0,.2)';
  box.innerHTML = `<h3 style="margin:0 0 12px">${title}</h3><div style="margin-bottom:12px">${content}</div>`;
  const btns = document.createElement('div');
  btns.style.cssText = 'display:flex;gap:8px;justify-content:flex-end;';
  actions.forEach(a => {
    const b = document.createElement('button');
    b.textContent = a.text || 'OK';
    b.onclick = a.onClick;
    btns.appendChild(b);
  });
  box.appendChild(btns);
  wrap.appendChild(box);
  document.body.appendChild(wrap);
  return wrap;
}

function createBase({ key, title, content, actions }) {
  const emitter = createEmitter();
  let el = null;
  return {
    show() {
      if (el) return;
      el = mountModal({ title, content, actions: actions(emitter) });
    },
    close() {
      if (el && el.parentNode) el.parentNode.removeChild(el);
      el = null;
      emitter.emit('close');
      current.delete(key);
    },
    on: emitter.on,
    off: emitter.off
  };
}

export function createLogin(payload) {
  const key = 'login';
  const inst = createBase({
    key,
    title: '登录',
    content: `from: ${payload?.from ?? '-'}<br/>请登录以继续。`,
    actions: (emitter) => ([
      { text: '取消', onClick: () => api.close() },
      { text: '登录', onClick: () => { emitter.emit('login'); api.close(); } },
    ]),
  });
  const api = inst;
  current.set(key, api);
  return api;
}

export function createWidgetTask(params) {
  const key = 'widget';
  const inst = createBase({
    key,
    title: '任务提示',
    content: `任务ID: ${params?.id ?? '-'}<br/>点击主按钮继续。`,
    actions: (emitter) => ([
      { text: '关闭', onClick: () => api.close() },
      { text: '主按钮', onClick: () => { emitter.emit('btn-clk'); api.close(); } },
    ]),
  });
  const api = inst;
  current.set(key, api);
  return api;
}

export function createFloat(data) {
  // 简单的顶部浮层，3s 自动消失
  const div = document.createElement('div');
  div.style.cssText = 'position:fixed;top:16px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 12px;border-radius:6px;z-index:9999;';
  div.textContent = data?.text || '浮层';
  document.body.appendChild(div);
  setTimeout(() => { if (div.parentNode) div.parentNode.removeChild(div); }, data?.duration ?? 3000);
  return { show() {}, on() {}, close() { if (div.parentNode) div.parentNode.removeChild(div); } };
}

export function getCurrent(key) { return current.get(key); }

export default { createLogin, createWidgetTask, createFloat, getCurrent };
