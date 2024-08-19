// External imports
const express = require('express');
const socketIO = require('socket.io');

// Local imports
const {
    statuses,
    serverTypes,
    serverClasses,
} = require("./object_classes/CustomServers");
const {customLog, getElementByHtmlID, emitDataGlobal} = require('./utils/CustomUtils');
const {DiscordBot} = require('./object_classes/DiscordBot');
const {servers} = require('./utils/SharedVars');


//
// INIT
//

// Create ConfigManager instance
const {ConfigManager, configTypes} = require("./utils/ConfigManager");
// Load configs
ConfigManager.loadConfigs();
// Get loaded configs
const serversInfo = ConfigManager.getConfig(configTypes.serversInfo);
const discordBotsConfig = ConfigManager.getConfig(configTypes.discordBots);


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
        io: () => io,
        discordBots: () => discordBots,
    });
    // Create bot instance and add it to the list
    discordBots.push(new DiscordBot(constructorParams));
}

// Load servers
for (const type of Object.values(serverTypes)) {
    for (const serverName in serversInfo[type]) {
        const server = (serversInfo[type][serverName]);
        servers.push(new serverClasses[type](server))
    }
}

//
// Networking
//

// Setup express
const app = express();
app.use(express.static('public'));

// Assign id-name to server (for logs)
const siteIDName = 'JAVR_Server_Manager';

// Start server
const server = app.listen(3001, () => {
    customLog(siteIDName, `Server started on port ${server.address().port}`);

    // Start checking ports for every defined server
    for (const server of servers) {
        customLog(server.htmlID, "Starting statusMonitor");
        server.statusMonitor(emitDataGlobal, io, "status_response", {servers: servers})
    }
});

// Start socket
const io = socketIO(server);

// When client connects to the server
io.on('connection', socket => {
    customLog(siteIDName, `Established connection with website server`);

    // Respond to clients data request
    socket.on('status_request', (senderID) => {
        // Send back servers statuses
        if (socket) {
            customLog(siteIDName, `Status request received from ${senderID}`);
            socket.emit("status_response", {servers: servers, discordBots: discordBots});
            customLog(siteIDName, `Status update sent ${senderID}`);
        }
    });

    // Requested server start
    socket.on('start_server_request', (senderID, serverID, socketID) => {
        customLog(serverID, `${senderID} requested server start`);

        // Get requested server's status
        const server = getElementByHtmlID(servers, serverID);

        if (server) {
            if (server.status === statuses.OFFLINE) {
                server.startServer(emitDataGlobal, io, {servers: servers})
            }
            else {
                customLog(serverID, `Request denied, port is taken`);
                socket.emit('request_failed', {socket: socketID, reason: "Port jest zajęty"})
            }
        }
        else {
            customLog(serverID, `Request denied, Server not found`);
            socket.emit('request_failed', {socket: socketID, reason: "Nie znaleziono serwera"})
        }
    });

    // Requested server stop
    socket.on('stop_server_request', (senderID, serverID, socketID) => {
        customLog(serverID, `${senderID} requested server stop`);

        const server = getElementByHtmlID(servers, serverID);

        if (server) {
            if (server.status !== statuses.OFFLINE) {
                server.stopServer();
            }
            else {
                customLog(serverID, `Request denied, server is not running`);
                socket.emit('request_failed', {socket: socketID, reason: 'Serwer nie jest włączony'})
            }
        }
        else {
            customLog(serverID, `Request denied, Server not found`);
            socket.emit('request_failed', {socket: socketID, reason: "Nie znaleziono serwera"})
        }

    });


    // Request bot start
    socket.on('start_dbot_request', (senderID, botID, socketID) => {

        // Search for bot in the list
        const bot = getElementByHtmlID(discordBots, botID);

        // Check if bot was found
        if (bot) {
            // Check if bot isn't already on
            if (bot.status === statuses.OFFLINE) {
                bot.start()
            }
            else {
                customLog(botID, `Request denied, bot already on`);
                socket.emit('request_failed', {socket: socketID, reason: "Bot jest już włączony"})
            }
        }
        else {
            customLog(botID, `Request denied, Bot not found`);
            socket.emit('request_failed', {socket: socketID, reason: "Nie znaleziono bota"})
        }
    });

    // Requested server stop
    socket.on('stop_dbot_request', (senderID, botID, socketID) => {
        customLog(botID, `${senderID} requested bot stop`);

        // Search for bot in the list
        const bot = getElementByHtmlID(discordBots, botID);

        // Check if bot was found
        if (bot) {
            // Conditions broken down for clarity
            const botOnline = bot.status === statuses.ONLINE;
            const lavaOnline = bot.lavaStatus === statuses.ONLINE;
            const botStarting = bot.status === statuses.STARTING;
            const botStopping = bot.status === statuses.STOPPING;

            // Check if conditions to stop the bot are met
            if ((botOnline || lavaOnline) && !(botStarting || botStopping)) {
                bot.stop();
            }
            else {
                customLog(botID, `Request denied, bot is not online`);
                socket.emit('request_failed', {socket: socketID, reason: 'bot nie jest w pełni włączony'})
            }
        }
        else {
            customLog(botID, `Request denied, Bot not found`);
            socket.emit('request_failed', {socket: socketID, reason: "Nie znaleziono bota"})
        }

    });
});