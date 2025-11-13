'use client';
import React, { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';
import styles from '@/app/styles/ludo.module.css';

export default function LudoPage() {
    // Estados iniciales
    const [players] = useState([
        { id: 0, color: 'green', name: 'Verde', pieces: [0, 0, 0, 0] },
        { id: 1, color: 'yellow', name: 'Amarillo', pieces: [0, 0, 0, 0] },
        { id: 2, color: 'blue', name: 'Azul', pieces: [0, 0, 0, 0] },
        { id: 3, color: 'red', name: 'Rojo', pieces: [0, 0, 0, 0] }
    ]);

    const [gameState, setGameState] = useState({
        currentPlayer: 0,
        diceValue: null,
        canRoll: true,
        piecePositions: {
            0: [-1, -1, -1, -1],
            1: [-1, -1, -1, -1],
            2: [-1, -1, -1, -1],
            3: [-1, -1, -1, -1]
        },
        selectedPiece: null,
        consecutiveSixes: 0,
        animatingPieces: {}, // Para controlar animaciones
        capturedPieces: {} // Para animaciones de captura
    });

    // Configuración del tablero
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
    const safeSpots = [8, 21, 34, 47];

    // Función para tirar el dado
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

    // Verificar si una pieza puede moverse
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

    // Verificar si el jugador tiene movimientos válidos
    const hasValidMoves = (playerId) => {
        const positions = gameState.piecePositions[playerId];
        return positions.some((pos, idx) => canMovePiece(playerId, idx));
    };

    // Mover una pieza con animación paso a paso
    const movePiece = async (pieceIndex) => {
        const playerId = gameState.currentPlayer;
        if (!canMovePiece(playerId, pieceIndex)) return;

        const currentPos = gameState.piecePositions[playerId][pieceIndex];
        const dice = gameState.diceValue;
        
        // Deshabilitar clicks durante la animación
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
                alert(`¡${players[playerId].name} ha completado una ficha!`);
                newPos = 58;
            }
            await animateMovement(playerId, pieceIndex, currentPos, newPos, dice);
        } else {
            // Está en el camino principal
            const startPos = startPositions[playerId];
            let tempPos = currentPos + dice;
            
            // Verificar si debe entrar al camino final
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
                    alert(`¡${players[playerId].name} ha completado una ficha!`);
                    newPos = 58;
                }
            } else {
                newPos = tempPos % 52;
            }

            await animateMovement(playerId, pieceIndex, currentPos, newPos, dice);
        }

        // Actualizar posición final
        const newPositions = { ...gameState.piecePositions };
        newPositions[playerId] = [...newPositions[playerId]];
        newPositions[playerId][pieceIndex] = newPos;

        // Comer fichas enemigas
        let capturedPiece = false;
        if (newPos < 52 && !safeSpots.includes(newPos) && ![0, 13, 26, 39].includes(newPos)) {
            for (let pid of Object.keys(newPositions)) {
                if (parseInt(pid) !== playerId) {
                    for (let i = 0; i < newPositions[pid].length; i++) {
                        if (newPositions[pid][i] === newPos) {
                            capturedPiece = true;
                            // Animar captura
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

        if (dice === 6 || capturedPiece) {
            setGameState(prev => ({ ...prev, canRoll: true, diceValue: null }));
        } else {
            setTimeout(() => nextTurn(), 500);
        }
    };

    // Función para animar movimiento paso a paso
    const animateMovement = async (playerId, pieceIndex, startPos, endPos, steps) => {
        const delay = 200; // milisegundos entre cada paso

        if (startPos === -1) {
            // Salir de la base
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

        // Animar paso a paso
        for (let step = 1; step <= steps; step++) {
            let currentStepPos;
            
            if (startPos >= 52) {
                // En camino final
                currentStepPos = startPos + step;
            } else {
                currentStepPos = (startPos + step) % 52;
                
                // Manejar entrada al camino final
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

    // Función para animar captura
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

    // Función helper para delays
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Pasar al siguiente turno
    const nextTurn = () => {
        setGameState(prev => ({
            ...prev,
            currentPlayer: (prev.currentPlayer + 1) % 4,
            canRoll: true,
            diceValue: null,
            selectedPiece: null,
            consecutiveSixes: 0
        }));
    };

    // Effect para verificar si hay movimientos válidos
    useEffect(() => {
        if (gameState.diceValue && !hasValidMoves(gameState.currentPlayer)) {
            setTimeout(() => nextTurn(), 1500);
        }
    }, [gameState.diceValue]);

    // Obtener el estilo de cada celda
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

    // Renderizar el tablero
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
                        const piecePos = gameState.piecePositions[playerHome][spotIndex];
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
                    }
                }

                mainPath.forEach((pos, idx) => {
                    if (pos.x === x && pos.y === y) {
                        if (safeSpots.includes(idx)) {
                            content = <div className={styles.star}>★</div>;
                        }

                        Object.keys(gameState.piecePositions).forEach(playerId => {
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
                        });
                    }
                });

                Object.keys(finalPaths).forEach(playerId => {
                    finalPaths[playerId].forEach((pos, idx) => {
                        if (pos.x === x && pos.y === y) {
                            const pathColorClass = [
                                styles.cellGreenPath,
                                styles.cellYellowPath,
                                styles.cellBluePath,
                                styles.cellRedPath
                            ][playerId];
                            cellClass = `${styles.cell} ${pathColorClass}`;

                            gameState.piecePositions[playerId].forEach((piecePos, pieceIdx) => {
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

    return (
        <div className={styles.container}>
    
            <div className={styles.playersContainer}>
                {/* Jugadores Izquierda (1 arriba, 4 abajo) */}
                <div className={styles.leftPlayers}>
                    {/* Jugador 1 - Verde */}
                    <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 0 ? styles.active : ''}`}
                         style={{ borderColor: gameState.currentPlayer === 0 ? '#15803d' : 'transparent' }}>
                        <div className={`${styles.playerColorDot} ${styles.green}`}></div>
                        <div className={styles.playerName}>Jugador 1</div>
                        <div className={styles.playerPieces}>
                            {gameState.piecePositions[0].filter(pos => pos !== -1).length} pieza/s afuera
                        </div>
                        {gameState.currentPlayer === 0 && (
                            <div className={styles.playerTurnLabel}>Su turno!</div>
                        )}
                    </div>
    
                    {/* Jugador 4 - Rojo */}
                    <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 3 ? styles.active : ''}`}
                         style={{ borderColor: gameState.currentPlayer === 3 ? '#990906' : 'transparent' }}>
                        <div className={`${styles.playerColorDot} ${styles.red}`}></div>
                        <div className={styles.playerName}>Jugador 4</div>
                        <div className={styles.playerPieces}>
                            {gameState.piecePositions[3].filter(pos => pos !== -1).length} pieza/s afuera
                        </div>
                        {gameState.currentPlayer === 3 && (
                            <div className={styles.playerTurnLabel}>Su turno!</div>
                        )}
                    </div>
                </div>
    
                {/* Tablero en el centro */}
                <div className={styles.boardContainer}>{renderBoard()}</div>
    
                {/* Jugadores Derecha (2 arriba, 3 abajo) */}
                <div className={styles.rightPlayers}>
                    {/* Jugador 2 - Amarillo */}
                    <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 1 ? styles.active : ''}`}
                         style={{ borderColor: gameState.currentPlayer === 1 ? '#cc9f02' : 'transparent' }}>
                        <div className={`${styles.playerColorDot} ${styles.yellow}`}></div>
                        <div className={styles.playerName}>Jugador 2</div>
                        <div className={styles.playerPieces}>
                            {gameState.piecePositions[1].filter(pos => pos !== -1).length} pieza/s afuera
                        </div>
                        {gameState.currentPlayer === 1 && (
                            <div className={styles.playerTurnLabel}>Su turno!</div>
                        )}
                    </div>
    
                    {/* Jugador 3 - Azul */}
                    <div className={`${styles.playerIndicator} ${gameState.currentPlayer === 2 ? styles.active : ''}`}
                         style={{ borderColor: gameState.currentPlayer === 2 ? '#1d4ed8' : 'transparent' }}>
                        <div className={`${styles.playerColorDot} ${styles.blue}`}></div>
                        <div className={styles.playerName}>Jugador 3</div>
                        <div className={styles.playerPieces}>
                            {gameState.piecePositions[2].filter(pos => pos !== -1).length} pieza/s afuera
                        </div>
                        {gameState.currentPlayer === 2 && (
                            <div className={styles.playerTurnLabel}>Su turno!</div>
                        )}
                    </div>
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
            </div>
    
            <div className={styles.rulesContainer}>
                <p className={styles.rulesTitle}>Reglas:</p>
                <p className={styles.rulesText}>• Saca 6 para salir de la base</p>
                <p className={styles.rulesText}>• Las estrellas (★) son casillas seguras</p>
                <p className={styles.rulesText}>• Si sacas 6 o comes una ficha, tiras de nuevo</p>
                <p className={styles.rulesText}>• Tres 6 seguidos = pierdes el turno</p>
            </div>
        </div>
    );
}