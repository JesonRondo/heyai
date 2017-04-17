<template>
  <div class="container">
    <div class="zone"
      :class="{
        'enter-bling': isEnterBling,
        'error-bling': isErrorBling,
        'upload-bling': isUploading
      }"
      @dragenter="dragenterHandle"
      @dragleave="draglevelHandle"
      @drop="dropHandle">
      <span class="status">ZIP Drop</span>
      <transition name="fade">
        <div v-if="isUploading" class="uploading"></div>
      </transition>
      <transition name="fade">
        <div v-if="showQR" class="can-bg" @click="cancelQR">
          <canvas ref="can"></canvas>
        </div>
      </transition>
    </div>
    <tip :show="tipShow" :message="tipMessage"></tip>
  </div>
</template>

<style scoped>
  .container {
    position: relative;
    width: 240px;
    padding: 35px 30px 25px;
    box-sizing: border-box;
  }
  .fade-enter-active, .fade-leave-active {
    transition: opacity .5s
  }
  .fade-enter, .fade-leave-to {
    opacity: 0
  }
  .can-bg {
    display: flex;
    justify-content: center;
    align-items: center;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    background-color: #fff;
    cursor: pointer;
  }
  .uploading {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
  }
  .uploading:before {
    content: '';
    width: 25px;
    height: 3px;
    background: #000;
    opacity: 0.1;
    position: absolute;
    top: 57%;
    left: 73%;
    border-radius: 50%;
    animation: shadow .5s linear infinite;
  }
  .uploading:after {
    content: '';
    width: 25px;
    height: 25px;
    background: #9ed7ff;
    animation: animate .5s linear infinite;
    position: absolute;
    top: 36%;
    left: 73%;
    border-radius: 3px;
  }
  @keyframes animate {
    17% {
      border-bottom-right-radius: 2px;
    }
    25% {
      transform: translateY(9px) rotate(22.5deg);
    }
    50% {
      transform: translateY(18px) scale(1, .9) rotate(45deg);
      border-bottom-right-radius: 20px;
    }
    75% {
      transform: translateY(9px) rotate(67.5deg);
    }
    100% {
      transform: translateY(0) rotate(90deg);
    }
  }
  @keyframes shadow {
    0%, 100% {
      transform: scale(1, 1);
    }
    50% {
      transform: scale(1.2, 1);
    }
  }
  .zone {
    position: relative;
    border-radius: 10px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: 3px dashed #ccc;
    background-color: #f6f6f6;
    border-color: #ccc;
    color: #999;
    overflow: hidden;
    transition: background-color .3s;
  }
  .upload-bling {
    background-color: #d9efff;
    color: #fff;
  }
  .enter-bling {
    background-color: #ececec;
  }
  .error-bling {
    background-color: #ff6161;
    border-color: #ffcccc;
    color: #fff;
  }
  .status {
    pointer-events: none;
    position: absolute;
    width: 80%;
    left: 50%;
    top: 50%;
    font-size: 24px;
    transform: translate(-50%, -50%);
    transition: transform .3s, color .3s;
  }
  .upload-bling .status {
    transform: translate(-62%, -50%);
  }
</style>

<script>
import Tip from '@/components/tip'
import Api from '@/api'
import Bus from '@/bus'
import QRCode from 'qrcode'

const fs = window.require('fs')
const path = window.require('path')
const exec = window.require('child_process').execSync
const appPath = nw.App.dataPath

