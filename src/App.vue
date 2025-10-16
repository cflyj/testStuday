<template>
  <div id="app">
    
    <div
      class="component-section"
      v-if="true"
    >
      <h2>🎬 弹幕组件</h2>
      <TestOne />
    </div>
    
    <div
      class="component-section"
      v-if="true"
    >
      <h2>📊 进度条组件</h2>
      <TestTwo />
    </div>

    <div
      class="component-section"
      v-if="true"
    >
      <ListPagerDemo />
    </div>
  </div>
</template>

<script>
import TestOne from './components/TestOne.vue'
import TestTwo from './components/testTwo.vue'
import ListPagerDemo from './components/ListPagerDemo.vue'

export default {
  name: 'App',
  components: {
    TestOne,
    TestTwo,
    ListPagerDemo
  },
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin: 0;
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.component-section {
  background: white;
  border-radius: 12px;
  padding: 30px;
  margin: 30px auto;
  max-width: 1000px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.component-section h2 {
  margin-top: 0;
  color: #333;
  font-size: 24px;
  margin-bottom: 20px;
  text-align: center;
}

h1 {
  text-align: center;
  color: #333;
  font-size: 32px;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
