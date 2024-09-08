const {ServerList} = require("./ServerList");
const {customLog} = require("../utils/CustomUtils");
const {serverManagers, Statuses} = require('../utils/SharedVars');

const logName = 'Server_Managers';

/**
 * @class ServerManagerList
 * @desc Keeps the track of all defined server managers and handles all operations on managerList.
 */
class ServerManagerList {

    /**
     * @desc Checks if any `serverManager` is connected.
     * @returns {boolean} - Returns `true` if at least one server manager is connected, `false` if none are.
     */
    static anyManagerConnected() {
        for (const serverManager of serverManagers) {
            if (serverManager.status === Statuses.ONLINE) {
                return true;
            }
        }
        return false;
    }

    /**
     * @desc Starts all defined serverManagers
     * @param {socket.io} websiteIO - Socket.io instance from the main server.
     */
    static startServerManagers(websiteIO) {
        for (const serverManager of serverManagers) {
            customLog(logName, `${serverManager.name} started`);
            serverManager.startConnection(websiteIO);
        }
    }

    /**
     * @desc Gets all server managers with `online` status.
     * @returns {[ServerManager]} - Array of connected `ServerManager` instances.
     */
    static getConnectedManagers() {
        let connected = [];
        for (const serverManager of serverManagers) {
            if (serverManager.status === Statuses.ONLINE) {
                connected.push(serverManager);
            }
        }
        return connected;
    }

    /**
     * @desc Gets server manager by its name.
     * @param {string} name - Name by which manager will be searched.
     * @returns {ServerManager|boolean} - `ServerManager` instance on success and `false` on fail.
     */
    static getManagerByName(name) {
        for (const serverManager of serverManagers) {
            if (serverManager.name === name) {
                return serverManager;
            }
        }
        return false;
    }

    /**
     * @desc Gest server manager by one of its server's htmlID's.
     * @param serverID - `htmlID` property of a server.
     * @returns {ServerManager|boolean} - `ServerManager` instance on success and `false` on fail.
     */
    static getManagerByServerID(serverID) {
        // Get name from server list
        const managerName = ServerList.getManagerNameByServer(serverID);

        for (const serverManager of serverManagers) {
            if (serverManager.name === managerName) {
                return serverManager;
            }
        }
        return false;
    }

    /**
     * @desc Gets statuses of all defined server managers.
     * @returns {[string, Statuses]} - Array of two values, manager name and it's state
     */
    static getManagersStatuses() {
        let states = [];
        for (const serverManager of serverManagers) {
            states.push({htmlID: serverManager.name, status: serverManager.status});
        }
        return states;
    }
}

module.exports = {ServerManagerList, serverManagers};