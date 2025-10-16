新增的核心知识点
1. AsyncQueue 异步队列核心实现
我深入解析了异步队列的核心实现逻辑，包括：
- 单例模式的队列管理
- 任务入队/插队机制
- 队列冻结/解冻的关键功能
- 递归处理任务的核心逻辑
2. PopupLib 弹窗创建库详解
详细展示了弹窗库的设计模式：
- 静态工厂模式的架构设计
- Talos 弹窗的全局配置
- 不同类型弹窗的具体实现（登录、新人红包、浮层等）
- 复杂业务流程的完整代码示例
3. 事件驱动通信机制
深入分析了事件总线的设计：
- 全局事件配置和管理
- 跨模块事件通信的完整流程
- 事件监听和触发的最佳实践
4. 复杂业务场景处理
提供了三个核心场景的处理方案：
- Widget 组件场景：特殊入口的队列管理策略
- 页面可见性管理：基于 Visibility API 的智能队列控制
- 风控和异常处理：完整的错误处理和降级机制
5. 性能优化策略
展示了生产级别的优化手段：
- 防抖和节流处理防止重复操作
- 内存管理和资源清理
- 智能队列优化策略
技术亮点总结
1. Promise 化管理：每个弹窗都返回 Promise，支持 async/await 语法，使异步流程更加清晰
2. 队列冻结机制：这是最核心的创新点，能够在特殊场景下暂停整个弹窗队列，避免用户体验干扰
3. 事件解耦设计：通过 eventHub 实现模块间的松耦合通信，提高了系统的可维护性
4. 智能优先级管理：通过优先级数组和插队机制，确保重要弹窗（如登录、新人红包）优先显示
5. 完善的错误处理：从网络异常到 JS 错误，都有对应的处理机制和降级策略
这套弹窗管理机制的设计思想可以应用到任何需要复杂 UI 交互管理的前端项目中，特别是大型运营活动、游戏界面、或者需要多模态交互的应用场景。它很好地平衡了功能复杂度和代码可维护性，是前端架构设计的优秀案例。



红包活动弹窗管理器深度解析

一、核心设计思想

1. 分层架构设计

弹窗管理器采用了三层架构设计，实现了清晰的职责分离：

// 第一层：事件调度层 (index.san)
// 负责事件监听、数据管理和模块协调
eventHub.$on(SHOW_LOGIN_POPUP, () => {
    this.checkLoginInfo();
});

// 第二层：弹窗管理层 (popup.san)
// 负责弹窗优先级管理、队列调度和生命周期控制
const POP_TYPE_RANK = [
    'new',              // 新人弹窗
    'task',             // 任务弹窗
    'report',           // 签到弹窗
    'assistance',       // 助力弹窗
    'invite',           // 邀请弹窗
];

// 第三层：弹窗创建层 (popupLib.ts)
// 负责具体弹窗实例的创建和配置
PopupLib.createLogin({
    isOneKeyShare: true,
    isOneKeyLogin: true
});

2. 优先级队列机制

弹窗管理器通过优先级队列确保重要弹窗优先显示：

// 弹窗优先级配置
const POP_TYPE_RANK = [
    'new',              // 新人红包 - 最高优先级
    'task',             // 任务奖励
    'report',           // 签到奖励
    'perceptionOverlay', // 感知浮层
    'perceptionPopup',  // 感知弹窗
    'assistance',       // 好友助力
    'invite',           // 邀请奖励
    'inviterTip'        // 邀请提示
];

// 弹窗排序和调度
async popupInit(popups) {
    // 过滤和排序
    popups = popups.filter(popup => POP_TYPE_RANK.includes(popup.type));
    popups.sort((a, b) => 
        POP_TYPE_RANK.indexOf(a.type) - POP_TYPE_RANK.indexOf(b.type)
    );
    
    // 依次加入队列
    popups.forEach(popup => {
        this.handleInitPop(popup);
    });
}

二、异步队列管理机制

1. AsyncQueue 核心实现

异步队列是整个弹窗管理的核心，确保弹窗按序执行：

// 队列操作示例
AsyncQueue.getInstance().push(() => {
    return this.createNewUserPopup(); // 返回 Promise
});

