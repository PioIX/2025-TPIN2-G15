import { pool } from "./database/connectionMySQL.js";

const getData = async () => {
    try{
        const result = await pool.query('SELECT * FROM MensajesWPP;');
        console.log(result); 
    } catch (err) {
        console.error(err);
    }
};

getData();