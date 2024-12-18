let {gameCards, allUsersGameCards} = require("@server-lib/globals.js");

class GameCardList {
    static addGameCard(gameCard) {
        gameCards.push(gameCard);
    }

    static removeGameCard(gameCard) {
        gameCards = gameCards.filter(el => el.name !== gameCard.name)
    }

    static updateUsersList(user, cardList) {
        allUsersGameCards[user] = cardList;
        console.log(allUsersGameCards[user]);
    }
}

module.exports = GameCardList;