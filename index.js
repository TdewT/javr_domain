const express = require('express');
const socketIO = require('socket.io');
const CustomServers = require('./CustomServers')

const CustomServer = CustomServers.CustomServer

// Setup express
const app = express()
app.use(express.static('public'))

// Start server
const server = app.listen(80, () => {
    console.log('Server started on: http://localhost or http://10.16.28.217')

    // Start checking ports for every defined server
        for (const server of servers){
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
        if (client){
            console.log("Request Received", client.id)
            emitData(io, servers)
            console.log("Response sent", client.id)
        }
    })
})

// Define all servers
const servers = [
    new CustomServer(25565, 'planetary-status', 'Minecraft: Planetary'),
    new CustomServer(2344, 'arma-status', 'Arma 3: Antistasi')
]

// Sending servers statuses
function emitData(socket, servers){
    socket.emit('status_response', servers);
}

