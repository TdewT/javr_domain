const express = require('express');
const socketIO = require('socket.io');
const exec = require('child_process').exec;
const CustomServers = require('./CustomServers')
const {statuses} = require("./CustomServers");

const minecraftPath = '"E:\\Serwery\\AF server"'
const minecraftStarter = 'java -jar minecraft_server.1.12.2.jar nogui'

const CustomServer = CustomServers.CustomServer

// Setup express
const app = express()
app.use(express.static('public'))

// Start server
const server = app.listen(80, () => {
    console.log('Server started on: http://localhost or http://10.16.28.217')

    // Start checking ports for every defined server
    for (const server of servers) {
        console.log("Starting portChecker for:", server.htmlID)
        server.portChecker(emitData, io, servers)
    }
})
// Start socket
const io = socketIO(server, {
    cors: {
        origin: "*",
        method: ["GET", "POST"],
        credentials: true
    }
})


// When client connects to the server
io.on('connection', client => {
    console.log("Client connected", client.id)

    // Respond to clients data request
    client.on('status_request', () => {
        // Send back servers statuses
        if (client) {
            console.log("Request Received", client.id)
            emitData(io, servers)
            console.log("Response sent", client.id)
        }
    })
    // Start requested server
    client.on('start_server_request', (serverID) => {
        console.log("Client asking to start server", serverID)
        if ((serverID) === 'planetary') {
            console.log("Attempting to start", serverID)
            // const test = child_process.spawn('cd /d "E:/Serwery/AF server/" && start cmd /C java -jar minecraft_server.1.12.2.jar nogui',
            //     {shell: true})
            exec(`cd /d ${minecraftPath} && start cmd /C ${minecraftStarter}`);
            servers[0].status = statuses.LAUNCHING;
        }
    })

    client.on('stop_server_request', (serverID) => {
    })
})

// Define all servers
const servers = [
    new CustomServer(25565, 'planetary', 'Minecraft: Planetary'),
    new CustomServer(2344, 'arma', 'Arma 3: Antistasi')
]

// Sending servers statuses
function emitData(socket, servers) {
    socket.emit('status_response', servers);
}

