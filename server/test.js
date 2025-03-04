import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const sqlServerConfig = {
  user: process.env.SQL_SERVER_USER || 'power-bi',
  password: process.env.SQL_SERVER_PASSWORD || 'Z1x2c3v4*',
  server: process.env.SQL_SERVER_HOST || '192.168.90.64',
  database: process.env.SQL_SERVER_DB || 'UNOEE',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function testSQLQuery() {
    try {
      let pool = await sql.connect(sqlServerConfig);
      let result = await pool.request().query(`
        SELECT TOP 10 * FROM BI_W0550
      `);
      console.log('Resultado de la consulta:', result.recordset);
      await pool.close();
    } catch (error) {
      console.error('Error ejecutando consulta SQL:', error);
    }
  }
  
  testSQLQuery();




