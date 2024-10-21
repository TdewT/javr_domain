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
}

module.exports = SocketEvents;