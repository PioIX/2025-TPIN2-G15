import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcryptjs";
import { pool } from "./database/connectionMySQL.js";

const app = express();

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
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
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