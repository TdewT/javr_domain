const {ServerList} = require("./ServerList");
const {customLog} = require("../utils/CustomUtils");
const {serverManagers} = require('../utils/SharedVars');

const logName = 'Server_Managers';

class ServerManagerList {

    static anyManagerConnected() {
        for (const serverManager of serverManagers) {
            if (serverManager.isConnected) {
                return true;
            }
        }
        return false;
    }

    static loadServerManagers(websiteIO) {
        for (const serverManager of serverManagers) {
            customLog(logName, `${serverManager.name} loaded`);
            serverManager.startConnection(websiteIO);
        }
    }

    static getConnectedManagers() {
        let connected = [];
        for (const serverManager of serverManagers) {
            if (serverManager.isConnected) {
                connected.push(serverManager);
            }
        }
        return connected;
    }

    static getManagerByName(name) {
        for (const serverManager of serverManagers) {
            if (serverManager.name === name) {
                return serverManager;
            }
        }
        return false;
    }

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

    static getManagersStates(){
        let states = [];
        for (const serverManager of serverManagers) {
            states.push([serverManager.name, serverManager.isConnected]);
        }
        return states;
    }
}

module.exports = {ServerManagerList, serverManagers};