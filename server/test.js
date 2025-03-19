import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3307;

app.use(cors());
app.use(express.json({ limit: '50mb' })); 

const dbConfig = {
  host: process.env.DB_HOST || 'maglev.proxy.rlwy.net',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'vweBcUhlUkhjGenFhVPJpjKhSoRVpOVr',
  database: process.env.DB_NAME || 'railway',
  port: 55308, 
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000 
};

const pool = mysql.createPool(dbConfig);

const secondaryDbConfig = {
  host: process.env.SQL_DB_HOST || 'maglev.proxy.rlwy.net', 
  user: process.env.SQL_DB_USER || 'root',
  password: process.env.SQL_DB_PASSWORD || 'vweBcUhlUkhjGenFhVPJpjKhSoRVpOVr',
  database: process.env.SQL_DB_NAME || 'railway',
  port: 55308, 
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000
};

const secondaryPool = mysql.createPool(secondaryDbConfig);

// Test database connection
app.get('/api/test-connection', async (req, res) => {
  try {
    console.log('[INFO] Testing MySQL connection...');
    const connection = await pool.getConnection();
    connection.release();
    console.log('[INFO] MySQL connection successful');
    res.status(200).json({ message: 'Database connection successful' });
  } catch (error) {
    console.error('[ERROR] MySQL connection error:', error);
    res.status(500).json({ error: 'Failed to connect to database', details: error.message });
  }
});

// Validate employees
app.post('/api/validate-employees', async (req, res) => {
  console.log('Configuración BD principal:', dbConfig);
  console.log('Configuración BD secundaria:', secondaryDbConfig);
  const { employees } = req.body;
  console.log('[INFO] Petición recibida en /api/validate-employees');

  if (!Array.isArray(employees)) {
    return res.status(400).json({ error: 'Formato de lista de empleados inválido' });
  }

  const validEmployees = employees.filter(emp => emp.cedula !== null && emp.cedula !== undefined);

  if (validEmployees.length === 0) {
    return res.status(400).json({ error: 'No hay cédulas válidas para procesar' });
  }

  if (validEmployees.length > 1000) {
    return res.status(400).json({ error: 'Máximo 1000 empleados por solicitud' });
  }

  try {
    console.log('[INFO] Conectando a MySQL secundario...');
    const connection = await secondaryPool.getConnection();

    const cedulas = validEmployees
      .map(emp => {
        const cleaned = emp.cedula.toString().replace(/[^\d]/g, '').trim();
        return cleaned || null;
      })
      .filter(Boolean);

    if (cedulas.length === 0) {
      return res.status(400).json({ error: 'Ninguna cédula válida encontrada' });
    }

    const placeholders = cedulas.map(() => '?').join(',');
    const query = `
      SELECT
        TRIM(
          REPLACE(
            CONVERT(F200_NIT USING latin1),
            CHAR(160), 
            ''
          )
        ) AS F200_ID 
      FROM personas_validas 
      WHERE 
        TRIM(
          REPLACE(
            CONVERT(F200_NIT USING latin1), 
            CHAR(160), 
            ''
          )
        ) IN (${placeholders});
    `;

    console.log('[INFO] Ejecutando consulta MySQL:', query);
    const [rows] = await connection.execute(query, cedulas);
    connection.release();

    const validCedulas = new Set(
      rows.map(record => 
        record.F200_ID?.replace(/[^\d]/g, '').trim() || ''
      )
    );

    const invalidEmployees = validEmployees.filter(emp => {
      const cleaned = emp.cedula.toString().replace(/[^\d]/g, '').trim();
      return !validCedulas.has(cleaned);
    });

    res.status(200).json({
      isValid: invalidEmployees.length === 0,
      invalidEmployees: invalidEmployees.map(emp => ({
        cedula: emp.cedula,
        nombre: emp.nombre || 'No disponible'
      })),
      meta: {
        totalChecked: validEmployees.length,
        validCount: validCedulas.size,
        invalidCount: invalidEmployees.length
      }
    });

  } catch (error) {
    console.error('[ERROR] Error en validación:', error);
    res.status(500).json({
      error: 'Error en validación',
      details: process.env.NODE_ENV === 'development' ? error.message : null
    });
  }
});

