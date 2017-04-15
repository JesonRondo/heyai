<template>
  <div class="container">
    <div v-if="fetching" class="empty">有东西嘛</div>
    <div v-else-if="list.length <= 0" class="empty">
      木有东西
    </div>
    <div v-else class="scroller">
      <ul class="list">
        <li v-for="item of list" @click="openHandle(item)">{{ item }}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import Api from '@/api'
import Bus from '@/bus'

export default {
  data () {
    return {
      fetching: true,
      list: []
    }
  },
  created () {
    fetch(Api['list'])
      .then(res => res.json())
      .then(res => {
        if (res.ok) {
          this.fetching = false
          this.list = res.list
        }
      })
      .catch(err => {
        this.fetching = false
      })

    Bus.$on('update:list', list => {
      this.list = list
    })
  },
  methods: {
    openHandle (item) {
      nw.Shell.openExternal(`${Api.static}/${item}/`)
    }
  }
}
</script>

<style scoped>
  .container {
    margin-right: 30px;
    padding: 15px 0 5px 0;
    flex: 1;
    position: relative;
    box-sizing: border-box;
  }
  .empty {
    position: absolute;
    top: 50%;
    left: 50%;
    font-size: 24px;
    color: #999;
    transform: translate(-50%, -50%);
  }
  .scroller {
    width: 100%;
    height: 100%;
    overflow-y: auto;
  }
  .scroller::-webkit-scrollbar {
    display: none;
  }
  .container:before,
  .container:after {
    content: '';
    position: absolute;
    top: 10px;
    left: 0;
    right: 30px;
    height: 20px;
    background-image: -webkit-linear-gradient(90deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
    z-index: 1;
  }
  .wrap:after {
    bottom: 10px;
    top: auto;
    background-image: -webkit-linear-gradient(270deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 1));
  }
  .list {
    padding: 20px 0;
    margin: 0;
    list-style: none;
    min-height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .list li {
    margin-bottom: 10px;
    width: 100%;
    color: #666;
    cursor: pointer;
    box-sizing: border-box;
    padding: 8px 16px;
    text-overflow: ellipsis;
    border: 1px solid #cfcfcf;
    opacity: .6;
    transition: opacity .3s;
  }
  .list li:hover {
    opacity: 1;
  }
  .list li:active {
    color: #fff;
    border-color: #f90;
    box-shadow: 0 0 30px #f60 inset;
    background-color: #f90;
  }
  .list li:last-child {
    margin-bottom: 0;
  }
</style>
