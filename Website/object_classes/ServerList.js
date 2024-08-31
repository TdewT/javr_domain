const {customLog} = require("../utils/CustomUtils");
const {serverManagers} = require('../utils/SharedVars');

const logName = "Server_List";
let allServers = [];

/**
 * @class ServerList
 * @desc Keeps the track of all available servers and handles all operations on server lists.
 * @property {{string: [GenericServer]}} managersWithServers - Dictionary containing all managers (as keys) and array of their servers (as values)
 */
class ServerList {
    static managersWithServers = {};

    /**
     * @desc Creates entries for each serverManagers in managersWithServers
     */
    static init() {
        customLog(logName, "Initialising");
        for (let serverManager of serverManagers) {
            ServerList.managersWithServers[serverManager.name] = null;
        }
    }

    /**
     * @desc Updates both server lists with given parameters.
     * @param {string} managerName - Name of the server manager that sent update.
     * @param {[GenericServer]} servers - List of servers.
     */
    static updateServers(managerName, servers) {
        customLog(logName, `Updating server list for ${managerName}`);
        // Update server list for the manager
        ServerList.managersWithServers[managerName] = servers;
        // Update list with all servers
        this.updateAllServers();
    }

    /**
     * @desc Updates allServers array.
     */
    static updateAllServers() {
        // Get all servers
        let serverListArr = Object.values(ServerList.managersWithServers);
        // Clear old allServers
        allServers.length = 0;
        // Extract individual servers and add them to allServers
        for (const serverArr of serverListArr) {
            for (const server of serverArr) {
                allServers.push(server)
            }
        }
    }

    /**
     * @desc Searches for a server manager that contains server.
     * @param serverID - HtmlID of the server by which manager will be searched.
     * @returns {boolean|string} - Returns name of the manager if succeeded or `false` if it was not found.
     */
    static getManagerNameByServer(serverID) {
        for (const managerName of Object.keys(ServerList.managersWithServers)) {
            const serverNames = ServerList.getServerHtmlIDs(ServerList.managersWithServers[managerName]);
            if (serverNames.includes(serverID)) {
                return managerName;
            }
        }

        return false;
    }

    /**
     * @desc Extracts htmlIDs from an array of servers.
     * @param {[GenericServer]} servers - Array of server instances.
     * @returns {[string]} - array of htmlIDs;
     */
    static getServerHtmlIDs(servers) {
        let names = [];
        for (const server of servers) {
            names.push(server.htmlID);
        }
        return names;
    }
}

module.exports = {ServerList, allServers};