AsyncQueue.getInstance().unshift(() => {
    return this.createLoginPopup(); // 高优先级插队
});

// 队列冻结机制 - 用于特殊场景
AsyncQueue.getInstance().freeze();   // 冻结队列
AsyncQueue.getInstance().unfreeze(); // 解冻队列

2. 弹窗生命周期管理

每个弹窗都有完整的生命周期管理：

// 标准弹窗生命周期
handleNew(): Promise<void> {
    return new Promise<void>(async (resolve) => {
        try {
            // 1. 创建弹窗
            const noobPopup = PopupLib.createNewNoob({bonus});
            
            // 2. 显示弹窗
            noobPopup.show();
            
            // 3. 监听事件
            noobPopup.on('btn-click', async () => {
                // 处理点击逻辑
                await this.handleReward();
                resolve(); // 结束当前弹窗
            });
            
            // 4. 监听关闭
            noobPopup.on('close', resolve);
            
        } catch (error) {
            resolve(); // 异常时也要结束
        }
    });
}

三、冲突和阻塞解决机制

1. Widget 组件冲突处理

当用户通过 Widget 组件进入页面时，需要特殊处理：

// Widget 场景下的队列冻结
if (widgetExt.widgetId) {
    // 页面隐藏冻结队列弹窗
    AsyncQueue.getInstance().freeze();
    
    // 删除 URL 参数，防止刷新重复执行
    const url = new URL(window.location.href);
    url.searchParams?.delete("ext");
    window.history.replaceState({}, "", url.toString());
    
    // 处理 Widget 任务
    this.getWidgetTaskInfo().then(async (isRegister) => {
        if (isRegister) {
            await this.handleWidgetTask(activateTask);
        }
        // 解除冻结
        AsyncQueue.getInstance().unfreeze();
    });
}

2. 页面可见性状态管理（冻结）

通过页面可见性 API 管理弹窗显示：

// 页面隐藏时冻结弹窗
pageHide() {
    if (document.hidden && !this.isWidgetPopup) {
        AsyncQueue.getInstance().freeze();
        eventHub.$emit(STOP_PASSTIVE_TASK);
    }
}

// 页面显示时解冻弹窗
listenPageShow(() => {
    if (!this.isPageFirstShow && !this.isWidgetPopup) {
        this.startPasstiveTask('long');
        this.updateDataListener().then(() => {
            AsyncQueue.getInstance().unfreeze();
        });
    }
});

3. 登录状态冲突处理

登录弹窗具有最高优先级，会打断其他流程：

// 登录检查逻辑
async checkLoginInfo() {
    const isLogin = this.data.get('isLogin');
    if (+isLogin) return; // 已登录直接返回
    
    try {
        // 获取登录配置
        const [shareInfo, oneKeyInfo] = await Promise.all([
            invokeJsNative('account.getOneKeyShareInfo'),
            invokeJsNative('account.getOneKeyInfo')
        ]);
        
        // 创建登录弹窗
        const loginPopup = PopupLib.createLogin({...});
        loginPopup.show();
        
        // 登录成功后刷新页面
        loginPopup.on('login', async (data) => {
            const loginRes = await invokeJsNative('account.login', {...});
            loginRes && window.location.reload();
        });
        
    } catch (error) {
        // 登录失败处理
    }
}

四、特殊场景处理

1. 新用户体验优化

针对新用户设计了专门的弹窗流程：

// 新用户弹窗链路
handleNew(): Promise<void> {
    return new Promise<void>(async (resolve) => {
        // 1. 显示新人红包弹窗
        const noobPopup = PopupLib.createNewNoob({bonus});
        noobPopup.show();
        
        noobPopup.on('btn-click', async () => {
            try {
                // 2. 领取新人红包
                await receiveNew();
                
                // 3. 检查提现门槛
                const thresholdData = await this.executeGetThreshold();
                
                if (thresholdData) {
                    // 4. 执行快速提现
                    const result = await this.executeWithdraw(amount, prizeID);
                    this.handleWithdrawResult(result, bonus);
                } else {
                    this.handleWithdrawResult(null, bonus);
                }
                
                // 5. 显示感知弹窗
                this.handleNewPerception();
                
            } catch (error) {
                // 异常处理
            } finally {
                resolve();
            }
        });
    });
}

