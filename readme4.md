[图片]
暂时无法在飞书文档外展示此内容
暂时无法在飞书文档外展示此内容

二、主要功能
- 样式定制：支持多种自定义样式，包括进度条颜色、宽高、插槽自定义资产图片等
- 动画：包括粒子动画、进度增加回传事件（自定义设置飞入动画）、进度100%回传事件等

三、params&methods
暂时无法在飞书文档外展示此内容

暂时无法在飞书文档外展示此内容

具体使用范例
   import {progressBar} from '@/static/common/components/ProgressBar';
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
        class="{{$style['earnings-lj']}}"
    >
        <div slot="img" class="{{$style['img']}}">
            <span class="{{$style['amount']}} {{$style['front']}}">{{currentRedpackNum }}</span><span class="{{$style['amount-danwei']}} {{$style['front']}}">元</span>
        </div>
    </c-progress-bar>
    
    <script>
        export default {
            static components = {
                'c-progress-bar': progressBar
            };
        }
        // 进度增加
        increaseEarning() {
        }
        // 进度100%
        finishEarning() {
        }
    </script>
[图片]

组件化思维和可复用性
"我将进度条设计为独立的业务组件，具备高度的可复用性：
- 配置化设计：通过props传入不同的尺寸、颜色、动画时长，一个组件适配多种场景
- 插槽机制：预留img插槽，允许业务方自定义图标内容
- 事件驱动：通过increase、finish事件与父组件解耦，遵循单一职责原则
- 数据抽象：将业务逻辑（积分计算）与视图逻辑分离，提升组件通用性"
性能优化和用户体验
"在性能和体验方面做了多项优化：
- 条件渲染：粒子效果只在进度>23%时渲染，减少DOM开销
- CSS硬件加速：使用transform替代left/top，利用GPU加速
- 防抖机制：进度更新时合理控制动画频率，避免过度渲染
- 渐进增强：基础进度条功能保证可用，粒子效果作为增强体验"
// 性能优化策略
class MyEarning extends Component {
    // 防抖更新
    private debounceUpdate = debounce((progress: number) => {
        this.data.set('progress', Math.min(progress, 100));
    }, 16); // 60fps

    // 条件渲染优化
    static computed = {
        shouldShowParticle() {
            const progress = this.data.get('progress');
            const hasParticle = this.data.get('hasParticle');
            return progress > 23 && hasParticle;
        }
    };

    // 内存优化 - 组件销毁时清理
    detached() {
        this.debounceUpdate.cancel();
        this.unwatchAll();
    }
}

/* CSS性能优化 */
.progress-bar {
    /* 使用transform代替width变化，启用GPU加速 *//* 改变width会触发layout（重排） */
    transform: scaleX(var(--progress-scale));
    transform-origin: left center;
    will-change: transform; /* 提示浏览器优化 */
    
    /* 使用contain提升渲染性能 */
    contain: layout style paint;
}

