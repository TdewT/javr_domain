import {io} from "socket.io-client";
import {Events} from "@server-lib/globals.js";

export const socket = io();

export const initServicesSocket = (setData) => {
    socket.on(Events.STATUS_RESPONSE, (data) => {
        setData(data);
    });

    socket.on(Events.REQUEST_FAILED, (err) => {
        alert('Error: ' + err);
    });

    socket.on(Events.INFO, (info) => {
        alert(info);
    });

    return () => {
        socket.disconnect();
    };
};

export const initGamePickerSocket = (setGameCards, setResults) => {
    socket.on(Events.GAME_CARDS_RESPONSE, (gameCards) => {
        setGameCards(gameCards);
    });

    socket.on(Events.GAME_CARDS_RESULTS, (results) => {
        setResults(results);
    });

    socket.on(Events.REQUEST_FAILED, (err) => {
        alert('Error: ' + err);
    });

    socket.on(Events.INFO, (info) => {
        alert(info);
    });

    return () => {
        socket.disconnect();
    };
};

export const innitZTSocket = (setData, setError) => {

    socket.on(Events.ZT_RESPONSE, (data) => {
        setData(data)
    });

    socket.on(Events.ZT_REQUEST_FAILED, (err) => {
        setError('Error: ' + err);
    });

    socket.on(Events.REQUEST_FAILED, (err) => {
        alert('Error: ' + err);
    });

    socket.on(Events.INFO, (info) => {
        alert(info);
    });

    return () => {
        socket.disconnect();
    };

};

// Services
export const requestServicesData = () => {
    socket.emit(Events.STATUS_REQUEST);
};

// ZeroTier
export const requestZTData = () => {
    socket.emit(Events.ZT_REQUEST);
};

// Game Picker
export const sendGameCardsUpdate = ({markedForDelete, changedCards, newCards}) => {
    socket.emit(Events.GAME_CARDS_UPDATE, {markedForDelete, changedCards, newCards});
};
export const requestGameCardsData = () => {
    socket.emit(Events.GAME_CARDS_REQUEST);
};
export const requestUsersGameCardsData = () => {
    socket.emit(Events.USERS_GAME_CARDS_REQUEST);
};

export default socket;