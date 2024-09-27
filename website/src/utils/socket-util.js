import { io } from "socket.io-client";
import {Events} from "@server-lib/globals.js";

export const socket = io();

export const initSocket = (setData) => {
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

export const requestData = () => {
    socket.emit(Events.STATUS_REQUEST);
};

export default socket;