export default {
  components: {
    Tip
  },
  data () {
    return {
      socket: null,
      isEnterBling: false,
      isErrorBling: false,
      isUploading: false,
      tipShow: false,
      showQR: false,
      uploadCache: null,
      tipMessage: '',
      wsid: null
    }
  },
  created () {
    this.wsInit()
  },
  methods: {
    wsInit () {
      let that = this
      if (!this.socket) {
        this.socket = new WebSocket('wss://heyai.me/wss')

        this.socket.addEventListener('message', function (event) {
          let data = JSON.parse(event.data)

          if (data.type === 'connected') {
            that.wsid = data.id
            return
          }

          if (data.type === 'permission_key') {
            // permission done
            that.continueUpload(data.key)
          }
        })

        this.socket.addEventListener('error', function (event) {
          that.showMessage('失去连接，3s后重试 = =')

          // reconnect after 3s
          setTimeout(() => {
            that.socket = new WebSocket('wss://heyai.me/wss') 
          }, 3000)
        })
      }
    },

    cancelQR () {
      this.showQR = false
      this.uploadCache = null
    },

    showMessage (msg) {
      this.tipShow = true
      this.tipMessage = msg

      setTimeout(() => {
        this.tipShow = false
      }, 3000)
    },

    showError (msg) {
      this.isErrorBling = true
      this.showMessage(msg)

      setTimeout(() => {
        this.isErrorBling = false
      }, 200)
    },

    dragenterHandle (e) {
      this.isEnterBling = true
    },

    draglevelHandle (e) {
      this.isEnterBling = false
    },

    permission (list, formData) {
      this.showQR = true
      this.$nextTick(() => {
        const key = 'hyup' + (Math.random() * 10000 >>> 0) + (+new Date)
        const wsid = this.wsid
        QRCode.toCanvas(this.$refs.can, JSON.stringify({
          key: key,
          list: list,
          wsid: wsid
        }), err => {
          if (err) {
            this.showError(err.message)
            this.showQR = false
          } else {
            this.uploadCache = {
              key,
              formData
            }
          }
        })
      })
    },

    continueUpload (key) {
      if (!this.uploadCache || this.uploadCache.key !== key) return
      this.showQR = false
      this.isUploading = true
      fetch(Api['upload'], {
        method: 'POST',
        body: this.uploadCache.formData
      })
      .then(res => res.json())
      .then(res => {
        this.isUploading = false
        this.uploadCache = null
        if (res.ok) {
          Bus.$emit('update:list', res.list)
        } else {
          throw new Error(res.msg)
        }
      })
      .catch(err => {
        this.isUploading = false
        this.showError(err.message)
      })
    },

    dropHandle (e) {
      if (this.showQR) return

      this.isEnterBling = false

      e.preventDefault()
      const fileList = e.dataTransfer.files

      const list = []
      const formData = new FormData()
      for (let i = 0, len = fileList.length; i < len; i++) {
        if (!this.checkFile(fileList[i])) {
          // 只要有一个不满足条件就终止
          return false
        } else {
          list.push(fileList[i].name.replace(/\.zip$/, '').replace(/\.ZIP/, ''))
          formData.append('file', fileList[i])
        }
      }

      this.permission(list, formData)
    },

    checkFile (zip) {
      if (!zip) {
        this.showError('丢了个什么东西...')
        return false
      }

      if (zip.type.indexOf('zip') < 0) {
        this.showError(`${zip.name} 不是ZIP～`)
        return false
      }

      let checkFail = false

      const tmpName = 'television_' + (+new Date) + (Math.random() * 100000 >>> 0)
      
      const originPath = zip.path
      const distPath = path.join(appPath, tmpName)
      const distFolderPath = `${distPath}_unpkg`

      exec([
        `cp '${originPath}' '${distPath}'`,
        `unzip -oq  -d '${distFolderPath}' '${distPath}'`
      ].join(' && '))

      if (!fs.existsSync(path.join(distFolderPath, 'index.html'))) {
        this.showError(`"${zip.name}" 根目录没有index.html`)
        checkFail = true
      }

      exec([
        `cp '${originPath}' '${distPath}'`,
        `unzip -oq  -d '${distFolderPath}' '${distPath}'`,
        `rm -r '${distPath}'`,
        `rm -r '${distFolderPath}'`
      ].join(' && '))

      return !checkFail
    }
  }
}
</script>
