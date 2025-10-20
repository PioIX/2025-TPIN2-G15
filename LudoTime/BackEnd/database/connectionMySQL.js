import {createPool} from 'mysql2/promise';

export const pool = createPool({
    host: 'Gitlab2019',
    port: 3306,
    database: '2025-5INF-G15',
    user: '2025-5INF-G15',
    password: 'melaniegil'
});