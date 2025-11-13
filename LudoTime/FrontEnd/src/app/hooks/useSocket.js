import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:4001';

export function useSocket() {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Crear conexión
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        const socket = socketRef.current;

        // Eventos de conexión
        socket.on('connect', () => {
            console.log('Conectado al servidor Socket.IO');
            setIsConnected(true);
            setError(null);
        });

        socket.on('disconnect', (reason) => {
            console.log('Desconectado:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('Error de conexión:', err);
            setError(err.message);
        });

        // Limpiar al desmontar
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    return {
        socket: socketRef.current,
        isConnected,
        error
    };
}

// Ejemplo de uso en un componente de juego
export function useGameSocket(userId, userName) {
    const { socket, isConnected } = useSocket();
    const [roomId, setRoomId] = useState(null);
    const [opponents, setOpponents] = useState([]);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Escuchar cuando alguien se une
        socket.on('user-joined', (data) => {
            console.log('Usuario se unió:', data);
            setOpponents(prev => [...prev, data]);
        });

        // Escuchar cuando alguien sale
        socket.on('user-left', (data) => {
            console.log('Usuario salió:', data);
            setOpponents(prev => prev.filter(u => u.socketId !== data.socketId));
        });

        // Escuchar movimientos del oponente
        socket.on('opponent-move', (data) => {
            console.log('Movimiento del oponente:', data);
            // Actualizar el estado del juego
        });

        // Escuchar mensajes de chat
        socket.on('chat-message', (data) => {
            setMessages(prev => [...prev, data]);
        });

        // Escuchar rendición del oponente
        socket.on('opponent-surrendered', (data) => {
            console.log('Oponente se rindió:', data);
            // Mostrar mensaje de victoria
        });

        // Limpiar listeners
        return () => {
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('opponent-move');
            socket.off('chat-message');
            socket.off('opponent-surrendered');
        };
    }, [socket, isConnected]);

    // Funciones para emitir eventos
    const joinGame = (gameRoomId) => {
        if (socket && isConnected) {
            socket.emit('join-game', {
                userId,
                userName,
                roomId: gameRoomId
            });
            setRoomId(gameRoomId);
        }
    };

    const makeMove = (move, gameState) => {
        if (socket && isConnected && roomId) {
            socket.emit('game-move', {
                roomId,
                move,
                gameState
            });
        }
    };

    const sendMessage = (message) => {
        if (socket && isConnected && roomId) {
            socket.emit('chat-message', {
                roomId,
                message
            });
        }
    };

    const surrender = () => {
        if (socket && isConnected && roomId) {
            socket.emit('surrender', { roomId });
        }
    };

    const findMatch = (gameMode) => {
        if (socket && isConnected) {
            socket.emit('find-match', {
                userId,
                userName,
                gameMode
            });
        }
    };

    return {
        socket,
        isConnected,
        roomId,
        opponents,
        messages,
        joinGame,
        makeMove,
        sendMessage,
        surrender,
        findMatch
    };
}   