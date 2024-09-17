const {events, servers, discordBots, serverManagers, serverList} = require("@server-lib/globals.js");

class SocketEvents {


    /**
     * @desc This static sends status response over given websocket, can be configured to send only some of the statuses. By default, sends update for all statuses.
     * @param websocket - Socket.io websocket, over which the data will be sent.
     * @param {boolean} updateServers - Should servers be sent.
     * @param {boolean} updateDiscordBots - Should Discord bots be sent.
     * @param {boolean} updateServerManagers - Should server managers be sent.
     */
    static statusResponse(websocket, {
        // Default values if not all perimeters are specified e.g. statusResponse(websocket, {updateServers: true})
        updateServers = true,
        updateDiscordBots = true,
        updateServerManagers = true
        // Default value when no object is provided statusResponse(websocket)
    } = {updateServers: true, updateDiscordBots: true, updateServerManagers: true}) {

        let data = {};

        if (updateServers) {
            data['servers'] = serverList;
        }
        if (updateDiscordBots) {
            const DiscordBotList = require("@server-lib/DiscordBotList.cjs");
            data['discordBots'] = DiscordBotList.getStatuses();
        }
        if (updateServerManagers) {
            const ServerManagerList = require("@server-lib/ServerManagerList.cjs");
            data['serverManagers'] = ServerManagerList.getStatuses();
        }

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