/* 粒子动画优化 */
.particle-item {
    /* 合成层优化 */
    transform: translateZ(0);
    backface-visibility: hidden;
}
CSS动画和数学算法
"动画设计体现了我对数学和视觉的理解：
- 粒子分布算法：使用概率函数确保粒子在视觉上的自然分布
// 10%概率顶部，85%中间，5%底部 - 符合视觉重心
const _mapY = (y) => {
    if (y < 0.1) return 1 + y * (14 / 0.1);
    // ...
}
- 贝塞尔曲线：cubic-bezier(0.1, -0.6, 0.2, 0)实现弹性动画效果
- 时间函数映射：粒子延迟时间通过--x变量实现错落有致的动画"
响应式设计和移动端适配
"移动端适配采用了灵活的方案：
- vw单位适配：（width: {{containerWidth / 12.42}}vw 实现真正的响应式）
- 应该是在postcss配置文件中设置基准宽度为设计稿的页面宽度，然后最后通过配置转换为vw
module.exports = {
    plugins: {
        // px转vw插件
        'postcss-px-to-viewport': {
            viewportWidth: 750, // 设计稿的宽度
            viewportHeight: 1334, // 设计稿的高度，可选
            unitPrecision: 3, // vw的小数点后位数
            viewportUnit: 'vw', // 希望使用的视口单位
            selectorBlackList: ['.ignore', '.hairlines'], // 忽略转换的类名
            minPixelValue: 1, // 最小转换数值
            mediaQuery: false, // 是否在媒体查询中转换px
            exclude: [/node_modules/], // 忽略某些文件夹下的文件
        }
    }
}
- 基准值计算：12.42作为设计稿转换基准，确保不同屏幕下的一致性
- CSS变量系统：--mkt-base-font-size支持运行时动态调整
- 最小尺寸保障：min-width: 54px确保极小屏幕下的可用性"
总结优势： "这个组件体现了我在前端架构、性能优化、数学建模、移动端适配等方面的综合能力。既保证了代码的工程化质量，又在用户体验上做到了细致入微的优化。"
<template>
    <div
        class="{{$style['earnings-container']}}"
        style="
            --mkt-base-font-size: {{fontSize / 12.42}}vw;
            background: {{containerBgColor}};
            border: {{lineBorder}};
            width: {{containerWidth / 12.42}}vw;
            height: {{containerHeight / 12.42}}vw;
        "
    >
        <!-- 进度条底部框 -->
        <div
            class="{{$style['progress-container']}}"   
        >
            <!-- 进度bar动画 -->
            <div
                s-ref="progressBar"
                class="{{[$style['progress-bar'], toggleAnimationEnd && $style['process-bar-end']]}}"
                style="
                    width: {{progress}}%;
                    background: {{bgColor}};
                    transition-duration: {{barDuration}}s;"
                on-transitionend="onProcessBarTransitionEnd"
            >
                <div s-show="+progress > 23 && hasParticle" class="{{$style['particle']}}">
                    <div
                        s-for="position in particleList" class="{{$style['particle-item']}}"
                        style="--x: {{position.x}}s; --y: {{position.y}}%;"
                    ></div>
                </div>
            </div> 
        </div>
        <!-- 资产图片自定义 -->
        <slot
            name="img"
        ></slot>
    </div>
</template>

<script lang="ts">
import {Component} from 'san';

interface ComponentData {
    /** 总分 */
    totalPoints: number | null;
    /** 当前分 */
    currentPoints: number;
    /** 进度条百分比 */
    progress: number;
    /** 进度条达到100% */
    toggleAnimationEnd: boolean;
    /** 是否有粒子效果 */
    hasParticle: boolean;
    /** 进度条底部容器宽度 */
    containerWidth: number;
    /** 进度条底部容器高度 */
    containerHeight: number;
    /** 进度条底部容器背景色 支持渐变和纯色 */
    containerBgColor: string;
}

export default class MyEarning extends Component {
    public initData(): ComponentData {
        return {
            totalPoints: 0,
            currentPoints: 0,
            progress: 0,
            toggleAnimationEnd: false,
            hasParticle: false,
            containerWidth: 810,
            containerHeight: 54,
            containerBgColor: '#D9D9D999'
        };
    }

    public attached(): void {
        this.updateProgress(this.data.get('currentProgress'));
        this.watch('currentProgress', this.updateProgress);
    }

