const express = require('express');
const socketIO = require('socket.io');
const {statuses, types, ArmaServer, MinecraftServer, GenericServer, TeamspeakServer} = require("./CustomServers");

// Import information required to start a server
const serversInfo = require('./servers_info.json');

// Setup express
const app = express();
app.use(express.static('public'));

// Start server
const server = app.listen(80, () => {
    console.log('Server started on: http://localhost or http://10.16.28.217');

    // Start checking ports for every defined server
    for (const server of servers) {
        console.log("Starting statusMonitor for:", server.htmlID);
        server.statusMonitor(emitDataGlobal, io, "status_response", servers)
    }
});
// Start socket
const io = socketIO(server, {
    cors: {
        origin: "10.16.28.*",
        method: ["GET", "POST"],
        credentials: true
    }
});

//Find server in servers[] by server.htmlID
const getServerByHtmlID = serverID => servers.filter((s) => {
    return s.htmlID === serverID
})[0];

//

// When client connects to the server
io.on('connection', client => {
    console.log("Client connected", client.id);
    // Respond to clients data request
    client.on('status_request', () => {
        // Send back servers statuses
        if (client) {
            console.log("Request Received", client.id);
            emitDataGlobal(io, "status_response", servers);
            console.log("Response sent", client.id)
        }
    });

    // Requested server start
    client.on('start_server_request', (serverID) => {
        console.log(`[${serverID}]: Client asked to start server`);

        // Get requested server's status
        const server = getServerByHtmlID(serverID);

        if (server) {
            if (server.status === statuses.OFFLINE) {
                if ((serverID) !== 'arma') {
                    // Start commandLine for the server
                    server.startServer(emitDataGlobal, io, servers)
                }
                else {
                    io.to(client.id).emit('request_failed', "Nie ma tego jeszcze")
                }
            }
            else {
                console.log(`[${serverID}]: Request denied, port is taken`);
                io.to(client.id).emit('request_failed', "Port jest zajęty")
            }
        }
        else {
            console.log(`[${serverID}]: Server not found`);
            io.to(client.id).emit('request_failed', "Nie znaleziono serwera")
        }
    });

    // Requested server stop
    client.on('stop_server_request', (serverID) => {
        console.log(`[${serverID}]: Client asked to stop server`);

        const server = getServerByHtmlID(serverID);

        if (server.status === statuses.ONLINE ||
            (server.status === statuses.STARTING && 
                (server.type === types.ARMA || server.type === types.TSSERVER))
        ) {
            server.stopServer();
        }
        else {
            console.log(`[${serverID}]: Request denied, server is not running`);
            io.to(client.id).emit('request_failed', 'Serwer nie jest włączony')
        }

    })
});

// Define all servers
const servers = [
    // Generic Servers
    new GenericServer({
        port: 25566,
        htmlID: "generic",
        displayName: "Generic Server"
    }),
    // Minecraft Servers
    new MinecraftServer(
        serversInfo.minecraft.planetary
    ),
    new MinecraftServer(
        serversInfo.minecraft["forge-test"]
    ),
    new MinecraftServer(
        serversInfo.minecraft.test
    ),
    // Arma Servers
    new ArmaServer(
        serversInfo.arma.test
    ),
];

// Sending servers statuses
function emitDataGlobal(socket, event, data) {
    socket.emit(event, data);
}