2. 风控和反作弊处理

遇到风控场景时的特殊处理：

// 风控弹窗处理
createRiskPopup() {
    return new Promise<void>(resolve => {
        const riskPopup = PopupLib.createRisk({type: 'risk'});
        riskPopup.show();
        
        // 触发风控，清空后续弹窗队列
        const queue = AsyncQueue.getInstance();
        queue.clear(); // 清空队列
        
        riskPopup.on('btn-clk', () => {
            // 跳转反馈页面
            this.debounceJumpH5(this.data.get('feedbackUrl'));
            resolve();
        });
    });
}

3. 任务激活冲突处理

通过定时器防止重复激活：

// 防止重复激活任务
eventHub.$on(REGISTER_TASK, ({params}) => {
    const widgetTime = new Date().getTime();
    
    this.taskConsumer.register(params).then(() => {
        const widgetTaskType = ['revisit_task', 'component_task'];
        const oldWidgetTaskTimer = this.widgetTaskTimer ? +this.widgetTaskTimer : 0;
        
        // 防重复点击逻辑
        if (widgetTaskType.includes(params.type) && 
            (widgetTime - oldWidgetTaskTimer) > 1000) {
            this.widgetTaskTimer = new Date().getTime();
            this.handleWidgetBtnClick(params);
        }
    });
});

五、核心优势总结

1. 优雅的优先级管理
- 通过优先级数组确保重要弹窗优先显示
- 支持动态插队和排序调整
- 避免弹窗之间的显示冲突
2. 完善的生命周期控制
- 每个弹窗都是 Promise 化管理
- 支持链式调用和组合操作
- 异常情况下的优雅降级
3. 灵活的队列操作
- 支持队列冻结/解冻机制
- 动态清空和重置功能
- 特殊场景的定制化处理
4. 多场景适配能力
- Widget 组件场景适配
- 新用户专属流程设计
- 风控和反作弊处理
- 页面可见性状态管理
5. 数据驱动的弹窗配置
- 服务端配置弹窗优先级
- 动态弹窗内容和样式
- A/B 测试支持能力
六、AsyncQueue 异步队列核心实现

1. 队列基础结构

AsyncQueue 是整个弹窗管理系统的核心，采用单例模式确保全局统一调度：

// AsyncQueue 核心实现
// 任务类型约定：所有任务必须最终 resolve（成功/异常/超时/取消），不得长期 pending
type AsyncTask = () => Promise<void>;

export class AsyncQueue {       
    private queue: AsyncTask[] = [];        // 任务队列
    private isProcessing = false;         // 是否正在处理
    private isFreezing = false;           // 是否冻结状态
    private static instance: AsyncQueue | null = null;

    // 单例模式获取实例
    public static getInstance(): AsyncQueue {
        if (!AsyncQueue.instance) {
            AsyncQueue.instance = new AsyncQueue();
        }
        return AsyncQueue.instance;
    }

    // 任务入队（队尾）
    public push(task: AsyncTask): void {
        this.queue.push(task);
        this.processQueue();
    }

    // 任务插队（队首）
    public unshift(task: AsyncTask): void {
        this.queue.unshift(task);
        this.processQueue();
    }

    // 核心队列处理逻辑
    private async processQueue(): Promise<void> {
        if (this.isProcessing      // 正在处理中
            || this.isFreezing     // 队列被冻结
            || this.queue.length === 0) { // 队列为空
            return;
        }
        
        this.isProcessing = true;
        const task = this.queue.shift()!;
        
        try {
            await task(); // 执行任务
        } catch (e) {
            // TODO: 错误上报
            console.error('AsyncQueue task failed:', e);
        }
        
        this.isProcessing = false;
        await this.processQueue(); // 递归处理下一个任务
    }

    // 冻结队列 - 关键功能
    public freeze(): void {
        this.isFreezing = true;
    }

    // 解冻队列
    public unfreeze(): void {
        this.isFreezing = false;
        this.processQueue();
    }

    // 清空队列
    public clear(): void {
        this.queue = [];
    }

    // 队列长度
    public size(): number {
        return this.queue.length;
    }
}

2. 队列使用模式

在实际项目中的使用模式：