        static computed = {
        currentProgress () {
            const currentPoints = this.data.get('currentPoints');
            const totalPoints = this.data.get('totalPoints');
            return Number(currentPoints) / Number(totalPoints);
        },
        // 粒子列表
        particleList() {
            const particleList = [];
            const _mapY = (y: number) => {
                if (y < 0.1) {
                    // 10% 概率，1%-15%
                    return 1 + y * (14 / 0.1); // [1, 15)
                }
                else if (y < 0.95) {
                    // 85% 概率，16%-60%
                    return 16 + (y - 0.1) * (44 / 0.85); // [16, 60)
                }
                else {
                    // 5% 概率，61%-100%
                    return 61 + (y - 0.95) * (39 / 0.05); // [61, 100)
                }
            };
            // 确保x间距在0.05-0.2之间
            const _getRandomGap = () => {
                return 0.05 + Math.random() * 0.15; // 生成0.3到0.5之间的随机数
            };
            let currentX = 0;
            for (let i = 0; i < 8; i++) {
                const gap = _getRandomGap();
                particleList.push({x: currentX.toFixed(3), y: _mapY(Math.random())});
                currentX += gap;
            }
            return particleList;
        }
    }

    private async updateProgress(val: number, args: {oldValue: number}) {
        const progress = Number(val) * 100;
        // 进度条有变化
        if (args && val > args.oldValue) {
            this.fire('increase');
        }
        // 执行进度动画
        this.data.set('progress', Math.min(progress, 100));
    }
    // 进度条动画结束事件
    onProcessBarTransitionEnd(e) {
        // e?.stopPropagation();
        if (+this.data.get('progress') === 100) {
            this.fire('finish');
        }
    }
}
</script>

<style lang="less" module>
@import '../../mixin.less';
.earnings-container {
    display: flex;
    // position: absolute;
    // left: 50%;
    // top: 183px;
    // transform: translateX(-50%);
    align-items: center;
    border-radius: 9999px;
    justify-content: flex-start;
    align-items: center;
    border: 3px solid #FFFFFF;
    // box-sizing: border-box;
    
    .progress-container {
        width: 65%;
        overflow: hidden;
        z-index: 1;
        height: 54px;
        line-height: 54px;
    }
    .progress-bar {
        height: 100%;
        border-radius: 9999px;
        min-width: 54px;
        transition: width 1s ease;
        display: flex;
        align-items: center;
        position: relative;
        // &:after {
        //     content: '';
        //     display: block;
        //     width: 100%;
        //     height: 12px;
        //     min-width: 12px;
        //     border-radius: 4px;
        //     margin-top: 7px;
        //     background: linear-gradient(90deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.45) 100%);
        // }
        &.showPass {
            transition: width 0.12s ease-in;
        }
        &.process-bar-end {
            left: unset;
            right: 0;
            width: 0% !important;
            transform-origin: right center !important;
            opacity: 0;
        }
        .particle {
            position: absolute;
            width: 387px;
            top: 0;
            right: 0;
            height: 53px;
            border-radius: 9999px;
            overflow: hidden;
            display: flex;
            flex-direction: row-reverse;
            // background: linear-gradient(93deg,
            //                 rgba(255, 255, 255, 0.00) 71.8%,
            //                 rgba(255, 255, 255, 0.30) 83.74%,
            //                 rgba(255, 255, 255, 0.33) 93.98%),
            //             linear-gradient(89deg,
            //                 rgba(238, 242, 129, 0.00) 71.77%,
            //                 rgba(250, 255, 107, 0.35) 86.56%,
            //                 rgba(255, 255, 255, 0.70) 97.62%);
            background-size: 100% 100%;
            background-repeat: no-repeat;
            background-image: url('https://gips2.baidu.com/it/u=3896502504,3443677759&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f71_55');
            width: 71px;
            height: 55px;
            .particle-item {
                content: '';
                display: block;
                width: 14px;
                height: 14px;
                position: absolute;
                // right: var(--x);
                top: var(--y);
                border-radius: 50%;
                transform-origin: center center;
                animation: particle 2s linear infinite forwards;
                animation-delay: var(--x);
                background: radial-gradient(50% 50% at 50% 50%,
                    rgba(255, 255, 255, 0.8) 0%,
                    rgba(255, 255, 255, 0.634615) 25%,
                    rgba(255, 255, 255, 0.142382) 74.52%,
                    rgba(255, 255, 255, 0) 100%);
            }
            @keyframes particle {
                0% {
                    transform: translateX(0) scale(1);
                }
                100% {
                    transform: translateX(-387px) scale(0);
                }
            }
        }
    }

    .afx {
        position: absolute;
        z-index: 10;
    }

    .amount, .amount-danwei {
        color: #FF2828;
        font-size: 46px;
        font-weight: 500;
        font-family: BaiduNumberPlus;
        margin-top: 16px;
        line-height: 71px;
        display: inline-block;
    }
    .front {
        margin-top: 6px;
    }
    .amount-danwei {
        font-size: 26px;
        margin-bottom: 9px;
    }

    .front-bale {
        width: 132px;
        height: 132px;
        background: url('https://gips1.baidu.com/it/u=3844495338,1175158309&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f132_132') center / 100%   no-repeat ;
        position: absolute;
        background-size: contain;
        right: 239px;
        bottom: -39px;
        z-index: 2;
    }
    .union {
        width: 49px;
        height: 11px;
        background: url('https://gips2.baidu.com/it/u=1595964835,587288577&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f49_11') center / 100%   no-repeat ;
        position: absolute;
        right: 162px;
        bottom: 21px;
        z-index: 2;
    }
    .final-bale {
        width: 159px;
        height: 159px;
        background: url('https://gips2.baidu.com/it/u=1663311960,1692287398&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f159_159') center / 100%   no-repeat ;
        position: absolute;
        background-size: contain;
        right: -12px;
        bottom: -46px;
        z-index: 2;
    }
}

