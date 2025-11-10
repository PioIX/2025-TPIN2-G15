'use client';

import React, { useState, useEffect } from 'react';
import { Dices } from 'lucide-react';
import styles from '../styles/ludo.module.css';

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
        consecutiveSixes: 0
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
    const safeSpots = [0, 8, 13, 21, 26, 34, 39, 47];

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

    // Mover una pieza
    const movePiece = (pieceIndex) => {
        const playerId = gameState.currentPlayer;
        if (!canMovePiece(playerId, pieceIndex)) return;

        const currentPos = gameState.piecePositions[playerId][pieceIndex];
        const dice = gameState.diceValue;
        let newPos;

        if (currentPos === -1) {
            newPos = startPositions[playerId];
        } else if (currentPos >= 52) {
            newPos = currentPos + dice;
        } else {
            newPos = (currentPos + dice) % 52;

            const startPos = startPositions[playerId];
            const passedStart =
                (currentPos < startPos && currentPos + dice >= startPos) ||
                (currentPos >= startPos && currentPos + dice >= startPos + 52);

            if (passedStart && currentPos + dice >= startPos) {
                const overflow = (currentPos + dice) - (startPos + 51);
                if (overflow > 0) {
                    newPos = 52 + overflow - 1;
                }
            }
        }

        if (newPos >= 58) {
            alert(`¡${players[playerId].name} ha completado una ficha!`);
            newPos = 58;
        }

        const newPositions = { ...gameState.piecePositions };
        newPositions[playerId] = [...newPositions[playerId]];
        newPositions[playerId][pieceIndex] = newPos;

        let capturedPiece = false;
        if (newPos < 52 && !safeSpots.includes(newPos)) {
            Object.keys(newPositions).forEach(pid => {
                if (parseInt(pid) !== playerId) {
                    newPositions[pid] = newPositions[pid].map(pos => {
                        if (pos === newPos) {
                            capturedPiece = true;
                            return -1;
                        }
                        return pos;
                    });
                }
            });
        }

        setGameState(prev => ({
            ...prev,
            piecePositions: newPositions,
            selectedPiece: null
        }));

        if (dice === 6 || capturedPiece) {
            setGameState(prev => ({ ...prev, canRoll: true, diceValue: null }));
        } else {
            setTimeout(() => nextTurn(), 500);
        }
    };

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
                            
                            // CORREGIDO: Hacer clickeable si es el turno y puede mover
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
                                    
                                    content = (
                                        <div
                                            onClick={() => canMove && movePiece(pieceIdx)}
                                            className={`${styles.piece} ${sizeClass} ${pieceColorClass}`}
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
                                    
                                    content = (
                                        <div
                                            onClick={() => canMove && movePiece(pieceIdx)}
                                            className={`${styles.piece} ${sizeClass} ${pieceColorClass}`}
                                            style={{ cursor: canMove ? 'pointer' : 'default' }}
                                        ></div>
                                    );
                                }
                            });
                        }
                    });
                });

                if (x === 0 && y === 6) content = <span className={`${styles.arrow} ${styles.arrowGreen}`}>→</span>;
                if (x === 8 && y === 0) content = <span className={`${styles.arrow} ${styles.arrowYellow}`}>↓</span>;
                if (x === 14 && y === 8) content = <span className={`${styles.arrow} ${styles.arrowBlue}`}>←</span>;
                if (x === 6 && y === 14) content = <span className={`${styles.arrow} ${styles.arrowRed}`}>↑</span>;

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
            <h1 className={styles.title}>LUDO</h1>

            <div className={styles.turnIndicator}>
                <div
                    className={`${styles.turnText} ${
                        gameState.currentPlayer === 0
                            ? styles.turnTextGreen
                            : gameState.currentPlayer === 1
                            ? styles.turnTextYellow
                            : gameState.currentPlayer === 2
                            ? styles.turnTextBlue
                            : styles.turnTextRed
                    }`}
                >
                    Turno: {players[gameState.currentPlayer].name}
                </div>
            </div>

            <div className={styles.boardContainer}>{renderBoard()}</div>

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