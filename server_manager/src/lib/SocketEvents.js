const {Events, servers, discordBots, getWebsocket} = require("./globals.js");

class SocketEvents {
    /**
     * @desc Sends status response with all servers over given websocket.
     * @param websocket - Socket.io websocket, over which the data will be sent.
     */
    static statusResponse(websocket = getWebsocket()) {
        if (websocket) {
            let data = {
                servers: servers,
                discordBots: discordBots,
            };
            websocket.emit(Events.STATUS_RESPONSE, data);
        }
    }

    /**
     * @desc Sends response with information to client.
     * @param websocket - Socket.io websocket, over which the data will be sent.
     * @param {string} info - What will be displayed to the user.
     */
    static info(websocket, info) {
        websocket.emit(Events.INFO, info);
    }

    /**
     * @desc Sends request failed message along with the reason.
     * @param websocket - Socket.io websocket, over which the data will be sent.
     * @param {string} reason - What will be displayed to the user.
     */
    static requestFailed(websocket, reason) {
        websocket.emit(Events.REQUEST_FAILED, reason);
    }

    /**
     * @desc Sends request not allowed message, when feature has been disabled in config
     * @param websocket - Socket.io websocket, over which the data will be sent.
     */
    static requestNotAllowed(websocket) {
        websocket.emit(Events.REQUEST_FAILED, "Ta funkcja została wyłączona w configu");
    }
}

module.exports = SocketEvents;