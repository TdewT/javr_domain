const express = require('express');
const socketIO = require('socket.io');
const CustomServers = require('./CustomServers')
const {statuses} = require("./CustomServers");

const CustomServer = CustomServers.CustomServer
const MinecraftServer = CustomServers.MinecraftServer

// Minecraft stuff
const minecraftFolder = "E:\\Serwery\\AF server"

// Setup express
const app = express()
app.use(express.static('public'))

// Start server
const server = app.listen(80, () => {
    console.log('Server started on: http://localhost or http://10.16.28.217')

    // Start checking ports for every defined server
    for (const server of servers) {
        console.log("Starting portChecker for:", server.htmlID)
        server.portChecker(emitData, io, "status_response", servers)
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

//Find server in servers[] by server.htmlID
const getServerByHtmlID = serverID => servers.filter((s) => {
    return s.htmlID === serverID
})[0]

// When client connects to the server
io.on('connection', client => {

    console.log("Client connected", client.id)
    // Respond to clients data request
    client.on('status_request', () => {
        // Send back servers statuses
        if (client) {
            console.log("Request Received", client.id)
            emitData(io, "status_response", servers)
            console.log("Response sent", client.id)
        }
    })

    // Requested server start
    client.on('start_server_request', (serverID) => {
        console.log("Client asked to start server", serverID)

        // Get requested server's status
        const server = getServerByHtmlID(serverID);

        if (server.status === statuses.OFFLINE){
            if ((serverID) === 'planetary') {
                console.log("Attempting to start", serverID)
                // Start commandLine for the server
                servers[0].startServer(emitData, io, servers)

                // Change server status
                servers[0].status = statuses.STARTING;
            }
            else{
                io.emit('request_failed', "Nie ma tego jeszcze")
            }
        }
        else{
            console.log('Request denied: server already started')
            io.emit('request_failed', "Serwer (powinien być) już odpalony")
        }
    })

    // Requested server stop
    client.on('stop_server_request', (serverID) => {
        console.log("Client asked to stop server", serverID);

        const server = getServerByHtmlID(serverID);

        if (server.status === statuses.ONLINE){
            if (servers[0] !== null) {
                console.log("Closing server", serverID);
                servers[0].stopServer();
            }
        }
        else{
            console.log('Request denied: server not running')
            io.emit('request_failed', 'Serwer nie jest włączony')
        }

    })
})

// Define all servers
const servers = [
    new MinecraftServer(port=25565, htmlID='planetary', displayName='Minecraft: Planetary', path=minecraftFolder),
    new CustomServer(port=2344, htmlID='arma',displayName='Arma 3: Antistasi')
]

// Sending servers statuses
function emitData(socket, event, data) {
    socket.emit(event, data);
}