.breathing {
    animation: breathing 0.4s cubic-bezier(0.1, -0.6, 0.2, 0);
    animation-iteration-count: 1; /* 动画只执行一次 */
}

@keyframes breathing {
    0% {
        transform: scale(1);
    }
    // 25% {
    //     transform: scale(1.1);
    // }
    50% {
        transform: scale(1.4);
    }
    100% {
        transform: scale(1);
    }
}
</style>


[图片]
暂时无法在飞书文档外展示此内容
暂时无法在飞书文档外展示此内容

二、主要功能
- 样式定制：支持多种自定义样式，包括进度条颜色、宽高、插槽自定义资产图片等
- 动画：包括粒子动画、进度增加回传事件（自定义设置飞入动画）、进度100%回传事件等

三、params&methods
暂时无法在飞书文档外展示此内容

暂时无法在飞书文档外展示此内容

具体使用范例
   import {progressBar} from '@/static/common/components/ProgressBar';
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
        class="{{$style['earnings-lj']}}"
    >
        <div slot="img" class="{{$style['img']}}">
            <span class="{{$style['amount']}} {{$style['front']}}">{{currentRedpackNum }}</span><span class="{{$style['amount-danwei']}} {{$style['front']}}">元</span>
        </div>
    </c-progress-bar>
    
    <script>
        export default {
            static components = {
                'c-progress-bar': progressBar
            };
        }
        // 进度增加
        increaseEarning() {
        }
        // 进度100%
        finishEarning() {
        }
    </script>
[图片]

组件化思维和可复用性
"我将进度条设计为独立的业务组件，具备高度的可复用性：
- 配置化设计：通过props传入不同的尺寸、颜色、动画时长，一个组件适配多种场景
- 插槽机制：预留img插槽，允许业务方自定义图标内容
- 事件驱动：通过increase、finish事件与父组件解耦，遵循单一职责原则
- 数据抽象：将业务逻辑（积分计算）与视图逻辑分离，提升组件通用性"
性能优化和用户体验
"在性能和体验方面做了多项优化：
- 条件渲染：粒子效果只在进度>23%时渲染，减少DOM开销
- CSS硬件加速：使用transform替代left/top，利用GPU加速
- 防抖机制：进度更新时合理控制动画频率，避免过度渲染
- 渐进增强：基础进度条功能保证可用，粒子效果作为增强体验"
// 性能优化策略
class MyEarning extends Component {
    // 防抖更新
    private debounceUpdate = debounce((progress: number) => {
        this.data.set('progress', Math.min(progress, 100));
    }, 16); // 60fps

