const {events, serverList, arduinoBoards} = require("@server-lib/globals.js");

class SocketEvents {


    /**
     * @desc Sends status response with all servers over given websocket.
     * @param websocket - Socket.io websocket, over which the data will be sent.
     */
    static statusResponse(websocket) {
        const ServerManagerList = require("@server-lib/ServerManagerList.cjs");
        const DiscordBotList = require("@server-lib/DiscordBotList.cjs");
        let data = {
            servers: serverList,
            discordBots: DiscordBotList.getStatuses(),
            serverManagers: ServerManagerList.getStatuses(),
            arduinoBoards: arduinoBoards,
        };

        websocket.emit(events.STATUS_RESPONSE, data);
    }

    /**
     * @desc Sends response with information to client.
     * @param websocket - Socket. io websocket, over which the data will be sent.
     * @param {string} info - What will be displayed to the user.
     */
    static info(websocket, info) {
        websocket.emit(events.INFO, info);
    }

    /**
     * @desc Sends request failed with reason why it did
     * @param websocket - Socket. io websocket, over which the data will be sent.
     * @param {string} reason - What will be displayed to the user.
     */
    static requestFailed(websocket, reason) {
        websocket.emit(events.REQUEST_FAILED, reason);
    }

    /**
     * @desc Sends ZeroTier data to client.
     * @param websocket - Socket. io websocket, over which the data will be sent.
     * @param {JSON} data - data from ZeroTier's API.
     */
    static ztResponse(websocket, data) {
        websocket.emit(events.ZT_RESPONSE, data)
    }

    /**
     * @desc Sends status request on provided websocket
     * @param websocket - Socket. io websocket, over which the request will be sent.
     */
    static statusRequest(websocket) {
        websocket.emit(events.STATUS_REQUEST);
    }

    /**
     * @desc Sends a request to start a server to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param serverID - HtmlID of the server.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static startServerRequest(websocket, serverID, clientSocketID) {
        websocket.emit(events.START_SERVER_REQUEST, serverID, clientSocketID);
    }

    /**
     * @desc Sends a request to stop a server to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param serverID - HtmlID of the server.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static stopServerRequest(websocket, serverID, clientSocketID) {
        websocket.emit(events.STOP_SERVER_REQUEST, serverID, clientSocketID);
    }

    /**
     * @desc Sends a request to start a Discord bot to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param botID - HtmlID of the bot.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static startDBotRequest(websocket, botID, clientSocketID) {
        websocket.emit(events.START_DBOT_REQUEST, botID, clientSocketID);
    }

    /**
     * @desc Sends a request to stop a Discord bot to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param botID - HtmlID of the bot.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static stopDBotRequest(websocket, botID, clientSocketID) {
        websocket.emit(events.STOP_DBOT_REQUEST, botID, clientSocketID);
    }
}

module.exports = SocketEvents;