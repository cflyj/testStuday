// 意图层（Intent Layer）
// 职责：用业务语义“表达要做什么”，而不掺入“如何做”的实现细节。
// 形式：统一从这里 emit 语义事件；由管理器/订阅方决定时机、顺序、实现与降级。

/**
 * 事件常量（语义层协议）
 */
export const INTENT = {
  SHOW_LOGIN_POPUP: 'show_login_popup',
  HANDLE_POPUP: 'handle_popup',
  SHOW_WIDGET_POPUP: 'show_widget_popup',
  SHOW_FLOAT_POP: 'show_float_pop',
  SHOW_AFX_FLOAT_POP: 'show_afx_float_pop',
  REGISTER_TASK: 'register_task',
  SEND_LOG: 'send_log',
  UPLOAD_DATA: 'upload_data',
  SHOW_TOAST: 'show_toast',
};

/**
 * 工厂：基于给定的 eventHub（需具备 $emit/$on 接口）创建意图 API。
 * 这些方法只做语义事件的发射，不执行业务实现，也不直接创建弹窗。
 * @param {object} eventHub - 具备 $emit/$on 的总线实例
 */
export function createIntentLayer(eventHub) {
  if (!eventHub || typeof eventHub.$emit !== 'function') {
    throw new Error('[intentLayer] require an eventHub with $emit');
  }

  return {
    // 用户侧意图：我想触发登录弹窗
    showLoginPopup(payload = {}) {
      eventHub.$emit(INTENT.SHOW_LOGIN_POPUP, payload);
    },

    // 业务侧意图：请按照优先级/规则处理一批弹窗任务
    handlePopup(payload) {
      eventHub.$emit(INTENT.HANDLE_POPUP, payload);
    },

    // Widget 相关意图
    showWidgetPopup(params) {
      eventHub.$emit(INTENT.SHOW_WIDGET_POPUP, params);
    },

    // 任务相关意图：发起任务注册（例如激活、打点）
    registerTask(params) {
      eventHub.$emit(INTENT.REGISTER_TASK, { params });
    },

    // 浮层/特效浮层的展示意图
    showFloatPop(data) {
      eventHub.$emit(INTENT.SHOW_FLOAT_POP, data);
    },
    showAfxFloatPop(data) {
      eventHub.$emit(INTENT.SHOW_AFX_FLOAT_POP, data);
    },

    // 通用埋点/上报意图
    sendLog(logData) {
      eventHub.$emit(INTENT.SEND_LOG, logData);
    },
    uploadData(data) {
      eventHub.$emit(INTENT.UPLOAD_DATA, data);
    },

    // 轻提示意图
    showToast(message, ext = {}) {
      eventHub.$emit(INTENT.SHOW_TOAST, { message, ...ext });
    },
  };
}

/**
 * 用法示例（仅供参考，不会在运行时执行）：
 *
 * import eventHub from '@/eventHub';
 * import { createIntentLayer, INTENT } from '@/intent/intentLayer';
 *
 * const intent = createIntentLayer(eventHub);
 *
 * // 业务侧发起意图
 * intent.registerTask({ taskid, type, activity });
 * intent.showWidgetPopup({ taskType, amountPoint });
 * intent.showLoginPopup();
 * intent.showFloatPop({ title: '获得100金币', duration: 3000 });
 * intent.sendLog({ type: 'element_show', ext: { action_name: 'xxx' } });
 *
 * // 管理器侧（订阅方）在统一入口注册订阅
 * eventHub.$on(INTENT.SHOW_WIDGET_POPUP, (params) => {
 *   // 将具体任务函数 push 到 AsyncQueue（时机、优先级、冻结等由管理器决定）
 *   AsyncQueue.getInstance().push(() => new Promise((resolve) => {
 *     const pop = PopupLib.createWidgetTask(params);
 *     pop.show();
 *     pop.on('btn-clk', () => resolve());
 *     pop.on('close', resolve);
 *   }));
 * });
 */
