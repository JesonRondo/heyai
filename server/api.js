const Koa = require('koa')
const Router = require('koa-router')
const multiparty = require('multiparty')

const fs = require('fs')
const path = require('path')
const exec = require('child_process').execSync

const app = new Koa()
const router = new Router()

const uploadPath = path.resolve(process.cwd(), 'static/show')

if (!fs.existsSync(uploadPath)) {
  exec(`mkdir ${uploadPath}`)
}

const parseBody = function (req) {
  return new Promise((resolve, reject) => {
    const form = new multiparty.Form()
    form.parse(req, function (err, fields, files) {
      resolve({fields, files})
    })
  })
}

const getFolders = function () {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      fs.readdir(uploadPath, (err, list) => {
        const sortList = []
        list.forEach(li => {
          const st = fs.statSync(path.join(uploadPath, li))
          sortList.push({
            name: li,
            time: +st.atime
          })
        })
        list = sortList
                .sort((a, b) => a.time < b.time)
                .map(item => item.name)
        resolve(list)
      })
    }, 1000)
  })
}

const getMenu = function () {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/menu.json', 'utf-8', function (err, data) {
      if (err) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

router.get('/api/list', async function (ctx, next) {
  let uploadFolders
  await getFolders().then(list => {
    uploadFolders = list
  })

  ctx.body = JSON.stringify({
    ok: true,
    list: uploadFolders,
    msg: 'ok'
  })
})

router.get('/api/eatmenu', async function (ctx, next) {
  let menu = ''
  await getMenu().then(menuStr => {
    menu = menuStr
  }).catch(err => {})

  ctx.body = menu
})

router.post('/api/upload', async function (ctx, next) {
  let body

  await parseBody(ctx.req).then(parsed => {
    body = parsed
  })

  if (!body.files || !body.files.file) {
    ctx.body = JSON.stringify({
      ok: false,
      msg: '没有上传文件！'
    })
  } else {
    const fileList = body.files.file
    fileList.forEach(file => {
      if (file.headers['content-type'].endsWith('zip')) {
        const name = file.originalFilename.replace(/\.zip/, '').replace(/\.ZIP/, '')
        exec(`unzip -oq  -d '${path.resolve(uploadPath, name)}' '${file.path}'`)
      }
    })

    let uploadFolders
    await getFolders().then(list => {
      uploadFolders = list
    })

    ctx.body = JSON.stringify({
      ok: true,
      list: uploadFolders,
      msg: '上传成功！'
    })
  }
})

app
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(7772)
console.log('api server: http://127.0.0.1:7772')