// 基本使用模式
const queue = AsyncQueue.getInstance();

// 添加普通弹窗任务
queue.push(async () => {
    const popup = PopupLib.createTask(taskData);
    popup.show();
    await popup.onClose(); // 等待弹窗关闭
});

// 添加高优先级弹窗（插队）
queue.unshift(async () => {
    const loginPopup = PopupLib.createLogin();
    loginPopup.show();
    await loginPopup.onClose();
});

// 特殊场景：冻结队列
if (isRiskTriggered) {
    queue.freeze();
    queue.clear(); // 清空队列
}

3. 使用流程（从事件到弹窗关闭）

- 触发：业务侧通过 eventHub.$emit 触发语义事件（如 HANDLE_POPUP/SHOW_WIDGET_POPUP）。
- 收口：弹窗管理器在 eventInit 中 $on 这些事件，决定将哪个“任务函数 AsyncTask”入队（push/unshift，或带优先级的 pushWithPriority）。
- 调度：AsyncQueue.processQueue 串行执行任务；若 isProcessing 或 isFreezing 为真则等待，解冻后继续。
- 展示：任务内部创建并展示弹窗（PopupLib.createXxx().show()），并监听 'close' 或主按钮点击等事件。
- 结束：监听回调里 resolve()，或兜底超时/异常也必须 resolve，保证“任务最终完成，队列不饿死”。
- 时机治理：页面隐藏/广告播放/Widget 过程调用 freeze()；对应结束信号触发 unfreeze() 继续调度。

七、PopupLib 弹窗创建库详解

1. 弹窗库架构设计

PopupLib 采用静态工厂模式，统一管理所有弹窗类型的创建：

export class PopupLib {
    public name = 'popupLib';
    
    // 初始化配置 - 设置 Talos 弹窗的全局参数
    public static init(talosVersion: string) {
        TalosPopup.setBundleParams({
            mainBizName: 'box.rnplugin.searchmanifest',
            bundleName: 'EggPopup',
            version: talosVersion || '1.0.4.5'
        });
        
        TalosPopup.setNaParams({
            showType: 'middle',           // 居中显示
            bgClosable: 0,               // 背景不可点击关闭
            bgColor: {                   // 背景颜色配置
                normal: '#000000-0.8',
                dark: '#000000-0.8'
            },
            // Talos 弹窗动画配置
            animation: {
                contentShow: {
                    scale: {
                        start: 1, end: 1,
                        curve: [0.41, 0.05, 0.1, 1],
                        time: 200
                    }
                },
                contentHide: {
                    scale: {
                        start: 1, end: 1,
                        curve: [0.41, 0.05, 0.1, 1],
                        time: 200
                    }
                }
            },
            leaveNotShowWindow: 1        // 离开页面不显示弹窗
        });
    }
}

2. 核心弹窗类型实现

A. 登录弹窗 - 最高优先级

// 登录弹窗 - 支持一键登录和一键分享
public static createLogin(params): TalosPopup {
    return TalosPopup.create({
        popupName: 'MktRedpacketProNew',
        popupParams: {
            componentName: 'c-login',
            componentData: {
                isOneKeyShare: params.isOneKeyShare,  // 一键分享能力
                isOneKeyLogin: params.isOneKeyLogin,  // 一键登录能力
                htInfo: params.htInfo,                // 分享信息
                okInfo: params.okInfo,                // 登录信息
                ...params
            }
        }
    });
}

// 使用示例
async checkLoginInfo() {
    try {
        const [shareInfo, oneKeyInfo] = await Promise.all([
            invokeJsNative('account.getOneKeyShareInfo'),
            invokeJsNative('account.getOneKeyInfo')
        ]);

        const loginPopup = PopupLib.createLogin({
            isOneKeyShare: Number(shareInfo?.onekeyShareEnable) === 1,
            isOneKeyLogin: Number(oneKeyInfo?.oneKeyEnable) === 1,
            htInfo: shareInfo,
            okInfo: oneKeyInfo,
        });

        loginPopup.show();
        
        loginPopup.on('login', async (data) => {
            const { loginData } = data;
            const loginRes = await invokeJsNative('account.login', {
                app: '',
                loginType: 'fast',
                displayName: '',
                showThirdLogin: '1',
                loginSource: '',
                normalizeAccount: '1',
                ...loginData,
            });
            
            if (loginRes) {
                window.location.reload(); // 登录成功刷新页面
            }
        });
    } catch (error) {
        console.error('登录弹窗创建失败:', error);
    }
}

