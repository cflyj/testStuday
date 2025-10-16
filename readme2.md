1.25高考主页
前三个动画为手写动画（注）
暂时无法在飞书文档外展示此内容
[图片]

代码
<template>
    <c-log
        exposure-once="{{taskType === 'brand_guide' ? false : true}}"
        on-exposure="handleExposure"
        on-unExposure="handleUnExposure"
    >
        <div class="{{$style['btn-group-wrapper']}}">
            <!-- 学分按钮与心情按钮的层级高于主按钮 -->
            <!-- 学分按钮 -->
            <div class="{{$style['btn-aside']}} {{$style['btn-credit']}}" on-click="btnClick('credit')"></div>
            <!-- 主按钮 -->
            <div
                class="{{$style['btn-main']}}"
                style="{{showGuide ? 'z-index: 100;' : ''}}"
                on-click="btnClick('main')"
            >
                <div
                    s-if="showTaskTitle"
                    class="{{$style['btn-main-title']}}"
                >
                    {{showTaskTitle}}
                </div>
                <div
                    s-if="showTaskProfit && !isAgentFinished"
                    class="{{$style['btn-main-profit']}}"
                >
                    {{showSubTitle}}
                </div>
                <!-- 无任务兜底btn -->
                <div
                    s-else
                    class="{{$style['btn-main-profit']}}"
                >
                    多多陪我聊天呀
                </div>
                <div class="{{$style['light-area']}}">
                    <div class="{{$style['light-bg']}}" style="background-image: url({{lightBg}})"></div>
                </div>
            </div>
            <!-- 新人引导全局点击 -->
            <div
                s-if="showGuide"
                class="{{$style['click-area']}}"
                on-click="btnClick('main')"
            ></div>
            <!-- 心情按钮 -->
            <div class="{{$style['btn-aside']}} {{$style['btn-mood']}}" on-click="btnClick('mood')"></div>
            <!-- 左右按钮 -->
        </div>
    </c-log>
</template>

<script lang="ts">
import {Component} from 'san';
import {
    SEND_LOG,
    HANDLE_NEW_STEP,
    CLOSE_NEW_GUIDE,
    MAIN_BTN_CLICK,
    CLOSE_SUCCESS_OR_PAGESHOW
} from '../common/event-conf';
import {NEW_GUIDE_STEP} from '../common/constant';
import Log from '@/components/Log';
import {eventHub} from '@/static/js/lib/event-emitter';
import { TASK_STATUS } from '../common/constant';

const MOOD_TEXT = '心情值';

export default class Btngroup extends Component {

    static trimWhitespace = 'all';
    asyncQueue: any;
    observer: any;

    static components = {
        'c-log': Log,
    };

    static computed = {
        showTaskTitle() {
            const curBtnTask = this.data.get('curBtnTask');
            if (curBtnTask && !this.data.get('isAgentFinished')) {
                const title = curBtnTask?.taskshow?.customconfig?.title;
                return title?.length > 7 ? `${title.slice(0, 7)}...` : title;
            }
            else {
                return '和我对话';
            }
        },
        showSubTitle() {
            const curBtnTask = this.data.get('curBtnTask');
            const subTitle = curBtnTask?.taskshow?.customconfig?.buttonShowTitle;
            const showTaskProfit = this.data.get('showTaskProfit');
            const showTaskTypeText = this.data.get('showTaskTypeText');
            return subTitle || `最高得${showTaskProfit}${showTaskTypeText}`;
        },
        showTaskProfit() {
            return this.data.get('curBtnTask')?.taskshow?.customconfig?.taskAdditionValue;
        },
        showTaskTypeText() {
            return this.data.get('curBtnTask')?.taskshow?.customconfig?.taskAdditionType === 'point' ? '学分' : MOOD_TEXT;
        },
        isAgentFinished() {
            return String(this.data.get('curBtnTask')?.taskshow?.status) === TASK_STATUS.FINISHED
        }
    };

    initData() {
        return {
            curBtnTask: {},
            isOnlyMoodTask: false,
            healthLevel: 0,
            showGuide: false,
            // 按钮扫光图
            lightBg: 'https://search-operate.cdn.bcebos.com/732dac717f5752772405e8449b18205a.png',
            curStep: 0
        };
    }
    created() {
        eventHub.$on(HANDLE_NEW_STEP, ({step}) => {
            this.data.set('curStep', step);
            if (+step === NEW_GUIDE_STEP.DO_SCORE_TASK || +step === NEW_GUIDE_STEP.DO_MOOD_TASK) {
                this.data.set('showGuide', true);
            }
        });
        eventHub.$on(MAIN_BTN_CLICK, () => {
            const curBtnTask = this.data.get('curBtnTask');
            this.fire('btn-click', {type: 'main', task: curBtnTask});
        });
    }

    attached() {
        // 品牌任务：弹窗关闭需要再次打曝光点
        eventHub.$on(CLOSE_SUCCESS_OR_PAGESHOW, () => {
            const taskType = this.data.get('curBtnTask.taskshow.taskdetail.ext.customType');
            const curBtnTask = this.data.get('curBtnTask');
            const isOnlyMoodTask = this.data.get('isOnlyMoodTask');
            if(taskType === 'brand_guide' && this.data.get('isVisible')) {
                eventHub.$emit(SEND_LOG, {
                    type: 'element_show',
                    ext: {
                        action_name: 'ppcjhc_task_show',
                        task_id: curBtnTask?.taskshow?.taskid,
                        mood_grade: this.data.get('healthLevel'),
                        status: isOnlyMoodTask ? 'low' : 'normal'
                    }
                });
            }
        });
    }

    handleExposure() {
        this.data.set('isVisible', true);
        const curBtnTask = this.data.get('curBtnTask');
        const isOnlyMoodTask = this.data.get('isOnlyMoodTask');
        const logData = [
            {action_name: 'gk2025_earn_credits_show'},
            {action_name: 'gk2025_happy_show'},
            {
                action_name: 'gk2025_main_btn_show',
                task_id: curBtnTask?.taskshow?.taskid,
                mood_grade: this.data.get('healthLevel'),
                status: isOnlyMoodTask ? 'low' : 'normal'
            }
        ];

        const taskType = curBtnTask?.taskshow?.taskdetail.ext.customType || '';

        logData.forEach((data, index) => {
            if(index === 2 &&  taskType === 'brand_guide') {
                eventHub.$emit(SEND_LOG, {
                    type: 'element_show',
                    ext: {
                        ...data,
                        action_name: 'ppcjhc_task_show'
                    }
                });
            }
            else {
                eventHub.$emit(SEND_LOG, {
                    type: 'element_show',
                    ext: data
                });
            }
        });
    }

    btnClick(type: string) {
        const curBtnTask = this.data.get('curBtnTask');
        const isOnlyMoodTask = this.data.get('isOnlyMoodTask');
        const actionMap = {
            credit: {action_name: 'gk2025_earn_credits_click'},
            mood: {action_name: 'gk2025_happy_click'},
            main: {
                action_name: 'gk2025_main_btn_click',
                task_id: curBtnTask?.taskshow?.taskid,
                mood_grade: this.data.get('healthLevel'),
                status: isOnlyMoodTask ? 'low' : 'normal'
            }
        };
        const taskType = curBtnTask?.taskshow?.taskdetail.ext.customType || '';

        if (actionMap[type]) {
            let logData;
            switch (taskType) {
                case 'brand_guide':
                    logData = {
                        ...actionMap[type],
                        action_name: 'ppcjhc_task_click'
                    };
                    break;
                default:
                    logData = actionMap[type];
                    break;
            }
            eventHub.$emit(SEND_LOG, {
                type: 'click',
                ext: logData
            });
        }

        this.fire('btn-click', {type, task: curBtnTask});
        if (type === 'main' && this.data.get('showGuide')) {
            eventHub.$emit(CLOSE_NEW_GUIDE);
            this.data.set('showGuide', false);
            eventHub.$emit(SEND_LOG, {
                type: 'click',
                ext: {
                    action_name: this.data.get('curStep') === NEW_GUIDE_STEP.DO_MOOD_TASK
                        ? 'gk2025_mood_guidance_click'
                        : 'gk2025_credits_guidance_click'
                },
            });
        }
    }

    handleUnExposure() {
        this.data.set('isVisible', false);
    }

    detached() {
        this.observer && this.observer?.disconnect();
    }


}
</script>

<style lang="less" module>
@import '../mixin.less';

.btn-group-wrapper {
    position: relative;
    margin-top: 1333px;
    width: 100%;
    height: 308px;
}

.btn-aside {
    position: absolute;
    z-index: 2;
    width: 281px;
    height: 306px;
}

.btn-credit {
    top: 0;
    left: 0;
    .full-cover-bg('https://gips3.baidu.com/it/u=1674931474,1237744095&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f281_306');

}

.btn-mood {
    top: 0;
    right: 0;
    .full-cover-bg('https://gips0.baidu.com/it/u=546789689,2637041784&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f281_306');
}

.click-area {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 100;
}

.btn-main {
    position: relative;
    width: 669px;
    height: 222px;
    top: 0;
    left: 50%;
    transform: translateX(-50%);
    z-index: 1;
    display: flex;
    justify-content: center;

    .full-cover-bg('https://gips0.baidu.com/it/u=160397774,3655136139&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f2656_222');
    animation: slide-background 8s linear infinite,
        btnAnimation 1.25s linear 0s infinite;
    background-size: cover;
    border-radius: 111px;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        right: -51px;
        width: 771px;
        height: 308px;
        .full-cover-bg('https://gips3.baidu.com/it/u=2993796947,3334378137&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f771_308');
    }

    &-title {
        position: absolute;
        top: 47px;
        font-weight: 600;
        .hold-text-in-large-font(66px, 66px);
        color: #002C33;
    }

    &-profit {
        position: absolute;
        top: 131px;
        .hold-text-in-large-font(45px, 45px);
        color: #00184C;
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 90%;
    }

    .light-area {
            position: relative;
            width: 97%;
            height: 97%;
            border-radius: 248px;
            overflow: hidden;
            .light-bg {
                position: absolute;
                width: 124px;
                top: -124px;
                height: 424px;
                left: -124px;
                transform: rotate(30deg);
                background-size: 100% 100%;
                background-repeat: no-repeat;
                animation-name: lightMove;
                animation-duration: 1.5s;
                animation-timing-function: ease-in-out;
                animation-iteration-count: infinite;
            }
        }
}

