// External imports
const socketIO = require("socket.io");
const axios = require("axios");
const {createServer} = require("http");
const next = require("next");
// Local imports
const ApiHandler = require("@server-lib/ApiHandler.cjs");
const {DiscordBot} = require("./DiscordBot.cjs");
const DiscordBotList = require("@server-lib/DiscordBotList.cjs");
const {customLog} = require("@server-utils/custom-utils.cjs");
const {Statuses, events} = require("@server-lib/globals.js");
const ServerManagerList = require("@server-lib/ServerManagerList.cjs");
const {ConfigManager, configTypes} = require("@server-utils/config-manager.cjs");
const ServerManager = require("@server-lib/ServerManager.cjs");
const SocketEvents = require("@server-lib/SocketEvents.cjs");

/**
 * @class ServerInstance
 * @desc Object class for easier management of the main website server. Can have only one instance.
 * @property instance - After first initialisation stores class instance. It is returned if class has already been initialised.
 */
class ServerInstance {
    // Holds static reference to an initialised instance
    static #instance;
    // Type of next environment
    #processEnv;
    // Holds next app
    #app;

    /**
     * @constructor
     * @param {string} siteName - Name of the website.
     * @param {number} port - Port on which the website is hosted.
     * @param {string[]} discordBotAutostart - List of bot names to automatically start with the website.
     * @param {string} processEnv - Type of next environment.
     * @returns {this} - If instance is already initialised it returns that instance.
     */
    constructor({
                    siteName: siteName,
                    port: port,
                    discordBotAutostart: discordBotAutostart,
                    processEnv: processEnv,
                }) {

        // Ensure that only one instance of the class can be initialised at a time
        if (ServerInstance.#instance) {
            return ServerInstance.#instance;
        }
        ServerInstance.#instance = this;

        this.#processEnv = processEnv;
        this.name = siteName;
        this.port = port;
        this.discordBotStart = discordBotAutostart;
    }