B. 新人红包弹窗 - 复杂业务流程

// 新人红包弹窗（实验版本）
public static createNewNoob(params): TalosPopup {
    return TalosPopup.create({
        popupName: 'MktRedpacketProNew',
        popupParams: {
            componentName: 'c-new-noob',
            componentData: {
                bonus: params.bonus, // 红包金额
                ...params
            }
        }
    });
}

// 复杂的新人流程实现
handleNew(): Promise<void> {
    return new Promise<void>(async (resolve) => {
        try {
            const newer = this.data.get('newer');
            const bonus = Number(newer?.newReward?.new_redpack?.value / 100) || 0;
            
            // 1. 创建新人红包弹窗
            const noobPopup = PopupLib.createNewNoob({bonus});
            
            // 2. 发送展示日志
            eventHub.$emit(SEND_LOG, {
                type: 'element_show',
                ext: {
                    action_name: 'syhb4_popup_show',
                    popup_type: 'redpacket_popup',
                    new_user_take: this.data.get('isNewUserExp') ? 'yes' : 'no',
                }
            });
            
            noobPopup.show();

            // 3. 监听红包点击
            noobPopup.on('btn-click', async () => {
                try {
                    // 领取新人红包
                    await receiveNew();
                    eventHub.$emit(UPLOAD_DATA);
                    
                    // 检查提现门槛
                    const thresholdData = await this.executeGetThreshold();
                    
                    if (thresholdData) {
                        // 执行快速提现
                        const {prizeID, amount} = thresholdData;
                        const result = await this.executeWithdraw(amount, prizeID);
                        this.handleWithdrawResult(result, bonus);
                    } else {
                        this.handleWithdrawResult(null, bonus);
                    }
                } catch (error) {
                    this.handleWithdrawResult(null, bonus);
                } finally {
                    resolve();
                }
            });

            noobPopup.on('close', resolve);
            
        } catch (error) {
            resolve();
        }
    });
}

C. 浮层通知弹窗 - 特殊显示方式

// 浮层弹窗 - 从底部滑出
public static createFloat(params): TalosPopup {
    return TalosPopup.create({
        popupName: 'MktRedpacketProNew',
        popupParams: {
            componentName: 'c-settlement',
            componentData: {
                icon: params.icon,           // 图标
                iconStyle: params.iconStyle, // 图标样式
                isAfx: params.isAfx,         // 是否为特效
                type: params.type,           // 类型
                prefixTitle: params.prefixTitle, // 前缀标题
                title: params.title,         // 主标题
                duration: params.duration,   // 持续时间
                ...params
            }
        }
    }, {
        showType: 'bottom-to-top',     // 从底部滑出
        bgColor: {                     // 透明背景
            normal: '#000000-0',
            dark: '#000000-0'
        }
    });
}

// 特效浮层显示逻辑
showAfxFloatPop(data) {
    return new Promise(async (resolve) => {
        const {icon, iconStyle, type, value, isNeedUpdate, scrollWaitTime = 500} = data;
        
        // 滚动到顶部
        setTimeout(() => {
            scrollSmoothTo();
        }, scrollWaitTime);
        
        const {afxFloatPopConfNew} = this.data.get();
        const afxConf = afxFloatPopConfNew;
        
        await this.showFloatPop({
            icon: icon || afxConf[type].afx,
            isAfx: true,
            iconStyle: iconStyle || afxConf[type].afxStyle,
            type,
            isNeedUpdate,
            prefixTitle: '获得',
            title: (type <= 2 ? `${value / 100}元` : value) + afxConf[type].suffix,
            duration: 3000
        });
        
        resolve();
    });
}

八、事件驱动通信机制

1. 全局事件总线设计

事件总线是整个系统解耦的关键，通过 eventHub 实现模块间通信：

