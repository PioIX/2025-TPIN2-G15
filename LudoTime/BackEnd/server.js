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

const io = new Server(server, {
    cors: {
        origin: "*", // Permite conexiones desde cualquier origen
        methods: ["GET", "POST"],
        credentials: false
    }
});

// ========================================
//        CONFIGURACIÓN DE SOCKET.IO
// ========================================

// Objeto para almacenar usuarios conectados y salas
const connectedUsers = new Map();
const rooms = new Map();

io.on('connection', (socket) => {
    console.log('Usuario conectado:', socket.id);

    // Evento: Crear sala
    socket.on('create-room', (data) => {
        const { userId, userName, gameMode, maxPlayers } = data;
        const roomId = 'room-' + Math.random().toString(36).substr(2, 9);

        // Crear información de la sala
        const room = {
            id: roomId,
            gameMode,
            maxPlayers,
            players: [{
                socketId: socket.id,
                userId,
                userName,
                isHost: true
            }],
            gameState: null,
            createdAt: new Date()
        };

        rooms.set(roomId, room);
        connectedUsers.set(socket.id, { userId, userName, roomId, isHost: true });

        socket.join(roomId);
        console.log(`Sala creada: ${roomId} por ${userName}`);

        socket.emit('room-created', {
            roomId,
            players: room.players
        });
    });

    // Evento: Unirse a una sala existente
    socket.on('join-room', (data) => {
        const { userId, userName, roomId } = data;
        console.log(`🔍 Intento de unirse a sala - RoomId recibido: ${roomId}`);
        console.log(`📋 Salas disponibles:`, Array.from(rooms.keys()));

        const room = rooms.get(roomId);

        if (!room) {
            console.error(`❌ Sala no encontrada: ${roomId}`);
            socket.emit('error', { message: 'Sala no encontrada. Verifica el código.' });
            return;
        }

        if (room.players.length >= room.maxPlayers) {
            socket.emit('error', { message: 'Sala llena' });
            return;
        }

        // Agregar jugador a la sala
        const player = {
            socketId: socket.id,
            userId,
            userName,
            isHost: false
        };

        room.players.push(player);
        connectedUsers.set(socket.id, { userId, userName, roomId, isHost: false });

        socket.join(roomId);
        console.log(`${userName} se unió a la sala: ${roomId}`);

        // Notificar al jugador que se unió
        socket.emit('room-created', {
            roomId,
            players: room.players
        });

        // Notificar a todos en la sala
        io.to(roomId).emit('player-joined', {
            players: room.players,
            newPlayer: player
        });
    });

    // Evento: Salir de una sala
    socket.on('leave-room', (data) => {
        const { roomId } = data;
        const user = connectedUsers.get(socket.id);
        const room = rooms.get(roomId);

        if (user && room) {
            // Remover jugador de la sala
            room.players = room.players.filter(p => p.socketId !== socket.id);

            socket.leave(roomId);
            console.log(`${user.userName} salió de la sala: ${roomId}`);

            // Si era el host, asignar nuevo host
            if (user.isHost && room.players.length > 0) {
                room.players[0].isHost = true;
                const newHost = connectedUsers.get(room.players[0].socketId);
                if (newHost) newHost.isHost = true;
            }

            // Si no quedan jugadores, eliminar la sala
            if (room.players.length === 0) {
                rooms.delete(roomId);
                console.log(`Sala eliminada: ${roomId}`);
            } else {
                // Notificar a los demás
                io.to(roomId).emit('player-left', {
                    players: room.players,
                    leftPlayer: { userId: user.userId, userName: user.userName }
                });
            }

            connectedUsers.delete(socket.id);
        }
    });

    // Evento: Iniciar juego
    socket.on('start-game', (data) => {
        const { roomId } = data;
        const room = rooms.get(roomId);
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

        console.log(`Juego iniciado en sala: ${roomId}`);

        // Notificar a todos en la sala que el juego comienza
        io.to(roomId).emit('game-start', {
            roomId,
            players: room.players,
            gameState: { /* estado inicial del juego */ }
        });
    });

    // Evento: Usuario se une a una sala (legacy - mantener por compatibilidad)
    socket.on('join-game', (data) => {
        const { userId, userName, roomId } = data;
        
        // Guardar información del usuario
        connectedUsers.set(socket.id, { userId, userName, roomId });
        
        // Unirse a la sala
        socket.join(roomId);
        
        console.log(`${userName} se unió a la sala: ${roomId}`);
        
        // Notificar a otros usuarios en la sala
        socket.to(roomId).emit('user-joined', {
            userId,
            userName,
            socketId: socket.id
        });
        
        // Enviar lista de usuarios en la sala
        const usersInRoom = Array.from(connectedUsers.entries())
            .filter(([_, user]) => user.roomId === roomId)
            .map(([socketId, user]) => ({ socketId, ...user }));
        
        io.to(roomId).emit('room-users', usersInRoom);
    });

    // Evento: Movimiento del juego
    socket.on('game-move', (data) => {
        const { roomId, move, gameState } = data;
        
        // Reenviar el movimiento a todos en la sala excepto al emisor
        socket.to(roomId).emit('opponent-move', {
            move,
            gameState,
            playerId: socket.id
        });
    });

    // Evento: Chat en la sala
    socket.on('chat-message', (data) => {
        const { roomId, message } = data;
        const user = connectedUsers.get(socket.id);
        
        if (user) {
            io.to(roomId).emit('chat-message', {
                userName: user.userName,
                message,
                timestamp: new Date().toISOString()
            });
        }
    });

    // Evento: Solicitud de emparejamiento
    socket.on('find-match', (data) => {
        const { userId, userName, gameMode } = data;
        
        // Aquí implementarías tu lógica de matchmaking
        console.log(`${userName} busca partida en modo: ${gameMode}`);
        
        // Ejemplo básico: notificar que se está buscando
        socket.emit('searching-match', { gameMode });
    });

    // Evento: Cancelar búsqueda
    socket.on('cancel-search', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            console.log(`${user.userName} canceló la búsqueda`);
            socket.emit('search-cancelled');
        }
    });

    // Evento: Rendirse
    socket.on('surrender', (data) => {
        const { roomId } = data;
        const user = connectedUsers.get(socket.id);
        
        if (user) {
            socket.to(roomId).emit('opponent-surrendered', {
                userName: user.userName
            });
        }
    });

    // Evento: Desconexión
    socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        
        if (user) {
            console.log(`Usuario desconectado: ${user.userName}`);
            
            // Notificar a la sala
            if (user.roomId) {
                socket.to(user.roomId).emit('user-left', {
                    userId: user.userId,
                    userName: user.userName,
                    socketId: socket.id
                });
            }
            
            // Eliminar del mapa
            connectedUsers.delete(socket.id);
        }
    });

    // Evento de    or
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});