// Check dates
app.post('/api/check-dates', async (req, res) => {
  const { dates, area } = req.body;
  console.log('[INFO] Petición recibida en /api/check-dates');
  console.log('[DEBUG] Datos recibidos:', { dates, area });
  
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    console.log('[ERROR] No se proporcionaron fechas para validar');
    return res.status(400).json({ error: 'No se proporcionaron fechas para validar' });
  }
  
  if (!area) {
    console.log('[ERROR] No se proporcionó el área para validar');
    return res.status(400).json({ error: 'No se proporcionó el área para validar' });
  }
  
  try {
    let connection;
    try {
      console.log('[INFO] Intentando conectar a MySQL...');
      connection = await pool.getConnection();
      console.log('[INFO] Conexión a MySQL establecida');
    } catch (connError) {
      console.error('[ERROR] MySQL connection error:', connError);
      
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        console.log('[INFO] Running in development mode - bypassing date check');
        return res.status(200).json({
          exists: false,
          existingDates: []
        });
      } else {
        throw connError; 
      }
    }
    
    try {
      const formattedDates = dates.map(date => {
        let formattedDate = date;
        if (date instanceof Date) {
          formattedDate = date.toISOString().split('T')[0];
        } else if (typeof date === 'string') {
          formattedDate = date.split('T')[0];
        }
        return `'${formattedDate}'`;
      }).join(',');
      
      console.log('[DEBUG] Fechas formateadas:', formattedDates);
      
      const [tables] = await connection.execute(`
        SELECT TABLE_NAME 
        FROM information_schema.tables 
        WHERE table_schema = ? 
        AND table_name = 'novedades_programacion_empleados'
      `, [dbConfig.database]);
      
      if (!tables || tables.length === 0) {
        console.log('[INFO] La tabla novedades_programacion_empleados no existe, se creará al guardar');
        return res.status(200).json({
          exists: false,
          existingDates: []
        });
      }
      
      const query = `
        SELECT DISTINCT FECHA_PROGRAMACION 
        FROM novedades_programacion_empleados 
        WHERE Area = ? 
          AND FECHA_PROGRAMACION IN (${formattedDates})
      `;
      
      console.log('[INFO] Ejecutando consulta:', query);
      console.log('[DEBUG] Parámetros:', [area]);
      
      const [rows] = await connection.execute(query, [area]);
      console.log('[DEBUG] Resultado de consulta:', rows);
      
      const existingDates = rows.map((row) => {
        if (row.FECHA_PROGRAMACION instanceof Date) {
          return row.FECHA_PROGRAMACION.toISOString().split('T')[0];
        } else if (typeof row.FECHA_PROGRAMACION === 'string') {
          return row.FECHA_PROGRAMACION.split('T')[0];
        }
        return row.FECHA_PROGRAMACION;
      });
      
      console.log('[INFO] Fechas existentes encontradas:', existingDates);
      
      res.status(200).json({
        exists: existingDates.length > 0,
        existingDates
      });
    } catch (error) {
      console.error('[ERROR] Error checking dates:', error);
      
      if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        console.log('[INFO] Error in date check query - bypassing in development mode');
        return res.status(200).json({
          exists: false,
          existingDates: []
        });
      }
      
      res.status(500).json({ error: 'Failed to check dates in database', details: error.message });
    } finally {
      connection.release();
      console.log('[INFO] Conexión a MySQL liberada');
    }
  } catch (error) {
    console.error('[ERROR] Database connection error:', error);
    res.status(500).json({ error: 'Failed to connect to database', details: error.message });
  }
});