    // 条件渲染优化
    static computed = {
        shouldShowParticle() {
            const progress = this.data.get('progress');
            const hasParticle = this.data.get('hasParticle');
            return progress > 23 && hasParticle;
        }
    };

    // 内存优化 - 组件销毁时清理
    detached() {
        this.debounceUpdate.cancel();
        this.unwatchAll();
    }
}

/* CSS性能优化 */
.progress-bar {
    /* 使用transform代替width变化，启用GPU加速 *//* 改变width会触发layout（重排） */
    transform: scaleX(var(--progress-scale));
    transform-origin: left center;
    will-change: transform; /* 提示浏览器优化 */
    
    /* 使用contain提升渲染性能 */
    contain: layout style paint;
}

/* 粒子动画优化 */
.particle-item {
    /* 合成层优化 */
    transform: translateZ(0);
    backface-visibility: hidden;
}
CSS动画和数学算法
"动画设计体现了我对数学和视觉的理解：
- 粒子分布算法：使用概率函数确保粒子在视觉上的自然分布
// 10%概率顶部，85%中间，5%底部 - 符合视觉重心
const _mapY = (y) => {
    if (y < 0.1) return 1 + y * (14 / 0.1);
    // ...
}
- 贝塞尔曲线：cubic-bezier(0.1, -0.6, 0.2, 0)实现弹性动画效果
- 时间函数映射：粒子延迟时间通过--x变量实现错落有致的动画"
响应式设计和移动端适配
"移动端适配采用了灵活的方案：
- vw单位适配：（width: {{containerWidth / 12.42}}vw 实现真正的响应式）
- 应该是在postcss配置文件中设置基准宽度为设计稿的页面宽度，然后最后通过配置转换为vw
module.exports = {
    plugins: {
        // px转vw插件
        'postcss-px-to-viewport': {
            viewportWidth: 750, // 设计稿的宽度
            viewportHeight: 1334, // 设计稿的高度，可选
            unitPrecision: 3, // vw的小数点后位数
            viewportUnit: 'vw', // 希望使用的视口单位
            selectorBlackList: ['.ignore', '.hairlines'], // 忽略转换的类名
            minPixelValue: 1, // 最小转换数值
            mediaQuery: false, // 是否在媒体查询中转换px
            exclude: [/node_modules/], // 忽略某些文件夹下的文件
        }
    }
}
- 基准值计算：12.42作为设计稿转换基准，确保不同屏幕下的一致性
- CSS变量系统：--mkt-base-font-size支持运行时动态调整
- 最小尺寸保障：min-width: 54px确保极小屏幕下的可用性"
总结优势： "这个组件体现了我在前端架构、性能优化、数学建模、移动端适配等方面的综合能力。既保证了代码的工程化质量，又在用户体验上做到了细致入微的优化。"
<template>
    <div
        class="{{$style['earnings-container']}}"
        style="
            --mkt-base-font-size: {{fontSize / 12.42}}vw;
            background: {{containerBgColor}};
            border: {{lineBorder}};
            width: {{containerWidth / 12.42}}vw;
            height: {{containerHeight / 12.42}}vw;
        "
    >
        <!-- 进度条底部框 -->
        <div
            class="{{$style['progress-container']}}"   
        >
            <!-- 进度bar动画 -->
            <div
                s-ref="progressBar"
                class="{{[$style['progress-bar'], toggleAnimationEnd && $style['process-bar-end']]}}"
                style="
                    width: {{progress}}%;
                    background: {{bgColor}};
                    transition-duration: {{barDuration}}s;"
                on-transitionend="onProcessBarTransitionEnd"
            >
                <div s-show="+progress > 23 && hasParticle" class="{{$style['particle']}}">
                    <div
                        s-for="position in particleList" class="{{$style['particle-item']}}"
                        style="--x: {{position.x}}s; --y: {{position.y}}%;"
                    ></div>
                </div>
            </div> 
        </div>
        <!-- 资产图片自定义 -->
        <slot
            name="img"
        ></slot>
    </div>
