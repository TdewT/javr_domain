const {customLog} = require("@server-utils/custom-utils.cjs");
const {serverManagers, serversWithHosts, mana, serverList} = require("@server-lib/globals.js");

const logName = "Server_List";

/**
 * @class ServerList
 * @desc Keeps the track of all available servers and handles all operations on server lists.
 */
class ServerList {

    /**
     * @desc Creates entries for each serverManagers in managersWithServers
     */
    static init() {
        customLog(logName, "Initialising");
        for (let serverManager of serverManagers) {
            serversWithHosts[serverManager.name] = null;
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
        serversWithHosts[managerName] = servers;
        // Update list with all servers
        this.updateServersList();
    }

    /**
     * @desc Updates servers array.
     */
    static updateServersList() {
        // Get all servers
        let serverListArr = Object.values(serversWithHosts);
        // Clear old servers
        serverList.length = 0;
        // Extract individual servers and add them to servers
        for (const serverArr of serverListArr) {
            if (serverArr != null){
                for (const server of serverArr) {
                    serverList.push(server)
                }
            }
        }
    }

    /**
     * @desc Searches for a server manager that contains server.
     * @param serverID - HtmlID of the server by which manager will be searched.
     * @returns {boolean|string} - Returns name of the manager if succeeded or `false` if it was not found.
     */
    static getManagerNameByServer(serverID) {
        for (const managerName of Object.keys(serversWithHosts)) {
            const serverNames = ServerList.getServerHtmlIDs(serversWithHosts[managerName]);
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

module.exports = ServerList;