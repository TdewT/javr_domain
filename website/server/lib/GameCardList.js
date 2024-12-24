let {allUsersGameCards, setGameCards, getGameCards} = require("@server-lib/globals.js");
const GameCard = require("@server-lib/GameCard.js");
const SocketEvents = require("@server-lib/SocketEvents.cjs");

class GameCardList {
    static addGameCard(card) {
        const gameCards = getGameCards();
        gameCards.push(new GameCard(card));
        SocketEvents.gameCardsResponse();
    }

    static removeGameCard(card) {
        setGameCards(getGameCards().filter(item => item.id !== card.id))
        SocketEvents.gameCardsResponse();
    }

    static updateGameCard(card){
        const cardIndex = getGameCards().findIndex(item => item.id === card.id);
        if (cardIndex !== -1){
            getGameCards()[cardIndex] = card;
        }
        SocketEvents.gameCardsResponse();
    }

    static updateUsersList(user, cardList) {
        allUsersGameCards[user] = cardList;
    }
}

module.exports = GameCardList;