</template>

<script lang="ts">
import {Component} from 'san';

interface ComponentData {
    /** 总分 */
    totalPoints: number | null;
    /** 当前分 */
    currentPoints: number;
    /** 进度条百分比 */
    progress: number;
    /** 进度条达到100% */
    toggleAnimationEnd: boolean;
    /** 是否有粒子效果 */
    hasParticle: boolean;
    /** 进度条底部容器宽度 */
    containerWidth: number;
    /** 进度条底部容器高度 */
    containerHeight: number;
    /** 进度条底部容器背景色 支持渐变和纯色 */
    containerBgColor: string;
}

export default class MyEarning extends Component {
    public initData(): ComponentData {
        return {
            totalPoints: 0,
            currentPoints: 0,
            progress: 0,
            toggleAnimationEnd: false,
            hasParticle: false,
            containerWidth: 810,
            containerHeight: 54,
            containerBgColor: '#D9D9D999'
        };
    }

    public attached(): void {
        this.updateProgress(this.data.get('currentProgress'));
        this.watch('currentProgress', this.updateProgress);
    }

        static computed = {
        currentProgress () {
            const currentPoints = this.data.get('currentPoints');
            const totalPoints = this.data.get('totalPoints');
            return Number(currentPoints) / Number(totalPoints);
        },
        // 粒子列表
        particleList() {
            const particleList = [];
            const _mapY = (y: number) => {
                if (y < 0.1) {
                    // 10% 概率，1%-15%
                    return 1 + y * (14 / 0.1); // [1, 15)
                }
                else if (y < 0.95) {
                    // 85% 概率，16%-60%
                    return 16 + (y - 0.1) * (44 / 0.85); // [16, 60)
                }
                else {
                    // 5% 概率，61%-100%
                    return 61 + (y - 0.95) * (39 / 0.05); // [61, 100)
                }
            };
            // 确保x间距在0.05-0.2之间
            const _getRandomGap = () => {
                return 0.05 + Math.random() * 0.15; // 生成0.3到0.5之间的随机数
            };
            let currentX = 0;
            for (let i = 0; i < 8; i++) {
                const gap = _getRandomGap();
                particleList.push({x: currentX.toFixed(3), y: _mapY(Math.random())});
                currentX += gap;
            }
            return particleList;
        }
    }

    private async updateProgress(val: number, args: {oldValue: number}) {
        const progress = Number(val) * 100;
        // 进度条有变化
        if (args && val > args.oldValue) {
            this.fire('increase');
        }
        // 执行进度动画
        this.data.set('progress', Math.min(progress, 100));
    }
    // 进度条动画结束事件
    onProcessBarTransitionEnd(e) {
        // e?.stopPropagation();
        if (+this.data.get('progress') === 100) {
            this.fire('finish');
        }
    }
}
</script>

