const express = require('express');
const socketIO = require('socket.io');
const axios = require('axios');
const {statuses, types, ArmaServer, MinecraftServer, GenericServer, TeamspeakServer} = require("./CustomServers");
const {customLog, createLogStream} = require('./CustomUtils');


// Import information required to start a server
const serversInfo = require('./configs/servers_info.json');
// Import zt token
const zeroTierToken = require('./configs/zerotier_token.json');

// Setup express
const app = express();
app.use(express.static('public'));

// Assign id-name to server (for logs)
const siteIDName = 'JAVR_Strona';




// Start server
const server = app.listen(80, () => {
    // Create stream to log file
    createLogStream();

    customLog(siteIDName, `Server started on port ${server.address().port}`);

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

    let targetSite = socket.request.headers.referer.split('/');
    targetSite = targetSite[targetSite.length - 1];
    let ip = socket.handshake.address.split(':');
    ip = ip[ip.length - 1];

    customLog(siteIDName, `Client ${ip} connected to site: ${targetSite}`);

    // Respond to clients data request
    socket.on('status_request', () => {
        // Send back servers statuses
        if (socket) {
            customLog(siteIDName, `Status request received from ${ip}`);
            emitDataGlobal(io, "status_response", servers);
            customLog(siteIDName, `Status update sent ${ip}`);
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

        if (server.status !== statuses.OFFLINE) {
            server.stopServer();
        }
        else {
            customLog(serverID, `${ip} request denied, server is not running`);
            io.to(socket.id).emit('request_failed', 'Serwer nie jest włączony')
        }

    });

    //Handling ZeroTier Request
    socket.on('zt_request', () => {
        customLog(siteIDName, `${ip} requested ZeroTier information`);
        
        let config = {
            "method": "GET",
            "maxBodyLength": "Infinity",
            "url": "https://api.zerotier.com/api/v1/network/0cccb752f7ccba90/member",
            "headers": {
                "Authorization": `${zeroTierToken.TOKEN}`
            }
        }

        axios.request(config)
            .then((response) => {
                io.emit("zt_response", response.data)
            })
            .catch((error) => {
                customLog(siteIDName, `Error fetching data from ZeroTier: ${error}`);
            });
    });

    //Sending user edit form to ZeroTier api
    socket.on('zt_send_form',(userJSON, idUserJSON, apiUrl)=>{
        
        customLog(siteIDName,`${ip} requested change of ZeroTier user - (${idUserJSON}) ${userJSON.name} ${userJSON.description}`);

        let postConfig = {
            "method": "POST",
            "maxBodyLength": "Infinity",
            "url": apiUrl,
            "data": JSON.stringify(userJSON),
            "headers": {
                "Authorization": `${zeroTierToken.token}`
            }
        }
        
        axios.request(postConfig)
        .then(()=>{
            customLog(siteIDName,`${ip} changed ZeroTier user - (${idUserJSON}) ${userJSON.name} ${userJSON.description}`);
        })
        .catch((error) => {
            customLog(siteIDName, `Error fetching data from ZeroTier: ${error.response.data}`);
        });
        
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

