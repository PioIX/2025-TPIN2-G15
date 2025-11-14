import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import { pool } from "./database/connectionMySQL.js";
import { Server } from "socket.io";
import { createServer } from "node:http";

const app = express();
const server = createServer(app);

app.use(cors());
app.use(bodyParser.json());


// ==================================================
// Verif. conexión a BdD
// ==================================================
(async () => {
    try {
        const [dbRow] = await pool.query("SELECT DATABASE() AS db");
        console.log(`Conectado a la base de datos: ${dbRow[0].db}`);

        const [tables] = await pool.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = DATABASE()
    `);

        console.log(
            "Tablas detectadas:",
            tables.map(t => t.table_name).join(", ")
        );
    } catch (err) {
        console.error("Error comprobando la conexión a MySQL:", err);
    }
})();


// ==================================================
// Endpoint: Registro usuario (/api/register)
// ==================================================
app.post("/api/register", async (req, res) => {
    try {
        const { nombre, correo, contrasena } = req.body;

        // Validar campos
        if (!nombre || !correo || !contrasena) {
            return res.status(400).json({ ok: false, msg: "Faltan campos requeridos" });
        }

        // Verificar si el correo ya existe
        const [existRows] = await pool.query(
            "SELECT idUsuarios FROM UsuariosLT WHERE correo = ? LIMIT 1",
            [correo]
        );

        if (existRows.length > 0) {
            return res.status(409).json({ ok: false, msg: "El correo ya está registrado" });
        }

        // Encriptar contraseña
        const hashed = await bcrypt.hash(contrasena, 10);

        // Insertar nuevo usuario
        const [insertResult] = await pool.query(
            "INSERT INTO UsuariosLT (nombre, correo, contrasena) VALUES (?, ?, ?)",
            [nombre, correo, hashed]
        );

        return res.status(201).json({
            ok: true,
            msg: "Usuario creado exitosamente",
            id_usuario: insertResult.insertId,
        });
    } catch (err) {
        console.error("Error en /api/register:", {
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage,
            sql: err.sql,
        });
        return res.status(500).json({
            ok: false,
            msg: "Error en el servidor durante el registro",
        });
    }
});


// ==================================================
// Endpoint: Login usuario (/api/login)
// ==================================================
app.post("/api/login", async (req, res) => {
    try {
        const { correo, contrasena } = req.body;

        if (!correo || !contrasena) {
            return res.status(400).json({ ok: false, msg: "Faltan credenciales" });
        }

        // Buscar usuario por correo
        const [rows] = await pool.query(
            "SELECT idUsuarios, nombre, correo, contrasena FROM UsuariosLT WHERE correo = ? LIMIT 1",
            [correo]
        );

        if (rows.length === 0) {
            return res.status(401).json({ ok: false, msg: "Correo o contraseña incorrectos" });
        }

        const user = rows[0];

        // Comparar contraseñas
        const valid = await bcrypt.compare(contrasena, user.contrasena);
        if (!valid) {
            return res.status(401).json({ ok: false, msg: "Correo o contraseña incorrectos" });
        }

        // Inicio de sesión exitoso
        return res.json({
            ok: true,
            msg: "Login exitoso",
            user: {
                id: user.idUsuarios,
                nombre: user.nombre,
                correo: user.correo,
            },
        });
    } catch (err) {
        console.error("Error en /api/login:", {
            code: err.code,
            errno: err.errno,
            sqlState: err.sqlState,
            sqlMessage: err.sqlMessage,
            sql: err.sql,
        });
        return res.status(500).json({ ok: false, msg: "Error en el servidor" });
    }
});


// ==================================================
// Endpoint de depu. (/api/_debug/usuarioslt)
// ==================================================
app.get("/api/_debug/usuarioslt", async (_req, res) => {
    try {
        const [db] = await pool.query("SELECT DATABASE() AS db");
        const [cols] = await pool.query("DESCRIBE UsuariosLT");
        res.json({ db: db[0].db, cols: cols.map(c => c.Field) });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// ==================================================
// Inicialización del server
// ==================================================
const PORT = process.env.PORT ?? 4000;

server.listen(PORT, () => {
    console.log(`Servidor API escuchando en el puerto ${PORT} [env=${process.env.NODE_ENV}]`);
});

// ========================================
//        ENDPOINTS PERFIL DE USUARIO
// ========================================

// Cambiar nombre de usuario
app.patch("/api/profile/name", async (req, res) => {
    try {
        const { id, nombre } = req.body;
        if (!id || !nombre)
            return res.status(400).json({ ok: false, msg: "Faltan campos" });

        await pool.query("UPDATE UsuariosLT SET nombre = ? WHERE idUsuarios = ?", [
            nombre,
            id,
        ]);
        res.json({ ok: true, msg: "Nombre actualizado" });
    } catch (e) {
        console.error("PATCH /profile/name", e);
        res.status(500).json({ ok: false, msg: "Error del servidor" });
    }
});

// Cambiar correo
app.patch("/api/profile/email", async (req, res) => {
    try {
        const { id, correo } = req.body;
        if (!id || !correo)
            return res.status(400).json({ ok: false, msg: "Faltan campos" });

        const [rows] = await pool.query(
            "SELECT idUsuarios FROM UsuariosLT WHERE correo = ? AND idUsuarios <> ? LIMIT 1",
            [correo, id]
        );
        if (rows.length)
            return res
                .status(409)
                .json({ ok: false, msg: "Ese correo ya está en uso" });

        await pool.query("UPDATE UsuariosLT SET correo = ? WHERE idUsuarios = ?", [
            correo,
            id,
        ]);
        res.json({ ok: true, msg: "Correo actualizado" });
    } catch (e) {
        console.error("PATCH /profile/email", e);
        res.status(500).json({ ok: false, msg: "Error del servidor" });
    }
});

// Cambiar contraseña
app.patch("/api/profile/password", async (req, res) => {
    try {
        const { id, actual, nueva } = req.body;
        if (!id || !actual || !nueva)
            return res.status(400).json({ ok: false, msg: "Faltan campos" });

        const [rows] = await pool.query(
            "SELECT contrasena FROM UsuariosLT WHERE idUsuarios = ? LIMIT 1",
            [id]
        );
        if (!rows.length)
            return res
                .status(404)
                .json({ ok: false, msg: "Usuario no encontrado" });

        const ok = await bcrypt.compare(actual, rows[0].contrasena);
        if (!ok)
            return res
                .status(401)
                .json({ ok: false, msg: "Contraseña actual incorrecta" });

        const hash = await bcrypt.hash(nueva, 10);
        await pool.query("UPDATE UsuariosLT SET contrasena = ? WHERE idUsuarios = ?", [
            hash,
            id,
        ]);

        res.json({ ok: true, msg: "Contraseña actualizada" });
    } catch (e) {
        console.error("PATCH /profile/password", e);
        res.status(500).json({ ok: false, msg: "Error del servidor" });
    }
});

// Sección del backend que necesita corrección

const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"],
        credentials: false
    },
    // Configuración adicional importante
    pingTimeout: 60000, // Aumentar timeout a 60 segundos
    pingInterval: 25000, // Ping cada 25 segundos
    transports: ['websocket', 'polling']
});

// ========================================
//    FUNCIONES AUXILIARES DEL JUEGO LUDO
// ========================================

const startPositions = { 0: 0, 1: 13, 2: 26, 3: 39 };
const safeSpots = [8, 21, 34, 47];

// Verificar si una pieza puede moverse
function canMovePiece(gameState, playerId, pieceIndex) {
    const position = gameState.piecePositions[playerId][pieceIndex];
    const dice = gameState.diceValue;

    if (position === -1) return dice === 6;

    if (position >= 52) {
        const finalPos = position - 52;
        return finalPos + dice <= 6;
    }

    return true;
}

// Verificar si el jugador tiene movimientos válidos
function checkValidMoves(gameState, playerId) {
    const positions = gameState.piecePositions[playerId];
    return positions.some((pos, idx) => canMovePiece(gameState, playerId, idx));
}

// Verificar captura de fichas
function checkCapture(gameState, playerId, position, numPlayers) {
    if (position < 0 || position >= 52) return null;
    if (safeSpots.includes(position)) return null;
    if ([0, 13, 26, 39].includes(position)) return null;

    for (let pid = 0; pid < numPlayers; pid++) {
        if (pid !== playerId) {
            const pieceIndex = gameState.piecePositions[pid].findIndex(pos => pos === position);
            if (pieceIndex !== -1) {
                return {
                    capturedPlayerId: pid,
                    capturedPieceIndex: pieceIndex
                };
            }
        }
    }

    return null;
}

// Verificar si un jugador ganó
function checkWin(gameState, playerId) {
    const positions = gameState.piecePositions[playerId];
    return positions.every(pos => pos === 58);
}

// Inicializar estado del juego
function initializeGameState(numPlayers) {
    const piecePositions = {};
    for (let i = 0; i < numPlayers; i++) {
        piecePositions[i] = [-1, -1, -1, -1];
    }

    return {
        currentPlayer: 0,
        diceValue: null,
        canRoll: true,
        piecePositions,
        consecutiveSixes: 0
    };
}

// ========================================
//        CONFIGURACIÓN DE SOCKET.IO
// ========================================

io.on('connection', (socket) => {
    console.log('✅ Usuario conectado:', socket.id);

    // Evento: Crear sala
    socket.on('create-room', (data) => {
        const { userId, userName, gameMode, maxPlayers } = data;
        const roomId = 'room-' + Math.random().toString(36).substr(2, 9);

        const room = {
            id: roomId,
            gameMode,
            maxPlayers,
            players: [{
                socketId: socket.id,
                userId,
                userName,
                isHost: true,
                playerId: 0  // AGREGAR playerId explícito
            }],
            gameState: null,
            createdAt: new Date()
        };

        room.set(roomId, room);
        connectedUsers.set(socket.id, { 
            userId, 
            userName, 
            roomId, 
            isHost: true,
            playerId: 0  // AGREGAR playerId
        });

        socket.join(roomId);
        console.log(`📦 Sala creada: ${roomId} por ${userName}`);

        socket.emit('room-created', {
            roomId,
            players: room.players
        });
    });

    // Evento: Unirse a una sala existente - CORREGIDO
    socket.on('join-room', (data) => {
        const { userId, userName, roomId } = data;
        console.log(`🔍 Intento de unirse a sala - RoomId: ${roomId}`);

        const room = room.get(roomId);

        if (!room) {
            console.error(`❌ Sala no encontrada: ${roomId}`);
            socket.emit('error', { message: 'Sala no encontrada. Verifica el código.' });
            return;
        }

        if (room.players.length >= room.maxPlayers) {
            console.error(`❌ Sala llena: ${roomId} (${room.players.length}/${room.maxPlayers})`);
            socket.emit('error', { message: 'Sala llena' });
            return;
        }

        const newPlayerId = room.players.length;  // NUEVO playerId basado en el índice

        const player = {
            socketId: socket.id,
            userId,
            userName,
            isHost: false,
            playerId: newPlayerId  // AGREGAR playerId
        };

        room.players.push(player);
        connectedUsers.set(socket.id, { 
            userId, 
            userName, 
            roomId, 
            isHost: false,
            playerId: newPlayerId  // AGREGAR playerId
        });

        socket.join(roomId);
        console.log(`👤 ${userName} se unió a la sala: ${roomId} como jugador ${newPlayerId}`);

        socket.emit('room-created', {
            roomId,
            players: room.players
        });

        io.to(roomId).emit('player-joined', {
            players: room.players,
            newPlayer: player
        });
    });

    // Evento: Usuario se une al juego en curso - COMPLETAMENTE REESCRITO
    socket.on('join-game', (data) => {
        const { userId, userName, roomId } = data;
        
        console.log(`🎮 join-game recibido - roomId: ${roomId}, userId: ${userId}, socket: ${socket.id}`);

        const room = room.get(roomId);

        if (!room) {
            console.error(`❌ Sala no encontrada: ${roomId}`);
            console.log(`📋 Salas disponibles:`, Array.from(room.keys()));
            socket.emit('error', { message: 'Sala no encontrada' });
            return;
        }

        // IMPORTANTE: Buscar por userId, no por socketId
        const existingPlayerIndex = room.players.findIndex(p => p.userId === userId);

        if (existingPlayerIndex !== -1) {
            // Usuario RECONECTÁNDOSE - actualizar socket
            console.log(`♻️ Reconectando jugador existente: ${userName} (playerId: ${existingPlayerIndex})`);
            
            room.players[existingPlayerIndex].socketId = socket.id;
            
            const existingUser = connectedUsers.get(socket.id);
            connectedUsers.set(socket.id, {
                userId,
                userName,
                roomId,
                isHost: room.players[existingPlayerIndex].isHost,
                playerId: existingPlayerIndex
            });
            
            socket.join(roomId);

            // ENVIAR player-assignment INMEDIATAMENTE
            socket.emit('player-assignment', { playerId: existingPlayerIndex });
            console.log(`📤 player-assignment enviado: playerId=${existingPlayerIndex}`);

            // Enviar estado del juego si existe
            if (room.gameState) {
                socket.emit('game-state-update', room.gameState);
                console.log(`📤 game-state-update enviado`);
            }

            // Notificar reconexión
            socket.to(roomId).emit('player-reconnected', {
                playerId: existingPlayerIndex,
                userName
            });

        } else {
            // Usuario NUEVO - verificar espacio disponible
            if (room.players.length >= room.maxPlayers) {
                console.error(`❌ Sala llena: ${roomId} (${room.players.length}/${room.maxPlayers})`);
                socket.emit('error', { message: 'Sala llena. No puedes unirte.' });
                return;
            }

            const newPlayerId = room.players.length;
            
            console.log(`✨ Nuevo jugador uniéndose: ${userName} (playerId: ${newPlayerId})`);

            const newPlayer = {
                socketId: socket.id,
                userId,
                userName,
                isHost: room.players.length === 0,
                playerId: newPlayerId
            };

            room.players.push(newPlayer);
            
            connectedUsers.set(socket.id, {
                userId,
                userName,
                roomId,
                isHost: newPlayer.isHost,
                playerId: newPlayerId
            });
            
            socket.join(roomId);

            console.log(`✅ Nuevo jugador agregado: ${userName} (playerId: ${newPlayerId})`);

            // ENVIAR player-assignment
            socket.emit('player-assignment', { playerId: newPlayerId });
            console.log(`📤 player-assignment enviado: playerId=${newPlayerId}`);

            // Enviar estado del juego si ya comenzó
            if (room.gameState) {
                socket.emit('game-state-update', room.gameState);
            }

            // Notificar a todos sobre el nuevo jugador
            io.to(roomId).emit('player-joined', {
                players: room.players,
                newPlayer
            });
        }
    });

    // Evento: Salir de una sala
    socket.on('leave-room', (data) => {
        const { roomId } = data;
        const user = connectedUsers.get(socket.id);
        const room = room.get(roomId);

        if (user && room) {
            room.players = room.players.filter(p => p.socketId !== socket.id);

            socket.leave(roomId);
            console.log(`👋 ${user.userName} salió de la sala: ${roomId}`);

            if (user.isHost && room.players.length > 0) {
                room.players[0].isHost = true;
                const newHostSocket = room.players[0].socketId;
                const newHost = connectedUsers.get(newHostSocket);
                if (newHost) newHost.isHost = true;
            }

            if (room.players.length === 0) {
                room.delete(roomId);
                console.log(`🗑️ Sala eliminada: ${roomId}`);
            } else {
                io.to(roomId).emit('player-left', {
                    players: room.players,
                    leftPlayer: { userId: user.userId, userName: user.userName }
                });
            }

            connectedUsers.delete(socket.id);
        }
    });

    // Evento: Iniciar juego - SIN CAMBIOS
    socket.on('start-game', (data) => {
        const { roomId } = data;
        const room = room.get(roomId);
        const user = connectedUsers.get(socket.id);

        if (!room) {
            socket.emit('error', { message: 'Sala no encontrada' });
            return;
        }

        if (!user || !user.isHost) {
            socket.emit('error', { message: 'Solo el host puede iniciar el juego' });
            return;
        }

        if (room.players.length < 2) {
            socket.emit('error', { message: 'Se necesitan al menos 2 jugadores' });
            return;
        }

        console.log(`🎮 Juego iniciado en sala: ${roomId} con ${room.players.length} jugadores`);

        room.gameState = initializeGameState(room.players.length);
        room.gameStarted = true;

        io.to(roomId).emit('game-start', {
            roomId,
            players: room.players,
            gameState: room.gameState
        });
    });

    // Evento: Tirar dado - MEJORADO
    socket.on('roll-dice', (data) => {
        const { roomId, playerId } = data;
        const room = room.get(roomId);

        console.log(`🎲 roll-dice recibido - roomId: ${roomId}, playerId: ${playerId}`);

        if (!room || !room.gameState) {
            console.error('❌ Juego no encontrado');
            socket.emit('error', { message: 'Juego no encontrado' });
            return;
        }

        const gameState = room.gameState;

        // VERIFICACIÓN MEJORADA
        if (gameState.currentPlayer !== playerId) {
            console.error(`❌ No es el turno del jugador ${playerId}. Turno actual: ${gameState.currentPlayer}`);
            socket.emit('error', { message: 'No es tu turno' });
            return;
        }

        if (!gameState.canRoll) {
            console.error('❌ No puede tirar el dado en este momento');
            socket.emit('error', { message: 'No puedes tirar el dado ahora' });
            return;
        }

        const diceValue = Math.floor(Math.random() * 6) + 1;
        const consecutiveSixes = diceValue === 6 ? gameState.consecutiveSixes + 1 : 0;

        console.log(`🎲 Dado: ${diceValue}, Seises consecutivos: ${consecutiveSixes}`);

        if (consecutiveSixes === 3) {
            console.log('⚠️ Tres seises consecutivos - saltar turno');
            gameState.consecutiveSixes = 0;
            gameState.canRoll = false;

            io.to(roomId).emit('dice-rolled', { value: diceValue, consecutiveSixes: 3 });

            setTimeout(() => {
                gameState.currentPlayer = (gameState.currentPlayer + 1) % room.players.length;
                gameState.canRoll = true;
                gameState.diceValue = null;

                console.log(`🔄 Turno cambiado a jugador ${gameState.currentPlayer}`);
                io.to(roomId).emit('turn-changed', { currentPlayer: gameState.currentPlayer });
            }, 1500);

            return;
        }

        gameState.diceValue = diceValue;
        gameState.consecutiveSixes = consecutiveSixes;
        gameState.canRoll = false;

        io.to(roomId).emit('dice-rolled', { value: diceValue, consecutiveSixes });

        const hasValidMoves = checkValidMoves(gameState, playerId);

        if (!hasValidMoves) {
            console.log(`⏭️ Jugador ${playerId} no tiene movimientos válidos`);
            setTimeout(() => {
                gameState.currentPlayer = (gameState.currentPlayer + 1) % room.players.length;
                gameState.canRoll = true;
                gameState.diceValue = null;
                gameState.consecutiveSixes = 0;

                console.log(`🔄 Turno cambiado a jugador ${gameState.currentPlayer}`);
                io.to(roomId).emit('turn-changed', { currentPlayer: gameState.currentPlayer });
            }, 1500);
        }
    });

    // Evento: Mover pieza - SIN CAMBIOS MAYORES
    socket.on('move-piece', (data) => {
        const { roomId, playerId, pieceIndex, from, to, steps } = data;
        const room = room.get(roomId);

        if (!room || !room.gameState) {
            socket.emit('error', { message: 'Juego no encontrado' });
            return;
        }

        const gameState = room.gameState;

        if (gameState.currentPlayer !== playerId) {
            socket.emit('error', { message: 'No es tu turno' });
            return;
        }

        console.log(`♟️ Moviendo pieza: jugador ${playerId}, pieza ${pieceIndex}, de ${from} a ${to}`);

        gameState.piecePositions[playerId][pieceIndex] = to;

        io.to(roomId).emit('piece-moved', { playerId, pieceIndex, from, to, steps });

        const captured = checkCapture(gameState, playerId, to, room.players.length);

        if (captured) {
            const { capturedPlayerId, capturedPieceIndex } = captured;
            console.log(`💥 Captura: jugador ${capturedPlayerId}, pieza ${capturedPieceIndex}`);
            gameState.piecePositions[capturedPlayerId][capturedPieceIndex] = -1;

            io.to(roomId).emit('piece-captured', { capturedPlayerId, capturedPieceIndex });
        }

        const hasWon = checkWin(gameState, playerId);

        if (hasWon) {
            const winner = room.players[playerId];
            console.log(`🏆 Jugador ${playerId} (${winner.userName}) ha ganado!`);
            io.to(roomId).emit('game-ended', {
                winner: winner.userName,
                winnerId: playerId
            });

            setTimeout(() => {
                room.delete(roomId);
            }, 5000);

            return;
        }

        const shouldContinue = gameState.diceValue === 6 || captured;

        if (shouldContinue) {
            console.log(`♻️ Jugador ${playerId} tira de nuevo (dado=6 o captura)`);
            gameState.canRoll = true;
            gameState.diceValue = null;
        } else {
            setTimeout(() => {
                gameState.currentPlayer = (gameState.currentPlayer + 1) % room.players.length;
                gameState.canRoll = true;
                gameState.diceValue = null;
                gameState.consecutiveSixes = 0;

                console.log(`🔄 Turno cambiado a jugador ${gameState.currentPlayer}`);
                io.to(roomId).emit('turn-changed', { currentPlayer: gameState.currentPlayer });
            }, 500);
        }
    });

    // Evento: Saltar turno - SIN CAMBIOS
    socket.on('skip-turn', (data) => {
        const { roomId, playerId } = data;
        const room = room.get(roomId);

        if (!room || !room.gameState) {
            return;
        }

        const gameState = room.gameState;

        if (gameState.currentPlayer !== playerId) {
            return;
        }

        console.log(`⏭️ Jugador ${playerId} salta su turno`);

        gameState.currentPlayer = (gameState.currentPlayer + 1) % room.players.length;
        gameState.canRoll = true;
        gameState.diceValue = null;
        gameState.consecutiveSixes = 0;

        io.to(roomId).emit('turn-changed', { currentPlayer: gameState.currentPlayer });
    });

    // Evento: Abandonar juego
    socket.on('leave-game', (data) => {
        const { roomId } = data;
        const user = connectedUsers.get(socket.id);
        const room = room.get(roomId);

        if (user && room) {
            socket.leave(roomId);
            console.log(`🚪 ${user.userName} salió del juego: ${roomId}`);

            socket.to(roomId).emit('player-disconnected', {
                playerName: user.userName
            });
        }
    });

    // Evento: Desconexión - MEJORADO
    socket.on('disconnect', (reason) => {
        const user = connectedUsers.get(socket.id);

        if (user) {
            console.log(`❌ Usuario desconectado: ${user.userName} (razón: ${reason})`);

            if (user.roomId) {
                const room = room.get(user.roomId);
                
                // NO eliminar al jugador inmediatamente - permitir reconexión
                if (room) {
                    socket.to(user.roomId).emit('player-disconnected', {
                        playerId: user.playerId,
                        playerName: user.userName,
                        temporary: true  // Indicar que puede reconectarse
                    });
                }
            }

            connectedUsers.delete(socket.id);
        } else {
            console.log(`❌ Socket desconectado: ${socket.id} (sin usuario asociado)`);
        }
    });

    // Manejo de errores del socket
    socket.on('error', (error) => {
        console.error('❌ Socket error:', error);
    });

});


// ========================================
//        ENDPOINTS DE LA TIENDA
// ========================================

// Obtener items de la tienda con info de si el usuario ya los compró
app.get("/api/shop/items/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ ok: false, msg: "userId requerido" });
        }

        // Obtener todos los items de la tienda con info de si el usuario los compró
        const [items] = await pool.query(`
            SELECT
                s.idItem,
                s.titulo,
                s.precio,
                s.categoria,
                s.clave,
                IF(up.idCompra IS NOT NULL, 1, 0) AS comprado
            FROM ShopItemsLT s
            LEFT JOIN UserPurchasesLT up
                ON s.idItem = up.idItem
                AND up.idUsuario = ?
            ORDER BY s.categoria, s.precio
        `, [userId]);

        res.json({ ok: true, items });
    } catch (e) {
        console.error("GET /api/shop/items", e);
        res.status(500).json({ ok: false, msg: "Error del servidor" });
    }
});

// Obtener balance de lodux del usuario
app.get("/api/shop/balance/:userId", async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ ok: false, msg: "userId requerido" });
        }

        // Obtener lodux del usuario desde UserStyleLT
        const [rows] = await pool.query(
            "SELECT lodux FROM UserStyleLT WHERE idUsuario = ? LIMIT 1",
            [userId]
        );

        if (rows.length === 0) {
            // Si no existe, crear registro con lodux inicial
            await pool.query(
                "INSERT INTO UserStyleLT (idUsuario, lodux) VALUES (?, ?)",
                [userId, 1000] // 1000 lodux inicial
            );
            return res.json({ ok: true, lodux: 1000 });
        }

        res.json({ ok: true, lodux: rows[0].lodux || 0 });
    } catch (e) {
        console.error("GET /api/shop/balance", e);
        res.status(500).json({ ok: false, msg: "Error del servidor" });
    }
});

// Comprar un item
app.post("/api/shop/purchase", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { userId, itemId } = req.body;

        if (!userId || !itemId) {
            return res.status(400).json({ ok: false, msg: "Faltan datos requeridos" });
        }

        await connection.beginTransaction();

        // Verificar que el item existe y obtener su precio
        const [itemRows] = await connection.query(
            "SELECT precio, titulo FROM ShopItemsLT WHERE idItem = ? LIMIT 1",
            [itemId]
        );

        if (itemRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ ok: false, msg: "Item no encontrado" });
        }

        const { precio, titulo } = itemRows[0];

        // Verificar que el usuario no haya comprado ya este item
        const [purchaseCheck] = await connection.query(
            "SELECT idCompra FROM UserPurchasesLT WHERE idUsuario = ? AND idItem = ? LIMIT 1",
            [userId, itemId]
        );

        if (purchaseCheck.length > 0) {
            await connection.rollback();
            return res.status(409).json({ ok: false, msg: "Ya tienes este item" });
        }

        // Obtener lodux actual del usuario
        const [userRows] = await connection.query(
            "SELECT lodux FROM UserStyleLT WHERE idUsuario = ? LIMIT 1",
            [userId]
        );

        if (userRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ ok: false, msg: "Usuario no encontrado en UserStyleLT" });
        }

        const loduxActual = userRows[0].lodux || 0;

        // Verificar que tiene suficientes lodux
        if (loduxActual < precio) {
            await connection.rollback();
            return res.status(400).json({
                ok: false,
                msg: `No tienes suficientes lodux. Necesitas ${precio - loduxActual} más`
            });
        }

        const nuevoSaldo = loduxActual - precio;

        // Actualizar saldo
        await connection.query(
            "UPDATE UserStyleLT SET lodux = ? WHERE idUsuario = ?",
            [nuevoSaldo, userId]
        );

        // Registrar la compra
        await connection.query(
            "INSERT INTO UserPurchasesLT (idUsuario, idItem, fecha) VALUES (?, ?, NOW())",
            [userId, itemId]
        );

        // Registrar en el ledger de transacciones
        await connection.query(
            "INSERT INTO LoduxLedgerLT (tipo, monto, concepto, fecha) VALUES (?, ?, ?, NOW())",
            ["purchase", precio, `Compra: ${titulo}`]
        );

        await connection.commit();

        res.json({
            ok: true,
            msg: "Compra exitosa",
            nuevoSaldo,
            itemComprado: titulo
        });

    } catch (e) {
        await connection.rollback();
        console.error("POST /api/shop/purchase", e);
        res.status(500).json({ ok: false, msg: "Error en el servidor" });
    } finally {
        connection.release();
    }
});

// Dar lodux a un usuario (para admins o sistema de recompensas)
app.post("/api/shop/grant-lodux", async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { userId, monto, concepto } = req.body;

        if (!userId || !monto || monto <= 0) {
            return res.status(400).json({ ok: false, msg: "Datos inválidos" });
        }

        await connection.beginTransaction();

        // Verificar si el usuario existe en UserStyleLT
        const [userRows] = await connection.query(
            "SELECT lodux FROM UserStyleLT WHERE idUsuario = ? LIMIT 1",
            [userId]
        );

        if (userRows.length === 0) {
            // Si no existe, crear registro
            await connection.query(
                "INSERT INTO UserStyleLT (idUsuario, lodux) VALUES (?, ?)",
                [userId, monto]
            );
        } else {
            // Si existe, sumar al saldo actual
            const nuevoSaldo = (userRows[0].lodux || 0) + monto;
            await connection.query(
                "UPDATE UserStyleLT SET lodux = ? WHERE idUsuario = ?",
                [nuevoSaldo, userId]
            );
        }

        // Registrar en el ledger
        await connection.query(
            "INSERT INTO LoduxLedgerLT (tipo, monto, concepto, fecha) VALUES (?, ?, ?, NOW())",
            ["grant", monto, concepto || "Lodux otorgado"]
        );

        await connection.commit();

        // Obtener nuevo saldo
        const [newBalance] = await connection.query(
            "SELECT lodux FROM UserStyleLT WHERE idUsuario = ? LIMIT 1",
            [userId]
        );

        res.json({
            ok: true,
            msg: "Lodux otorgado exitosamente",
            nuevoSaldo: newBalance[0].lodux
        });

    } catch (e) {
        await connection.rollback();
        console.error("POST /api/shop/grant-lodux", e);
        res.status(500).json({ ok: false, msg: "Error del servidor" });
    } finally {
        connection.release();
    }
});

// ========================================
//        ENDPOINT DE SCORES
// ========================================

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    try {
        const [rows] = await pool.query(`
    SELECT
        u.nombre AS player,
        p.puntaje_classic AS classic,
        p.puntaje_time AS time,
        p.trofeos_total AS trophies,
        p.puntaje_total AS total,
        p.victorias_classic,
        p.victorias_time,
        (p.victorias_classic + p.victorias_time) AS victorias_total
        FROM PuntajesLT p
        INNER JOIN UsuariosLT u ON p.idUsuario = u.idUsuarios
        ORDER BY p.puntaje_total DESC, p.trofeos_total DESC
        LIMIT 10
    `);

        return res.status(200).json(rows);
    } catch (error) {
        console.error('❌ Error al obtener scores:', error);
        return res.status(500).json({ error: 'Error al obtener scores' });
    }
}


