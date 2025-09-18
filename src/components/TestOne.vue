<template>
  <div class="danmaku-container">
    <div class="danmaku-track">
      <div 
        v-for="item in visibleDanmaku" 
        :key="item.id"
        class="danmaku-item"
        :style="getDanmakuStyle()"
        @animationend="onAnimationEnd(item.id)"
      >
        {{ item.text }}
      </div>
    </div>
    
    <!-- 控制按钮 -->
    <div class="controls">
      <button @click="startDanmaku" :disabled="isPlaying">开始弹幕</button>
      <button @click="stopDanmaku" :disabled="!isPlaying">停止弹幕</button>
      <button @click="addDanmaku">添加弹幕</button>
    </div>
    
    <!-- 添加自定义弹幕输入框 -->
    <div class="add-danmaku">
      <input 
        v-model="customText" 
        placeholder="输入自定义弹幕内容"
        @keyup.enter="addCustomDanmaku"
      />
      <button @click="addCustomDanmaku">发送</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestOne',
  data() {
    return {
      // 弹幕数据队列
      danmakuQueue: [
        { id: 1, text: '我今天吃早饭了' },
        { id: 2, text: '今天天气真不错' },
        { id: 3, text: '这个弹幕效果很棒' },
        { id: 4, text: 'Vue.js 真好用' },
        { id: 5, text: '前端开发有意思' },
        { id: 6, text: '学习使人进步' },
        { id: 7, text: '坚持就是胜利' }
      ],
      // 当前显示的弹幕
      visibleDanmaku: [],
      // 当前弹幕索引
      currentIndex: 0,
      // 是否正在播放
      isPlaying: false,
      // 定时器
      timer: null,
      // 弹幕间隔时间（毫秒）
      interval: 6000,
      // 自定义弹幕文本
      customText: '',
      // 弹幕ID计数器
      danmakuIdCounter: 8
    }
  },
  methods: {
    // 开始弹幕
    startDanmaku() {
      if (this.isPlaying) return
      
      this.isPlaying = true
      this.showNextDanmaku()
      
      this.timer = setInterval(() => {
        this.showNextDanmaku()
      }, this.interval)
    },
    
    // 停止弹幕
    stopDanmaku() {
      this.isPlaying = false
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.visibleDanmaku = []
      this.currentIndex = 0
    },
    
    // 显示下一条弹幕
    showNextDanmaku() {
      if (this.danmakuQueue.length === 0) return
      
      const danmaku = this.danmakuQueue[this.currentIndex]
      this.visibleDanmaku.push({
        ...danmaku,
        startTime: Date.now()
      })
      
      this.currentIndex = (this.currentIndex + 1) % this.danmakuQueue.length
    },
    
    // 获取弹幕样式
    getDanmakuStyle() {
      return {
        animationDelay: '0s',
        animationDuration: '10s'
      }
    },
    
    // 动画结束处理
    onAnimationEnd(danmakuId) {
      this.visibleDanmaku = this.visibleDanmaku.filter(item => item.id !== danmakuId)
    },
    
    // 添加随机弹幕
    addDanmaku() {
      const randomTexts = [
        '哈哈哈哈',
        '666666',
        '太棒了',
        '加油加油',
        '继续努力',
        '很有趣',
        '学到了'
      ]
      const randomText = randomTexts[Math.floor(Math.random() * randomTexts.length)]
      
      this.danmakuQueue.push({
        id: this.danmakuIdCounter++,
        text: randomText
      })
    },
    
    // 添加自定义弹幕
    addCustomDanmaku() {
      if (this.customText.trim()) {
        this.danmakuQueue.push({
          id: this.danmakuIdCounter++,
          text: this.customText.trim()
        })
        this.customText = ''
      }
    }
  },
  
  beforeUnmount() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  }
}
</script>

<style scoped>
.danmaku-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.danmaku-track {
  position: relative;
  height: 200px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.danmaku-item {
  position: absolute;
  top: 50%;
  right: -100%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  animation: danmaku-move 10s linear forwards;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes danmaku-move {
  0% {
    right: -100%;
    opacity: 1;
  }
  100% {
    right: 100%;
    opacity: 1;
  }
}

.controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.controls button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.controls button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.add-danmaku {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
}

.add-danmaku input {
  padding: 8px 15px;
  border: 2px solid #667eea;
  border-radius: 20px;
  font-size: 14px;
  width: 300px;
  outline: none;
  transition: all 0.3s ease;
}

.add-danmaku input:focus {
  border-color: #764ba2;
  box-shadow: 0 0 10px rgba(102, 126, 234, 0.3);
}

.add-danmaku button {
  background: linear-gradient(45deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-danmaku button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media (max-width: 600px) {
  .danmaku-container {
    padding: 10px;
  }
  
  .danmaku-track {
    height: 150px;
  }
  
  .danmaku-item {
    font-size: 14px;
    padding: 6px 12px;
  }
  
  .controls {
    flex-wrap: wrap;
  }
  
  .add-danmaku {
    flex-direction: column;
  }
  
  .add-danmaku input {
    width: 250px;
  }
}
</style>