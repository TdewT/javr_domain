import { io } from "socket.io-client";
import { events } from "@server-lib/globals.js";

export const socket = io();

export const initSocket = (setData) => {
    socket.on(events.STATUS_RESPONSE, (data) => {
        setData(data);
    });

    socket.on(events.REQUEST_FAILED, (err) => {
        alert('Error: ' + err);
    });

    socket.on(events.INFO, (info) => {
        alert(info);
    });

    return () => {
        socket.disconnect();
    };
};

export const requestData = () => {
    socket.emit(events.STATUS_REQUEST);
};

export default socket;