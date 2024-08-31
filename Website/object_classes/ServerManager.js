const socketIOClient = require("socket.io-client");
const {ServerList} = require("./ServerList");
const {customLog} = require("../utils/CustomUtils");
const {wake} = require("wake_on_lan");
const SocketEvents = require("../utils/SocketEvents");
// import for docstrings
const socketIO = require("socket.io");
const {Statuses} = require("../utils/SharedVars");

/**
 * @class ServerManager
 * @classdesc This class's purpose is to create object for easy management of connection with a remote server manager.
 * @property {string} name - Name of the server manager, used for logs and keeping track of what servers are under each manager.
 * @property {string} mac - Mac address of the server manager, used for Wake On Lan feature.
 * @property {websocket} serverScoket - Websocket which connects to the Server Manager's node webserver.
 * @property {string} ip - IP/url that `serverSocket` is going to listen on. String value.
 * @property {Statuses} status - Keeps track of the state of websocket connection. `true` if connected `false` otherwise.
 */
class ServerManager {
    socket;
    status = Statuses.OFFLINE;
    #socketOpen = false;

    /**
     * @constructor
     * @desc Parameters passed in an object.
     * @param {string} serverManagerName - Name of the server manager, used for logs and keeping track of what servers are under each manager.
     * @param {string} serverManagerMac - Mac address of the server manager, used for Wake On Lan feature.
     * @param {string} serverManagerIP - IP/url that `serverSocket` is going to listen on. String value.
     * @param {number} serverManagerPort - port of the server manager.
     */
    constructor({
                    serverManagerName: serverManagerName,
                    serverManagerMac: serverManagerMac,
                    serverManagerIP: serverManagerIP,
                    serverManagerPort: serverManagerPort
                }) {
        this.name = serverManagerName;
        this.mac = serverManagerMac;
        this.ip = serverManagerIP;
        this.port = serverManagerPort;
        this.socket = socketIOClient(`http://${this.ip}:${this.port}`);
    }

    /**
     * Creates websocket client connection with specified server.
     * @param websiteIO - Websocket used for connection with the website's frontend clients.
     */
    startConnection(websiteIO) {
        setInterval(() => {
            if (!this.#socketOpen) {
                this.#socketOpen = true;
                this.socket.once('connect', () => {
                    this.status = Statuses.ONLINE;
                    customLog(this.name, `Connected`);

                    customLog(this.name, `Sending status request`);
                    console.log("abc");
                    SocketEvents.statusRequest(this.socket);

                    this.socket.on('disconnect', () => {
                        this.status = Statuses.OFFLINE;
                        ServerList.updateServers(this.name, []);
                        SocketEvents.statusResponse(websiteIO);
                        this.socket.off();
                        customLog(this.name, 'Disconnected');
                    });

                    this.socket.on('status_response', (response) => {
                        customLog(this.name, `Received status update`);
                        ServerList.updateServers(this.name, response.servers);
                        SocketEvents.statusResponse(websiteIO);
                        customLog(this.name, `Global status update sent to all clients`);
                    });

                    // If the request is denied
                    this.socket.on('request_failed', (response) => {
                        customLog(this.name, `Request failed "${response['reason']}"`);
                        SocketEvents.requestFailed(websiteIO.to(response['socket']), response['reason']);
                    });
                });
            }
        }, 1000);
    }

    /**
     * @desc Sends a wake-up signal to the manager
     * @param clientSocket
     */
    wakeUp(clientSocket) {
        return wake(this.mac, error => {
            if (error) {
                customLog(this.name, "Failed to send wake up packet");
                SocketEvents.requestFailed(clientSocket, "Menedżer serwerów niedostępny")
            }
            else {
                customLog(this.name, `Wake up packet sent to ${this.name}`);
                SocketEvents.info(clientSocket, "Wysłano pakiet wybudzający, jeśli menedżer serwerów nie wstanie po paru minutach to kaplica.")
            }
        });
    }

    /**
     * @desc Extract names from an array of ServerManager objects.
     * @param {Array[ServerManager]} managers - Array of ServerManager instances to extract names from.
     * @returns {string[]} - Array of strings containing names of managers.
     */
    static getManagersNames(managers) {
        let names = [];
        for (const manager of managers) {
            names.push(manager.name)
        }
        return names;
    }
}

module.exports = ServerManager;
