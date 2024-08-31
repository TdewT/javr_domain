const {allServers} = require("../object_classes/ServerList");
const {discordBots} = require("./SharedVars");
const {ServerManagerList} = require("../object_classes/ServerManagerList");

class SocketEvents {

    static events = {
        INFO: "info",
        ZT_RESPONSE: "zt_response",
        STATUS_RESPONSE: 'status_response',
        STATUS_REQUEST: 'status_request',
        REQUEST_FAILED: 'request_failed',
        START_SERVER_REQUEST: 'start_server_request',
        STOP_SERVER_REQUEST: 'stop_server_request',
        START_SERVER_MANAGER_REQUEST: 'start_server_manager_request'
    };

    /**
     * @desc This static sends status response over given websocket, can be configured to send only some of the statuses. By default, sends update for all statuses.
     * @param websocket - Socket.io websocket, over which the data will be sent.
     * @param {boolean} sendServers - Determines if servers should be included in the update.
     * @param {boolean} sendDiscordBots - Determines if discordBots should be included in the update.
     * @param {boolean} sendServerManagers - Determines if serverManagers should be included in the update.
     */
    static statusResponse(websocket, sendServers = true, sendDiscordBots = true, sendServerManagers = true) {
        let data = {};

        if (sendServers) {
            data['servers'] = allServers;
        }
        if (sendDiscordBots) {
            data['discordBots'] = discordBots;
        }
        if (sendServerManagers) {
            data['serverManagers'] = ServerManagerList.getManagersStatuses();
        }

        websocket.emit(this.events.STATUS_RESPONSE, data);
    }

    /**
     * @desc Sends response with information to client.
     * @param websocket - Socket. io websocket, over which the data will be sent.
     * @param {string} info - What will be displayed to the user.
     */
    static info(websocket, info){
        websocket.emit(this.events.INFO, info)
    }

    /**
     * @desc Sends request failed with reason why it did
     * @param websocket - Socket. io websocket, over which the data will be sent.
     * @param {string} reason - What will be displayed to the user.
     */
    static requestFailed(websocket, reason) {
        websocket.emit(this.events.REQUEST_FAILED, reason);
    }

    /**
     * @desc Sends ZeroTier data to client.
     * @param websocket - Socket. io websocket, over which the data will be sent.
     * @param {JSON} data - data from ZeroTier's API.
     */
    static ztResponse(websocket, data){
        websocket.emit(this.events.ZT_RESPONSE, websocket, data)
    }

    /**
     * @desc Sends status request on provided websocket
     * @param websocket - Socket. io websocket, over which the request will be sent.
     */
    static statusRequest(websocket) {
        websocket.emit(this.events.STATUS_REQUEST);
    }

    /**
     * @desc Sends request to start a server to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param serverID - HtmlID of the server.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static startServerRequest(websocket, serverID, clientSocketID) {
        websocket.emit(this.events.START_SERVER_REQUEST, serverID, clientSocketID);
    }

    /**
     * @desc Sends request to stop a server to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param serverID - HtmlID of the server.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static stopServerRequest(websocket, serverID, clientSocketID) {
        websocket.emit(this.events.STOP_SERVER_REQUEST, serverID, clientSocketID);
    }
}


module.exports = SocketEvents;