@keyframes slide-background {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 100% 0; /* 根据图片的实际长度调整偏移量 */
  }
  100% {
    background-position: 0 0;
  }
}

@keyframes lightMove {
    0% {
        left: -124px;
        opacity: 1;
    }
    66% {
        left: 700px;
        opacity: 0.4;
    }
    100% {
        left: 700px;
        opacity: 0;
    }
}

@keyframes btnAnimation {
    0% {
        transform: translateX(-50%) scale(1);
    }
    51% {
        transform: translateX(-50%) scale(1.1);
    }
    100% {
        transform: translateX(-50%) scale(1);
    }
}
</style>


实现
这个主按钮上的动画实现包含以下几个部分：
背景滚动动画 (slide-background)
animation: slide-background 8s linear infinite;

@keyframes slide-background {
  0% {
    background-position: 0 0;
  }
  50% {
    background-position: 100% 0;
  }
  100% {
    background-position: 0 0;
  }
}

- 通过改变 background-position 实现背景图片的左右滚动效果
- 8秒为一个周期，无限循环
1. 按钮缩放脉动动画 (btnAnimation)
animation: btnAnimation 1.25s linear 0s infinite;

@keyframes btnAnimation {
    0% {
        transform: translateX(-50%) scale(1);
    }
    51% {
        transform: translateX(-50%) scale(1.1);
    }
    100% {
        transform: translateX(-50%) scale(1);
    }
}
- 按钮在原始大小和1.1倍大小之间循环变化
- 保持水平居中的同时进行缩放
- 1.25秒为一个周期
2. 扫光动效 (lightMove)
.light-bg {
    animation-name: lightMove;
    animation-duration: 1.5s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
}

@keyframes lightMove {
    0% {
        left: -124px;
        opacity: 1;
    }
    66% {
        left: 700px;
        opacity: 0.4;
    }
    100% {
        left: 700px;
        opacity: 0;
    }
}
- 通过一个旋转30度的光效元素从左向右移动
- 同时透明度从1变化到0，产生扫光效果
- 1.5秒为一个周期
3. 动画组合
主按钮同时应用了背景滚动和缩放动画：
animation: slide-background 8s linear infinite,
           btnAnimation 1.25s linear 0s infinite;
这些动画组合起来形成了一个具有吸引力的动态按钮效果，包括背景流动、按钮呼吸和扫光特效。


2.异形动画
暂时无法在飞书文档外展示此内容
[图片]


代码
波浪速度为什么设置的比较小为0.01或者这里是0.005

// 一个完整的sin波周期是2π ≈ 6.28
// 当speed = 0.01时：
// 完成一个周期需要：6.28 ÷ 0.01 = 628帧
// 在60fps下 = 628 ÷ 60 ≈ 10.5秒完成一个波浪周期
<template>
    <div
        class="
            {{$style['heart-container']}}
            {{weight >= 1 ? $style['peng'] : ''}}
        ">
        <svg
            class="{{$style['svg-container']}}"
            viewBox="0 0 190 157"
            fill="none" 
            xmlns="http://www.w3.org/2000/svg">
            <defs>
                <clipPath id="{{clipId}}">
                    <!-- eslint-disable max-len -->
                    <path d="M96.0268 14.0132C96.0268 14.0132 115.332 0 140.339 0C161.945 0 189.953 18.0879 189.953 54.6614C189.953 54.6614 194.58 106 111.931 152.654C111.931 152.654 95.3267 165.376 66.8187 147.288C66.8187 147.288 0 111.509 0 61.1214C0 15.8021 39.0109 2.48461 56.1157 2.48461C79.3222 2.38522 91.4256 13.6157 96.0268 14.0132Z" fill="black"/>
                    <!-- eslint-enable max-len -->
                </clipPath>
            </defs>
            
            创建垂直渐变色（从上到下）
            从startColor渐变到红色
            rotate(90)让渐变垂直
            <defs>
                <linearGradient id="{{colorId}}" gradientTransform="rotate(90)">
                    <stop offset="0%" stop-color="{{startColor}}"/>
                    <stop offset="100%" stop-color="rgba(255, 29, 29, 1)"/>
                </linearGradient>
            </defs>
            <path
                s-ref="wavePath" 
                stroke-width="0"
                fill="{{'url(#'+colorId+')'}}"
                clip-path="{{'url(#'+clipId+')'}}"/>
        </svg>
        <!-- 心形图片 -->
        <div class="{{$style['heart-img']}}"></div>
        <!-- 心情状态 -->
        <img
            class="{{$style['state-img']}}"
            src="{{_iconMap[ipStatus]}}">
        <!-- 数值 -->
        <div class="{{$style['moodState']}}">
            <c-num
                class="{{$style['num']}}"
                num-font-style="{{_numFontStyle}}"
                income="{{healthLevel}}"
                fixed="0"
                max-num="{{healthUpperLimit}}"
            />
        </div>
    </div>
</template>

<script lang="ts">
import {Component} from 'san';
import RunNumber from '@/static/common/components/run-number.san';
import {eventHub} from '@/static/js/lib/event-emitter';
import {SEND_LOG} from '../common/event-conf';
import ua from '@searchfe/user-agent';
export default class Heart extends Component {

    static components = {
        'c-num': RunNumber
    };

    static computed = {
        weight(this: Heart) {
            return this.data.get('healthLevel') / this.data.get('healthUpperLimit')
        },
        startColor(this: Heart) {
            let weight = this.data.get('healthLevel') / this.data.get('healthUpperLimit');
            const startColor = [255, 0, 136, 1];
            const endColor = [255, 29, 29, 1];
            const resultColot = startColor.map((num, index) => {
                return num + (endColor[index] - num) * weight;
            });
            return rgba(${resultColot.join(',')});
        }
    };

    static animationFrameId: any = null;

    initData() {
        return {
            path: '',
            healthLevel: 1,      //  心情值
            healthUpperLimit: 1, //  心情值上限
            isHealthLowLevel: 1,  // 是否可做学分任务
            ipStatus: 1,
            _numFontStyle: {
                'font-size': ua.isAndroid() ? ${66 / 1.06 / 12.42}vw : ${66 / 12.42}vw,
                'font-weight': 700,
                'color': '#fff',
                'height': ${66 / 12.42}vw,
                'line-height': ua.isAndroid() ? ${66 / 1.21 / 12.42}vw : ${66 / 12.42}vw,
                'overflow': 'hidden',
                '-webkit-text-stroke': ${5 / 12.42}vw rgba(255, 28, 68, 0.3)
            },
            _iconMap: {
                '1': 'https://gips3.baidu.com/it/u=3958387041,1012129206&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f148_62',     // 激动
                '2': 'https://gips0.baidu.com/it/u=3580675454,1392651735&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f148_62',     // 开心
                '3': 'https://gips1.baidu.com/it/u=1797032455,4014345549&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f148_62',     // 平淡
                '4': 'https://gips2.baidu.com/it/u=10923133,1289546534&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f148_62'        // 沮丧
            },
            _fadeHealthLevel: 0,
            _amplitude: 10,     // 波浪振幅，稍微减小使波浪更柔和
            _speed: 0.005,      // 波浪速度
            _fps: 28,
            colorId: color_${Date.now()},
            clipId: clip_${Date.now()}
        };
    }

    attached() {
        this.animateWave = this.animateWave();
        // 启动动画
        this.startLoop();

        eventHub.$emit(SEND_LOG, {
            type: 'element_show',
            ext: {
                action_name: 'gk2025_mood_grade_show',
            }
        });
    }

    animateWave() {
        const wavePath =this.ref('wavePath');
        let phase = 0;
        let self = this;

        return (deltaTime = 40) => {
            let { healthLevel, healthUpperLimit, _fadeHealthLevel, _speed, _amplitude } = self.data.get();
            if (_fadeHealthLevel < healthLevel) {
                _fadeHealthLevel += 0.03 * deltaTime;
                self.data.set('_fadeHealthLevel', _fadeHealthLevel);
            } else {
                _fadeHealthLevel = healthLevel;
            };
            const baseY = 157 * (1 - _fadeHealthLevel / healthUpperLimit); // 基础Y坐标
            // 更新相位
            phase += _speed * deltaTime;
            // 构建新的路径数据
            let pathData = M0 230 L0 ${baseY};
            // 创建平滑波浪曲线，使用更多点和贝塞尔曲线
            const points = [];
            const numPoints = 20; // 增加点的数量以获得更平滑的曲线
            // 生成波浪上的点
            for (let i = 0; i <= numPoints; i++) {
                const x = (i / numPoints) * 230;
                const y = baseY + Math.sin(phase + i * 0.2) * _amplitude;
                points.push({ x, y });
            }
            // 使用贝塞尔曲线连接点
            for (let i = 0; i < points.length - 1; i++) {
                const curr = points[i];
                const next = points[i + 1];
                // 计算控制点（使曲线更平滑）
                const cpX = (curr.x + next.x) / 2;
                if (i === 0) {
                    pathData += C${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y} ;
                } else {
                    pathData += S${cpX},${next.y} ${next.x},${next.y} ;
                }
            }
            // 完成路径
            pathData += "L230 230 Z";
            // 更新路径
            wavePath.setAttribute('d', pathData);
        }
    }

    startLoop() {
        const frameInterval = 1000 / this.data.get('_fps');
        let lastFrameTime = 0;
        const animate = (timestamp) => {
            const elapsed = timestamp - lastFrameTime;
            if (elapsed > frameInterval) {
                this.animateWave(elapsed);
                lastFrameTime = timestamp;
            }
            Heart.animationFrameId = requestAnimationFrame(animate);
        };
        Heart.animationFrameId = requestAnimationFrame(animate);
    }

