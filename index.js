const express = require('express');
const socketIO = require('socket.io');
const axios = require('axios');
const {statuses, types, ArmaServer, MinecraftServer, GenericServer, TeamspeakServer} = require("./CustomServers");
const {customLog, createLogStream} = require('./CustomUtils');


// Import information required to start a server
const serversInfo = require('./configs/servers_info.json');

// Setup express
const app = express();
app.use(express.static('public'));

// Assign id-name to server (for logs)
const serverIDName = 'JAVR_Strona';

//Setup Config for ZeroTier
let config = {
    method: 'GET',
    maxBodyLength: Infinity,
    url: 'https://api.zerotier.com/api/v1/network/0cccb752f7ccba90/member',
    headers: { 
      'Authorization': 'Bearer dRBMhds9vGR9Dtqcn21gmm7zFYr24iFR'
    }
};


// Start server
const server = app.listen(80, () => {
    // Create stream to log file
    createLogStream();

    customLog(serverIDName, `Server started on port ${server.address().port}`);

    // Start checking ports for every defined server
    for (const server of servers) {
        customLog(server.htmlID, "Starting statusMonitor");
        server.statusMonitor(emitDataGlobal, io, "status_response", servers)
    }
});
// Start socket
const io = socketIO(server);

//Find server in servers[] by server.htmlID
const getServerByHtmlID = serverID => servers.filter((s) => {
    return s.htmlID === serverID
})[0];

// When client connects to the server
io.on('connection', socket => {

    let ip = socket.handshake.address.split(':');
    ip = ip[ip.length - 1];

    customLog(serverIDName, `Client ${ip} connected`);

    // Respond to clients data request
    socket.on('status_request', () => {
        // Send back servers statuses
        if (socket) {
            customLog(serverIDName, `Status request received from ${ip}`);
            emitDataGlobal(io, "status_response", servers);
            customLog(serverIDName, `Status update sent ${ip}`);
        }
    });

    // Requested server start
    socket.on('start_server_request', (serverID) => {
        customLog(serverID, `${ip} requested server start`);

        // Get requested server's status
        const server = getServerByHtmlID(serverID);

        if (server) {
            if (server.status === statuses.OFFLINE) {
                server.startServer(emitDataGlobal, io, servers)
            }
            else {
                customLog(serverID, `${ip} request denied, port is taken`);
                io.to(socket.id).emit('request_failed', "Port jest zajęty")
            }
        }
        else {
            customLog(serverID, `${ip} request denied, Server not found`);
            io.to(socket.id).emit('request_failed', "Nie znaleziono serwera")
        }
    });

    // Requested server stop
    socket.on('stop_server_request', (serverID) => {
        customLog(serverID, `${ip} requested server stop`);

        const server = getServerByHtmlID(serverID);

        if (server.status === statuses.ONLINE ||
            (server.status === statuses.STARTING &&
                (server.type === types.ARMA || server.type === types.TSSERVER))
        ) {
            server.stopServer();
        }
        else {
            customLog(serverID, `${ip} request denied, server is not running`);
            io.to(socket.id).emit('request_failed', 'Serwer nie jest włączony')
        }

    })
    
    //Handeling ZeroTier Request
    client.on('zt_request', () =>{
        console.log("ZeroTier Request Received")
        let wasRequested = false
        if(!wasRequested){

            axios.request(config)
                .then((response) => {
                    io.emit("zt_response",response.data)
                })
                .catch((error) => {
                    console.log(error);
                });

            wasRequested = true;
        }
        

        

        console.log("ZeroTier Response sent")
    })

    
});

// Define all servers
const servers = [];
for (const serverName in serversInfo[types.GENERIC]) {
    const server = (serversInfo[types.GENERIC][serverName]);
    servers.push(new GenericServer(server))
}
for (const serverName in serversInfo[types.MINECRAFT]) {
    const server = (serversInfo[types.MINECRAFT][serverName]);
    servers.push(new MinecraftServer(server))
}
for (const serverName in serversInfo[types.ARMA]) {
    const server = (serversInfo[types.ARMA][serverName]);
    servers.push(new ArmaServer(server))
}
for (const serverName in serversInfo[types.TSSERVER]) {
    const server = (serversInfo[types.TSSERVER][serverName]);
    servers.push(new TeamspeakServer(server))
}

// Sending servers statuses
function emitDataGlobal(socket, event, data) {
    socket.emit(event, data);
}