<style lang="less" module>
@import '../../mixin.less';
.earnings-container {
    display: flex;
    // position: absolute;
    // left: 50%;
    // top: 183px;
    // transform: translateX(-50%);
    align-items: center;
    border-radius: 9999px;
    justify-content: flex-start;
    align-items: center;
    border: 3px solid #FFFFFF;
    // box-sizing: border-box;
    
    .progress-container {
        width: 65%;
        overflow: hidden;
        z-index: 1;
        height: 54px;
        line-height: 54px;
    }
    .progress-bar {
        height: 100%;
        border-radius: 9999px;
        min-width: 54px;
        transition: width 1s ease;
        display: flex;
        align-items: center;
        position: relative;
        // &:after {
        //     content: '';
        //     display: block;
        //     width: 100%;
        //     height: 12px;
        //     min-width: 12px;
        //     border-radius: 4px;
        //     margin-top: 7px;
        //     background: linear-gradient(90deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.45) 100%);
        // }
        &.showPass {
            transition: width 0.12s ease-in;
        }
        &.process-bar-end {
            left: unset;
            right: 0;
            width: 0% !important;
            transform-origin: right center !important;
            opacity: 0;
        }
        .particle {
            position: absolute;
            width: 387px;
            top: 0;
            right: 0;
            height: 53px;
            border-radius: 9999px;
            overflow: hidden;
            display: flex;
            flex-direction: row-reverse;
            // background: linear-gradient(93deg,
            //                 rgba(255, 255, 255, 0.00) 71.8%,
            //                 rgba(255, 255, 255, 0.30) 83.74%,
            //                 rgba(255, 255, 255, 0.33) 93.98%),
            //             linear-gradient(89deg,
            //                 rgba(238, 242, 129, 0.00) 71.77%,
            //                 rgba(250, 255, 107, 0.35) 86.56%,
            //                 rgba(255, 255, 255, 0.70) 97.62%);
            background-size: 100% 100%;
            background-repeat: no-repeat;
            background-image: url('https://gips2.baidu.com/it/u=3896502504,3443677759&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f71_55');
            width: 71px;
            height: 55px;
            .particle-item {
                content: '';
                display: block;
                width: 14px;
                height: 14px;
                position: absolute;
                // right: var(--x);
                top: var(--y);
                border-radius: 50%;
                transform-origin: center center;
                animation: particle 2s linear infinite forwards;
                animation-delay: var(--x);
                background: radial-gradient(50% 50% at 50% 50%,
                    rgba(255, 255, 255, 0.8) 0%,
                    rgba(255, 255, 255, 0.634615) 25%,
                    rgba(255, 255, 255, 0.142382) 74.52%,
                    rgba(255, 255, 255, 0) 100%);
            }
            @keyframes particle {
                0% {
                    transform: translateX(0) scale(1);
                }
                100% {
                    transform: translateX(-387px) scale(0);
                }
            }
        }
    }

    .afx {
        position: absolute;
        z-index: 10;
    }

    .amount, .amount-danwei {
        color: #FF2828;
        font-size: 46px;
        font-weight: 500;
        font-family: BaiduNumberPlus;
        margin-top: 16px;
        line-height: 71px;
        display: inline-block;
    }
    .front {
        margin-top: 6px;
    }
    .amount-danwei {
        font-size: 26px;
        margin-bottom: 9px;
    }

    .front-bale {
        width: 132px;
        height: 132px;
        background: url('https://gips1.baidu.com/it/u=3844495338,1175158309&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f132_132') center / 100%   no-repeat ;
        position: absolute;
        background-size: contain;
        right: 239px;
        bottom: -39px;
        z-index: 2;
    }
    .union {
        width: 49px;
        height: 11px;
        background: url('https://gips2.baidu.com/it/u=1595964835,587288577&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f49_11') center / 100%   no-repeat ;
        position: absolute;
        right: 162px;
        bottom: 21px;
        z-index: 2;
    }
    .final-bale {
        width: 159px;
        height: 159px;
        background: url('https://gips2.baidu.com/it/u=1663311960,1692287398&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f159_159') center / 100%   no-repeat ;
        position: absolute;
        background-size: contain;
        right: -12px;
        bottom: -46px;
        z-index: 2;
    }
}

.breathing {
    animation: breathing 0.4s cubic-bezier(0.1, -0.6, 0.2, 0);
    animation-iteration-count: 1; /* 动画只执行一次 */
}

@keyframes breathing {
    0% {
        transform: scale(1);
    }
    // 25% {
    //     transform: scale(1.1);
    // }
    50% {
        transform: scale(1.4);
    }
    100% {
        transform: scale(1);
    }
}
</style>