    detached() {
        if (Heart.animationFrameId) {
            cancelAnimationFrame(Heart.animationFrameId);
        }
    }
}
</script>

<style lang="less" module>
    .heart-container {
        position: relative;
        width: 230px;
        height: 230px;
        background-color: transparent;
    }
    .svg-container {
        position: absolute;
        left: 22px;
        top: 33px;
        width: 180px;
        height: 157px;
        transform: scale(0.98);
    }
    .heart-img {
        position: absolute;
        left: 0;
        top: 0;
        width: 230px;
        height: 230px;
        background-image: url(https://gips2.baidu.com/it/u=680850981,2233768711&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f230_230);
        background-size: 230px 230px;
    }
    .state-img {
        width: 142px;
        height: 56px;
        position: absolute;
        top: 163px;
        left: 44px;
    }
    .peng {
        animation: heartbeat 0.32s ease-in-out infinite;
    }
    .moodState {
        position: absolute;
        top: 70px;
        left: 50%;
        transform: translate(-50%, 0);
        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        font-size: 66px;
    }
    @keyframes heartbeat {
        0% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.1);
        }
        100% {
            transform: scale(1);
        }
    }
</style>
实现
这个心形容器的异形动画实现有以下几个技术难点：
1.SVG裁剪路径的精确控制
<clipPath id="{{clipId}}">
    <path d="M96.0268 14.0132C96.0268 14.0132 115.332 0 140.339 0C161.945 0 189.953 18.0879 189.953 54.6614..."/>
</clipPath>

定义一个复杂的不规则形状（可能是水滴、爱心或其他造型）
作为"模板"，波浪只在这个形状内部显示
难点：
- 需要精确绘制心形的贝塞尔曲线路径
- 确保裁剪区域与心形图片完全匹配
- 处理复杂的曲线控制点计算
2.动态波浪效果生成
animateWave() {
    return (deltaTime = 40) => {
        const baseY = 157 * (1 - _fadeHealthLevel / healthUpperLimit);
        phase += _speed * deltaTime;
        // 生成20个点的平滑波浪
        for (let i = 0; i <= numPoints; i++) {
            const x = (i / numPoints) * 230;
            const y = baseY + Math.sin(phase + i * 0.2) * _amplitude;
            points.push({ x, y });
        }
    }
}
难点：
- 实时计算波浪的数学函数（正弦波）
- 动态生成SVG路径字符串
- 处理波浪的相位变化和振幅控制
- 确保波浪在心形边界内正确显示
3.贝塞尔曲线平滑连接
// 使用贝塞尔曲线连接点
for (let i = 0; i < points.length - 1; i++) {
    const cpX = (curr.x + next.x) / 2;
    if (i === 0) {
        pathData += C${cpX},${curr.y} ${cpX},${next.y} ${next.x},${next.y};
    } else {
        pathData += S${cpX},${next.y} ${next.x},${next.y};
    }
}
难点：
- 计算控制点位置使波浪更平滑
- 处理起始点和中间点的不同连接方式
- 确保曲线的连续性和自然过渡
4. 渐变色动态计算
startColor(this: Heart) {
    let weight = this.data.get('healthLevel') / this.data.get('healthUpperLimit');
    const startColor = [255, 0, 136, 1];
    const endColor = [255, 29, 29, 1];
    const resultColot = startColor.map((num, index) => {
        return num + (endColor[index] - num) * weight;
    });
    return rgba(${resultColot.join(',')});
}
难点：
- 根据数值比例动态计算颜色插值
- 处理RGBA颜色空间的线性插值
- 确保颜色变化的平滑过渡
5. 高性能动画循环
startLoop() {
    const frameInterval = 1000 / this.data.get('_fps');
    let lastFrameTime = 0;
    const animate = (timestamp) => {
        const elapsed = timestamp - lastFrameTime;
        if (elapsed > frameInterval) {
            this.animateWave(elapsed);
            lastFrameTime = timestamp;
        }
        Heart.animationFrameId = requestAnimationFrame(animate);
    };
}
难点：
- 控制动画帧率避免过度渲染
- 处理时间差计算确保动画流畅
- 管理requestAnimationFrame的生命周期
- 避免内存泄漏和性能问题
6. 坐标系统映射
难点：
- SVG坐标系与CSS坐标系的转换
- 心形容器的相对定位计算
- 波浪高度与数值比例的映射关系
- 确保在不同尺寸下的正确显示
7. 多层级元素协调
- SVG波浪层
- 心形图片层
- 状态图标层
- 数值显示层
难点： 确保各层级的z-index正确，视觉效果协调统一。
这种异形动画的核心难点在于数学计算的精确性、SVG路径的动态生成和多个动画系统的协调配合。


3.粒子效果
暂时无法在飞书文档外展示此内容
[图片]


代码
<template>
    <div class="{{$style['main-earnings-container']}}">
        <div
            class="{{$style['main-earnings']}}"
            style="
                {{braZIndex ? 'z-index: ' + braZIndex : ''}};
                {{braScale ? 'transform: scale(' + braScale + ')' : ''}}
            "
        >
            <div
                class="{{[$style['process-bar'], toggleAnimationEnd && $style['process-bar-end']]}}"
                style="width: {{processBarWidth}}%;"
                on-transitionend="onProcessBarTransitionEnd"
            >
                <!-- 高光进度条长度：23% -->
                <div s-show="processBarWidth > 23" class="{{$style['particle']}}">
                    <div
                        s-for="position in particleList" class="{{$style['particle-item']}}"
                        style="--x: {{position.x}}s; --y: {{position.y}}%;"
                    ></div>
                </div>
            </div>
            <div
                s-if="{{!braScale}}"
                class="{{$style['icon-box']}}"
                style="background-image: url({{selection.thumbImg}});"
                on-click="handleClick"
            >
                <div class="{{$style['name']}}" style="--text: '{{selection.prizeName}}'">
                    {{ selection.prizeName }}
                </div>
            </div>
        </div>
        <div
            class="{{$style['process-info']}}"
            style="{{infoZIndex ? 'z-index: ' + infoZIndex : ''}}"
        >
            {{ processInfo }}
        </div>
    </div>
</template>

<script lang="ts">
import {Component} from 'san';
import {
    MAIN_EARNINGS_NEWCOMER_SHOW,
    MAIN_EARNINGS_NEWCOMER_SCALE,
    MAIN_EARNINGS_NEWCOMER_SCALE_END
, SEND_LOG
} from '../common/event-conf';
import {REAL_PROGRESS_STAGE, THRESHOLD_LIST} from './popups/Product/constans';
import {AsyncQueue} from '@/static/js/lib/async-queue';
import {H5Popup} from '@/static/js/lib/popups';
import {debounce} from '@/static/js/lib/decorator.ts';
import {eventHub} from '@/static/js/lib/event-emitter';
import {isIOSLowPowerMode} from '@/static/js/lib/boxx-utils';

export default class MainEarnings extends Component {
    needSetProcessBarWidth = false;
    needOpenProduct = false;
    static computed = {
        isComplete() {
            const level = this.data.get('level');
            if (level?.curLevel && level?.treeConfigInfo) {
                return Number(level.curLevel) === -1;
            }
            return false;
        },
        processBarStyle() {
            return {
                'z-index': this.data.get('zIndex'),
                'transform': scale(${this.data.get('scale')}),
            };
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
        },
    };
    initData() {
        return {
            level: {},
            braZIndex: '',
            braScale: '',
            infoZIndex: '',
            selection: {},
            processBarWidth: 0,
            processInfo: '',
            theme: null,
            // 切换动画是否播放完成
            toggleAnimationEnd: false,
        };
    }

    inited() {
        this.setProcessBarWidth();
    }
    attached() {
        this.setProcessInfo();
        this.watch('level', (_, {newValue, oldValue}) => {
            // 等级有变化
            if (+newValue?.curLevel !== +oldValue?.curLevel) {
                // 如果当前等级不是最后一级，100%动画完成后，重新更新进度条
                if (+newValue?.curLevel !== -1) {
                    // 如果当前等级不是最后一级，100%动画完成后，重新更新进度条
                    this.needSetProcessBarWidth = true;
                }
 else {
                    // 如果当前等级是最后一级，需要打开产品弹窗
                    this.needOpenProduct = true;
                }
                this.setProcessBarWidth(100);
            }
            else {
                this.setProcessBarWidth();
            }
        });
        eventHub.$emit(SEND_LOG, {
            type: 'element_show',
            ext: {
                action_name: 'zhnc_select_button_show',
            },
        });
        eventHub.$on(MAIN_EARNINGS_NEWCOMER_SHOW, this.handleNewcomerShow);
        eventHub.$on(MAIN_EARNINGS_NEWCOMER_SCALE, this.handleNewcomerScale);
        eventHub.$on(MAIN_EARNINGS_NEWCOMER_SCALE_END, this.handleNewcomerScaleEnd);
    }
    async setProcessBarWidth(width?: number) {
        // 等待500ms，错开主页pag动画chu初始化
        await new Promise(resolve => setTimeout(resolve, 500));
        if (width) {
            this.data.set('processBarWidth', Math.min(width, 100));
            return;
        }
        const level = this.data.get('level');
        const curLevel = Number(level?.curLevel);
        if (curLevel === -1) {
            this.data.set('processBarWidth', 100);
            return;
        }
        const curProgress = level?.curProgress;
        const levelData = level?.levelData;
        const w = (curProgress / levelData?.threshold) * 100 || 0;
        this.data.set('processBarWidth', Math.min(w, 100));
    }
    onProcessBarTransitionEnd = () => {
        const processBarWidth = this.data.get('processBarWidth');
        const toggleAnimationEnd = this.data.get('toggleAnimationEnd');
        // 如果进度条已经100%，并且需要重新设置进度条，则设置进度条为100%，并重新设置进度条宽度
        if (processBarWidth === 100 && this.needSetProcessBarWidth) {
            this.data.set('toggleAnimationEnd', true);
            this.needSetProcessBarWidth = false;
            this.setProcessBarWidth();
            this.setProcessInfo();
            return;
        }
        // 如果切换动画已经播放完成，则设置切换动画状态为false
        if (toggleAnimationEnd) {
            this.data.set('toggleAnimationEnd', false);
            return;
        }
        this.setProcessInfo();
    };

