'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dices, Zap, RotateCcw, Shield, TrendingDown } from 'lucide-react';
import styles from '@/app/styles/time.module.css';
import { useRouter } from 'next/navigation';

const CARD_TYPES = [
    { id: 'minus5', name: '-5', description: 'Retrocede 5 casillas', icon: TrendingDown, color: '#f97316' },
    { id: 'minus10', name: '-10', description: 'Retrocede 10 casillas', icon: TrendingDown, color: '#dc2626' },
    { id: 'block', name: 'Bloqueo', description: 'Bloquea 1 turno', icon: Shield, color: '#8b5cf6' },
    { id: 'reverse', name: 'Reversa', description: 'Invierte el orden', icon: RotateCcw, color: '#0ea5e9' }
];

export default function LudoTimePage() {
    const searchParams = useSearchParams();
    
    const router = useRouter();
    const salirALocal = () => {
        router.push("../../local");
    };

    const numPlayers = parseInt(searchParams.get('players')) || 4;
    const safeEnabled = false; // En modo Time, las estrellas dan cartas
    
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
            capturedPieces: {},
            playerCards: Array(numPlayers).fill(null),
            blockedPlayers: Array(numPlayers).fill(false),
            lastMovedPiece: Array(numPlayers).fill(null),
            turnDirection: 1, // 1 = normal, -1 = reversa
            showCardSelection: false,
            pendingCard: null
        };
    });

    const [winner, setWinner] = useState(null);
    
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
    const cardSpots = [8, 21, 34, 47]; // Casillas que dan cartas

    const getRandomCard = () => {
        return CARD_TYPES[Math.floor(Math.random() * CARD_TYPES.length)];
    };

    // ========= NUEVO: calcula el recorrido completo de una jugada =========
    const getMovementPath = (playerId, startPos, dice) => {
        const path = [];

        // Desde la base (-1) sale a su casilla de salida
        if (startPos === -1) {
            const firstPos = startPositions[playerId];
            path.push(firstPos);
            return path;
        }

        // Ya está en el camino final (52–57)
        if (startPos >= 52) {
            let current = startPos;
            for (let step = 1; step <= dice; step++) {
                let next = current + 1;
                if (next > 57) {
                    // Llega/pasa la última casilla -> meta (58)
                    next = 58;
                    path.push(next);
                    break;
                }
                path.push(next);
                current = next;
            }
            return path;
        }

        // Está en el camino principal (0–51)
        const startPosPlayer = startPositions[playerId];
        const entryPos = (startPosPlayer + 51) % 52; // casilla justo antes de la salida de ese color

        let current = startPos;

        for (let step = 1; step <= dice; step++) {
            // Si estoy parado en la casilla de entrada al home, entro al camino final
            if (current === entryPos) {
                const stepsIntoFinal = dice - step + 1; // incluye este paso
                let currentFinal = 52;

                for (let i = 0; i < stepsIntoFinal; i++) {
                    if (currentFinal > 57) {
                        path.push(58);
                        return path;
                    }
                    path.push(currentFinal);
                    currentFinal++;
                }
                return path;
            }

            // Movimiento normal por el anillo
            current = (current + 1) % 52;
            path.push(current);
        }

        // Nunca entró al home en esta tirada, se queda en el anillo
        return path;
    };

    const useCard = (targetPlayerId) => {
        const card = gameState.playerCards[gameState.currentPlayer];
        if (!card) return;

        const newState = { ...gameState };

        switch (card.id) {
            case 'minus5':
            case 'minus10':
                const steps = card.id === 'minus5' ? 5 : 10;
                const lastPiece = newState.lastMovedPiece[targetPlayerId];
                if (lastPiece !== null) {
                    const currentPos = newState.piecePositions[targetPlayerId][lastPiece];
                    if (currentPos >= 0 && currentPos < 52) {
                        let newPos = currentPos - steps;
                        if (newPos < 0) newPos = 0;
                        newState.piecePositions[targetPlayerId][lastPiece] = newPos;
                    }
                }
                break;
            
            case 'block':
                newState.blockedPlayers[targetPlayerId] = true;
                break;
            
            case 'reverse':
                newState.turnDirection *= -1;
                break;
        }

        newState.playerCards[gameState.currentPlayer] = null;
        newState.showCardSelection = false;
        setGameState(newState);
    };

    const winInstantly = () => {
        const newPositions = { ...gameState.piecePositions };
        newPositions[gameState.currentPlayer] = [58, 58, 58, 58];

        setGameState(prev => ({
            ...prev,
            piecePositions: newPositions
        }));

        checkWinner(newPositions);
    };

    const rollDice = () => {
        if (!gameState.canRoll) return;

        // Verificar si el jugador está bloqueado
        if (gameState.blockedPlayers[gameState.currentPlayer]) {
            const newBlocked = [...gameState.blockedPlayers];
            newBlocked[gameState.currentPlayer] = false;
            setGameState(prev => ({
                ...prev,
                blockedPlayers: newBlocked
            }));
            setTimeout(() => nextTurn(), 1500);
            return;
        }

        const value = Math.floor(Math.random() * 6) + 1;
        const newConsecutiveSixes = value === 6 ? gameState.consecutiveSixes + 1 : 0;
        
        if (newConsecutiveSixes === 3) {
            setGameState(prev => ({
                ...prev,
                diceValue: value,
                canRoll: false,
                consecutiveSixes: 0
            }));
            setTimeout(() => nextTurn(), 1500);
            return;
        }
        
        setGameState(prev => ({
            ...prev,
            diceValue: value,
            canRoll: false,
            consecutiveSixes: newConsecutiveSixes,
            selectedPiece: null
        }));
    };
    
    const canMovePiece = (playerId, pieceIndex) => {
        const position = gameState.piecePositions[playerId][pieceIndex];
        const dice = gameState.diceValue;
        
        if (position === -1) return dice === 6 || dice === 1;
        
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

    const checkWinner = (positions) => { //recibe como parametro las posiciones de las fichas de cada jugador
        for (let playerId = 0; playerId < numPlayers; playerId++) { //recorre los jugadores
            const playerPositions = positions[playerId]; //agarra las posiciones del jugador actual
        
            if (playerPositions.every(pos => pos === 58)) { // si todas las fichas del jugador estan en la posicion 58 (meta) entonces gano
            
                // ACTUALIZAR ESTADISTICAS
                const storedStats = localStorage.getItem("ludoStats");
            
                // si existe lo convierte en objeto, sino crea un objeto con valores en 0
                let stats = storedStats 
                    ? JSON.parse(storedStats)
                    : {
                        gamesPlayed: 0,
                        wins: {
                            0: 0,
                            1: 0,
                            2: 0,
                            3: 0
                        }
                    };
                
                stats.gamesPlayed += 1; //es un acumulador que va sumando + 1 por partida jugada
                stats.wins[playerId] += 1; //es un acumulador que va sumando al jugador + 1 por victoria
                
                localStorage.setItem("ludoStats", JSON.stringify(stats)); // convierte el objeto en texto y lo guarda en el navegador
                
                setWinner(playerId); //actualiza el estado del juego
                return true; //si hubo ganador termino
            }
        }
    
        return false; // sino termino significa que no hubo ganador todavia
    };
    
    const movePiece = async (pieceIndex) => {
        const playerId = gameState.currentPlayer;
        if (!canMovePiece(playerId, pieceIndex)) return;
        
        const currentPos = gameState.piecePositions[playerId][pieceIndex];
        const dice = gameState.diceValue;
        
        setGameState(prev => ({ ...prev, canRoll: false }));
        
        // NUEVO: calculamos el recorrido completo y animamos en base a eso
        const movementPath = getMovementPath(playerId, currentPos, dice);
        const newPos = movementPath.length > 0
            ? movementPath[movementPath.length - 1]
            : currentPos;

        await animateMovement(playerId, pieceIndex, movementPath);
        
        const newPositions = { ...gameState.piecePositions };
        newPositions[playerId] = [...newPositions[playerId]];
        newPositions[playerId][pieceIndex] = newPos;
        
        // Actualizar última ficha movida
        const newLastMoved = [...gameState.lastMovedPiece];
        newLastMoved[playerId] = pieceIndex;
        
        let capturedPiece = false;
        if (newPos < 52 && ![0, 13, 26, 39].includes(newPos)) {
            for (let pid of Object.keys(newPositions)) {
                if (parseInt(pid) !== playerId && parseInt(pid) < numPlayers) {
                    for (let i = 0; i < newPositions[pid].length; i++) {
                        if (newPositions[pid][i] === newPos) {
                            capturedPiece = true;
                            await animateCapture(parseInt(pid), i);
                            newPositions[pid][i] = -1;
                        }
                    }
                }
            }
        }
        
        // Verificar si cayó en casilla de carta
        if (newPos < 52 && cardSpots.includes(newPos)) {
            const newCard = getRandomCard();
            const newCards = [...gameState.playerCards];
            newCards[playerId] = newCard;
            
            setGameState(prev => ({
                ...prev,
                piecePositions: newPositions,
                selectedPiece: null,
                animatingPieces: {},
                playerCards: newCards,
                lastMovedPiece: newLastMoved,
                pendingCard: newCard
            }));
            setTimeout(() => {
                setGameState(prev => ({ ...prev, pendingCard: null }));
            }, 2000);
        } else {
            setGameState(prev => ({
                ...prev,
                piecePositions: newPositions,
                selectedPiece: null,
                animatingPieces: {},
                lastMovedPiece: newLastMoved
            }));
        }
        
        if (checkWinner(newPositions)) {
            return;
        }
        
        if (dice === 6 || capturedPiece) {
            setGameState(prev => ({ ...prev, canRoll: true, diceValue: null }));
        } else {
            setTimeout(() => nextTurn(), 500);
        }
    };
    
    // ========= NUEVO: anima siguiendo una lista de posiciones =========
    const animateMovement = async (playerId, pieceIndex, path) => {
        const delay = 200;
        if (!path || path.length === 0) return;

        for (let stepPos of path) {
            setGameState(prev => {
                const newPositions = { ...prev.piecePositions };
                newPositions[playerId] = [...newPositions[playerId]];
                newPositions[playerId][pieceIndex] = stepPos;

                return {
                    ...prev,
                    piecePositions: newPositions,
                    animatingPieces: { [`${playerId}-${pieceIndex}`]: true }
                };
            });
            await sleep(delay);
        }
        // OJO: no limpiamos animatingPieces acá a propósito,
        // movePiece ya hace `animatingPieces: {}` como antes.
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
    
    const nextTurn = () => {
        let nextPlayer = gameState.currentPlayer + gameState.turnDirection;
        
        if (nextPlayer >= numPlayers) nextPlayer = 0;
        if (nextPlayer < 0) nextPlayer = numPlayers - 1;

        setGameState(prev => ({
            ...prev,
            currentPlayer: nextPlayer,
            canRoll: true,
            diceValue: null,
            selectedPiece: null,
            consecutiveSixes: 0
        }));
    };
    
    useEffect(() => {
        if (gameState.diceValue && !hasValidMoves(gameState.currentPlayer)) {
            setTimeout(() => nextTurn(), 1500);
        }
    }, [gameState.diceValue]);
    
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

                if (x === 0 && y === 7) content = <span className={`${styles.arrow} ${styles.arrowGreen}`}>→</span>;
                if (x === 7 && y === 0) content = <span className={`${styles.arrow} ${styles.arrowYellow}`}>↓</span>;
                if (x === 14 && y === 7) content = <span className={`${styles.arrow} ${styles.arrowBlue}`}>←</span>;
                if (x === 7 && y === 14) content = <span className={`${styles.arrow} ${styles.arrowRed}`}>↑</span>;

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
                    if (!content && cardSpots.includes(idx)) {
                        content = <div className={styles.cardIcon} style={{color: "rgba(37, 37, 37, 0.295)"}}><Zap size={20} /></div>;
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
                              canMovePiece(playerId, pieceIdx) &&
                              gameState.diceValue !== null;
                            const sizeClass = canMove ? styles.pieceLarge : styles.pieceMedium;
                        
                            // ...
                            const isAnimating = gameState.animatingPieces[`${playerId}-${pieceIdx}`];
                            const isCaptured = gameState.capturedPieces[`${playerId}-${pieceIdx}`];
                            const animClass = isCaptured ? styles.pieceCaptured : (isAnimating ? styles.pieceMoving : '');

                            // 👇 CAMBIO ACÁ
                            const isCurrentPlayer = gameState.currentPlayer == playerId;

                            if (!content || isCurrentPlayer) {
                              content = (
                                <div
                                  onClick={() => canMove && movePiece(pieceIdx)}
                                  className={`${styles.piece} ${sizeClass} ${pieceColorClass} ${animClass}`}
                                  style={{ cursor: canMove ? 'pointer' : 'default' }}
                                ></div>
                              );
                            }

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

                cells.push(
                    <div key={`${x}-${y}`} className={cellClass}>
                        {content}
                    </div>
                );
            }
        }
        return cells;
    };
    
    return (
        <div className={styles.container}>
            {/* Panel de carta del jugador actual */}
            <div className={styles.cardPanel}>
                <h3 className={styles.cardPanelTitle}>Tu carta:</h3>
                {gameState.playerCards[gameState.currentPlayer] ? (
                    <div className={styles.cardContainer}>
                        <div 
                            className={styles.card}
                            style={{ borderColor: gameState.playerCards[gameState.currentPlayer].color }}
                        >
                            {React.createElement(gameState.playerCards[gameState.currentPlayer].icon, { size: 32 })}
                            <div className={styles.cardName}>{gameState.playerCards[gameState.currentPlayer].name}</div>
                            <div className={styles.cardDesc}>{gameState.playerCards[gameState.currentPlayer].description}</div>
                        </div>
                        <button 
                            className={styles.useCardButton}
                            onClick={() => setGameState(prev => ({ ...prev, showCardSelection: true }))}
                        >
                            Usar carta
                        </button>
                    </div>
                ) : (
                    <div className={styles.noCard}>Sin carta</div>
                )}
            </div>

            <div className={styles.playersContainer}>
                <div className={styles.leftPlayers}>
                    {numPlayers >= 1 && (
                        <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 0 ? styles.active : ''} ${gameState.blockedPlayers[0] ? styles.blocked : ''}`}
                             style={{ borderColor: gameState.currentPlayer === 0 ? '#15803d' : 'transparent' }}>
                            <div className={`${styles.playerColorDot} ${styles.green}`}></div>
                            <div className={styles.playerName}>Jugador 1</div>
                            <div className={styles.playerPieces}>
                                {gameState.piecePositions[0]?.filter(pos => pos !== -1).length || 0} pieza/s afuera
                            </div>
                            {gameState.blockedPlayers[0] && (
                                <div className={styles.blockedLabel}>🚫 BLOQUEADO</div>
                            )}
                            {gameState.currentPlayer === 0 && !gameState.blockedPlayers[0] && (
                                <div className={styles.playerTurnLabel}>Su turno!</div>
                            )}
                        </div>
                    )}
                    {numPlayers >= 4 && (
                        <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 3 ? styles.active : ''} ${gameState.blockedPlayers[3] ? styles.blocked : ''}`}
                             style={{ borderColor: gameState.currentPlayer === 3 ? '#990906' : 'transparent' }}>
                            <div className={`${styles.playerColorDot} ${styles.red}`}></div>
                            <div className={styles.playerName}>Jugador 4</div>
                            <div className={styles.playerPieces}>
                                {gameState.piecePositions[3]?.filter(pos => pos !== -1).length || 0} pieza/s afuera
                            </div>
                            {gameState.blockedPlayers[3] && (
                                <div className={styles.blockedLabel}>🚫 BLOQUEADO</div>
                            )}
                            {gameState.currentPlayer === 3 && !gameState.blockedPlayers[3] && (
                                <div className={styles.playerTurnLabel}>Su turno!</div>
                            )}
                        </div>
                    )}
                </div>
                <div className={styles.boardContainer}>{renderBoard()}</div>
                <div className={styles.rightPlayers}>
                    {numPlayers >= 2 && (
                        <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 1 ? styles.active : ''} ${gameState.blockedPlayers[1] ? styles.blocked : ''}`}
                             style={{ borderColor: gameState.currentPlayer === 1 ? '#cc9f02' : 'transparent' }}>
                            <div className={`${styles.playerColorDot} ${styles.yellow}`}></div>
                            <div className={styles.playerName}>Jugador 2</div>
                            <div className={styles.playerPieces}>
                                {gameState.piecePositions[1]?.filter(pos => pos !== -1).length || 0} pieza/s afuera
                            </div>
                            {gameState.blockedPlayers[1] && (
                                <div className={styles.blockedLabel}>🚫 BLOQUEADO</div>
                            )}
                            {gameState.currentPlayer === 1 && !gameState.blockedPlayers[1] && (
                                <div className={styles.playerTurnLabel}>Su turno!</div>
                            )}
                        </div>
                    )}
                    {numPlayers >= 3 && (
                        <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 2 ? styles.active : ''} ${gameState.blockedPlayers[2] ? styles.blocked : ''}`}
                             style={{ borderColor: gameState.currentPlayer === 2 ? '#1d4ed8' : 'transparent' }}>
                            <div className={`${styles.playerColorDot} ${styles.blue}`}></div>
                            <div className={styles.playerName}>Jugador 3</div>
                            <div className={styles.playerPieces}>
                                {gameState.piecePositions[2]?.filter(pos => pos !== -1).length || 0} pieza/s afuera
                            </div>
                            {gameState.blockedPlayers[2] && (
                                <div className={styles.blockedLabel}>🚫 BLOQUEADO</div>
                            )}
                            {gameState.currentPlayer === 2 && !gameState.blockedPlayers[2] && (
                                <div className={styles.playerTurnLabel}>Su turno!</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            
            <div className={styles.diceContainer}>
                <button
                    onClick={rollDice}
                    disabled={!gameState.canRoll}
                    className={`${styles.diceButton} ${
                        gameState.canRoll ? styles.diceButtonActive : styles.diceButtonDisabled
                    }`}
                >
                    <Dices size={36} />
                    {gameState.diceValue || 'Tirar'}
                </button>

                <button
                    onClick={winInstantly}
                    className={styles.diceButton}
                    style={{
                        background: 'linear-gradient(to right, #ef4444, #dc2626)',
                        padding: '1rem 2rem',
                        fontSize: '1rem'
                    }}
                >
                    🏆 Victoria instantánea (TEST)
                </button>
            </div>
            
            

            <div className={styles.rulesContainer}>
                <p className={styles.rulesTitle}>Reglas Modo TIME:</p>
                <p className={styles.rulesText}>• Saca 6 para salir de la base</p>
                <p className={styles.rulesText}>• Las casillas ⚡ dan cartas especiales</p>
                <p className={styles.rulesText}>• Solo puedes tener 1 carta a la vez</p>
                <p className={styles.rulesText}>• Si sacas 6 o comes una ficha, tiras de nuevo</p>
                <p className={styles.rulesText}>• Tres 6 seguidos = pierdes el turno</p>
                <p className={styles.rulesText}>• Jugadores: {numPlayers}</p>
            </div>
            
            {/* Boton de skip turno por si algo sale mal */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                    onClick={nextTurn}
                    className={styles.skipButton}
                >
                    ⏭️ Saltar turno
                </button>
            </div>

            {/* Notificación de carta obtenida */}
            {gameState.pendingCard && (
                <div className={styles.cardNotification}>
                    <div className={styles.cardNotificationContent}>
                        <Zap size={40} color="#fbbf24" />
                        <h2>¡Carta obtenida!</h2>
                        <div 
                            className={styles.cardPreview}
                            style={{ borderColor: gameState.pendingCard.color }}
                        >
                            {React.createElement(gameState.pendingCard.icon, { size: 48 })}
                            <div className={styles.cardPreviewName}>{gameState.pendingCard.name}</div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Modal de selección de jugador para usar carta */}
            {gameState.showCardSelection && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h2 className={styles.modalTitle}>Elige un jugador objetivo</h2>
                        <div className={styles.playerSelection}>
                            {players.map((player, idx) => {
                                if (idx === gameState.currentPlayer) return null;
                                return (
                                    <button
                                        key={idx}
                                        className={styles.playerSelectButton}
                                        style={{ 
                                            backgroundColor: idx === 0 ? '#22c55e' :
                                                            idx === 1 ? '#facc15' :
                                                            idx === 2 ? '#60a5fa' : '#ef4444'
                                        }}
                                        onClick={() => useCard(idx)}
                                    >
                                        {player.name}
                                    </button>
                                );
                            })}
                        </div>
                        <button 
                            className={styles.cancelButton}
                            onClick={() => setGameState(prev => ({ ...prev, showCardSelection: false }))}
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            )}
            
            {/* PANTALLA DE VICTORIA */}
            {winner !== null && (
                <div className={styles.victoryOverlay}>
                    <div className={styles.victoryCard}>
                        <div className={styles.confetti}>🎉 🎊 🏆 🎉 🎊</div>
                        <h1 className={`${styles.victoryTitle} ${
                            winner === 0 ? styles.victoryWinnerGreen :
                            winner === 1 ? styles.victoryWinnerYellow :
                            winner === 2 ? styles.victoryWinnerBlue :
                            styles.victoryWinnerRed
                        }`}>
                            ¡VICTORIA!
                        </h1>
                        <p className={styles.victoryMessage}>
                            {winner === 0 ? '🟢 Jugador 1 (Verde)' :
                             winner === 1 ? '🟡 Jugador 2 (Amarillo)' :
                             winner === 2 ? '🔵 Jugador 3 (Azul)' :
                             '🔴 Jugador 4 (Rojo)'} ha ganado la partida!
                        </p>
                        <button 
                            className={styles.victoryButton1}
                            onClick={() => window.location.reload()}
                        >
                            Jugar de nuevo
                        </button>
                        <button 
                            className={styles.victoryButton2}
                            onClick={salirALocal}
                        >
                            Salir
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
