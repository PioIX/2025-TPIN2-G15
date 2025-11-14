'use client';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Dices } from 'lucide-react';
import styles from '@/app/styles/ludo.module.css';
import { useRouter } from 'next/navigation';

export default function LudoPage() {
    const searchParams = useSearchParams();
    

    const router = useRouter();

    const salirALocal = () => {
        router.push("../../local");
    };

    const numPlayers = parseInt(searchParams.get('players')) || 4;
    const safeEnabled = searchParams.get('safe') !== 'false';
    
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
    const safeSpots = safeEnabled ? [8, 21, 34, 47] : [];
    

    //ESTO ES SOLO PARA GANAR AL INSTANTE Y PROBAR LA PANTALLA DE VICTORIA
    const winInstantly = () => {
        const newPositions = { ...gameState.piecePositions };
        // Poner todas las fichas del jugador actual en la meta
        newPositions[gameState.currentPlayer] = [58, 58, 58, 58];
        
        setGameState(prev => ({
            ...prev,
            piecePositions: newPositions
        }));

        checkWinner(newPositions);
    };


    const rollDice = () => {
        if (!gameState.canRoll) return;
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

    const checkWinner = (positions) => {
        for (let playerId = 0; playerId < numPlayers; playerId++) {
            const playerPositions = positions[playerId];
            // Verificar si las 4 fichas están en posición 58 (meta)
            if (playerPositions.every(pos => pos === 58)) {
                setWinner(playerId);
                return true;
            }
        }
        return false;
    };
    
    const movePiece = async (pieceIndex) => {
        const playerId = gameState.currentPlayer;
        if (!canMovePiece(playerId, pieceIndex)) return;
        
        const currentPos = gameState.piecePositions[playerId][pieceIndex];
        const dice = gameState.diceValue;
        
        setGameState(prev => ({ ...prev, canRoll: false }));
        
        let newPos;
        if (currentPos === -1) {
            // Salir de la base
            newPos = startPositions[playerId];
            await animateMovement(playerId, pieceIndex, currentPos, newPos, 1);
        } else if (currentPos >= 52) {
            // Ya está en el camino final
            newPos = currentPos + dice;
            if (newPos > 57) {
                newPos = 58;
            }
            await animateMovement(playerId, pieceIndex, currentPos, newPos, dice);
        } else {
            // Está en el camino principal (0-51)
            const startPos = startPositions[playerId];
            const entryPos = (startPos + 51) % 52; // Posición de entrada al camino final
            
            let stepsRemaining = dice;
            let tempPos = currentPos;
            let shouldEnterFinal = false;
            
            // Simular el movimiento paso a paso
            for (let step = 1; step <= dice; step++) {
                let nextPos = (tempPos + 1) % 52;
                
                // Verificar si pasamos por la entrada al camino final
                if (tempPos < entryPos && nextPos >= entryPos && tempPos >= startPos) {
                    shouldEnterFinal = true;
                    stepsRemaining = dice - step;
                    break;
                }
                // Verificar si damos la vuelta completa y pasamos por la entrada
                if (tempPos >= startPos && nextPos < startPos) {
                    // Dimos la vuelta, verificar si llegamos a la entrada
                    let stepsToEntry = (52 - tempPos) + entryPos;
                    if (step + stepsToEntry <= dice) {
                        shouldEnterFinal = true;
                        stepsRemaining = dice - step - stepsToEntry;
                        break;
                    }
                }
                
                tempPos = nextPos;
            }
            
            if (shouldEnterFinal) {
                // Entrar al camino final
                newPos = 52 + stepsRemaining;
                if (newPos > 57) {
                    newPos = 58;
                }
            } else {
                // Continuar en el camino principal
                newPos = (currentPos + dice) % 52;
            }
            
            await animateMovement(playerId, pieceIndex, currentPos, newPos, dice);
        }
        
        const newPositions = { ...gameState.piecePositions };
        newPositions[playerId] = [...newPositions[playerId]];
        newPositions[playerId][pieceIndex] = newPos;
        
        let capturedPiece = false;
        if (newPos < 52 && !safeSpots.includes(newPos) && ![0, 13, 26, 39].includes(newPos)) {
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
        
        setGameState(prev => ({
            ...prev,
            piecePositions: newPositions,
            selectedPiece: null,
            animatingPieces: {}
        }));
        
        if (checkWinner(newPositions)) {
            return;
        }
        
        if (dice === 6 || capturedPiece) {
            setGameState(prev => ({ ...prev, canRoll: true, diceValue: null }));
        } else {
            setTimeout(() => nextTurn(), 500);
        }
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
    
    const nextTurn = () => {
        setGameState(prev => ({
            ...prev,
            currentPlayer: (prev.currentPlayer + 1) % numPlayers,
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

                // ⭐ PRIMERO: Renderizar flechas (ANTES de las fichas)
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

                // Renderizar fichas en el camino principal
                mainPath.forEach((pos, idx) => {
                    if (pos.x === x && pos.y === y) {
                        // Solo agregar estrella si NO hay contenido previo (flecha)
                        if (!content && safeEnabled && safeSpots.includes(idx)) {
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

                // Renderizar fichas en caminos finales
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
            <div className={styles.playersContainer}>
                <div className={styles.leftPlayers}>
                    {numPlayers >= 1 && (
                        <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 0 ? styles.active : ''}`}
                             style={{ borderColor: gameState.currentPlayer === 0 ? '#15803d' : 'transparent' }}>
                            <div className={`${styles.playerColorDot} ${styles.green}`}></div>
                            <div className={styles.playerName}>Jugador 1</div>
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
                            <div className={styles.playerName}>Jugador 4</div>
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
                            <div className={styles.playerName}>Jugador 2</div>
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
                            <div className={styles.playerName}>Jugador 3</div>
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
                <p className={styles.rulesTitle}>Reglas:</p>
                <p className={styles.rulesText}>• Saca 6 para salir de la base</p>
                {safeEnabled && <p className={styles.rulesText}>• Las estrellas (★) son casillas seguras</p>}
                <p className={styles.rulesText}>• Si sacas 6 o comes una ficha, tiras de nuevo</p>
                <p className={styles.rulesText}>• Tres 6 seguidos = pierdes el turno</p>
                <p className={styles.rulesText}>• Jugadores: {numPlayers}</p>
            </div>

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