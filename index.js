const express = require('express');
const socketIO = require('socket.io');
const CustomServers = require('./CustomServers')
const {statuses} = require("./CustomServers");

const CustomServer = CustomServers.CustomServer
const MinecraftServer = CustomServers.MinecraftServer

// Import information required to start a server
const serversInfo =  require('./servers_info.json')

// Setup express
const app = express()
app.use(express.static('public'))

// Start server
const server = app.listen(80, () => {
    console.log('Server started on: http://localhost or http://10.16.28.217')

    // Start checking ports for every defined server
    for (const server of servers) {
        console.log("Starting portChecker for:", server.htmlID)
        server.portChecker(emitDataGlobal, io, "status_response", servers)
    }
})
// Start socket
const io = socketIO(server, {
    cors: {
        origin: "10.16.28.*",
        method: ["GET", "POST"],
        credentials: true
    }
})

//Find server in servers[] by server.htmlID
const getServerByHtmlID = serverID => servers.filter((s) => {
    return s.htmlID === serverID
})[0]

//

// When client connects to the server
io.on('connection', client => {
    console.log("Client connected", client.id)
    // Respond to clients data request
    client.on('status_request', () => {
        // Send back servers statuses
        if (client) {
            console.log("Request Received", client.id)
            emitDataGlobal(io, "status_response", servers)
            console.log("Response sent", client.id)
        }
    })

    // Requested server start
    client.on('start_server_request', (serverID) => {
        console.log("Client asked to start server", serverID)

        // Get requested server's status
        const server = getServerByHtmlID(serverID);

        if (server.status === statuses.OFFLINE){
            if ((serverID) !== 'arma') {
                console.log("Attempting to start", serverID)
                // Start commandLine for the server
                server.startServer(emitDataGlobal, io, servers)
            }
            else{
                io.to(client.id).emit('request_failed', "Nie ma tego jeszcze")
            }
        }
        else{
            console.log('Request denied: server already started')
            io.to(client.id).emit('request_failed', "Port jest zajęty")
        }
    })

    // Requested server stop
    client.on('stop_server_request', (serverID) => {
        console.log("Client asked to stop server", serverID);

        const server = getServerByHtmlID(serverID);

        if (server.status === statuses.ONLINE){
            console.log("Closing server", serverID);
            server.stopServer();
        }
        else{
            console.log('Request denied: server not running')
            io.to(client.id).emit('request_failed', 'Serwer nie jest włączony')
        }

    })
})

// Define all servers
const servers = [
    new MinecraftServer({
        port: 25565,
    htmlID: 'planetary',
    displayName: 'Minecraft: Planetary',
    path: serversInfo.planetary.path,
    startArgs: serversInfo.planetary.args
    }),
    new MinecraftServer({
        port: 25566,
    htmlID: 'test',
    displayName: 'Minecraft: Testing server',
    path: serversInfo.test.path,
    startArgs: serversInfo.test.args
    }),
    new CustomServer({
        port: 2344,
        htmlID: 'arma',
        displayName: 'Arma 3: Antistasi'
    })
]

// Sending servers statuses
function emitDataGlobal(socket, event, data) {
    socket.emit(event, data);
}

