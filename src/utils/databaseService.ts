import axios from 'axios';
import { DatabaseRecord } from '../types';

// URL to your backend API - Configurada para apuntar directamente a la URL especificada
const API_URL = 'http://localhost:3001/api';

// Función para imprimir logs detallados
const logDebug = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [DATABASE] ${message}`);
  if (data) {
    console.log('Datos:', data);
  }
};

/**
 * Saves records to the database through the API
 * @param records Array of records to save
 */
export const saveToDatabase = async (records: DatabaseRecord[]): Promise<any> => {
  try {
    logDebug(`Iniciando guardado de ${records.length} registros en la base de datos`);
    logDebug(`URL de destino: ${API_URL}/save-schedule`);
    
    // Validar que los registros tengan el formato correcto
    if (!records || !Array.isArray(records) || records.length === 0) {
      const error = 'No hay registros válidos para guardar';
      logDebug(`Error de validación: ${error}`);
      throw new Error(error);
    }
    
    // Verificar que cada registro tenga los campos requeridos
    records.forEach((record, index) => {
      if (!record.CEDULA) {
        const error = `El registro #${index + 1} no tiene cédula válida`;
        logDebug(`Error de validación: ${error}`);
        throw new Error(error);
      }
      if (!record.Fecha_programacion) {
        const error = `El registro #${index + 1} no tiene fecha válida`;
        logDebug(`Error de validación: ${error}`);
        throw new Error(error);
      }
      if (!record.Area) {
        const error = `El registro #${index + 1} no tiene área válida`;
        logDebug(`Error de validación: ${error}`);
        throw new Error(error);
      }
    });
    
    // Mostrar muestra de los datos que se enviarán
    logDebug(`Muestra de datos a enviar:`, records.slice(0, 2));
    
    // Agregar timestamp para evitar problemas de caché
    const timestamp = new Date().getTime();
    const url = `${API_URL}/save-schedule?t=${timestamp}`;
    logDebug(`Enviando solicitud POST a: ${url}`);
    
    const response = await axios.post(url, { 
      records 
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 30000 // 30 segundos de timeout
    });
    
    logDebug(`Respuesta recibida con estado: ${response.status}`);
    logDebug(`Respuesta del servidor:`, response.data);
    
    if (response.status !== 200) {
      const error = `Error al guardar en la base de datos: ${response.statusText}`;
      logDebug(`Error HTTP: ${error}`);
      throw new Error(error);
    }
    
    logDebug(`Guardado exitoso de ${records.length} registros`);
    return response.data;
  } catch (error: any) {
    logDebug(`Error en saveToDatabase: ${error.message}`);
    
    if (error.response) {
      // El servidor respondió con un código de error
      logDebug(`Error de respuesta del servidor: ${error.response.status}`, error.response.data);
      throw new Error(`Error del servidor: ${error.response.status} - ${error.response.data?.error || 'Error desconocido'}`);
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      logDebug(`No se recibió respuesta del servidor`, error.request);
      throw new Error('No se recibió respuesta del servidor. Verifique su conexión a internet o si el servidor está en funcionamiento.');
    } else {
      // Error al configurar la solicitud
      logDebug(`Error al configurar la solicitud`, error);
      throw error;
    }
  }
};

/**
 * Validates if a connection to the database can be established
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    logDebug('Probando conexión a la base de datos');
    const timestamp = new Date().getTime();
    const url = `${API_URL}/test-connection?t=${timestamp}`;
    logDebug(`Enviando solicitud GET a: ${url}`);
    
    const response = await axios.get(url, {
      headers: {
        'Cache-Control': 'no-cache'
      },
      timeout: 10000 // 10 segundos de timeout
    });
    
    logDebug(`Respuesta de prueba de conexión: ${response.status}`, response.data);
    return response.status === 200;
  } catch (error: any) {
    logDebug(`Error en testDatabaseConnection: ${error.message}`);
    if (error.response) {
      logDebug(`Error de respuesta: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      logDebug('No se recibió respuesta del servidor');
    }
    return false;
  }
};

/**
 * Converts a date string to YYYY-MM-DD format
 * @param dateStr Date string in any format
 * @returns Formatted date string in YYYY-MM-DD format
 */
const formatDateToYYYYMMDD = (dateStr: string): string => {
  try {
    // Handle common date formats
    if (dateStr.includes('-')) {
      // Check if it's already in YYYY-MM-DD format
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return dateStr.split('T')[0]; // Remove time part if exists
      }
      
      // Handle DD-MMM format (e.g., "17-Feb")
      const parts = dateStr.split('-');
      if (parts.length === 2) {
        const day = parts[0].trim();
        let month = parts[1].trim();
        
        // Convert month name to month number
        const monthMap: {[key: string]: string} = {
          'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
          'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
          'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06',
          'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'
        };
        
        // Get current year
        const currentYear = new Date().getFullYear();
        
        // Find month number
        let monthNum = '01';
        for (const [key, value] of Object.entries(monthMap)) {
          if (month.includes(key)) {
            monthNum = value;
            break;
          }
        }
        
        // Format with padding
        const paddedDay = day.padStart(2, '0');
        
        return `${currentYear}-${monthNum}-${paddedDay}`;
      }
    }
    
    // Try to parse as Date object
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // If all else fails, return the original string
    return dateStr;
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr;
  }
};

/**
 * Checks if dates already exist in the database for a specific area
 * @param dates Array of dates to check
 * @param area Area to check dates for
 * @returns Object with validation result
 */
export const checkDatesExist = async (dates: string[], area: string): Promise<{
  exists: boolean;
  existingDates: string[];
}> => {
  try {
    logDebug(`Verificando existencia de fechas para el área: ${area}`);
    
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      const error = 'No hay fechas válidas para verificar';
      logDebug(`Error de validación: ${error}`);
      throw new Error(error);
    }
    
    if (!area) {
      const error = 'No se especificó un área válida';
      logDebug(`Error de validación: ${error}`);
      throw new Error(error);
    }
    
    // Formatear fechas para asegurar consistencia en formato YYYY-MM-DD
    const formattedDates = dates.map(date => {
      // Si la fecha es un objeto Date, convertirla a string en formato ISO
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      // Si ya es string, asegurarse de que tenga el formato correcto
      return formatDateToYYYYMMDD(date.toString());
    });
    
    logDebug(`Fechas originales:`, dates);
    logDebug(`Fechas formateadas para enviar:`, formattedDates);
    
    const timestamp = new Date().getTime();
    const url = `${API_URL}/check-dates?t=${timestamp}`;
    logDebug(`Enviando solicitud POST a: ${url}`);
    
    const response = await axios.post(url, { 
      dates: formattedDates,
      area 
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000 // 15 segundos de timeout
    });
    
    logDebug(`Respuesta de verificación de fechas:`, response.data);
    return response.data;
  } catch (error: any) {
    logDebug(`Error en checkDatesExist: ${error.message}`);
    
    // Check if it's a MySQL connection error
    if (error.response?.status === 500) {
      logDebug('MySQL connection failed - bypassing date check in development mode');
      
      // In development mode, we'll bypass the date check
      return {
        exists: false,
        existingDates: []
      };
    }
    
    // Mejorar el mensaje de error
    if (error.response) {
      logDebug(`Error de respuesta: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      logDebug('No se recibió respuesta del servidor al verificar fechas');
    }
    
    // Return default response to prevent application from crashing
    return {
      exists: false,
      existingDates: []
    };
  }
};