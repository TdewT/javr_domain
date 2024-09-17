// hooks/useSocket.js
import { useState, useEffect } from 'react';
import io from 'socket.io-client';

export const useSocket = () => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const socketIo = io(process.env.NEXT_PUBLIC_API_URL, {
            transports: ['websocket'],
        });

        setSocket(socketIo);

        return () => {
            socketIo.disconnect();
        };
    }, []);

    return socket;
};