// 事件配置定义
export const SHOW_LOGIN_POPUP = 'show_login_popup';
export const SEND_LOG = 'send_log';
export const UPLOAD_DATA = 'upload_data';
export const POPUP_PENDING = 'popup_pending';
export const POPUP_RUNNING = 'popup_running';
export const SHOW_FLOAT_POP = 'show_float_pop';
export const SHOW_AFX_FLOAT_POP = 'show_afx_float_pop';
export const HANDLE_POPUP = 'handle_popup';
export const SHOW_WIDGET_POPUP = 'show_widget_popup';

// 主入口文件中的事件监听注册
attached() {
    // 登录事件监听
    eventHub.$on(SHOW_LOGIN_POPUP, () => {
        this.checkLoginInfo();
    });
    
    // 任务注册事件
    eventHub.$on(REGISTER_TASK, ({params}) => {
        this.handleTaskRegister(params);
    });
    
    // 分享事件
    eventHub.$on('share', (opt: ShareFireParams) => {
        this.invokeSharePopup(opt);
    });
    
    // 提现事件
    eventHub.$on('withdraw', () => {
        this.debounceJumpH5(this.data.get('withdrawUrl'));
    });
    
    // Widget 弹窗事件
    eventHub.$on(SHOW_WIDGET_POPUP, (params) => {
        this.handleWidgetTask(params);
    });
}

// 弹窗管理器中的事件初始化
eventInit() {
    eventHub.$on(SHOW_FLOAT_POP, this.showFloatPop.bind(this));
    eventHub.$on(SHOW_AFX_FLOAT_POP, this.showAfxFloatPop.bind(this));
    eventHub.$on(HANDLE_POPUP, this.popupInit.bind(this));
    eventHub.$on(SHOW_WIDGET_POPUP, this.handleWidgetTask.bind(this));
    eventHub.$on(SHOW_WIDGET_INSTALL_POPUP, this.handleWidgetInstallGuide.bind(this));
    eventHub.$on(SHOW_NEWER_POPUP, this.activeAwakeningNewerPopup.bind(this));
}

2. 跨模块事件通信示例

// 任务模块触发弹窗显示
handleTaskClick(taskItem) {
    const { taskid, type, status } = taskItem.taskshow;
    
    if (status === '3') {
        // 触发 Toast 显示事件
        eventHub.$emit(SHOW_TOAST, '任务已完成');
        return;
    }
    
    // 触发任务激活事件
    eventHub.$emit(REGISTER_TASK, {
        params: {
            taskid,
            type,
            activity: `redpackv4|${this.data.get('actid')}`
        }
    });
}

// 主入口处理任务激活
eventHub.$on(REGISTER_TASK, ({params}) => {
    this.taskConsumer.register(params).then(() => {
        // 任务激活成功后，触发弹窗显示
        eventHub.$emit(SHOW_WIDGET_POPUP, {
            taskType: params.type,
            amountPoint: params.reward,
            coinBankUpperLimit: this.data.get('shouyiqu.coinBankUpperLimit')
        });
    });
});

// 弹窗管理器处理 Widget 弹窗
handleWidgetTask(params) {
    AsyncQueue.getInstance().push(() => {
        return new Promise<void>(async (resolve) => {
            const wigetFinishPopup = PopupLib.createWidgetTask(params);
            
            // 发送展示日志
            eventHub.$emit(SEND_LOG, {
                type: 'element_show',
                ext: {
                    action_name: 'syhb4_popup_show',
                    popup_type: 'component_add_popup'
                }
            });
            
            wigetFinishPopup.show();
            
            wigetFinishPopup.on('btn-clk', () => {
                // 触发主按钮点击事件
                eventHub.$emit(MAIN_BTN_CLICK);
                resolve();
            });
            
            wigetFinishPopup.on('close', resolve);
        });
    });
}

九、复杂业务场景处理

1. Widget 组件场景处理

Widget 组件是一个特殊的入口场景，需要特殊的队列管理：

