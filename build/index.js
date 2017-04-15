const fs = require('fs')
const path = require('path')
const exec = require('child_process').execSync
const appdmg = require('appdmg')

const clientPath = path.resolve(process.cwd(), 'clients/television')
const distPath = path.resolve(clientPath, 'dist')
const dmgConfigPath = path.resolve(process.cwd(), 'build/dmg.json')

const packageJson = JSON.parse(fs.readFileSync(path.resolve(clientPath, 'package.json'), 'utf-8'))

// clean
exec(`rm -fr ${distPath}`)

// build vue
exec('node build/build.js', {
  cwd: clientPath,
  stdio: [0, 1, 2, 3]
})

// copy nw
const nwjsAppPath = path.resolve(distPath, 'nwjs.app')
const appPath = path.resolve(distPath, '禾一的小助手.app')
exec([
  `cp -fr /Applications/nwjs.app ${path.resolve(clientPath, 'dist')}`,
  `mv ${nwjsAppPath} ${appPath}`,
  `rm -r ${appPath}/Contents/Resources`,
  `cp -fr ${clientPath}/Resources ${appPath}/Contents/`,
  `mkdir ${appPath}/Contents/Resources/app.nw`,
  `mv ${distPath}/index.html ${appPath}/Contents/Resources/app.nw/`,
  `mv ${distPath}/static ${appPath}/Contents/Resources/app.nw/`,
  `cp ${clientPath}/package.json ${appPath}/Contents/Resources/app.nw/`,
].join(' && '))

console.log('create dmg start...')

const dmgPath = path.resolve(distPath, `禾一的小助手_v${packageJson.version}.dmg`)

const ee = appdmg({
  source: dmgConfigPath,
  target: dmgPath
})

ee.on('finish', () => {
  exec(`cp ${dmgPath} ${process.cwd()}/static/download/`)
  console.log('create dmg done')
  process.exit(0)
})

ee.on('error', err => {
  console.log(err)
})
