// External imports
const express = require('express');
const socketIO = require('socket.io');
const socketIOClient = require('socket.io-client');
const axios = require('axios');
// Local imports
const {customLog, getElementByHtmlID, emitDataGlobal} = require('./utils/CustomUtils');
const {DiscordBot} = require('./object_classes/DiscordBot');
const {ApiHandler} = require("./utils/ApiHandler");
let {servers} = require('./utils/SharedVars');


//
// Initial setup
//

// Assign id-names to servers (for logs)
const siteIDName = 'JAVR_Domain';
const serverManagerID = 'JAVR_Server_Manager';
// Create ConfigManager instance
const {ConfigManager, configTypes} = require("./utils/ConfigManager");
// Load configs
customLog(siteIDName, "Loading configs");
ConfigManager.loadConfigs();
// Get loaded configs
const apiTokens = ConfigManager.getConfig(configTypes.apiTokens);
const discordBotsConfig = ConfigManager.getConfig(configTypes.discordBots);
// Extract token for ZeroTier
const zeroTierToken = apiTokens["tokens"]["zerotier"];


//
// Networking
//

// Setup express
const app = express();
app.use(express.static('public'));
// Start servers
// Note: website hosted on port 3000 should be forwarded to 80 by additional software like Apache
const websiteServer = app.listen(3000, () => {
    customLog(siteIDName, `Website Server started on port ${websiteServer.address().port}`);
});
// Start sockets
// noinspection JSValidateTypes
const websiteSocket = socketIO(websiteServer);
const serverSocket = socketIOClient("http://localhost:3001");

// When Server Manager connects
let serverManagerConnected = false;
serverSocket.on('connect', () => {
    serverManagerConnected = true;
    customLog(siteIDName, `${serverManagerID} connected`);

    customLog(siteIDName, `Requested status data from ${serverManagerID}`);
    serverSocket.emit('status_request', siteIDName);

    serverSocket.on('disconnect', () => {
        serverManagerConnected = false;
        customLog(siteIDName, `${serverManagerID} disconnected`);
    });

    serverSocket.on('status_response', (response) => {
        servers = response.servers;
        customLog(siteIDName, `Received status update from the ${serverManagerID}`);
        websiteSocket.emit('status_response', {servers: servers, discordBots: discordBots});
        customLog(siteIDName, `Global status update sent to all clients`);
    });

    // If the request is denied
    serverSocket.on('request_failed', (response) => {
        customLog(siteIDName, `Request failed "${response['reason']}"`);
        websiteSocket.to(response['socket']).emit('request_failed', response['reason'])
    });
});

