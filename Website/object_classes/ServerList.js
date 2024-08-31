const {customLog} = require("../utils/CustomUtils");
const {serverManagers} = require('../utils/SharedVars');

const logName = "Server_List";
let allServers = [];

class ServerList {
    static managersWithServers = {};

    static init() {
        customLog(logName, "Initialising");
        for (let serverManager of serverManagers) {
            ServerList.managersWithServers[serverManager.name] = null;
        }
    }

    static updateServers(managerName, servers) {
        customLog(logName, `Updating server list for ${managerName}`);
        // Update server list for the manager
        ServerList.managersWithServers[managerName] = servers;
        // Update list with all servers
        this.updateAllServers();
    }

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

    static getManagerNameByServer(serverID) {
        for (const managerName of Object.keys(ServerList.managersWithServers)) {
            const serverNames = ServerList.getServerNames(ServerList.managersWithServers[managerName]);
            if (serverNames.includes(serverID)) {
                return managerName;
            }
        }

        return false;
    }

    static getServerNames(servers) {
        let names = [];
        for (const server of servers) {
            names.push(server.htmlID);
        }
        return names;
    }
}

module.exports = {ServerList, allServers};