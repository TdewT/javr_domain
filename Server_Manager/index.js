// External imports
const express = require('express');
const socketIO = require('socket.io');
const {exec} = require('child_process');

// Local imports
const {
    statuses,
    serverTypes,
    serverClasses,
} = require("./object_classes/CustomServers");
const {
    customLog,
    getElementByHtmlID,
    emitDataGlobal,
    anyServerUsed
} = require('./utils/CustomUtils');
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
// ID of sleep timer timeout
let sleepTimerID;
// Time of inactivity after which server manager goes to sleep
const timeToSleep = 10;
// If conditions are met, starts sleep timer, runs every minute
sleepConditionDetector();

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
// noinspection JSValidateTypes
const io = socketIO(server);

// When client connects to the server
io.on('connection', socket => {
    let ip = socket.handshake.address.split(':');
    ip = ip[ip.length - 1];

    customLog(siteIDName, `Established connection with website server`);

    // Respond to clients data request
    socket.on('status_request', () => {
        // Send back servers statuses
        if (socket) {
            customLog(siteIDName, `Status request received from ${ip}`);
            socket.emit("status_response", {servers: servers, discordBots: discordBots});
            customLog(siteIDName, `Status update sent ${ip}`);
        }
    });

    // Requested server start
    socket.on('start_server_request', (serverID, socketID) => {
        customLog(serverID, `${ip} requested server start`);

        // Get requested server's status
        const server = getElementByHtmlID(servers, serverID);

        if (server) {
            if (server.status === statuses.OFFLINE) {
                cancelSleepTimer();
                server.startServer(emitDataGlobal, io, {servers: servers});
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
    socket.on('stop_server_request', (serverID, socketID) => {
        customLog(serverID, `${ip} requested server stop`);

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
    socket.on('start_dbot_request', (botID, socketID) => {

        // Search for bot in the list
        const bot = getElementByHtmlID(discordBots, botID);

        // Check if bot was found
        if (bot) {
            // Check if bot isn't already on
            if (bot.status === statuses.OFFLINE) {
                cancelSleepTimer();
                bot.start();
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
    socket.on('stop_dbot_request', (botID, socketID) => {
        customLog(botID, `${ip} requested bot stop`);

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


//
// Auto-sleep
//

// Check if any server is used every minute
function sleepConditionDetector() {
    setInterval(() => {
        if (anyServerUsed(servers)) {
            sleepTimerID = sleepTimer();
        }
    }, 60 * 1000);
}
// If they are not used for configured time enter sleep
function sleepTimer() {
    return setTimeout(() => {
        // If servers are still offline
        if (anyServerUsed(servers)) {
            customLog(siteIDName, 'All servers offline since 10 min, entering sleep');
            sleepTimerID = undefined;
            sleepSystem();
        }
    }, timeToSleep * 60 * 1000);
}
// Enter command to sleep
function sleepSystem() {
    // Command for Windows
    const command = 'rundll32.exe powrprof.dll, SetSuspendState Sleep';

    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error putting system to sleep: ${error.message}`);
        }
        if (stderr) {
            console.error(`Error output: ${stderr}`);
        }
    });
}

function cancelSleepTimer() {
    if (sleepTimerID)
        clearTimeout(sleepTimerID);
        sleepTimerID = undefined;
}