    /**
     * @desc Starts the website and its components.
     */
    startWebsite() {
        // Server setup
        const dev = process.env.NODE_ENV !== this.#processEnv;
        this.#app = next({dev});
        const handle = this.#app.getRequestHandler();

        // Ready the app
        this.#app.prepare().then(() => {
            // Start the http server
            this.websiteServer = createServer((req, res) => {
                // noinspection JSIgnoredPromiseFromCall
                handle(req, res);
            });

            // Listen on the port
            this.websiteServer.listen(this.port, (err) => {
                if (err) throw err;
                customLog(this.name, `Server started on http://localhost:${this.websiteServer.address().port}`);
            });

            // Initializer functions
            this.createSocket();
            this.startDiscordBots();
            // this.initialiseAPI();
        });
    }


    /**
     * @desc Starts websocket connections.
     */
    createSocket() {
        customLog(this.name, 'Creating websocket');
        // noinspection JSValidateTypes
        this.websiteIO = socketIO(this.websiteServer, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
            },
        });

        // When client connects to the server
        this.websiteIO.on(events.CONNECTION, clientSocket => {
            let ip = clientSocket.handshake.address.split(':');
            ip = ip[ip.length - 1];

            // Respond to clients data request
            clientSocket.on(events.STATUS_REQUEST, () => {
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
            clientSocket.on(events.START_SERVER_MANAGER_REQUEST, managerID => {
                const serverManager = ServerManagerList.getManagerByName(managerID);
                customLog(this.name, `${ip} requested ${serverManager.name} start`);
                serverManager.wakeUp(clientSocket);
            });

            // Requested server start
            clientSocket.on(events.START_SERVER_REQUEST, (serverID) => {
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
                    SocketEvents.requestFailed(clientSocket, `Nie znaleziono managera dla ${serverID}`);
                }
            });

            // Requested server stop
            clientSocket.on(events.STOP_SERVER_REQUEST, (serverID) => {
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
                    SocketEvents.requestFailed(clientSocket, `Nie znaleziono managera dla ${serverID}`);
                }
            });


            // Request bot start
            clientSocket.on(events.START_DBOT_REQUEST, (botID) => {
                customLog(botID, `${ip} requested ${botID}'s start`);

                // Search for bot in the list
                const bot = DiscordBotList.getBotByHtmlID(botID);

                const serverManager = ServerManagerList.getManagerByBotID(botID);

                // Check if bot is on local machine
                if (serverManager.name === 'local'){
                    if (bot.status === Statuses.OFFLINE)
                        bot.start();
                    else {
                        customLog(this.name, "Request denied, bot not offline");
                        SocketEvents.requestFailed(clientSocket, "Bot nie jest offline")
                    }
                }
                else{
                    // Get requested server's status
                    if (serverManager && serverManager.status === Statuses.ONLINE) {
                        SocketEvents.startDBotRequest(serverManager.socket, botID, clientSocket.id);

                        customLog(this.name, `Request forwarded to ${serverManager.name}`);
                    }
                    else if (serverManager) {
                        customLog(this.name, `${serverManager.name} not online, sending wake up packet`);
                        serverManager.wakeUp(clientSocket);
                    }
                    else{
                        customLog(this.name, `Server Manager for ${botID} not found`);
                        SocketEvents.requestFailed(clientSocket, `Nie znaleziono managera dla ${botID}`);
                    }
                }

            });

            // Requested server stop
            clientSocket.on(events.STOP_DBOT_REQUEST, (botID) => {
                customLog(botID, `${ip} requested ${botID}'s stop`);

                // Search for bot in the list
                const bot = DiscordBotList.getBotByHtmlID(botID);

                const serverManager = ServerManagerList.getManagerByBotID(botID);

                // Check if bot is on local machine
                if (serverManager.name === 'local'){
                    if (bot.status === Statuses.ONLINE || bot.status === Statuses.STARTING) {
                        bot.stop();
                    }
                    else{
                        SocketEvents.requestFailed(clientSocket, "Bot nie jest online");
                        customLog(this.name, "Request failed, bot not online")
                    }
                }
                else{
                    // Get requested server's status
                    if (serverManager && serverManager.status === Statuses.ONLINE) {
                        SocketEvents.stopDBotRequest(serverManager.socket, botID, clientSocket.id);

                        customLog(this.name, `Request forwarded to ${serverManager.name}`);
                    }
                    else if (serverManager) {
                        customLog(this.name, `${serverManager.name} not online, sending wake up packet`);
                        serverManager.wakeUp(clientSocket);
                    }
                    else{
                        customLog(this.name, `Server Manager for ${botID} not found`);
                        SocketEvents.requestFailed(clientSocket, `Nie znaleziono managera dla ${botID}`);
                    }
                }

            });

            //
            // ZeroTier
            //

            const apiTokens = ConfigManager.getConfig(configTypes.apiTokens);
            const zeroTierToken = apiTokens["tokens"]["zerotier"];

            //Handling ZeroTier Request
            clientSocket.on(events.ZT_REQUEST, () => {

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
            clientSocket.on(events.ZT_SEND_FORM, (userJSON, idUserJSON, apiUrl) => {

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

    /**
     * @desc Starts all discord bots mentioned in `this.discordBotStart`
     */
    startDiscordBots(){
        customLog(this.name, "Starting Discord bots");

        // Get bots and their parameters from config file
        const discordBotsConfig = ConfigManager.getConfig(configTypes.discordBots);

        // Temporary variable holding local bots
        let discordBots = [];
        for (const botName in discordBotsConfig) {
            // Load initial parameters from config
            let constructorParams = discordBotsConfig[botName];
            // Add socket info
            constructorParams['io'] = this.websiteIO;
            
            // Create bot instance and add it to the list
            discordBots.push(new DiscordBot(constructorParams));
        }
        DiscordBotList.updateBots('local', discordBots);

        // Autostart bots
        for (const name of this.discordBotStart) {
            const bot = DiscordBotList.getBotByHtmlID(name);
            if (bot) {
                bot.start();
            }
            else{
                customLog(this.name, `${name} failed to start: Bot not defined`);
            }
        }
    }

    /**
     * @desc Initialises `APIHandler` and creates API endpoints.
     */
    initialiseAPI() {
        customLog(this.name, 'Initialising API');
        // Initialise api-handler
        const apiHandler = new ApiHandler(this.#app);


        // Create api-endpoint for generation of new tokens
        apiHandler.newTokenEndpoint();
        // Create endpoints for all existing tokens
        apiHandler.createEndpoints();
    }
}

module.exports = ServerInstance;