    setProcessInfo = () => {
        if (this.needOpenProduct) {
            this.needOpenProduct = false;
            this.openProduct();
        }
        const level = this.data.get('level');
        const curLevelIndex = Number(level?.curLevel);
        const curProgress = level?.curProgress;
        const levelData = level?.levelData;
        const waterCount = Math.ceil((levelData?.threshold - curProgress) / levelData?.exchangeCost);
        const needWater = (Math.floor((levelData?.threshold - curProgress) / levelData?.threshold * 100)).toFixed(0);
        const treeConfigInfo = level?.treeConfigInfo;
        let text = '';
        if (this.data.get('isComplete')) {
            text = '果树已经成熟啦，快去兑换吧';
        }
        else if (waterCount >= 0) {
            const levelName = curLevelIndex + 1 === treeConfigInfo?.length ? '兑换' : treeConfigInfo?.[curLevelIndex + 1]?.levelName;
            if (waterCount > 50) {
                text = 再浇水${needWater}%就能${levelName}啦;
            } else {
                text = 再浇水${waterCount}次就能${levelName}啦;
            }
        }
        else {
            text = '';
        }
        this.data.set('processInfo', text);
    };

    @debounce({delay: 300})
    handleClick() {
        this.openProduct(false);
        eventHub.$emit(SEND_LOG, {
            type: 'click',
            ext: {
                action_name: 'zhnc_select_button_click',
            },
        });
    }

    async openProduct(isShowPrintAnimation = true) {
        const isLowPower = await this.checkLowPower();
        AsyncQueue.getInstance().push(async () => {
            const popup = H5Popup.create({
                popupParams: {
                    componentName: 'c-product',
                    componentData: {
                        currentProgress: this.data.get('processBarWidth'),
                        productName: this.data.get('selection.prizeName'),
                        productDesc: this.data.get('selection.desc'),
                        originalPrice: (this.data.get('selection.value') / 100).toFixed(2),
                        productImg: this.data.get('selection.image'),
                        productIcon: this.data.get('selection.thumbImg'),
                        tag: this.data.get('selection.tag')?.split(','),
                        displayPrice: 0.01,
                        processInfo: this.getDetailProgress(),
                        isComplete: this.data.get('isComplete'),
                        isUniversal: Number(this.data.get('selection.isUniversal')),
                        notice: this.data.get('theme')?.module_data?.ipSpecial?.notice || [],
                        dropUrl: this.data.get('selection.dropUrl'),
                        prizeId: this.data.get('selection.prizeId'),
                        isShowPrintAnimation,
                        isLowPower,
                    },
                }
            });
            popup.show();
            return popup.onClose();
        });
    }

    detached() {
        eventHub.$off(MAIN_EARNINGS_NEWCOMER_SHOW, this.handleNewcomerShow);
        eventHub.$off(MAIN_EARNINGS_NEWCOMER_SCALE, this.handleNewcomerScale);
        eventHub.$off(MAIN_EARNINGS_NEWCOMER_SCALE_END, this.handleNewcomerScaleEnd);
    }

    handleNewcomerShow = () => {
        this.data.set('braZIndex', 100);
        this.data.set('infoZIndex', 100);
    };
    handleNewcomerScale = () => {
        this.data.set('infoZIndex', '');
        this.data.set('braScale', 1.2);
    };
    handleNewcomerScaleEnd = () => {
        this.data.set('braZIndex', '');
        this.data.set('infoZIndex', '');
        this.data.set('braScale', '');
    };

    // return:  curLevel-1 ,curLevel, curLevel+1, curLevel+2, ext.nameList[list.length -1]
    getDetailProgress(this: MainEarnings) {
        const level = this.data.get('level');
        const treeConfigInfo = level?.treeConfigInfo.concat([{levelName: this.data.get('selection.prizeName')}]);
        const curLevelIndex = Number(level?.curLevel);
        const targetIndex = treeConfigInfo.length - 1;
        // 弹窗需要展示的总阶段数
        const needShowTotalStage = REAL_PROGRESS_STAGE.length;
        // 弹窗需要展示的当前的阶段
        let popupNowStage = 0;
        let resultIndex = [];
        if (curLevelIndex === 0) {
            resultIndex = [curLevelIndex, curLevelIndex + 1, curLevelIndex + 2, curLevelIndex + 3, targetIndex];
            popupNowStage = 0;
        }
        // 最后一个阶段： ，或者 临近最后一个阶段：窗口值needShowStage-2 >= targetIndex
        else if (curLevelIndex === -1 || curLevelIndex + needShowTotalStage - 2 >= targetIndex) {
            resultIndex = [targetIndex - 4, targetIndex - 3, targetIndex - 2, targetIndex - 1, targetIndex];
            popupNowStage = resultIndex.indexOf(curLevelIndex === -1 ? targetIndex : curLevelIndex);
        }
        else {
            resultIndex = [curLevelIndex - 1, curLevelIndex, curLevelIndex + 1, curLevelIndex + 2, targetIndex];
            popupNowStage = 1;
        }
        const resultNameList = resultIndex.map(index => treeConfigInfo[index].levelName);
        const realProgressStage = REAL_PROGRESS_STAGE;
        const nowProgress = this.data.get('processBarWidth');
        const isComplete = this.data.get('isComplete');
        return {
            nameList: resultNameList,
            curLevel: +level?.curLevel,
            productIcon: this.data.get('selection.thumbImg'),
            currentProgress: isComplete ?
                100
                : THRESHOLD_LIST[popupNowStage] +
                    (realProgressStage[popupNowStage + 1] - THRESHOLD_LIST[popupNowStage]) * nowProgress / 100,
        };
    }
    async checkLowPower() {
        const isLowPower = await isIOSLowPowerMode();
        return isLowPower;
    }
}
</script>

<style lang="less" module>
.main-earnings-container {
    position: absolute;
    top: 1722px;
    left: 0px;
    width: 538px;
    right: 0;
    margin: 0 auto;
}
.main-earnings {
    // margin-top: 100px;
    div {
        box-sizing: border-box;
    }
    width: 492px;
    height: 43px;
    border: 5px #144B23 solid;
    border-radius: 9999px;
    background-color: #0F6331;
    display: flex;
    align-items: center;
    padding: 4px 3px;
    position: relative;
    transform-origin: center center;
    transition: transform 0.5s ease-in-out;
    position: relative;
    .process-bar {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 3px;
        margin: auto 0;
        height: 43px;
        min-width: 43px;
        border-bottom: 2px solid #FFF500;
        border-left: 2px solid #FFF500;
        border-radius: 9999px;
        background: linear-gradient(180deg, rgba(255, 243, 0, 0.50) 0%, rgba(255, 245, 0, 0.00) 57.49%),
                    linear-gradient(90deg, #FF7400 2.06%, #FFF400 98.75%);
        box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.25);
        display: flex;
        padding-left: 15px;
        padding-right: 16px;
        transform: translateZ(1px);
        opacity: 1;
        transition: width 0.5s linear, opacity 0.8s linear;
        overflow: hidden;
        &.process-bar-end {
            left: unset;
            right: 0;
            width: 0% !important;
            transform-origin: right center !important;
            opacity: 0;
        }
        &:after {
            content: '';
            display: block;
            width: 100%;
            height: 12px;
            min-width: 12px;
            border-radius: 4px;
            margin-top: 7px;
            background: linear-gradient(90deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0.45) 100%);
        }
        .particle {
            position: absolute;
            width: 387px;
            top: 0;
            right: 0;
            height: 43px;
            border-radius: 9999px;
            overflow: hidden;
            display: flex;
            flex-direction: row-reverse;
            background: linear-gradient(93deg,
                            rgba(255, 255, 255, 0.00) 71.8%,
                            rgba(255, 255, 255, 0.30) 83.74%,
                            rgba(255, 255, 255, 0.33) 93.98%),
                        linear-gradient(89deg,
                            rgba(238, 242, 129, 0.00) 71.77%,
                            rgba(250, 255, 107, 0.35) 86.56%,
                            rgba(255, 255, 255, 0.70) 97.62%);
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

            // &:after {
            //     content: '';
            //     display: block;
            //     width: 100%;
            //     transform: translateX(69px);
            //     height: 100%;
            //     background-image: url('https://gips2.baidu.com/it/u=2437146628,1020752200&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f976_43');
            //     background-size: 976px 43px;
            //     background-repeat: repeat;
            //     background-position: 0 0;
            //     animation: particle 30s linear infinite;
            //     @keyframes particle {
            //         0% {
            //             background-position: 0 0;
            //         }
            //         100% {
            //             background-position: -976px 0;
            //         }
            //     }
            // }
        }
    }
    .icon-box {
        position: absolute;
        right: -64px;
        bottom: -17px;
        background-size: 100% 100%;
        background-repeat: no-repeat;
        background-position: center center;
        width: 182px;
        height: 182px;
        display: flex;
        align-items: center;
        justify-content: center;
        .name {
            position: absolute;
            bottom: -10px;
            // left: 0;
            // right: 0;
            margin: 0 auto;
            letter-spacing: -3.04px;
            font-size: 38px;
            font-weight: 600;
            color: #fff;
            -webkit-text-stroke: 6px #0F6331;
            text-align: center;
            white-space: nowrap;
            &::after {
                content: var(--text);
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                -webkit-text-stroke: 0;
            }

        }
    }
}
.process-info {
    color: #fff;
    position: relative;
    text-align: center;
    font-family: "PingFang SC";
    font-size: 40px;
    font-style: normal;
    font-weight: 500;
    line-height: normal;
    letter-spacing: 0.96px;
    width: 508px;
    height: 56px;
    text-align: center;
    margin: 29px auto 0;
    white-space: nowrap;
    display: flex;
    align-items: center;
    justify-content: center;
    text-shadow: 1px 3px 4px #0B9275;
}
</style>


