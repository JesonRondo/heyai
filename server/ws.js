var WebSocketServer = require('websocket').server
var fs = require('fs')
var path = require('path')
var https = require('https')
var port = 7773

var connectionList = []

var server = https.createServer({
  key: fs.readFileSync(path.resolve(__dirname, '../configs/cert/214061641330306.key')),
  cert: fs.readFileSync(path.resolve(__dirname, '../configs/cert/214061641330306.pem'))
}, function(request, response) {
  console.log((new Date()) + ' Received request for ' + request.url)
  response.writeHead(404)
  response.end()
})
server.listen(port, function() {
  console.log((new Date()) + ' ws is listening on port ' + port)
})

wsServer = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: true
})

function getID () {
  return 'wsid' + (Math.random() * 10000 >>> 0) + (+new Date)
}

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true
}

function online (connection) {
  console.log((new Date()) + ' Connection accepted.')
  const id = getID()
  connectionList.push({
    id: id,
    connection: connection
  })
  connection.sendUTF(JSON.stringify({
    type: 'connected',
    id: id
  }))
}

function offline (connection) {
  connectionList.forEach((connect, index) => {
    if (connection === connect.connection) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.')
      connectionList.splice(index, 1)
      return false
    }
  })
}

function boardcast (message) {
  if (message.type === 'utf8') {
    // console.log('Received Message: ' + message.utf8Data);
    connectionList.forEach(connect => {
      connect.connection.sendUTF(message.utf8Data)
    })
  }
  else if (message.type === 'binary') {
    // console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
    connectionList.forEach(connect => {
      connect.connection.sendBytes(message.binaryData)
    })
  }
}

function parseMessage (message) {
  if (message.type === 'utf8') {
    const sendData = JSON.parse(message.utf8Data)
    const targetID = sendData.target

    connectionList.forEach(connect => {
      if (connect.id === targetID) {
        connect.connection.sendUTF(message.utf8Data)
        return
      }
    })
  }
}

wsServer.on('connect', function(connection) {
  online(connection)

  connection.on('message', function(message) {
    parseMessage(message)
  })

  connection.on('close', function(reasonCode, description) {
    offline(connection)
  })
})
