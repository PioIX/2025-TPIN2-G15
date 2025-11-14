'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Dices } from 'lucide-react';
import { io } from 'socket.io-client';
import styles from '@/app/styles/ludo.module.css';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

export default function LudoOnlinePage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const roomId = searchParams.get('room');
    const numPlayers = parseInt(searchParams.get('players')) || 4;
    const safeEnabled = searchParams.get('safe') !== 'false';

    const socketRef = useRef(null);
    const hasJoinedRef = useRef(false);
    const [isConnected, setIsConnected] = useState(false);
    const [userId] = useState('user-' + Math.random().toString(36).substr(2, 9));
    const [userName] = useState('Jugador ' + Math.floor(Math.random() * 1000));
    const [myPlayerId, setMyPlayerId] = useState(null);
    const [isPlayerAssigned, setIsPlayerAssigned] = useState(false); // NUEVO

    const [players] = useState(() => {
        const allPlayers = [
            { id: 0, color: 'green', name: 'Jugador 1', pieces: [0, 0, 0, 0] },
            { id: 1, color: 'yellow', name: 'Jugador 2', pieces: [0, 0, 0, 0] },
            { id: 2, color: 'blue', name: 'Jugador 3', pieces: [0, 0, 0, 0] },
            { id: 3, color: 'red', name: 'Jugador 4', pieces: [0, 0, 0, 0] }
        ];
        return allPlayers.slice(0, numPlayers);
    });

    const [gameState, setGameState] = useState(() => {
        const initialPositions = {};
        for (let i = 0; i < numPlayers; i++) {
            initialPositions[i] = [-1, -1, -1, -1];
        }
        return {
            currentPlayer: 0,
            diceValue: null,
            canRoll: true,
            piecePositions: initialPositions,
            selectedPiece: null,
            consecutiveSixes: 0,
            animatingPieces: {},
            capturedPieces: {}
        };
    });

    const mainPath = [
        { x: 1, y: 6 }, { x: 2, y: 6 }, { x: 3, y: 6 }, { x: 4, y: 6 }, { x: 5, y: 6 },
        { x: 6, y: 5 }, { x: 6, y: 4 }, { x: 6, y: 3 }, { x: 6, y: 2 }, { x: 6, y: 1 }, { x: 6, y: 0 },
        { x: 7, y: 0 }, { x: 8, y: 0 },
        { x: 8, y: 1 }, { x: 8, y: 2 }, { x: 8, y: 3 }, { x: 8, y: 4 }, { x: 8, y: 5 },
        { x: 9, y: 6 }, { x: 10, y: 6 }, { x: 11, y: 6 }, { x: 12, y: 6 }, { x: 13, y: 6 }, { x: 14, y: 6 },
        { x: 14, y: 7 }, { x: 14, y: 8 },
        { x: 13, y: 8 }, { x: 12, y: 8 }, { x: 11, y: 8 }, { x: 10, y: 8 }, { x: 9, y: 8 },
        { x: 8, y: 9 }, { x: 8, y: 10 }, { x: 8, y: 11 }, { x: 8, y: 12 }, { x: 8, y: 13 }, { x: 8, y: 14 },
        { x: 7, y: 14 }, { x: 6, y: 14 },
        { x: 6, y: 13 }, { x: 6, y: 12 }, { x: 6, y: 11 }, { x: 6, y: 10 }, { x: 6, y: 9 },
        { x: 5, y: 8 }, { x: 4, y: 8 }, { x: 3, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 8 }, { x: 0, y: 8 },
        { x: 0, y: 7 }, { x: 0, y: 6 }
    ];

    const finalPaths = {
        0: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }, { x: 6, y: 7 }],
        1: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }, { x: 7, y: 6 }],
        2: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }],
        3: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }, { x: 7, y: 8 }]
    };

    const startPositions = { 0: 0, 1: 13, 2: 26, 3: 39 };
    const safeSpots = safeEnabled ? [8, 21, 34, 47] : [];

    // Configuración de socket
    useEffect(() => {
        if (!roomId) {
            alert('No se especificó una sala');
            router.push('/home/play/online/classic');
            return;
        }

        console.log('🔌 Inicializando conexión socket...');
        
        socketRef.current = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
            timeout: 10000
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('✅ Conectado al servidor - Socket ID:', socket.id);
            setIsConnected(true);

            // ESPERAR 500ms antes de emitir join-game
            if (!hasJoinedRef.current) {
                setTimeout(() => {
                    console.log('📨 Enviando join-game a sala:', roomId);
                    hasJoinedRef.current = true;
                    
                    socket.emit('join-game', {
                        roomId,
                        userId,
                        userName
                    });
                }, 500);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('❌ Desconectado del servidor. Razón:', reason);
            setIsConnected(false);
            hasJoinedRef.current = false;
            setIsPlayerAssigned(false); // RESETEAR
        });

        socket.on('connect_error', (error) => {
            console.error('❌ Error de conexión:', error);
        });

        socket.on('game-state-update', (newState) => {
            console.log('🎮 Actualización de estado:', newState);
            setGameState(prev => ({
                ...prev,
                ...newState,
                animatingPieces: prev.animatingPieces,
                capturedPieces: prev.capturedPieces
            }));
        });

        socket.on('player-assignment', (data) => {
            console.log('👤 Asignación de jugador recibida:', data.playerId);
            setMyPlayerId(data.playerId);
            setIsPlayerAssigned(true); // MARCAR COMO ASIGNADO
            console.log('✅ myPlayerId actualizado a:', data.playerId);
        });

        socket.on('dice-rolled', (data) => {
            console.log('🎲 Dado lanzado:', data);
            setGameState(prev => ({
                ...prev,
                diceValue: data.value,
                canRoll: false,
                consecutiveSixes: data.consecutiveSixes
            }));
        });

        socket.on('piece-moved', async (data) => {
            console.log('♟️ Pieza movida:', data);
            await animateMovement(data.playerId, data.pieceIndex, data.from, data.to, data.steps);

            setGameState(prev => {
                const newPositions = { ...prev.piecePositions };
                newPositions[data.playerId] = [...newPositions[data.playerId]];
                newPositions[data.playerId][data.pieceIndex] = data.to;

                return {
                    ...prev,
                    piecePositions: newPositions,
                    animatingPieces: {}
                };
            });
        });

        socket.on('piece-captured', async (data) => {
            console.log('💥 Pieza capturada:', data);
            await animateCapture(data.capturedPlayerId, data.capturedPieceIndex);

            setGameState(prev => {
                const newPositions = { ...prev.piecePositions };
                newPositions[data.capturedPlayerId] = [...newPositions[data.capturedPlayerId]];
                newPositions[data.capturedPlayerId][data.capturedPieceIndex] = -1;

                return {
                    ...prev,
                    piecePositions: newPositions,
                    capturedPieces: {}
                };
            });
        });

        socket.on('turn-changed', (data) => {
            console.log('🔄 Cambio de turno:', data);
            setGameState(prev => {
                return {
                    ...prev,
                    currentPlayer: data.currentPlayer,
                    canRoll: true, // SIEMPRE PERMITIR RODAR CUANDO CAMBIA EL TURNO
                    diceValue: null,
                    selectedPiece: null,
                    consecutiveSixes: 0
                };
            });
        });

        socket.on('game-ended', (data) => {
            console.log('🏆 Juego terminado:', data);
            alert(`¡${data.winner} ha ganado el juego!`);
            setTimeout(() => {
                router.push('/home');
            }, 3000);
        });

        socket.on('player-disconnected', (data) => {
            console.log('👋 Jugador desconectado:', data);
            alert(`${data.playerName} se ha desconectado del juego`);
        });

        socket.on('error', (error) => {
            console.error('❌ Error del servidor:', error);
            alert(error.message || 'Error desconocido');
        });

        return () => {
            console.log('🧹 Limpiando conexión socket...');
            if (socket) {
                socket.emit('leave-game', { roomId });
                socket.disconnect();
                hasJoinedRef.current = false;
            }
        };
    }, [roomId]);

    // useEffect separado para el skip turn
    useEffect(() => {
        if (!gameState.diceValue || !isConnected || !isPlayerAssigned) return;
        if (gameState.currentPlayer !== myPlayerId) return;
        
        if (!hasValidMoves(gameState.currentPlayer)) {
            console.log('⏭️ Sin movimientos válidos, saltando turno...');
            const timer = setTimeout(() => {
                if (socketRef.current) {
                    socketRef.current.emit('skip-turn', {
                        roomId,
                        playerId: myPlayerId
                    });
                }
            }, 1500);
            
            return () => clearTimeout(timer);
        }
    }, [gameState.diceValue, gameState.currentPlayer, isPlayerAssigned]);

    const rollDice = () => {
        console.log('🎲 Intentando tirar dado:', {
            canRoll: gameState.canRoll,
            currentPlayer: gameState.currentPlayer,
            myPlayerId: myPlayerId,
            isConnected: isConnected,
            isPlayerAssigned: isPlayerAssigned
        });

        if (!isPlayerAssigned) {
            console.error('❌ Jugador aún no asignado');
            return;
        }

        if (!gameState.canRoll || gameState.currentPlayer !== myPlayerId || !isConnected) {
            console.error('❌ No se puede tirar el dado');
            return;
        }

        console.log('✅ Tirando dado...');
        socketRef.current.emit('roll-dice', {
            roomId,
            playerId: myPlayerId
        });
    };

    const canMovePiece = (playerId, pieceIndex) => {
        const position = gameState.piecePositions[playerId][pieceIndex];
        const dice = gameState.diceValue;

        if (position === -1) return dice === 6;

        if (position >= 52) {
            const finalPos = position - 52;
            return finalPos + dice <= 6;
        }

        return true;
    };

    const hasValidMoves = (playerId) => {
        const positions = gameState.piecePositions[playerId];
        return positions.some((pos, idx) => canMovePiece(playerId, idx));
    };

    const movePiece = async (pieceIndex) => {
        const playerId = gameState.currentPlayer;

        if (playerId !== myPlayerId || !canMovePiece(playerId, pieceIndex) || !isConnected) {
            return;
        }

        const currentPos = gameState.piecePositions[playerId][pieceIndex];
        const dice = gameState.diceValue;

        let newPos;
        if (currentPos === -1) {
            newPos = startPositions[playerId];
        } else if (currentPos >= 52) {
            newPos = currentPos + dice;
            if (newPos > 57) {
                newPos = 58;
            }
        } else {
            const startPos = startPositions[playerId];
            let tempPos = currentPos + dice;

            let shouldEnterHome = false;
            let stepsIntoHome = 0;

            for (let step = 1; step <= dice; step++) {
                let checkPos = (currentPos + step) % 52;

                if (currentPos >= startPos && checkPos < currentPos) {
                    let actualStep = currentPos + step;
                    if (actualStep >= startPos + 52) {
                        shouldEnterHome = true;
                        stepsIntoHome = actualStep - (startPos + 51);
                        break;
                    }
                }
            }

            if (shouldEnterHome && stepsIntoHome > 0) {
                newPos = 52 + stepsIntoHome - 1;
                if (newPos > 57) {
                    newPos = 58;
                }
            } else {
                newPos = tempPos % 52;
            }
        }

        socketRef.current.emit('move-piece', {
            roomId,
            playerId,
            pieceIndex,
            from: currentPos,
            to: newPos,
            steps: dice
        });
    };

    const animateMovement = async (playerId, pieceIndex, startPos, endPos, steps) => {
        const delay = 200;

        if (startPos === -1) {
            setGameState(prev => {
                const newPositions = { ...prev.piecePositions };
                newPositions[playerId] = [...newPositions[playerId]];
                newPositions[playerId][pieceIndex] = endPos;
                return {
                    ...prev,
                    piecePositions: newPositions,
                    animatingPieces: { [`${playerId}-${pieceIndex}`]: true }
                };
            });
            await sleep(delay);
            return;
        }

        for (let step = 1; step <= steps; step++) {
            let currentStepPos;

            if (startPos >= 52) {
                currentStepPos = startPos + step;
            } else {
                currentStepPos = (startPos + step) % 52;

                if (endPos >= 52 && currentStepPos === 0) {
                    currentStepPos = 52 + (step - (52 - startPos));
                }
            }

            setGameState(prev => {
                const newPositions = { ...prev.piecePositions };
                newPositions[playerId] = [...newPositions[playerId]];
                newPositions[playerId][pieceIndex] = currentStepPos;
                return {
                    ...prev,
                    piecePositions: newPositions,
                    animatingPieces: { [`${playerId}-${pieceIndex}`]: true }
                };
            });
            await sleep(delay);
        }
    };

    const animateCapture = async (playerId, pieceIndex) => {
        setGameState(prev => ({
            ...prev,
            capturedPieces: { [`${playerId}-${pieceIndex}`]: true }
        }));
        await sleep(500);
        setGameState(prev => ({
            ...prev,
            capturedPieces: {}
        }));
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    const getCellStyle = (x, y) => {
        if (x < 6 && y < 6) return styles.cellGreen;
        if (x > 8 && y < 6) return styles.cellYellow;
        if (x > 8 && y > 8) return styles.cellBlue;
        if (x < 6 && y > 8) return styles.cellRed;

        if (x >= 6 && x <= 8 && y >= 6 && y <= 8) {
            if (x === 6 && y === 6) return styles.cellGreen;
            if (x === 7 && y === 6) return styles.cellGreen;
            if (x === 6 && y === 7) return styles.cellGreen;
            if (x === 8 && y === 6) return styles.cellYellow;
            if (x === 8 && y === 7) return styles.cellYellow;
            if (x === 8 && y === 8) return styles.cellBlue;
            if (x === 7 && y === 8) return styles.cellBlue;
            if (x === 6 && y === 8) return styles.cellRed;
            if (x === 7 && y === 7) return styles.cellWhite;
        }

        if (x === 1 && y === 6) return styles.cellGreenStart;
        if (x === 8 && y === 1) return styles.cellYellowStart;
        if (x === 13 && y === 8) return styles.cellBlueStart;
        if (x === 6 && y === 13) return styles.cellRedStart;

        return styles.cellWhite;
    };

    const renderBoard = () => {
        const cells = [];

        for (let y = 0; y < 15; y++) {
            for (let x = 0; x < 15; x++) {
                let cellClass = `${styles.cell} ${getCellStyle(x, y)}`;
                let content = null;

                const isInGreenHome = (x >= 1 && x <= 4 && y >= 1 && y <= 4);
                const isInYellowHome = (x >= 10 && x <= 13 && y >= 1 && y <= 4);
                const isInBlueHome = (x >= 10 && x <= 13 && y >= 10 && y <= 13);
                const isInRedHome = (x >= 1 && x <= 4 && y >= 10 && y <= 13);

                if (isInGreenHome || isInYellowHome || isInBlueHome || isInRedHome) {
                    cellClass = `${styles.cell} ${styles.cellWhite}`;

                    const homeSpots = {
                        green: [[2, 2], [3, 2], [2, 3], [3, 3]],
                        yellow: [[11, 2], [12, 2], [11, 3], [12, 3]],
                        blue: [[11, 11], [12, 11], [11, 12], [12, 12]],
                        red: [[2, 11], [3, 11], [2, 12], [3, 12]]
                    };

                    let playerHome = null;
                    let spotIndex = -1;

                    if (isInGreenHome) {
                        playerHome = 0;
                        spotIndex = homeSpots.green.findIndex(([sx, sy]) => sx === x && sy === y);
                    } else if (isInYellowHome) {
                        playerHome = 1;
                        spotIndex = homeSpots.yellow.findIndex(([sx, sy]) => sx === x && sy === y);
                    } else if (isInBlueHome) {
                        playerHome = 2;
                        spotIndex = homeSpots.blue.findIndex(([sx, sy]) => sx === x && sy === y);
                    } else if (isInRedHome) {
                        playerHome = 3;
                        spotIndex = homeSpots.red.findIndex(([sx, sy]) => sx === x && sy === y);
                    }

                    if (spotIndex !== -1 && playerHome !== null) {
                        if (playerHome < numPlayers) {
                            const piecePos = gameState.piecePositions[playerHome]?.[spotIndex];
                            if (piecePos === -1) {
                                const pieceColorClass = [
                                    styles.pieceGreen,
                                    styles.pieceYellow,
                                    styles.pieceBlue,
                                    styles.pieceRed
                                ][playerHome];

                                const canMove = gameState.currentPlayer === playerHome &&
                                            gameState.currentPlayer === myPlayerId &&
                                            canMovePiece(playerHome, spotIndex) &&
                                            gameState.diceValue !== null;
                                const sizeClass = canMove ? styles.pieceLarge : styles.pieceMedium;

                                content = (
                                    <div
                                        onClick={() => canMove && movePiece(spotIndex)}
                                        className={`${styles.piece} ${sizeClass} ${pieceColorClass}`}
                                        style={{ cursor: canMove ? 'pointer' : 'default' }}
                                    ></div>
                                );
                            }
                        } else {
                            const pieceColorClass = [
                                styles.pieceGreen,
                                styles.pieceYellow,
                                styles.pieceBlue,
                                styles.pieceRed
                            ][playerHome];

                            content = (
                                <div
                                    className={`${styles.piece} ${styles.pieceMedium} ${pieceColorClass}`}
                                    style={{ cursor: 'default', opacity: 0.5 }}
                                ></div>
                            );
                        }
                    }
                }

                mainPath.forEach((pos, idx) => {
                    if (pos.x === x && pos.y === y) {
                        if (safeEnabled && safeSpots.includes(idx)) {
                            content = <div className={styles.star}>★</div>;
                        }

                        Object.keys(gameState.piecePositions).forEach(playerId => {
                            const pid = parseInt(playerId);
                            if (pid < numPlayers) {
                                gameState.piecePositions[playerId].forEach((piecePos, pieceIdx) => {
                                    if (piecePos === idx) {
                                        const pieceColorClass = [
                                            styles.pieceGreen,
                                            styles.pieceYellow,
                                            styles.pieceBlue,
                                            styles.pieceRed
                                        ][playerId];

                                        const canMove = gameState.currentPlayer == playerId &&
                                                       gameState.currentPlayer === myPlayerId &&
                                                       canMovePiece(playerId, pieceIdx) &&
                                                       gameState.diceValue !== null;
                                        const sizeClass = canMove ? styles.pieceLarge : styles.pieceMedium;

                                        const isAnimating = gameState.animatingPieces[`${playerId}-${pieceIdx}`];
                                        const isCaptured = gameState.capturedPieces[`${playerId}-${pieceIdx}`];
                                        const animClass = isCaptured ? styles.pieceCaptured : (isAnimating ? styles.pieceMoving : '');

                                        content = (
                                            <div
                                                onClick={() => canMove && movePiece(pieceIdx)}
                                                className={`${styles.piece} ${sizeClass} ${pieceColorClass} ${animClass}`}
                                                style={{ cursor: canMove ? 'pointer' : 'default' }}
                                            ></div>
                                        );
                                    }
                                });
                            }
                        });
                    }
                });

                Object.keys(finalPaths).forEach(playerId => {
                    const pid = parseInt(playerId);
                    finalPaths[playerId].forEach((pos, idx) => {
                        if (pos.x === x && pos.y === y) {
                            const pathColorClass = [
                                styles.cellGreenPath,
                                styles.cellYellowPath,
                                styles.cellBluePath,
                                styles.cellRedPath
                            ][playerId];
                            cellClass = `${styles.cell} ${pathColorClass}`;

                            if (pid < numPlayers) {
                                gameState.piecePositions[playerId]?.forEach((piecePos, pieceIdx) => {
                                    if (piecePos === 52 + idx) {
                                        const pieceColorClass = [
                                            styles.pieceGreen,
                                            styles.pieceYellow,
                                            styles.pieceBlue,
                                            styles.pieceRed
                                        ][playerId];

                                        const canMove = gameState.currentPlayer == playerId &&
                                                       gameState.currentPlayer === myPlayerId &&
                                                       canMovePiece(playerId, pieceIdx) &&
                                                       gameState.diceValue !== null;
                                        const sizeClass = canMove ? styles.pieceLarge : styles.pieceMedium;

                                        const isAnimating = gameState.animatingPieces[`${playerId}-${pieceIdx}`];
                                        const animClass = isAnimating ? styles.pieceMoving : '';

                                        content = (
                                            <div
                                                onClick={() => canMove && movePiece(pieceIdx)}
                                                className={`${styles.piece} ${sizeClass} ${pieceColorClass} ${animClass}`}
                                                style={{ cursor: canMove ? 'pointer' : 'default' }}
                                            ></div>
                                        );
                                    }
                                });
                            }
                        }
                    });
                });

                if (x === 0 && y === 7) content = <span className={`${styles.arrow} ${styles.arrowGreen}`}>→</span>;
                if (x === 7 && y === 0) content = <span className={`${styles.arrow} ${styles.arrowYellow}`}>↓</span>;
                if (x === 14 && y === 7) content = <span className={`${styles.arrow} ${styles.arrowBlue}`}>←</span>;
                if (x === 7 && y === 14) content = <span className={`${styles.arrow} ${styles.arrowRed}`}>↑</span>;

                cells.push(
                    <div key={`${x}-${y}`} className={cellClass}>
                        {content}
                    </div>
                );
            }
        }
        return cells;
    };

    // CONDICIÓN MEJORADA PARA EL BOTÓN
    const isMyTurn = isPlayerAssigned && myPlayerId !== null && gameState.currentPlayer === myPlayerId;
    const canRollDice = isMyTurn && gameState.canRoll && isConnected;

    return (
        <div className={styles.container}>
            <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                fontSize: '12px',
                color: isConnected ? '#4ade80' : '#f87171',
                background: 'rgba(0,0,0,0.7)',
                padding: '8px 12px',
                borderRadius: '8px',
                zIndex: 1000
            }}>
                {isConnected ? '🟢 Conectado' : '🔴 Desconectado'}
            </div>

            {roomId && (
                <div style={{
                    position: 'absolute',
                    top: '50px',
                    right: '10px',
                    fontSize: '12px',
                    color: '#888',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    zIndex: 1000
                }}>
                    Sala: <strong>{roomId.substring(5, 11).toUpperCase()}</strong>
                </div>
            )}

            {/* INDICADOR DE DEBUG */}
            {myPlayerId !== null && (
                <div style={{
                    position: 'absolute',
                    top: '90px',
                    right: '10px',
                    fontSize: '11px',
                    color: '#4ade80',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    zIndex: 1000
                }}>
                    Tu ID: {myPlayerId} | Turno: {gameState.currentPlayer}
                </div>
            )}

            <div className={styles.playersContainer}>
                <div className={styles.leftPlayers}>
                    {numPlayers >= 1 && (
                        <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 0 ? styles.active : ''}`}
                            style={{ borderColor: gameState.currentPlayer === 0 ? '#15803d' : 'transparent' }}>
                            <div className={`${styles.playerColorDot} ${styles.green}`}></div>
                            <div className={styles.playerName}>
                                Jugador 1 {myPlayerId === 0 && '(Tú)'}
                            </div>
                            <div className={styles.playerPieces}>
                                {gameState.piecePositions[0]?.filter(pos => pos !== -1).length || 0} pieza/s afuera
                            </div>
                            {gameState.currentPlayer === 0 && (
                                <div className={styles.playerTurnLabel}>Su turno!</div>
                            )}
                        </div>
                    )}
                    {numPlayers >= 4 && (
                        <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 3 ? styles.active : ''}`}
                             style={{ borderColor: gameState.currentPlayer === 3 ? '#990906' : 'transparent' }}>
                            <div className={`${styles.playerColorDot} ${styles.red}`}></div>
                            <div className={styles.playerName}>
                                Jugador 4 {myPlayerId === 3 && '(Tú)'}
                            </div>
                            <div className={styles.playerPieces}>
                                {gameState.piecePositions[3]?.filter(pos => pos !== -1).length || 0} pieza/s afuera
                            </div>
                            {gameState.currentPlayer === 3 && (
                                <div className={styles.playerTurnLabel}>Su turno!</div>
                            )}
                        </div>
                    )}
                </div>

                <div className={styles.boardContainer}>{renderBoard()}</div>

                <div className={styles.rightPlayers}>
                    {numPlayers >= 2 && (
                        <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 1 ? styles.active : ''}`}
                             style={{ borderColor: gameState.currentPlayer === 1 ? '#cc9f02' : 'transparent' }}>
                            <div className={`${styles.playerColorDot} ${styles.yellow}`}></div>
                            <div className={styles.playerName}>
                                Jugador 2 {myPlayerId === 1 && '(Tú)'}
                            </div>
                            <div className={styles.playerPieces}>
                                {gameState.piecePositions[1]?.filter(pos => pos !== -1).length || 0} pieza/s afuera
                            </div>
                            {gameState.currentPlayer === 1 && (
                                <div className={styles.playerTurnLabel}>Su turno!</div>
                            )}
                        </div>
                    )}
                    {numPlayers >= 3 && (
                        <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 2 ? styles.active : ''}`}
                             style={{ borderColor: gameState.currentPlayer === 2 ? '#1d4ed8' : 'transparent' }}>
                            <div className={`${styles.playerColorDot} ${styles.blue}`}></div>
                            <div className={styles.playerName}>
                                Jugador 3 {myPlayerId === 2 && '(Tú)'}
                            </div>
                            <div className={styles.playerPieces}>
                                {gameState.piecePositions[2]?.filter(pos => pos !== -1).length || 0} pieza/s afuera
                            </div>
                            {gameState.currentPlayer === 2 && (
                                <div className={styles.playerTurnLabel}>Su turno!</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.diceContainer}>
                <button
                    onClick={rollDice}
                    disabled={!canRollDice}
                    className={`${styles.diceButton} ${
                        canRollDice
                            ? styles.diceButtonActive
                            : styles.diceButtonDisabled
                    }`}
                >
                    <Dices size={36} />
                    {gameState.diceValue || 'Tirar'}
                </button>
                <div style={{ marginTop: '10px', fontSize: '14px', textAlign: 'center', color: '#fff' }}>
                    {!isPlayerAssigned ? (
                        'Conectando...'
                    ) : !isMyTurn ? (
                        'Espera tu turno'
                    ) : gameState.diceValue ? (
                        'Mueve una pieza'
                    ) : (
                        '¡Es tu turno! Tira el dado'
                    )}
                </div>
            </div>

            <div className={styles.rulesContainer}>
                <p className={styles.rulesTitle}>Reglas:</p>
                <p className={styles.rulesText}>• Saca 6 para salir de la base</p>
                {safeEnabled && <p className={styles.rulesText}>• Las estrellas (★) son casillas seguras</p>}
                <p className={styles.rulesText}>• Si sacas 6 o comes una ficha, tiras de nuevo</p>
                <p className={styles.rulesText}>• Tres 6 seguidos = pierdes el turno</p>
                <p className={styles.rulesText}>• Jugadores: {numPlayers}</p>
                <p className={styles.rulesText}>• Modo: <strong>Online</strong></p>
            </div>
        </div>
    );
}