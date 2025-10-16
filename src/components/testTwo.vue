<template>
    <div class="progress-container">
        <div class="outer-box">
            <div class="inner-box" :style="{ left: (progress / 100 * 700) -700 + 'px' }">

            </div>
        </div>
    </div>
    
    <!-- 控制按钮 -->
    <div class="controls">
        <p>当前进度: {{ progress }}%</p>
        <button @click="setProgress(0)">0%</button>
        <button @click="setProgress(25)">25%</button>
        <button @click="setProgress(50)">50%</button>
        <button @click="setProgress(75)">75%</button>
        <button @click="setProgress(100)">100%</button>
        <button @click="startAnimation">开始动画</button>
        <button @click="stopAnimation">停止动画</button>
    </div>
</template>

<script>
export default {
  name: 'TestTwo',
  data() {
    return {
        // 进度条数据
        progress: 0,
        // 定时器
        timer: null,
        // 进度条最大值
        maxProgress: 100,
        // 进度条更新间隔（毫秒）
        interval: 100
    };
  },
  methods: {
    // 设置进度值
    setProgress(value) {
      this.progress = Math.min(Math.max(value, 0), this.maxProgress);
    },
    
    // 开始进度动画
    startAnimation() {
      // 清除已存在的定时器
      this.stopAnimation();
      
      // 重置进度
      this.progress = 0;
      
      // 启动定时器
      this.timer = setInterval(() => {
        if (this.progress < this.maxProgress) {
          this.progress += 1;
        } else {
          this.stopAnimation();
        }
      }, this.interval);
    },
    
    // 停止进度动画
    stopAnimation() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }
  },
  
  // 组件销毁时清理定时器
  beforeUnmount() {
    this.stopAnimation();
  }
}
</script>

<style scoped>
.progress-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    margin-top: 20px;
}
.outer-box {
    position: relative;
    width: 700px;
    height: 50px;
    border: #183f02 5px solid;
    overflow: hidden;
    background: #183f02;
    border-radius: 35px;
}
.inner-box {
    position: absolute;
    height: 50px;
    width: 700px;
    background: #ff0000;
    border-radius: 25px;
    transition: left 0.3s ease-in-out;
    min-width: 0;
}

.controls {
    text-align: center;
    margin-top: 30px;
}

.controls p {
    font-size: 18px;
    font-weight: bold;
    color: #333;
    margin-bottom: 15px;
}

.controls button {
    background: #007bff;
    color: white;
    border: none;
    padding: 8px 16px;
    margin: 0 5px;
    border-radius: 5px;
    cursor: pointer;
    font-size: 14px;
    transition: background-color 0.3s ease;
}

.controls button:hover {
    background: #0056b3;
}

.controls button:active {
    background: #004085;
}
</style>