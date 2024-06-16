// External imports
const express = require('express');
const socketIO = require('socket.io');
const axios = require('axios');

// Local imports
const {
    statuses,
    serverTypes,
    serverClasses,
} = require("./object_classes/CustomServers");
const {customLog} = require('./utils/CustomUtils');
const {DiscordBot} = require('./object_classes/DiscordBot');


// Create ConfigManager instance
const {ConfigManager, configTypes} = require("./utils/ConfigManager");

// Load configs
ConfigManager.loadConfigs();

// Get loaded configs
const serversInfo = ConfigManager.getConfig(configTypes.serversInfo);
const apiTokens = ConfigManager.getConfig(configTypes.apiTokens);
const discordBotsConfig = ConfigManager.getConfig(configTypes.discordBots);

// Extract token for ZeroTier
const zeroTierToken = apiTokens["tokens"]["zerotier"];

// Setup express
const app = express();
app.use(express.static('public'));

// Assign id-name to server (for logs)
const siteIDName = 'JAVR_Strona';

// Start server
const server = app.listen(80, () => {
    customLog(siteIDName, `Server started on port ${server.address().port}`);

    // Start checking ports for every defined server
    for (const server of servers) {
        customLog(server.htmlID, "Starting statusMonitor");
        server.statusMonitor(emitDataGlobal, io, "status_response", {servers: servers})
    }
});

// Start socket
const io = socketIO(server);

//Find server in servers[] by server.htmlID
const getObjectByHtmlID = serverID => servers.filter((o) => {
    return o.htmlID === serverID
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
            io.to(socket.id).emit("status_response", {servers: servers, discordBots: discordBots});
            customLog(siteIDName, `Status update sent ${ip}`);
        }
    });

    // Requested server start
    socket.on('start_server_request', (serverID) => {
        customLog(serverID, `${ip} requested server start`);

        // Get requested server's status
        const server = getObjectByHtmlID(serverID);

        if (server) {
            if (server.status === statuses.OFFLINE) {
                server.startServer(emitDataGlobal, io, {servers: servers})
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

        const server = getObjectByHtmlID(serverID);

        if (server.status !== statuses.OFFLINE) {
            server.stopServer();
        }
        else {
            customLog(serverID, `${ip} request denied, server is not running`);
            io.to(socket.id).emit('request_failed', 'Serwer nie jest włączony')
        }

    });


    // Request bot start
    socket.on('start_bot_request', (botID) => {

        const bot = getObjectByHtmlID(botID);

        if (bot) {
            if (bot.status === statuses.OFFLINE) {
                bot.start(emitDataGlobal, io, {discordBots: discordBots})
            }
            else {
                customLog(botID, `${ip} request denied, bot already on`);
                io.to(socket.id).emit('request_failed', "Bot jest już włączony")
            }
        }
        else {
            customLog(botID, `${ip} request denied, Server not found`);
            io.to(socket.id).emit('request_failed', "Nie znaleziono serwera")
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
                "Authorization": `${zeroTierToken}`
            }
        };

        axios.request(config)
            .then((response) => {
                io.emit("zt_response", response.data)
            })
            .catch((error) => {
                customLog(siteIDName, `Error fetching data from ZeroTier: ${error}`);
            });
    });

    //Sending user edit form to ZeroTier api
    socket.on('zt_send_form', (userJSON, idUserJSON, apiUrl) => {

        customLog(siteIDName, `${ip} requested change of ZeroTier user - (${idUserJSON}) ${userJSON.name} ${userJSON.description}`);

        let postConfig = {
            "method": "POST",
            "maxBodyLength": "Infinity",
            "url": apiUrl,
            "data": JSON.stringify(userJSON),
            "headers": {
                "Authorization": `${zeroTierToken}`
            }
        };

        axios.request(postConfig)
            .then(() => {
                customLog(siteIDName, `${ip} changed ZeroTier user - (${idUserJSON}) ${userJSON.name} ${userJSON.description}`);
            })
            .catch((error) => {
                customLog(siteIDName, `Error fetching data from ZeroTier: ${error.response.data}`);
            });

    })

});


// Sending servers statuses
function emitDataGlobal(socket, event, data) {
    socket.emit(event, data);
}

//
// Services
//

// Load Discord bots
const discordBots = [];
for (const botName in discordBotsConfig) {
    // Load initial parameters from config
    let constructorParams = discordBotsConfig[botName];

    // Add missing parameters
    Object.assign(constructorParams, {
        emitFunc: emitDataGlobal,
        // FIXME: This is temporary work-around, will fix with general refactor
        io: ()=> io,
        discordBots:()=> discordBots,
    });
    // Create bot instance and add it to the list
    discordBots.push(new DiscordBot(constructorParams));
}

// Load servers
const servers = [];
for (const type of Object.values(serverTypes)) {
    for (const serverName in serversInfo[type]) {
        const server = (serversInfo[type][serverName]);
        servers.push(new serverClasses[type](server))
    }
}
module.exports = {servers};


//
// API
//

// Local imports
const {ApiHandler} = require("./utils/ApiHandler");
// Initialise api-handler
const apiHandler = new ApiHandler(app);


// Create api-endpoint for generation of new tokens
apiHandler.newTokenEndpoint();
// Create endpoints for all existing tokens
apiHandler.createEndpoints(servers);
