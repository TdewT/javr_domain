const express = require('express');
const socketIO = require('socket.io');
const tcpPortUsed = require('tcp-port-used')

const app = express()

app.use(express.static('public'))


const server = app.listen(80, () => {
    console.log('Server started on: http://localhost or http://10.16.28.217')
})

const io = socketIO(server, {
    cors: {
        origin: "*",
        method: ["GET", "POST"],
        credentials: true
    }
})


const statuses = {
    "ONLINE": "🟢",
    "CONNECTION_ERROR": "🟡",
    "OFFLINE": "🔴",
}

const servers = {
    "arma-status": statuses.OFFLINE,
    "planetary-status": statuses.ONLINE,
    "argentino-status": statuses.OFFLINE,
}

io.on('connection', client => {
    console.log("Client connected", client.id)

    client.on('status_request', () => {
        console.log("Request Received", client.id)
        console.log(checkStatus())
        io.emit('status_response', checkStatus())
        console.log("Response sent", client.id)
    })

    // client.on('refresh_request', (request) => {})
})


function checkStatus() {
    return servers;
}

function planetaryStatus() {
    let portUsed = tcpPortUsed.check(25565, 'localhost')
    .then(function(inUse) {
        if (inUse){
            planetaryRunning = true;
            servers["planetary-status"] = statuses.ONLINE;
        }
        else{
            planetaryRunning = false;
            servers["planetary-status"] = statuses.OFFLINE;
        }
    }, function(err) {
        console.error('Error on check:', err.message);
    });
}

let planetaryRunning = false;
let _planetaryRunning = false;

const serverCheck = setInterval(function (){
    if (_planetaryRunning !== planetaryRunning)
        io.emit('status_response', checkStatus())
    _planetaryRunning = planetaryRunning
    planetaryStatus()
}, 1000);