实现
这个进度条粒子动效的实现有几个很值得学习的地方：
1.数学算法控制粒子分布
// 粒子列表
particleList() {
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
}
学习点：
- 使用分段函数控制粒子垂直分布的概率密度
- 大部分粒子在中间区域（85%概率），少部分在边缘，形成自然的视觉效果
- 数学映射让随机分布更符合视觉预期
2.动态间距算法
const _getRandomGap = () => {
    return 0.05 + Math.random() * 0.15; // 生成0.05到0.2之间的随机数
};
let currentX = 0;
for (let i = 0; i < 8; i++) {
    const gap = _getRandomGap();
    particleList.push({x: currentX.toFixed(3), y: _mapY(Math.random())});
    currentX += gap;
}

学习点：
- 避免粒子重叠，确保最小间距
- 累积计算位置，保证粒子排列的连续性
- 精度控制（toFixed(3)）避免浮点数精度问题
3. CSS变量配合动画
<div
    s-for="position in particleList" class="{{$style['particle-item']}}"
    style="--x: {{position.x}}s; --y: {{position.y}}%;"
></div>

.particle-item {
    animation: particle 2s linear infinite forwards;
    animation-delay: var(--x);
    top: var(--y);
}

学习点：
- CSS变量实现动态数据传递
- 每个粒子有独立的延迟时间，形成波浪效果
- 避免JavaScript操作DOM，性能更优
4. 渐变遮罩营造高光效果
.particle {
    background: linear-gradient(93deg,
                    rgba(255, 255, 255, 0.00) 71.8%,
                    rgba(255, 255, 255, 0.30) 83.74%,
                    rgba(255, 255, 255, 0.33) 93.98%),
                linear-gradient(89deg,
                    rgba(238, 242, 129, 0.00) 71.77%,
                    rgba(250, 255, 107, 0.35) 86.56%,
                    rgba(255, 255, 255, 0.70) 97.62%);
}

学习点：
- 双层渐变叠加营造丰富的光效层次
- 透明度渐变让粒子自然融入背景
- 角度差异（93deg vs 89deg）增加视觉复杂度
5. 径向渐变模拟真实光粒子
.particle-item {
    background: radial-gradient(50% 50% at 50% 50%,
        rgba(255, 255, 255, 0.8) 0%,
        rgba(255, 255, 255, 0.634615) 25%,
        rgba(255, 255, 255, 0.142382) 74.52%,
        rgba(255, 255, 255, 0) 100%);
}
学习点：
- 径向渐变模拟真实光点的衰减效果
- 中心亮，边缘暗，符合物理光学原理
- 多个透明度节点实现平滑过渡
6. 条件渲染优化性能
<div s-show="processBarWidth > 23" class="{{$style['particle']}}">
学习点：
- 只在进度条达到一定宽度时才显示粒子
- 避免在不必要时渲染复杂动画
- 性能优化与用户体验的平衡
7. 动画生命周期管理
@keyframes particle {
    0% {
        transform: translateX(0) scale(1);
    }
    100% {
        transform: translateX(-387px) scale(0);
    }
}
学习点：
- 结合位移和缩放，粒子逐渐消失更自然
- 固定的移动距离确保动画一致性
- forwards 保持最终状态，避免闪烁
这种粒子系统的设计思路可以应用到很多场景：加载动画、能量效果、流水线状态等，核心是数学算法 + CSS变量 + 渐变效果的组合。


4.雪碧图帧动画
暂时无法在飞书文档外展示此内容
暂时无法在飞书文档外展示此内容


代码
<template>
    <div
        class="
            {{$style['player-layer']}}
        "
    >
        <div
            class="
                {{$style['ip-heart-container']}}
                {{step === 1 ? $style['ip-heart-container-status-1']: ''}}
                {{step === 2 ? $style['ip-heart-container-status-2']: ''}}
            "
        >
            <c-heart
                health-level="{{+mainIpActData.userHealthInfo.healthLevel}}"
                health-upper-limit="{{+mainIpActData.userHealthInfo.healthUpperLimit}}"
                is-health-low-level="{{+mainIpActData.userHealthInfo.isHealthLowLevel}}"
                ip-status="{{+mainIpActData.userHealthInfo.ipStatus}}"
            />
        </div>
        <div
            s-if="!isAndroid && !isLoaded || step === 2"
            class="
                {{$style['mask']}}
                {{step === 2 ? $style['page-status-2']: ''}}
            "
            style="{{'background-color: ' + viewConfig.backgroundColor + ';' : ''}}"
        ></div>
        <div
            id="mainIp"
            class="
                {{$style['mainIp']}}
                {{isGuidePlaying ? $style['is-guide-playing']: ''}}
                {{step === 2 ? $style['page-status-2']: ''}}
            "
            style="
                background-image: url({{ipWalkImg}});
                {{step === 2 ? 'background-color: ' + viewConfig.backgroundColor + ';' : ''}}
            "
        >
            <div
                class="{{$style['hot-click']}}"
                on-click="clickIp"
            ></div>
        </div>
        <div class="{{$style['shadow']}}"></div>
        <c-layer
            s-if="viewConfig.structureList && viewConfig.structureList.length > 0"
            background-list="{{viewConfig.middleBackgroundList}}"
            structure-list="{{viewConfig.structureList}}"
            billboard-position-list="{{billboardPositionList}}"
            billboard-position="{{viewConfig.billboardPosition}}"
            poke-tasks="{{pokeTasks}}"
            top="{{top}}"
            layer-id="middle"
            duration="70"
            z-index="1"
            step="{{step}}"
            height="{{height}}"
            master-time-line="{{masterTimeLine}}"
            need-canvas="{{false}}"
        />
        <c-layer
            background-list="{{viewConfig.distanceBackgroundList}}"
            top="{{top}}"
            layer-id="distance"
            duration="320"
            z-index="0"
            height="{{distanceHeight}}"
            master-time-line="{{masterTimeLine}}"
            need-canvas="{{false}}"
        />
        <c-layer
            background-list="{{viewConfig.frontBackgroundList}}"
            top="{{1421 / 1242 * 100}}"
            layer-id="front"
            duration="25"
            z-index="5"
            height="{{frontHeight}}"
            master-time-line="{{masterTimeLine}}"
            need-canvas="{{false}}"
        />
    </div>
</template>

<script lang="ts">
import {Component} from 'san';
import {gsap} from 'gsap';
import Layer from './BackgroundLayer.san';
import GoldCoin from './Gold.san';
import {eventHub} from '@/static/js/lib/event-emitter';
import {
    TASK_GUIDE_START,
    // TASK_GUIDE_END,
    MAIN_IP_ANIMATION_START,
    MAIN_IP_ANIMATION_PAUSE,
    HEALTH_GUIDE_GOLD_TRIGGER,
    SEND_LOG,
    LOGIN,
    CREATE_NEW_GOLD,
} from '../../common/event-conf';
import ua from '@searchfe/user-agent';
import { completeTask } from '../../common/api';
import Heart from '../Heart.san';
import {TaskExecution} from '@/static/js/lib/task-execution.ts';

let maskTimer;
export default class AnimationPlayer extends Component {
    static components = {
        'c-layer': Layer,
        'c-gold-coin': GoldCoin,
        'c-heart': Heart,
    };

