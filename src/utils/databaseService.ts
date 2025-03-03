import axios from 'axios';
import { DatabaseRecord } from '../types';

// URL to your backend API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Saves records to the database through the API
 * @param records Array of records to save
 */
export const saveToDatabase = async (records: DatabaseRecord[]): Promise<any> => {
  try {
    // Format dates as strings for TEXT fields in the database
    const formattedRecords = records.map(record => ({
      ...record,
      // Ensure Fecha_programacion is a string
      Fecha_programacion: typeof record.Fecha_programacion === 'object' 
        ? record.Fecha_programacion.toISOString().split('T')[0] 
        : record.Fecha_programacion,
      // Ensure fecha_consulta is a string
      fecha_consulta: typeof record.fecha_consulta === 'object'
        ? record.fecha_consulta.toISOString()
        : record.fecha_consulta
    }));
    
    const response = await axios.post(`${API_URL}/save-schedule`, { records: formattedRecords });
    
    if (response.status !== 200) {
      throw new Error('Error al guardar en la base de datos');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error saving to database:', error);
    throw error;
  }
};

/**
 * Validates if a connection to the database can be established
 */
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await axios.get(`${API_URL}/test-connection`);
    return response.status === 200;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
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
    // Format dates as strings for TEXT fields in the database
    const formattedDates = dates.map(date => {
      if (typeof date === 'object' && date instanceof Date) {
        return date.toISOString().split('T')[0];
      }
      return date;
    });
    
    const response = await axios.post(`${API_URL}/check-dates`, { 
      dates: formattedDates,
      area
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error checking dates in database:', error);
    
    // Check if it's a MySQL connection error
    if (error.response?.status === 500) {
      console.warn('MySQL connection failed - bypassing date check in development mode');
      
      // In development mode, we'll bypass the date check
      return {
        exists: false,
        existingDates: []
      };
    }
    
    // Return default response to prevent application from crashing
    return {
      exists: false,
      existingDates: []
    };
  }
};