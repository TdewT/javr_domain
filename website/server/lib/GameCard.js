const IDGenerator = require("@server-lib/IDGenerator.js");

class GameCard {

    constructor({name, optimalPlayers, maxPlayers, minPlayers, icon}) {
        this.id = IDGenerator.getID();
        this.name = name;
        this.optimalPlayers = optimalPlayers;
        this.maxPlayers = maxPlayers;
        this.minPlayers = minPlayers;
        this.icon = icon;
    }
}

module.exports = GameCard;