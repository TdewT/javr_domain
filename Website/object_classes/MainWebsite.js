// External imports
const express = require("express");
const socketIO = require("socket.io");
const axios = require("axios");
// Local imports
const {ApiHandler} = require("../utils/ApiHandler");
const {DiscordBot} = require("./DiscordBot");
const {customLog, getElementByHtmlID} = require("../utils/CustomUtils");
const {discordBots, Statuses} = require("../utils/SharedVars");
const {ServerManagerList} = require("./ServerManagerList");
const {ConfigManager, configTypes} = require("../utils/ConfigManager");
const ServerManager = require("./ServerManager");
const SocketEvents = require("../utils/SocketEvents");

// Setup express
const app = express();
app.use(express.static('public'));

class MainWebsite {
    // Holds static reference to an initialised instance
    static instance = null;

    constructor({
                    siteName: siteName,
                    port: port,
                }) {

        // Ensure that only one instance of the class can be initialised at a time
        if (MainWebsite.instance) {
            return MainWebsite.instance;
        }
        MainWebsite.instance = this;

        this.name = siteName;
        this.port = port;
    }

    startWebsite() {
        const websiteServer = app.listen(this.port, () => {
            customLog(this.name, `Server started on port ${websiteServer.address().port}`);
        });

        this.createSocket(websiteServer);
        this.loadDiscordBots();
        this.initialiseAPI();
    }

    loadDiscordBots() {
        customLog(this.name, 'Loading DiscordBots');
        // Get bots and their parameters from config file
        const discordBotsConfig = ConfigManager.getConfig(configTypes.discordBots);

        for (const botName in discordBotsConfig) {
            // Load initial parameters from config
            let constructorParams = discordBotsConfig[botName];

            // Add missing parameters
            Object.assign(constructorParams, {
                // FIXME: This is temporary work-around, will fix with general refactor
                io: () => this.websiteIO,
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
    }

    createSocket(websiteServer) {
        customLog(this.name, 'Creating websocket');
        // noinspection JSValidateTypes
        this.websiteIO = socketIO(websiteServer);

        // When client connects to the server
        this.websiteIO.on('connection', clientSocket => {
            let targetSite = clientSocket.request.headers.referer.split('/');
            targetSite = targetSite[targetSite.length - 1];
            let ip = clientSocket.handshake.address.split(':');
            ip = ip[ip.length - 1];

            customLog(this.name, `Client ${ip} connected to site: ${targetSite}`);
            // Send update on connection
            SocketEvents.statusResponse(clientSocket);
            customLog(this.name, `Status response sent to client ${ip}`);

            // Respond to clients data request
            clientSocket.on('status_request', () => {
                // Send back servers statuses
                if (clientSocket) {
                    customLog(this.name, `Status request received from ${ip}`);

                    // Check if any manager is connected
                    const connectedManagers = ServerManagerList.getConnectedManagers();
                    if (connectedManagers.length > 0) {

                        // Get names for logs
                        let managerNames = ServerManager.getManagersNames(connectedManagers);
                        managerNames = managerNames.toString().replace(',', ', ');
                        customLog(this.name, `Forwarding request/s to ${managerNames}`);

                        // Emit requests for all connected managers
                        for (const manager of connectedManagers) {
                            SocketEvents.statusRequest(manager.socket);
                        }
                    }
                    else {
                        // If none are connected send current state immediately
                        customLog(this.name, `No server managers connected`);
                        SocketEvents.statusResponse(clientSocket);
                        customLog(this.name, `Status update sent ${ip}`);
                    }
                }
            });

            // Requested server manager start
            clientSocket.on('start_server_manager_request', managerName => {
                const serverManager = ServerManagerList.getManagerByName(managerName);
                customLog(this.name, `${ip} requested ${serverManager.name} start`);
                serverManager.wakeUp(clientSocket);
            });

            // Requested server start
            clientSocket.on('start_server_request', (serverID) => {
                customLog(serverID, `${ip} requested server start`);
                const serverManager = ServerManagerList.getManagerByServerID(serverID);

                // Get requested server's status
                if (serverManager && serverManager.status === Statuses.ONLINE) {
                    SocketEvents.startServerRequest(serverManager.socket, serverID, clientSocket.id);

                    customLog(this.name, `Request forwarded to ${serverManager.name}`);
                }
                else if (serverManager) {
                    customLog(this.name, `${serverManager.name} not online, sending wake up packet`);
                    serverManager.wakeUp(clientSocket);
                }
                else{
                    customLog(this.name, `Server Manager for ${serverID} not found`);
                }
            });

            // Requested server stop
            clientSocket.on('stop_server_request', (serverID) => {
                customLog(serverID, `${ip} requested server stop`);

                const serverManager = ServerManagerList.getManagerByServerID(serverID);

                if (serverManager && serverManager.status === Statuses.ONLINE) {
                    SocketEvents.stopServerRequest(serverManager.socket, serverID, clientSocket.id);
                    customLog(this.name, `Request forwarded to ${serverManager.name}`);
                }
                else if (serverManager) {
                    customLog(this.name, `${serverManager.name} not online, sending wake up packet`);
                    serverManager.wakeUp(clientSocket);
                }
                else{
                    customLog(this.name, `Server Manager for ${serverID} not found`);
                }
            });


            // Request bot start
            clientSocket.on('start_dbot_request', (botID) => {
                customLog(botID, `${ip} requested ${botID}'s start`);

                // Search for bot in the list
                const bot = getElementByHtmlID(discordBots, botID);

            });

            // Requested server stop
            clientSocket.on('stop_dbot_request', (botID) => {
                customLog(botID, `${ip} requested ${botID}'s stop`);

                // Search for bot in the list
                const bot = getElementByHtmlID(discordBots, botID);

            });

            //
            // ZeroTier
            //

            const apiTokens = ConfigManager.getConfig(configTypes.apiTokens);
            const zeroTierToken = apiTokens["tokens"]["zerotier"];

            //Handling ZeroTier Request
            clientSocket.on('zt_request', () => {

                customLog(this.name, `${ip} requested ZeroTier information`);

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
                        SocketEvents.ztResponse(this.websiteIO, response.data);
                    })
                    .catch((error) => {
                        customLog(this.name, `Error fetching data from ZeroTier: ${error}`);
                    });
            });

            //Sending user edit form to ZeroTier api
            clientSocket.on('zt_send_form', (userJSON, idUserJSON, apiUrl) => {

                customLog(this.name, `${ip} requested change of ZeroTier user - (${idUserJSON}) ${userJSON.name} ${userJSON.description}`);

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
                        customLog(this.name, `${ip} changed ZeroTier user - (${idUserJSON}) ${userJSON.name} ${userJSON.description}`);
                    })
                    .catch((error) => {
                        customLog(this.name, `Error fetching data from ZeroTier: ${error.response.data}`);
                    });

            })
        });
    }

    initialiseAPI() {
        customLog(this.name, 'Initialising API');
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
    }
}

module.exports = MainWebsite;