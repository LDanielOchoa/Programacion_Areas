import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.DB_HOST || '190.90.160.5',
  user: process.env.DB_USER || 'saocomct_camaras',
  password: process.env.DB_PASSWORD || '1t&F)DQG6BLq',
  database: process.env.DB_NAME || 'saocomct_camaras',
};

async function testMySQLQuery() {
  try {
    const connection = await mysql.createConnection(mysqlConfig);
    const [rows] = await connection.execute('SELECT * FROM programacion_empleados LIMIT 10');
    console.log('Resultado de la consulta:', rows);
    await connection.end();
  } catch (error) {
    console.error('Error ejecutando consulta SQL:', error);
  }
}

testMySQLQuery();
