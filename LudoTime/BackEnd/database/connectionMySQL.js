import {createPool} from 'mysql2/promise';

export const pool = createPool({
    host: process.env.MYSQL_HOST,
    port: 3306,
    database: process.env.MYSQL_DB,
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    charset: 'UTF8_GENERAL_CI'
});

try {
    const [rows] = await pool.query('SELECT 1');
    console.log('✅ Conexión MySQL exitosa');
} catch (error) {
    console.error('❌ Error al conectar con MySQL:', error);
}