import { createApp } from 'vue'
import App from './App.vue'
import eventHub from '@/eventHub'
import PopupLib from '@/lib/popupLib'
import { createPopupManager } from '@/manager/popupManager'

// 初始化弹窗管理器（一次即可）
createPopupManager(eventHub, PopupLib, { defaultTimeout: 15000 })

createApp(App).mount('#app')