app.post('/api/save-novedades', async (req, res) => {
  const records = req.body.records;
  const currentYear = new Date().getFullYear();
  
  console.log('[INFO] Recibidos registros para guardar novedades:', records.length);

  let connection;
  try {
    console.log('[INFO] Intentando conectar a MySQL...');
    connection = await pool.getConnection();
    console.log('[INFO] Conexión a MySQL establecida');

    // Verificar y crear tabla si no existe
    console.log('[INFO] Verificando estructura de la tabla...');
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME 
      FROM information_schema.tables 
      WHERE table_schema = ? 
      AND table_name = 'novedades_programacion_empleados'
    `, [dbConfig.database]);

    if (tables.length === 0) {
      console.log('[INFO] Creando tabla novedades_programacion_empleados...');
      await connection.execute(`
        CREATE TABLE novedades_programacion_empleados (
          id INT AUTO_INCREMENT PRIMARY KEY,
          FECHA_PROGRAMACION DATE NOT NULL,
          CEDULA INT NOT NULL,
          TIPO_NOVEDAD TEXT NOT NULL,
          FECHA_HORA_EXTRA DATE,
          HORA_INICIO_FIN TEXT,
          MOTIVO TEXT,
          CEDULA_AUTORIZA INT,
          AREA TEXT NOT NULL,
          QUINCENA TEXT NOT NULL,
          TIEMPO_DESCONTAR DOUBLE DEFAULT NULL,
          FECHA_CONSULTA DATETIME NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
      `);
      console.log('[INFO] Tabla creada exitosamente');
    }

    // Validar y preparar datos
    console.log('[INFO] Validando registros...');
    const values = [];
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    for (const [index, record] of records.entries()) {
      try {
        // Validar CEDULA
        const cedula = Number(record.CEDULA);
        if (isNaN(cedula)) {
          throw new Error(`CEDULA inválida: ${record.CEDULA}`);
        }

        // Validar fecha programación
        const fechaProg = new Date(record.FECHA_PROGRAMACION);
        if (isNaN(fechaProg.getTime())) {
          throw new Error(`Fecha de programación inválida: ${record.FECHA_PROGRAMACION}`);
        }

        // Validar fecha hora extra si existe
        let fechaHoraExtra = null;
        if (record.FECHA_HORA_EXTRA) {
          fechaHoraExtra = new Date(record.FECHA_HORA_EXTRA);
          if (isNaN(fechaHoraExtra.getTime())) {
            throw new Error(`Fecha hora extra inválida: ${record.FECHA_HORA_EXTRA}`);
          }
        }

        values.push([
          fechaProg.toISOString().split('T')[0],
          cedula,
          record.TIPO_NOVEDAD,
          fechaHoraExtra ? fechaHoraExtra.toISOString().split('T')[0] : null,
          record.HORA_INICIO_FIN || null,
          record.MOTIVO || null,
          record.CEDULA_AUTORIZA || null,
          record.AREA,
          record.QUINCENA,
          record.TIEMPO_DESCONTAR || 0,
          now
        ]);

      } catch (validationError) {
        console.error(`[ERROR] Error en registro ${index + 1}:`, validationError.message);
        return res.status(400).json({
          error: 'Error de validación de datos',
          details: validationError.message,
          failedRecord: record,
          recordIndex: index
        });
      }
    }

    // Transacción de inserción
    console.log('[INFO] Iniciando transacción...');
    await connection.beginTransaction();

    try {
      console.log('[INFO] Insertando registros...');
      const [result] = await connection.query(
        `INSERT INTO novedades_programacion_empleados 
        (FECHA_PROGRAMACION, CEDULA, TIPO_NOVEDAD, FECHA_HORA_EXTRA, 
         HORA_INICIO_FIN, MOTIVO, CEDULA_AUTORIZA, AREA, 
         QUINCENA, TIEMPO_DESCONTAR, FECHA_CONSULTA)
        VALUES ?`,
        [values]
      );

      console.log('[INFO] Confirmando transacción...');
      await connection.commit();

      console.log('[INFO] Registros insertados:', result.affectedRows);
      res.status(200).json({
        success: true,
        message: 'Datos guardados exitosamente',
        recordCount: result.affectedRows
      });

    } catch (insertError) {
      console.error('[ERROR] Error en inserción:', insertError);
      await connection.rollback();
      
      if (insertError.code === 'ER_DUP_ENTRY') {
        const match = insertError.message.match(/Duplicate entry '(.+)' for key/);
        return res.status(409).json({
          error: 'Registro duplicado',
          details: match ? `Conflicto en: ${match[1]}` : insertError.message
        });
      }

      res.status(500).json({
        error: 'Error al guardar los datos',
        details: insertError.message,
        sqlCode: insertError.code
      });
    }

  } catch (connectionError) {
    console.error('[ERROR] Error de conexión:', connectionError);
    
    const errorResponse = {
      error: 'Error de conexión a la base de datos',
      details: connectionError.message,
      code: connectionError.code
    };

    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = connectionError.stack;
      errorResponse.config = {
        database: dbConfig.database,
        host: dbConfig.host,
        port: dbConfig.port
      };
    }

    res.status(500).json(errorResponse);

  } finally {
    if (connection) {
      connection.release();
      console.log('[INFO] Conexión liberada');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});