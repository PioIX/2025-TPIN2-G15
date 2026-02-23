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

    // ================== HELPERS DE MOVIMIENTO ==================

    // Calcula TODAS las posiciones intermedias de una jugada
    const getMovementPath = (playerId, startPos, dice) => {
        const path = [];

        // Desde la base (-1) solo sale a su casilla de salida
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
                    // Llegó / se pasó de la última casilla -> meta (58)
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
            // Si estoy en la casilla de "entrada" al home y todavía tengo pasos,
            // desde acá salto al camino final
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

        // Nunca entró al camino final en esta jugada, se queda en el anillo
        return path;
    };

    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Anima la ficha siguiendo una lista de posiciones
    const animateMovement = async (playerId, pieceIndex, path) => {
        const delay = 200;

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

        // apagar animación
        setGameState(prev => ({
            ...prev,
            animatingPieces: {
                ...prev.animatingPieces,
                [`${playerId}-${pieceIndex}`]: false
            }
        }));
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

    // ================== LÓGICA DEL JUEGO ==================

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

        if (position === -1) return dice === 6 || dice === 1; // puede salir de la base

        // En el camino final: no puede pasar más allá de la meta lógica (posición 58)
        if (position >= 52) {
            const finalPos = position - 52; // 0–5
            return finalPos + dice <= 6;
        }

        // En el camino principal siempre se puede mover (la lógica de entrar al home
        // o seguir de largo la resuelve getMovementPath)
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

        // NUEVO: calculamos el camino entero y animamos en base a eso
        const movementPath = getMovementPath(playerId, currentPos, dice);
        const newPos = movementPath.length > 0
            ? movementPath[movementPath.length - 1]
            : currentPos;

        await animateMovement(playerId, pieceIndex, movementPath);

        const newPositions = { ...gameState.piecePositions };
        newPositions[playerId] = [...newPositions[playerId]];
        newPositions[playerId][pieceIndex] = newPos;

        let capturedPiece = false;

        // Capturas solo en el camino principal (0–51)
        if (newPos < 52 && !safeSpots.includes(newPos) && ![0, 13, 26, 39].includes(newPos)) {
            for (let pid of Object.keys(newPositions)) {
                const intPid = parseInt(pid);
                if (intPid !== playerId && intPid < numPlayers) {
                    for (let i = 0; i < newPositions[pid].length; i++) {
                        if (newPositions[pid][i] === newPos) {
                            capturedPiece = true;
                            await animateCapture(intPid, i);
                            newPositions[pid][i] = -1;
                        }
                    }
                }
            }
        }

        setGameState(prev => ({
            ...prev,
            piecePositions: newPositions,
            selectedPiece: null
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

    // ================== RENDER DEL TABLERO ==================

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

                // Flechas de dirección
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

                // Fichas en el camino principal
                mainPath.forEach((pos, idx) => {
                    if (pos.x === x && pos.y === y) {
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

                // Fichas en caminos finales
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
            
            {/* Boton de skip turno por si algo sale mal */}
            <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                    onClick={nextTurn}
                    className={styles.skipButton}
                >
                    ⏭️ Saltar turno
                </button>
            </div>

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