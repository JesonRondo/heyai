<template>
  <div>
    <transition name="fade">
      <div class="tip" v-if="show">
        <span>{{message}}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.tip {
  background-color: #fff;
  box-shadow: 0 0 15px rgba(0, 0, 0, .3);
  position: absolute;
  right: 30px;
  transform: translate(100%, -50%);
  top: 50%;
  z-index: 1;
  padding: 10px 20px;
  color: #666;
  font-size: 14px;
  border-radius: 5px;
}
.tip:after {
  content: '';
  width: 12px;
  height: 12px;
  background-color: #fff;
  position: absolute;
  left: 0;
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}
.fade-enter-active, .fade-leave-active {
  transition: opacity .3s, transform .3s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
  transform: translate(90%, -50%);
}
</style>

<script>
export default {
  props: {
    message: String,
    show: Boolean
  }
}
</script>
