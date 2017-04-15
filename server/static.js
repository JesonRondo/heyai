const path = require('path')
const exec = require('child_process').exec

module.exports = {
  init: function () {
    exec(`SERVE_USER=hey SERVE_PASSWORD=zhimakaimen ${path.join(process.cwd(), 'node_modules/.bin/serve')} --auth --port 7771`, {
      cwd: path.join(process.cwd(), 'static'),
      stdio: [0, 1, 2, 3]
    })
    console.log('static server: http://127.0.0.1:7771')
  }
}
