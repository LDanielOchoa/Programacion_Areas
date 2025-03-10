import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.DB_HOST || 'maglev.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'vweBcUhlUkhjGenFhVPJpjKhSoRVpOVr',
  database: process.env.DB_NAME || 'railway',
  port: 55308, // Agregar puerto explícito
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000 // Aumentar tiempo de conexión
};

async function testMySQLQuery() {
  try {
    const connection = await mysql.createConnection(mysqlConfig);
    const [rows] = await connection.execute('SELECT * FROM personas_validas LIMIT 10');
    console.log('Resultado de la consulta:', rows);
    await connection.end();
  } catch (error) {
    console.error('Error ejecutando consulta SQL:', error);
  }
}

testMySQLQuery();