// Widget 入口场景处理
async attached() {
    // 检查是否来自 Widget 组件
    const widgetExt = getUrlParam('ext');
    
    if (widgetExt) {
        try {
            const widgetData = JSON.parse(decodeURIComponent(widgetExt));
            this.data.set('widgetExt', widgetData);
            
            // Widget 场景下冻结弹窗队列
            AsyncQueue.getInstance().freeze();
            
            // 删除URL参数，防止刷新重复执行
            const url = new URL(window.location.href);
            url.searchParams?.delete("ext");
            window.history.replaceState({}, "", url.toString());
            
            // 处理 Widget 任务
            this.getWidgetTaskInfo().then(async (isRegister) => {
                if (isRegister) {
                    await this.handleWidgetTask(activateTask);
                }
                
                // 解除队列冻结
                AsyncQueue.getInstance().unfreeze();
            });
            
        } catch (error) {
            console.error('Widget 参数解析失败:', error);
        }
    }
}

// Widget 任务信息获取
async getWidgetTaskInfo() {
    try {
        const widgetExt = this.data.get('widgetExt');
        const { widgetId, type, taskid, sign, tasknode } = widgetExt;
        
        if (!widgetId) return false;
        
        const activity = `redpackv4|${this.data.get('actid')}`;
        
        // 激活 Widget 任务
        const res = await completeTask({
            activity,
            type,
            taskid,
            sign,
            tasknode
        });
        
        const { ext } = res?.data || {};
        if (ext && ext.taskType) {
            // 触发 Widget 弹窗显示
            eventHub.$emit(SHOW_WIDGET_POPUP, {
                ...ext,
                coinBankUpperLimit: this.data.get('shouyiqu.coinBankUpperLimit')
            });
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Widget 任务处理失败:', error);
        return false;
    }
}

2. 页面可见性状态管理

页面可见性变化时的队列管理策略：

// 页面隐藏处理
pageHide() {
    if (document.hidden && !this.isWidgetPopup) {
        // 冻结弹窗队列
        AsyncQueue.getInstance().freeze();
        
        // 停止被动任务
        eventHub.$emit(STOP_PASSTIVE_TASK);
        
        // 发送页面隐藏日志
        eventHub.$emit(SEND_LOG, {
            type: 'page_hide',
            timestamp: Date.now()
        });
    }
}

// 页面显示处理
listenPageShow(() => {
    if (!this.isPageFirstShow && !this.isWidgetPopup) {
        // 重新启动被动任务
        this.startPasstiveTask('long');
        
        // 更新数据后解冻队列
        this.updateDataListener().then(() => {
            AsyncQueue.getInstance().unfreeze();
        });
        
        // 发送页面显示日志
        eventHub.$emit(SEND_LOG, {
            type: 'page_show',
            timestamp: Date.now()
        });
    }
});

// 监听页面可见性变化
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        this.pageHide();
    } else {
        this.pageShow();
    }
});

3. 风控和异常处理机制

// 风控弹窗处理
createRiskPopup() {
    return new Promise<void>(resolve => {
        // 创建风控弹窗
        const riskPopup = PopupLib.createRisk({
            type: 'risk',
            title: '系统检测到异常',
            content: '为了您的账户安全，请联系客服处理',
            btnText: '联系客服'
        });
        
        riskPopup.show();
        
        // 触发风控时的处理
        const queue = AsyncQueue.getInstance();
        queue.clear(); // 清空所有待执行弹窗
        queue.freeze(); // 冻结队列，不再执行新弹窗
        
        // 发送风控日志
        eventHub.$emit(SEND_LOG, {
            type: 'risk_popup_show',
            ext: {
                action_name: 'risk_detection_popup_show'
            }
        });
        
        riskPopup.on('btn-clk', () => {
            // 跳转反馈页面
            this.debounceJumpH5(this.data.get('feedbackUrl'));
            resolve();
        });
        
        riskPopup.on('close', resolve);
    });
}

// 全局错误处理
window.addEventListener('error', (event) => {
    // 发送错误日志
    eventHub.$emit(SEND_LOG, {
        type: 'js_error',
        ext: {
            error_message: event.message,
            error_filename: event.filename,
            error_lineno: event.lineno
        }
    });
    
    // 严重错误时清空弹窗队列
    if (event.message.includes('Critical')) {
        AsyncQueue.getInstance().clear();
    }
});

// 网络异常处理
request.interceptors.response.use(
    response => response,
    error => {
        if (error.code === 'NETWORK_ERROR') {
            // 网络异常时显示提示
            eventHub.$emit(SHOW_TOAST, '网络异常，请检查网络连接');
            
            // 暂停弹窗队列
            AsyncQueue.getInstance().freeze();
        }
        return Promise.reject(error);
    }
);