    initData() {
        return {
            distanceBackgroundList: [],
            middleBackgroundList: [],
            frontBackgroundList: [],
            billboardPositionList: [
                {
                    top: 1067,
                    left: 1760,
                },
                {
                    top: 1130,
                    left: 5000,
                },
                {
                    top: 1130,
                    left: 7640,
                },
                {
                    top: 1043,
                    left: 9403,
                },
                {
                    top: 1083,
                    left: 13627,
                }
            ],
            pokeTasks: [],
            viewConfig: {},
            height: 2688 / 1242 * 100,
            distanceHeight: 1690 / 1242 * 100,
            frontHeight: 1252 / 1242 * 100,
            gsapMainBus: '',
            masterTimeline: '',
            explore: {
                taskId: '',
                status: '',
                nextTaskTime: 2,
                taskType: '',
                totalTime: ''
            },
            goldIndex: 0,
            isGuidePlaying: false,
            mainIpActData: {},
            isAndroid: ua.isAndroid(),
            // 当前主页面任务列表所处的状态
            step: '',
            isLoaded: false,
        };
    }
    created() {
        gsap.config({ units: { x: 'vw', y: 'vw'}});
        const masterTimeLine = gsap.timeline();
        this.data.set('masterTimeLine', masterTimeLine);
        this.eventInit();
    }
    async attached() {
        this.initMainIp();
        // const {distanceBackgroundList, middleBackgroundList, frontBackgroundList} = this.data.get();

        this.createGoldIcon({ isGuidePlaying: false });
        // await Promise.all(allImg.map(url => this.loadImage(url)));
        // requestAnimationFrame(() => {
        //     this.data.set('isLoaded', true);
        // });
        maskTimer = setTimeout(() => {
            this.data.set('isLoaded', true);
        }, 900);
    }
    loadImage(url) {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = url;
      });
    }
    eventInit() {
        eventHub.$on(TASK_GUIDE_START, () => {
            this.data.set('isGuidePlaying', true);
            this.createGoldIcon({ isGuidePlaying: true });
        });
        // eventHub.$on(TASK_GUIDE_END, () => {
        //     this.data.set('isGuidePlaying', false);
        // });
        eventHub.$on(CREATE_NEW_GOLD, () => {
            this.createGoldIcon({ isGuidePlaying: false, isPause: false });
        });
        eventHub.$on('goldCollisions', async () => {
            const isGuidePlaying = this.data.get('isGuidePlaying');
            const {taskId, taskType} = this.data.get('explore');
            const isLogin = this.data.get('isLogin');
            if (isGuidePlaying) {
                this.data.set('isGuidePlaying', false);
                eventHub.$emit(HEALTH_GUIDE_GOLD_TRIGGER);
                return;
            }
            if (!isLogin) {
                eventHub.$emit(LOGIN);
                this.createGoldIcon({ isGuidePlaying: false, isPause: true });
                return;
            }
            try {
                const params = {
                    taskid: taskId,
                    customType: taskType,
                };
                const {data} = await completeTask(params);
                if (!data.dispdetail?.prizedata) {
                    this.createGoldIcon({ isGuidePlaying: false, isPause: false });
                    return;
                }
                const step = this.data.get('step');
                // 防止0状态下碰撞了金币，但是因为接口请求时间内滑到了1，在1的状态下生成了金币
                if (step === 0) {
                    this.createGoldIcon({ isGuidePlaying: false, isPause: true });
                }
                this.fire('task', data);
            } catch (err) {
                this.createGoldIcon({ isGuidePlaying: false, isPause: false });
            }
        });
        eventHub.$on(MAIN_IP_ANIMATION_START, () => {
            const masterTimeLine = this.data.get('masterTimeLine');
            masterTimeLine.play();
        });
        eventHub.$on(MAIN_IP_ANIMATION_PAUSE, () => {
            const masterTimeLine = this.data.get('masterTimeLine');
            masterTimeLine.pause();
        });
    }
    createGoldIcon({ isGuidePlaying = false, isPause = false }) {
        const totalTime = this.data.get('explore.totalTime');
        if (totalTime <= 0) {
            return;
        };
        const step = this.data.get('step');
        const duration = isGuidePlaying ? 2.3 : totalTime * 1.3;
        // 中层背景移动速度，金币速度要保持跟这个一致
        const layerSpeed = (15000 / 12.42 / 70);
        // 主IP最右侧的定位，减去金币自己的宽度200， 能保证主IP和金币碰撞
        const initX = (80 + 694 - 200) / 12.42;
        // x * 1.2 duration * 1.3 是因为保险起见要保证金币碰撞的时候，晚于服务端下发的最大时间间隔
        const x = -layerSpeed * totalTime * 1.2;
        // 金币的初始定位需要加上initX
        const left = layerSpeed * totalTime + initX;
        const gold = new GoldCoin({
            data: {
                masterTimeLine: this.data.get('masterTimeLine'),
                index: this.data.get('goldIndex'),
                duration,
                zIndex: isGuidePlaying ? 100 : step !== 2 ? 4 : 11,
                // 心情值引导生成的金币不需要退场动画，也不需要抛出常规碰撞事件
                doNotNeedEmitCollision: isGuidePlaying,
                top: step !== 2 ? (1458 / 12.42) : (1950 / 12.42),
                // x: step !== 2 ? -55 : -75,
                x: step !== 2 ? x : -75,
                left: step !== 2 && !isGuidePlaying ? left : 100,
                // left: 100,
                size: step !== 2 ? (200 / 12.42) : (151 / 12.42),
                isPause,
            }
        });
        this.data.set('goldIndex', this.data.get('goldIndex') + 1);
        gold?.attach(this.el);
    }
    initMainIp() {
        const cols = 5;
        const rows = 4;
        const frameWidth = 694;
        const frameHeight = 694;
        const totalFrames = cols * rows;
        const masterTimeLine = this.data.get('masterTimeLine');
        const tl = gsap.timeline({ repeat: -1 });

        for (let i = 0; i < totalFrames; i++) {
            const x = -((i % cols) * frameWidth) / 1242 * 100;
            const y = -(Math.floor(i / cols) * frameHeight) / 1242 * 100;
            tl.to('#mainIp', {
                backgroundPosition: ${x}vw ${y}vw,
                duration: 0.05,
                ease: 'steps(1)'
            });
        }
        masterTimeLine.add(tl, 0);
    }
    clickIp(e) {
        eventHub.$emit(SEND_LOG, {
            type: 'click',
            ext: {
                action_name: 'gk2025_ip_click',
            }
        });
        const {hahaTask, mainIpAgentTask, mainIpActData} = this.data.get();
        let task = mainIpAgentTask;
        // 有哄哄任务时，50%概率哄哄任务
        if (hahaTask?.taskshow?.taskid) {
            task = Math.random() > 0.5 ? (hahaTask || mainIpAgentTask) : mainIpAgentTask;
        }
        const taskId = task?.taskshow?.taskid || mainIpActData?.agentTaskId;
        if (!taskId) {
            return;
        }
        TaskExecution.getInstance().register({
            taskId,
            taskType: 'agent_task',
            rest: {
                query: task?.taskshow?.customconfig?.agentQuery || '',
                source: 'mainIp'
            }
        });
    }
    playAll() {
        const masterTimeLine = this.data.get('masterTimeLine');
        masterTimeLine.play();
        this.data.set('isPlaying', true);
    }

    pauseAll() {
        const masterTimeLine = this.data.get('masterTimeLine');
        masterTimeLine.pause();
        this.data.set('isPlaying', false);
    }
    detached() {
        clearTimeout(maskTimer);
    }
}
</script>

<style lang="less" module>
.player-layer {
    // position: relative;
    z-index: 0;
    width: 100%;
    // height: 2688px;
    .ip-heart-container {
        position: absolute;
        left: 324px;
        top: 960px;
        // width: 131px;
        // height: 131px;
        transform: scale(0.57);
        z-index: 20;
        pointer-events: none;
        &.ip-heart-container-status-1 {
            left: 12px;
            top: 1150px;
        }
        &.ip-heart-container-status-2 {
            left: 12px;
            top: 1900px;
        }
    }
    .billboard {
        position: fixed;
        min-width: 335px;
        height: 152px;
        color: #7E280A;
        font-size: 39px;
        font-weight: 500;
        white-space: nowrap;
        background-size: 100% 100%;
        padding-top: 10px;
        background-image: url('https://gips3.baidu.com/it/u=2831276087,2542225135&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f341_156');
    }
    .mask {
        position: absolute;
        top: 0px;
        width: 1242px;
        height: 2688px;
        z-index: 3;
        &.page-status-2 {
            z-index: 10;
        }
        // background-color: #F9A638;
    }
    .mainIp {
        position: absolute;
        top: 1081px;
        left: 80px;
        width: 694px;
        height: 694px;
        background-repeat: no-repeat;
        background-size: 3470px 2776px;
        background-position: 0px 0px;
        pointer-events: none;
        z-index: 4;
        .hot-click {
            position: absolute;
            top: 0px;
            left: 115px;
            width: 70%;
            height: 100%;
            pointer-events: auto;
        }
        &.is-guide-playing {
            z-index: 100;
        }
        &.page-status-2 {
            position: absolute;
            top: 1590px;
            transform: scale(0.505);
            left: -50px;
            z-index: 11;
            // background-color: #F9A638;
        }
    }
    .shadow {
        position: fixed;
        top: 1735px;
        left: 318px;
        width: 213px;
        height: 36px;
        background-image: url('https://gips3.baidu.com/it/u=293681939,1294413805&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f213_36');
        background-size: 100% 100%;
        z-index: 3;
    }
}
</style>



实现
这个雪碧图帧动画的实现有几个很值得学习的地方：
1. GSAP时间轴统一管理动画
created() {
    gsap.config({ units: { x: 'vw', y: 'vw'}});
    const masterTimeLine = gsap.timeline();
    //创建一个“总时间轴”（Master Timeline），统一管理多个子动画，支持顺序/并行动画、标签、整体控制。
    this.data.set('masterTimeLine', masterTimeLine);
}
学习点：
- 使用主时间轴（masterTimeLine）统一管理所有动画
- 全局配置单位为vw，实现响应式适配
- 集中控制播放/暂停状态
2. 数学计算实现雪碧图帧切换
initMainIp() {
    const cols = 5;
    const rows = 4;
    const frameWidth = 694;
    const frameHeight = 694;
    const totalFrames = cols * rows;
    for (let i = 0; i < totalFrames; i++) {
        const x = -((i % cols) * frameWidth) / 1242 * 100;
        const y = -(Math.floor(i / cols) * frameHeight) / 1242 * 100;
        tl.to('#mainIp', {                   //tl 应该是 GSAP 的 timeline 实例
            backgroundPosition: ${x}vw ${y}vw,
            duration: 0.05,
            ease: 'steps(1)'
        });
    }
}

const cols = 5; // 雪碧图每行有5帧（列数）
const rows = 4; // 雪碧图有4行（行数）
const frameWidth = 694; // 每帧的宽度（单位：px）
const frameHeight = 694; // 每帧的高度（单位：px）
const totalFrames = cols * rows; // 总帧数（20帧）

for (let i = 0; i < totalFrames; i++) {
    const x = -((i % cols) * frameWidth); // 当前帧在雪碧图中的横向偏移
    const y = -(Math.floor(i / cols) * frameHeight); // 当前帧在雪碧图中的纵向偏移
    tl.to('#mainIp', {
        backgroundPosition: `${x}px ${y}px`, // 设置雪碧图偏移，实现帧动画
        duration: 0.05, // 每帧动画持续时间（秒）
        ease: 'steps(1)' // 动画补间方式，steps(1)表示每帧直接跳变，没有平滑过渡
    });
}
学习点：
- 二维数组映射：i % cols 计算列位置，Math.floor(i / cols) 计算行位置
- 坐标系转换：将像素坐标转换为vw单位的负值偏移
- 逐帧动画：使用 steps(1) 实现无过渡的帧切换
- 响应式适配：除以1242转换为相对单位
3. CSS background-position精确控制
.mainIp {
    background-repeat: no-repeat;
    background-size: 3470px 2776px;  /* 雪碧图总尺寸 /
    background-position: 0px 0px;    / 初始位置 */
}

backgroundPosition: ${x}vw ${y}vw

学习点：
- 固定雪碧图大小，通过position控制显示区域
- 动态修改backgroundPosition实现帧切换
- 负值偏移显示不同帧内容
4. 性能优化策略
tl.to('#mainIp', {
    duration: 0.05,  // 20fps播放
    ease: 'steps(1)' // 避免插值计算
});

