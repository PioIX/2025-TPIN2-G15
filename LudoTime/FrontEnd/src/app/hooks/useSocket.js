"use client";

import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export function useGameSocket(userId, userName, onGameStart) {
    const socketRef = useRef(null);
    const [isConnected, setIsConnected] = useState(false);
    const [roomId, setRoomId] = useState(null);
    const [players, setPlayers] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Crear conexión solo una vez
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        const socket = socketRef.current;

        // Eventos de conexión
        socket.on('connect', () => {
            console.log('✅ Conectado al servidor');
            setIsConnected(true);
            setError(null);
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Desconectado:', reason);
            setIsConnected(false);
        });

        socket.on('connect_error', (err) => {
            console.error('⚠️ Error de conexión:', err);
            setError(err.message);
        });

        // Eventos del juego
        socket.on('room-created', (data) => {
            console.log('🎮 Sala creada:', data);
            setRoomId(data.roomId);
            setPlayers(data.players);
        });

        socket.on('player-joined', (data) => {
            console.log('👤 Jugador se unió:', data);
            setPlayers(data.players);
        });

        socket.on('player-left', (data) => {
            console.log('👋 Jugador salió:', data);
            setPlayers(data.players);
        });

        socket.on('game-start', (data) => {
            console.log('🎲 Juego iniciado:', data);
            // Llamar callback para redirigir
            if (onGameStart) {
                onGameStart(data);
            }
        });

        socket.on('error', (data) => {
            console.error('❌ Error del servidor:', data);
            setError(data.message);
            alert('Error: ' + data.message);
        });

        // Limpiar al desmontar
        return () => {
            if (socket) {
                socket.disconnect();
            }
        };
    }, []);

    // Funciones para emitir eventos
    const createRoom = (gameMode) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit('create-room', {
                userId,
                userName,
                gameMode,
                maxPlayers: 4
            });
        }
    };

    const joinRoom = (roomCode) => {
        console.log('🔍 Intentando unirse a sala:', roomCode);
        console.log('Estado conexión:', isConnected);
        console.log('Socket existe:', !!socketRef.current);

        if (socketRef.current && isConnected) {
            console.log('✅ Emitiendo join-room con:', { userId, userName, roomId: roomCode });
            socketRef.current.emit('join-room', {
                userId,
                userName,
                roomId: roomCode
            });
        } else {
            console.error('❌ No se puede unir: socket no conectado');
            alert('No estás conectado al servidor. Espera un momento y vuelve a intentar.');
        }
    };

    const leaveRoom = () => {
        if (socketRef.current && isConnected && roomId) {
            socketRef.current.emit('leave-room', { roomId });
            setRoomId(null);
            setPlayers([]);
        }
    };

    const startGame = () => {
        if (socketRef.current && isConnected && roomId) {
            socketRef.current.emit('start-game', { roomId });
        }
    };

    const invitePlayers = () => {
        // Copiar link o código de la sala
        if (roomId) {
            const inviteLink = `${window.location.origin}/lobby/${roomId}`;
            navigator.clipboard.writeText(inviteLink);
            return inviteLink;
        }
    };

    return {
        socket: socketRef.current,
        isConnected,
        error,
        roomId,
        players,
        createRoom,
        joinRoom,
        leaveRoom,
        startGame,
        invitePlayers
    };
}