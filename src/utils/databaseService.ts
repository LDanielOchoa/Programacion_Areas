import axios from 'axios';
import { DatabaseRecord } from '../types';

const API_URL = 'https://programacion-areas-khbj.onrender.com/api';

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
   
    if (!records || !Array.isArray(records) || records.length === 0) {
      const error = 'No hay registros válidos para guardar';
      logDebug(`Error de validación: ${error}`);
      throw new Error(error);
    }
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
    
    logDebug(`Muestra de datos a enviar:`, records.slice(0, 2));
    
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
      timeout: 30000 
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
      logDebug(`Error de respuesta del servidor: ${error.response.status}`, error.response.data);
      throw new Error(`Error del servidor: ${error.response.status} - ${error.response.data?.error || 'Error desconocido'}`);
    } else if (error.request) {
      logDebug(`No se recibió respuesta del servidor`, error.request);
      throw new Error('No se recibió respuesta del servidor. Verifique su conexión a internet o si el servidor está en funcionamiento.');
    } else {
      logDebug(`Error al configurar la solicitud`, error);
      throw error;
    }
  }
};

const formatDateToYYYYMMDD = (dateStr: string): string => {
  try {
    if (dateStr.includes('-')) {
      if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
        return dateStr.split('T')[0]; 
      }
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
        
        const currentYear = new Date().getFullYear();
        
        let monthNum = '01';
        for (const [key, value] of Object.entries(monthMap)) {
          if (month.includes(key)) {
            monthNum = value;
            break;
          }
        }
        
        const paddedDay = day.padStart(2, '0');
        
        return `${currentYear}-${monthNum}-${paddedDay}`;
      }
    }
    
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    return dateStr;
  } catch (e) {
    console.error('Error formatting date:', e);
    return dateStr;
  }
};

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
    
    const formattedDates = dates.map(date => {
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
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
      timeout: 15000 
    });
    
    logDebug(`Respuesta de verificación de fechas:`, response.data);
    return response.data;
  } catch (error: any) {
    logDebug(`Error en checkDatesExist: ${error.message}`);
    
    if (error.response?.status === 500) {
      logDebug('MySQL connection failed - bypassing date check in development mode');
      
      return {
        exists: false,
        existingDates: []
      };
    }
    
    if (error.response) {
      logDebug(`Error de respuesta: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      logDebug('No se recibió respuesta del servidor al verificar fechas');
    }
    return {
      exists: false,
      existingDates: []
    };
  }
};