学习点：
- 帧率控制：0.05秒/帧 = 20fps，平衡流畅度和性能
- 阶跃函数：steps(1)避免CSS动画插值，确保帧的清晰切换
（steps(1) 含义：整个时长内进度保持不变，到最后一刻一次性跳到终值（默认等同 steps(1, 'end')）。因此不存在中间值，自然“避免插值计算”与中间状态渲染。）
- 单一属性动画：只改变background-position，避免重排重绘
5.动画生命周期管理
// 全局统一控制
eventHub.$on(MAIN_IP_ANIMATION_START, () => {
    const masterTimeLine = this.data.get('masterTimeLine');
    masterTimeLine.play();
});
eventHub.$on(MAIN_IP_ANIMATION_PAUSE, () => {
    const masterTimeLine = this.data.get('masterTimeLine');
    masterTimeLine.pause();
});
学习点：
- 事件驱动的动画控制
- 统一的播放/暂停接口
- 避免多个动画状态不同步
6. 状态驱动的动画参数
createGoldIcon({ isGuidePlaying = false, isPause = false }) {
    const duration = isGuidePlaying ? 2.3 : totalTime * 1.3;
    const zIndex = isGuidePlaying ? 100 : step !== 2 ? 4 : 11;
    const top = step !== 2 ? (1458 / 12.42) : (1950 / 12.42);
}
学习点：
- 根据不同状态动态调整动画参数
- 引导模式与正常模式的差异化处理
- 状态机思维应用到动画控制
7. 响应式单位计算
// 将设计稿像素值转换为vw
const x = -((i % cols) * frameWidth) / 1242 * 100;

学习点：
- 以设计稿宽度1242为基准
- 所有尺寸统一转换为vw单位
- 确保在不同设备上的一致显示
这种实现方式特别适合角色动画、loading动画等需要逐帧播放的场景，核心优势是性能高、控制精确、响应式友好



4.果园浇水动效
暂时无法在飞书文档外展示此内容

[图片]


代码
<template>
    <div
        data-no-na-dialog="true"
        class="{{$style['container']}}"
    >
        <!-- 主IP渲染区域 -->
        <div
            class="{{$style['ip-page-wrap']}}"
        >
            <c-pag
                s-ref="pag"
                dpi="{{dpi}}"
                autoplay="{{false}}"
                loop="{{false}}"
            />
            <!-- 主IP浇水动画. 无循环apng必须通过这种方式播放, 否则只能播放一次  -->
            <img
                s-show="{{showWAteringApng}}"
                src="{{showWAteringApng ? bloburl : ''}}"/>
        </div>
        <!-- IP 静态图区域 -->
        <img
            s-show="{{showIpStaticImage}}"
            class="{{[
                $style['ip-image']
            ]}}"
            src="{{treeAnimation.imgs[curLevel]}}">
        <!-- IP点击热区 -->
        <!-- <div class="{{$style['click-hot-area']}}" on-click="clickIpHandler"></div> -->
        <!-- 树洞点击热区 -->
        <div
            s-if="{{curLevel >= 4}}"
            class="{{$style['click-threecave-area']}}"
            on-click="clickTreeCaveHandler">
        </div>
        <!-- 树洞引导气泡 -->
        <div
            class="
                {{$style['treecave-guide-bubble']}}
                {{showTreeCaveGuide && curLevel >= 4 && !weather.plot ? $style['show'] : ''}}
            ">
            <img
                class="{{$style['icon']}}"
                src="https://psstatic.cdn.bcebos.com/operation/2025_ncee/dog2_1749481096000.gif">
            <div class="{{$style['text']}}">
                解锁专属树洞！快来聊聊你的小秘密吧～
            </div>
        </div>
        <slot
            s-if="{{!!weather.plot}}"
            name="content"
        ></slot>
    </div>
</template>

<script lang="ts">
import {Component} from 'san';
import {
    MUSIC_LIST,
    WATERING_APNG
} from '../common/constant';
import {WATER_PLAY_ANIMATION,
    PLAY_MUSIC,
    PAGE_SHOW,
    PAGE_HIDE,
    WATER_PLAY_ANIMATION_ERROR,
    SEND_EXCEPT_LOG
} from '../common/event-conf';
import Pag from '@/static/common/components/Pag/index.san';
import {eventHub} from '@/static/js/lib/event-emitter';
import {debounce} from '@/static/js/lib/decorator.ts';
import {getAgentQuery} from '../common/api.ts';
import PlotCountDown from './PlotCountDown.san';
import {TaskExecution} from '@/static/js/lib/task-execution.ts';
import { Timer as TreeCaveGuideTimer, getRandomItem} from '../common/util.ts';
import {AssetsManager} from '@/static/common/components/Pag/assets-manager';
import { AsyncQueue } from '@/static/js/lib/async-queue.ts';

interface IWaterPlayParams {
    end: Function;      // 结束浇水回调
    start: Function;    // 开始浇水回调
}

export default class PlotWrap extends Component {

    static playNextLevelAnimation: boolean = false;
    static curPlayPagFile: any = null;
    static pagQueue: AsyncQueue = new AsyncQueue();
    static treeCaveGuideTimer: TreeCaveGuideTimer | null = null;

    static components = {
        'c-pag': Pag,
        'c-treecave-guide': PlotCountDown
    };

    static computed = {
        treeAnimation() {
            let config: any[] = this.data.get('level.treeConfigInfo');
            // 排序
            config = config.sort((a, b) => {
                return +a.level - b.level;
            });

            let treeGrow: string[] = [];
            let treeActive: string[] = [];
            let imgs: string[] = [];
            config.forEach((item, index) => {
                // 树生长动画
                treeGrow.push(item.treeImage)
                // 树浇水时反馈动画
                treeActive.push(item.treeAnimation);
                // 树每个阶段兜底图
                imgs.push(item.treeAnimationBak);
            });
            return {
                treeGrow,
                treeActive,
                imgs
            };
        }
    }
    initData() {
        return {
            pagReady: false,
            showIpStaticImage: true,
            curLevel: 0,
            level: {},
            dpi: window.devicePixelRatio, // Math.max(window.devicePixelRatio * 0.5, 1)
            weather: {},
            querys: {
                description: '',
                question_list: []
            },
            showTreeCaveGuide: false,
            agentTaskId: '',
            showWAteringApng: false,
            bloburl: '',
            isLowPower: false
        };
    }

    async attached() {

        // 浇水apng动画文件转bloburl缓存
        this.preLoadDataToBlobUrl(WATERING_APNG)
        .then((url) => {
            this.data.set('bloburl', url);
        });
        this.initTreeCaveGuideBubble();

        eventHub.$on(WATER_PLAY_ANIMATION, this.playAnimationWatering);

        let isPause: boolean = false;
        eventHub.$on(PAGE_SHOW, () => {
            if (isPause) {
                this.treeCaveGuideTimer?.start();
                isPause = false;
            }
        })

        eventHub.$on(PAGE_HIDE, () => {
            if (this.treeCaveGuideTimer?.isActive()) {
                isPause = true;
                this.treeCaveGuideTimer?.stop();
            };
        })

        // 将需要预加载的 pag url 写入到localStorage
        this.preWriteUrlToLocalStorage(2);
        this.watch('curLevel', (_, arg) => {
            this.preWriteUrlToLocalStorage(2);
            if (!this.data.get('isLowPower')) {
                PlotWrap.pagQueue.push(async () => {
                    await this.playAnimationTree('treeGrow', arg.oldValue);
                });
            };
        });
    }

    detached() {
        eventHub.$off(WATER_PLAY_ANIMATION, this.playAnimationWatering);
        //eventHub.$off(GUIDE_BUBBLE, this.showTreeCaveGuideBubble);
        this.treeCaveGuideTimer?.stop();
    }

    preWriteUrlToLocalStorage(preWriteNum: number = 0) {
        const curLevel = this.data.get('curLevel');
        const threeWateringAnimation = this.data.get('treeAnimation').treeActive;
        const growUpAnimation = this.data.get('treeAnimation').treeGrow;

        // let __preLoadPagUrl: any[] = [];
        // for (let i = curLevel, l = curLevel + preWriteNum; i <= l; i++) {
        //     threeWateringAnimation[i] && __preLoadPagUrl.push(threeWateringAnimation[i]);
        //     growUpAnimation[i] && __preLoadPagUrl.push(growUpAnimation[i]);
        // };

        // 预加载当前等级的动画文件
        threeWateringAnimation[curLevel] && AssetsManager.getInstance().load(threeWateringAnimation[curLevel]);
        growUpAnimation[curLevel] && AssetsManager.getInstance().load(growUpAnimation[curLevel]);
        //window.localStorage.setItem('__preLoadMainIpPagUrls', JSON.stringify(__preLoadPagUrl));
    }

    /**
     * 播放浇水动画
     * 浇水动画 = 水壶飞起浇水动画 + 树激活动画
     */
    playAnimationWatering = async (params: any) => {
        PlotWrap.pagQueue.setProcessing(false);
        PlotWrap.pagQueue.clear();
        try {
            const curLevel = this.data.get('curLevel');
            // 播放音效
            eventHub.$emit(PLAY_MUSIC, {
                musicId: 'watering',
                src: MUSIC_LIST.watering,
                volume: 0.2,
                loop: false,
            });
            // 播放水壶起飞浇水动效
            this.playAnimationKettle(params);
            // 低电量不播放pag相关动效
            if (!this.data.get('isLowPower')) {
                PlotWrap.pagQueue.push(async () => {
                    await this.playAnimationTree('treeActive', curLevel);
                });
            };
        } catch (error) {
            this.data.set('showIpStaticImage', true);
            eventHub.$emit(WATER_PLAY_ANIMATION_ERROR);
            // 上报错误
            eventHub.$emit(SEND_EXCEPT_LOG, {
                info: {
                    msg: '主IP浇水/成长动效播放失败'
                }
            });
        }
    }

