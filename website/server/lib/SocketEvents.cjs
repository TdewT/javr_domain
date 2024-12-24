const {
    Events,
    serverList,
    arduinoBoards,
    getWebsiteIO,
    allUsersGameCards, getGameCards
} = require("@server-lib/globals.js");
const ServerManagerList = require("@server-lib/ServerManagerList.cjs");
const DiscordBotList = require("@server-lib/DiscordBotList.cjs");

class SocketEvents {

    //
    // Global
    //

    /**
     * @desc Sends response with information to client.
     * @param websocket - Socket. io websocket, over which the data will be sent.
     * @param {string} info - What will be displayed to the user.
     */
    static info(websocket, info) {
        websocket.emit(Events.INFO, info);
    }

    /**
     * @desc Sends request failed with reason why it did
     * @param websocket - Socket. io websocket, over which the data will be sent.
     * @param {string} reason - What will be displayed to the user.
     */
    static requestFailed(websocket, reason) {
        websocket.emit(Events.REQUEST_FAILED, reason);
    }

    static requestNotAllowed(websocket) {
        websocket.emit(Events.REQUEST_FAILED, "Ta funkcja została wyłączona w configu");
    }


    //
    // Services
    //

    /**
     * @desc Sends status response with all servers over given websocket.
     * @param websocket - Socket.io websocket, over which the data will be sent.
     */
    static statusResponse(websocket = getWebsiteIO()) {
        if (websocket) {
            let data = {
                servers: serverList,
                discordBots: DiscordBotList.getStatuses(),
                serverManagers: ServerManagerList.getStatuses(),
                arduinoBoards: arduinoBoards,
            };
            websocket.emit(Events.STATUS_RESPONSE, data);
        }
    }

    /**
     * @desc Sends status request on provided websocket
     * @param websocket - Socket. io websocket, over which the request will be sent.
     */
    static statusRequest(websocket) {
        websocket.emit(Events.STATUS_REQUEST);
    }

    /**
     * @desc Sends a request to start a server to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param serverID - HtmlID of the server.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static startServerRequest(websocket, serverID, clientSocketID) {
        websocket.emit(Events.START_SERVER_REQUEST, serverID, clientSocketID);
    }

    /**
     * @desc Sends a request to stop a server to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param serverID - HtmlID of the server.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static stopServerRequest(websocket, serverID, clientSocketID) {
        websocket.emit(Events.STOP_SERVER_REQUEST, serverID, clientSocketID);
    }

    /**
     * @desc Sends a request to start a Discord bot to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param botID - HtmlID of the bot.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static startDBotRequest(websocket, botID, clientSocketID) {
        websocket.emit(Events.START_DBOT_REQUEST, botID, clientSocketID);
    }

    /**
     * @desc Sends a request to stop a Discord bot to provided server manager's socket.
     * @param websocket - Socket. io websocket, over which the request will be sent.
     * @param botID - HtmlID of the bot.
     * @param clientSocketID - ID of the socket of the user who sent the request.
     */
    static stopDBotRequest(websocket, botID, clientSocketID) {
        websocket.emit(Events.STOP_DBOT_REQUEST, botID, clientSocketID);
    }


    //
    // ZeroTier
    //

    /**
     * @desc Sends ZeroTier data to client.
     * @param websocket - Socket. io websocket, over which the data will be sent.
     * @param {JSON} data - data from ZeroTier's API.
     */
    static ztResponse(websocket = getWebsiteIO(), data) {
        websocket.emit(Events.ZT_RESPONSE, data);
    }

    /**
     * @desc Sends code and error message to client.
     * @param {*} [websocket=getWebsiteIO()] - Socket. io websocket, over which the data will be sent. Default is default websocket.
     * @param error - error message from ZeroTier's API.
     */
    static ztErrorResponse(websocket = getWebsiteIO(), error) {
        websocket.emit(Events.ZT_REQUEST_FAILED, error);
    }


    //
    // Game-picker
    //

    /**
     * @desc Sends response with a list of all available game cards.
     * @param webSocket - Socket.io websocket, over which the data will be sent.
     */
    static gameCardsResponse(webSocket = getWebsiteIO()) {
        if (webSocket) {
            const gameCards = getGameCards();
            webSocket.emit(Events.GAME_CARDS_RESPONSE, gameCards)
        }
    }

    /**
     * @desc Sends response with an object containing game card choices of all participating users.
     * @param webSocket - Socket.io websocket, over which the data will be sent.
     */
    static usersGameCardsResponse(webSocket = getWebsiteIO()) {
        if (webSocket) {
            webSocket.emit(Events.USERS_GAME_CARDS_RESPONSE, allUsersGameCards)
        }
    }

    /**
     * @desc Sends response with specific user's choices.
     * @param webSocket - Socket.io websocket, over which the data will be sent.
     * @param {{string: [GameCard]}} gameCards - list of user's game cards.
     */
    static userGamesCardsResponse(webSocket = getWebsiteIO(), gameCards) {
        if (webSocket) {
            webSocket.emit(Events.USER_GAME_CARDS_RESPONSE)
        }
    }

}

module.exports = SocketEvents;