十、性能优化策略

1. 防抖和节流处理

// 防抖处理 - 防止用户快速点击
debounceHandleClick = debounce((taskItem) => {
    this.handleTaskClick(taskItem);
}, 1000, {leading: true, trailing: false});

// 节流处理 - 限制日志发送频率
throttleSendLog = throttle((logData) => {
    this.sendLogToServer(logData);
}, 2000);

// 防重复任务激活
eventHub.$on(REGISTER_TASK, ({params}) => {
    const currentTime = new Date().getTime();
    
    this.taskConsumer.register(params).then(() => {
        const widgetTaskType = ['revisit_task', 'component_task'];
        const lastWidgetTaskTime = this.widgetTaskTimer || 0;
        
        // 防重复点击逻辑 - 1秒内只能点击一次
        if (widgetTaskType.includes(params.type) && 
            (currentTime - lastWidgetTaskTime) > 1000) {
            this.widgetTaskTimer = currentTime;
            this.handleWidgetBtnClick(params);
        }
    });
});

2. 内存管理和清理

// 组件销毁时的清理工作
detached() {
    // 清空弹窗队列
    AsyncQueue.getInstance().clear();
    
    // 移除事件监听
    eventHub.$off(SHOW_LOGIN_POPUP);
    eventHub.$off(REGISTER_TASK);
    eventHub.$off('share');
    eventHub.$off('withdraw');
    
    // 清理定时器
    if (this.widgetTaskTimer) {
        clearTimeout(this.widgetTaskTimer);
        this.widgetTaskTimer = null;
    }
    
    // 停止被动任务
    const passtiveTaskCtrl = PasstiveTaskCtrl.getInstance();
    passtiveTaskCtrl.destroy();
}

// 弹窗资源清理
createPopupWithCleanup(popupCreator, params) {
    return new Promise<void>(resolve => {
        const popup = popupCreator(params);
        
        // 设置超时清理
        const timeoutId = setTimeout(() => {
            popup.close();
            resolve();
        }, 30000); // 30秒超时
        
        popup.show();
        
        popup.on('close', () => {
            clearTimeout(timeoutId);
            resolve();
        });
        
        // 页面隐藏时自动关闭弹窗
        const hideHandler = () => {
            if (document.hidden) {
                popup.close();
            }
        };
        
        document.addEventListener('visibilitychange', hideHandler);
        
        popup.on('close', () => {
            document.removeEventListener('visibilitychange', hideHandler);
        });
    });
}

3. 队列优化策略

// 智能队列管理
class SmartAsyncQueue extends AsyncQueue {
    private priority: Map<string, number> = new Map();
    private taskTypes: Map<AsyncTask, string> = new Map();
    
    // 带优先级的任务添加
    pushWithPriority(task: AsyncTask, type: string, priority: number = 0) {
        this.taskTypes.set(task, type);
        
        if (priority > 0) {
            // 高优先级任务插队
            const insertIndex = this.queue.findIndex((t, index) => {
                const taskType = this.taskTypes.get(t);
                const taskPriority = this.priority.get(taskType) || 0;
                return taskPriority <= priority;
            });
            
            if (insertIndex === -1) {
                this.queue.push(task);
            } else {
                this.queue.splice(insertIndex, 0, task);
            }
        } else {
            this.queue.push(task);
        }
        
        this.processQueue();
    }
    
    // 队列去重
    deduplicateTasks() {
    const seen = new Set<string>();
    this.queue = this.queue.filter(task => {
            const type = this.taskTypes.get(task);
            if (seen.has(type)) {
                return false;
            }
            seen.add(type);
            return true;
        });
    }
    
    // 队列状态监控
    getQueueStatus() {
        return {
            length: this.queue.length,
            isProcessing: this.isProcessing,
            isFreezing: this.isFreezing,
            taskTypes: Array.from(this.taskTypes.values())
        };
    }
}

这套弹窗管理机制通过精心设计的架构，实现了复杂运营场景下的优雅管理，每个组件都有明确的职责和完善的错误处理机制，是大型前端项目中值得学习的最佳实践。