    /**
     * 播放树动画（激活动画/成长动画）
     */
    async playAnimationTree(type: 'treeActive' | 'treeGrow', level: number) {
        const pagRef = this.ref<any>('pag');
        const url = this.data.get('treeAnimation')[type][level];
        this.clearPagView(false);
        try {
            const pags = await pagRef.addPagFile([{
                    path: url,
                    pos: {
                        x: 0,
                        y: 0
                    }
            }], false);
            let finished = new Promise((resolve) => {
                pags[0].once('finished', () => {
                    let isClear = PlotWrap.pagQueue.size() === 0;
                    //isClear && this.data.set('showIpStaticImage', true);
                    isClear && this.nextTick(() => {
                        this.clearPagView(false);
                        resolve(true);
                    });
                    !isClear && resolve(true);
                });
            });
            await pagRef.play(0);
            this.data.set('showIpStaticImage', false);
            await finished;
        } catch (error) {
            this.clearPagView(true);
            this.data.set('isLowPower', true);
            this.data.set('showIpStaticImage', true);
            return Promise.reject();
        };
    }

    /**
     * 播放水壶飞起浇水动效
     */
    playAnimationKettle(params: IWaterPlayParams): Promise<boolean> {
        this.data.set("showWAteringApng", true);
        this.nextTick(()=>{params.start()});
        return new Promise((resolve) => {
            setTimeout(() => {
                params.end();
                this.nextTick(() => {
                    this.data.set("showWAteringApng", false);
                });
                resolve(true);
            }, 3000);
        });
    }

    clearPagView(isFlush: boolean) {
        const pagRef = this.ref<any>('pag');
        pagRef?.pause();
        pagRef?.getPagManager().removeActionAll();
        isFlush && pagRef?.flush(0);
    }

    @debounce({
        delay: 500
    })
    clickTreeCaveHandler() {
        let agentId = this.data.get('agentTaskId');
        let list = this.data.get('querys.question_list');
        if (agentId && list.length > 0) {
            TaskExecution.getInstance().register({
                taskId: agentId,
                taskType: 'agent_task',
                rest: {
                    query: getRandomItem(list),
                    source: 'toolTip'
                }
            })
        }
    }

    initTreeCaveGuideBubble(type?: number) {
        getAgentQuery()
        .then((res) => {
            this.data.set('querys', res.data);
            this.data.set('showTreeCaveGuide', true);

            this.treeCaveGuideTimer = new TreeCaveGuideTimer(() => {
                this.data.apply('showTreeCaveGuide', (v) => {
                    return !v;
                })
            }, 10000);

            this.treeCaveGuideTimer?.start();
        });
    }

    async preLoadDataToBlobUrl(path: string, type: string = 'image/png') {
        try {
            let buffer = await AssetsManager.getInstance().load(path)
            if (!buffer) {
                let res = await fetch(path);
                buffer = await res.arrayBuffer();            };
            let blob = new Blob([buffer], {type});
            let url = URL.createObjectURL(blob);
            return url;
        } catch {
            return '';
        }
    }
}
</script>
<style lang="less" module>
@import '../mixin.less';
.container {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 10;
    height: 2688px;
    width: 1242px;
}
.click-hot-area {
    position: absolute;
    width: 594px;
    height: 777px;
    top: 748px;
    left: 326px;
    //background-color: red;
    z-index: 2;
}
.click-threecave-area {
    position: absolute;
    width: 200px;
    height: 278px;
    top: 1247px;
    left: 523px;
    //background-color: red;
    z-index: 3;
}
.ip-click {
    animation: hotClick 1.2s 0s linear;
    transform-origin: 50% 1600px;
}
.ip-page-wrap {
    width: 1242px;
    height: 1750px;
    background-size: 100% 100%;
    position: absolute;
    left: 0;
    top: 480px;
    z-index: 1;
    img {
        position: absolute;
        left: 0;
        top: -480px;
        width: 1242px;
        height: 2688px;
        //background-image: url('https://psstatic.cdn.bcebos.com/operation/2025_ncee/00000_iSpt-on-repeat_1751629554000.png');
        background-size: 100% 100%;
    }
}

.ip-image {
    width: 1242px;
    height: 1242px;
    background-size: 100% 100%;
    position: absolute;
    left: 0;
    top: 480px;
    z-index: 0;
}
.treecave-guide-bubble {
    position: absolute;
    width: 525px;
    height: 159px;
    top: 1163px;
    left: 378px;
    background-image: url(https://gips1.baidu.com/it/u=3904985493,2553562763&fm=3028&app=3028&f=PNG&fmt=auto&q=75&size=f528_159);
    background-size: 100% 100%;
    z-index: 20;
    transform: scale(0);
    .icon {
        position: absolute;
        width: 174px;
        height: 195px;
        top: -36px;
        left: -64px;
    }
    &.show {
        animation: bubbleShowAnimation 0.5s linear forwards;
    }

    &.hide {
         animation: bubbleHideAnimation 0.5s linear forwards;
    }

    .text {
        .hold-text-in-large-font(42px, 140%);
        padding-left: 91px;
        padding-top: 15px;
        font-family: PingFang SC;
        font-weight: 500;
        letter-spacing: -2.5%;
        color: #007EFF;
        width: 414px;
        height: 110px;
        text-align: left;
    }
}
@keyframes hotClick {
    0% {
        transform: scale(1, 1);
    }
    23% {
        transform: scale(1, 1.05);
    }
    53% {
        transform: scale(1, 1.25);
    }
    80% {
        transform: scale(1, 0.975);
    }
    100% {
         transform: scale(1, 1.0);
    }
}
.afx {
    background-color: red;
    width: 100%;
    height: 100%;
}
</style>

实现
这个主IP浇水动效的实现有很多值得学习的地方：
1. 异步队列控制复合动画执行顺序
PlotWrap.pagQueue.push(async () => {
    await this.playAnimationTree('treeActive', curLevel);
});
学习点：
- 使用AsyncQueue确保动画按顺序执行
- 避免多个动画同时播放造成的冲突
- 提供暂停/恢复机制控制动画流程
2. 多种动画格式的组合应用
// PAG动画 (树的激活/成长)
//PAG：初始化播放器→加载 .pag → 播放→常返回 Promise/事件回调，因此常用 await this.playAnimationTree(...)
await this.playAnimationTree('treeActive', curLevel);

// APNG动画 (浇水水壶飞起)         
//直接 <img>（最简单，自动播放，无法精准控制） <img src="kettle.apng" alt="kettle" />

this.playAnimationKettle(params);

学习点：
- PAG动画：适合复杂场景动画，支持矢量+位图
- APNG动画：适合简单循环动画，文件小
- 根据不同需求选择最适合的动画格式
3. Blob URL优化APNG加载
// 预加载APNG转blob缓存
this.preLoadDataToBlobUrl(WATERING_APNG)
.then((url) => {
    this.data.set('bloburl', url);
});

async preLoadDataToBlobUrl(path: string, type: string = 'image/png') {
    let buffer = await AssetsManager.getInstance().load(path)
    let blob = new Blob([buffer], {type});
    let url = URL.createObjectURL(blob);
    return url;
}

学习点：
- 预加载动画文件到内存
- 使用Blob URL避免网络请求延迟
- 特别适合无循环APNG的重复播放
4. 分层动画架构设计
playAnimationWatering = async (params: any) => {
    // 1. 播放音效
    eventHub.$emit(PLAY_MUSIC, {musicId: 'watering'});
    // 2. 播放水壶动效 (前景层)
    this.playAnimationKettle(params);
    // 3. 播放树激活动效 (背景层)
    await this.playAnimationTree('treeActive', curLevel);
}
学习点：
- 音频层：音效反馈
- 前景层：水壶飞起APNG
- 背景层：树激活PAG动画
- 分层管理，互不干扰
5. 性能优化策略
// 低电量模式跳过复杂动画
if (!this.data.get('isLowPower')) {
    PlotWrap.pagQueue.push(async () => {
        await this.playAnimationTree('treeActive', curLevel);
    });
};
// 预加载动画资源
AssetsManager.getInstance().load(threeWateringAnimation[curLevel]);
AssetsManager.getInstance().load(growUpAnimation[curLevel]);

学习点：
- 检测设备状态，低电量时简化动画
- 预加载下一级动画资源
- 资源管理器统一管理动画文件
6. PAG动画生命周期管理
async playAnimationTree(type: 'treeActive' | 'treeGrow', level: number) {
    this.clearPagView(false); // 清理之前的动画
    const pags = await pagRef.addPagFile([{path: url, pos: {x: 0, y: 0}}]);
    let finished = new Promise((resolve) => {
        pags[0].once('finished', () => {
            this.clearPagView(false);
            resolve(true);
        });
    });
    await pagRef.play(0);
    await finished;
}

学习点：
- 播放前清理之前的PAG实例
- 使用Promise包装动画完成事件
- 动画结束后及时清理资源
7. 容错和降级处理
try {
    // 尝试播放PAG动画
    await this.playAnimationTree('treeActive', curLevel);
} catch (error) {
    // 降级到静态图
    this.data.set('showIpStaticImage', true);
    this.data.set('isLowPower', true);
    eventHub.$emit(WATER_PLAY_ANIMATION_ERROR);
}
学习点：
- 动画加载失败时降级到静态图
- 标记低电量模式，后续跳过复杂动画
- 错误上报，便于问题追踪
8. 时序控制精确匹配
playAnimationKettle(params: IWaterPlayParams): Promise<boolean> {
    this.data.set("showWAteringApng", true);
    this.nextTick(() => {params.start()}); // DOM更新后回调
    return new Promise((resolve) => {
        setTimeout(() => {
            params.end();
            this.data.set("showWAteringApng", false);
            resolve(true);
        }, 3000); // 精确控制3秒播放时长
    });
}

学习点：
- 使用nextTick确保DOM更新完成
- 精确控制动画时长
- 回调机制通知动画状态
这种多层次、多格式的动画组合方案特别适合游戏化交互、复杂场景动效等需求，核心是分层管理、异步控制、性能优化的结合。


5.afx展示
暂时无法在飞书文档外展示此内容
[图片]


写一个afx组件