<template>
  <div id="app">
    <h1>Vue 3 弹幕演示</h1>
      <TestOne />
  </div>
</template>

<script>
import TestOne from './components/TestOne.vue'

export default {
  name: 'App',
  components: {
    TestOne
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