// When client connects to the server
websiteSocket.on('connection', clientSocket => {
    let targetSite = clientSocket.request.headers.referer.split('/');
    targetSite = targetSite[targetSite.length - 1];
    let ip = clientSocket.handshake.address.split(':');
    ip = ip[ip.length - 1];

    customLog(siteIDName, `Client ${ip} connected to site: ${targetSite}`);
    // Send update on connection
    clientSocket.emit('status_response', {servers: servers, discordBots: discordBots});
    customLog(siteIDName, `Status response sent to client ${ip}`);

    // Respond to clients data request
    clientSocket.on('status_request', () => {
        // Send back servers statuses
        if (clientSocket) {
            customLog(siteIDName, `Status request received from ${ip}`);
            if (serverManagerConnected) {
                customLog(siteIDName, `Forwarding request to ${serverManagerID}`);
                serverSocket.emit('status_request', siteIDName);
            }
            else {
                clientSocket.emit("status_response", {servers: servers, discordBots: discordBots});
                customLog(siteIDName, `Status update sent ${ip}`);
            }
        }
    });

    // Requested server start
    clientSocket.on('start_server_request', (serverID) => {
        customLog(serverID, `${ip} requested server start`);

        // Get requested server's status
        if (serverManagerConnected) {
            serverSocket.emit("start_server_request",  siteIDName, serverID, clientSocket.id);
            customLog(siteIDName, `Request forwarded to ${serverManagerID}`);
        }
        else {
            customLog(siteIDName, "Request failed, Server Manager not available");
            clientSocket.emit('request_failed', "Server Manager not available");
        }
    });

    // Requested server stop
    clientSocket.on('stop_server_request', (serverID) => {
        customLog(serverID, `${ip} requested server stop`);

        if (serverManagerConnected) {
            serverSocket.emit("stop_server_request",  siteIDName, serverID, clientSocket.id);
            customLog(siteIDName, `Request forwarded to ${serverManagerID}`);
        }
        else {
            customLog(siteIDName, "Request failed, Server Manager not available");
            clientSocket.emit('request_failed', "Server Manager not available");
        }
    });


    // Request bot start
    clientSocket.on('start_dbot_request', (botID) => {

        // Search for bot in the list
        const bot = getElementByHtmlID(discordBots, botID);
        if (serverManagerConnected) {

        }
        else {
            customLog(siteIDName, "Request failed, Server Manager not available");
            clientSocket.emit('request_failed', "Server Manager not available");
        }
    });

    // Requested server stop
    clientSocket.on('stop_dbot_request', (botID) => {
        customLog(botID, `${ip} requested bot stop`);

        // Search for bot in the list
        const bot = getElementByHtmlID(discordBots, botID);
        if (serverManagerConnected) {

        }
        else {
            customLog(siteIDName, "Request failed, Server Manager not available");
            clientSocket.emit('request_failed', "Server Manager not available");
        }
    });

    //
    // ZeroTier
    //

    //Handling ZeroTier Request
    clientSocket.on('zt_request', () => {
        customLog(siteIDName, `${ip} requested ZeroTier information`);

        let config = {
            "method": "GET",
            "maxBodyLength": "Infinity",
            "url": "https://api.zerotier.com/api/v1/network/0cccb752f7ccba90/member",
            "headers": {
                "Authorization": `${zeroTierToken}`
            }
        };

        // noinspection JSCheckFunctionSignatures
        axios.request(config)
            .then((response) => {
                websiteSocket.emit("zt_response", response.data)
            })
            .catch((error) => {
                customLog(siteIDName, `Error fetching data from ZeroTier: ${error}`);
            });
    });

    //Sending user edit form to ZeroTier api
    clientSocket.on('zt_send_form', (userJSON, idUserJSON, apiUrl) => {

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

        // noinspection JSCheckFunctionSignatures
        axios.request(postConfig)
            .then(() => {
                customLog(siteIDName, `${ip} changed ZeroTier user - (${idUserJSON}) ${userJSON.name} ${userJSON.description}`);
            })
            .catch((error) => {
                customLog(siteIDName, `Error fetching data from ZeroTier: ${error.response.data}`);
            });

    })

});


//
// Discord bots
//

// Load Discord bots
let discordBots = [];
for (const botName in discordBotsConfig) {
    // Load initial parameters from config
    let constructorParams = discordBotsConfig[botName];

    // Add missing parameters
    Object.assign(constructorParams, {
        emitFunc: emitDataGlobal,
        // FIXME: This is temporary work-around, will fix with general refactor
        io: () => websiteSocket,
        discordBots: () => discordBots,
    });
    // Create bot instance and add it to the list
    discordBots.push(new DiscordBot(constructorParams));
}
// Autostart Argentino
// const argentino = getDbotByHtmlID("JAVR_Argentino");
// if (argentino) {
//     argentino.start();
// }


//
// API
//

// Initialise api-handler
const apiHandler = new ApiHandler(app);


// Create api-endpoint for generation of new tokens
apiHandler.newTokenEndpoint();
// Create endpoints for all existing tokens
apiHandler.createEndpoints();


// Setup redirects
app.get('/servers.html', (req, res) => {
    res.redirect(301, '/services.html');
});
