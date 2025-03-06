import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.DB_HOST || '192.168.90.32',
  user: process.env.DB_USER || 'desarrollo',
  password: process.env.DB_PASSWORD || 'test_24*',
  database: process.env.DB_NAME || 'bdsaocomco_operaciones',
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
