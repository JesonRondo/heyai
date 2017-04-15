<template>
  <div id="app" class="app-drag">
    <traffic-lights></traffic-lights>
    <div class="wrap">
      <dropzone></dropzone>
      <list></list>
    </div>
  </div>
</template>

<script>
import TrafficLights from '@/components/traffic-lights'
import Dropzone from '@/components/dropzone'
import List from '@/components/list'

export default {
  components: {
    Dropzone, List, TrafficLights
  },
  methods: {
  }
}
</script>

<style>
html, body {
  margin: 0;
  height: 100%;
  overflow: hidden;
  user-select: none;
  cursor: default;
}
.wrap {
  display: flex;
  height: 100%;
}
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100%;
  color: #2c3e50;
}
.app-drag {
  -webkit-app-region: drag;
}
</style>
