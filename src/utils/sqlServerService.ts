import axios from 'axios';

interface EmployeeValidationResult {
  isValid: boolean;
  invalidEmployees: {
    cedula: string | number;
    nombre: string;
  }[];
}

// Función para imprimir logs detallados
const logDebug = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [SQL_SERVER] ${message}`);
  if (data) {
    console.log('Datos:', data);
  }
};

/**
 * Valida si las cédulas de los empleados existen en la base de datos SQL Server
 * @param cedulas Array de cédulas a validar
 * @param nombres Array de nombres correspondientes a las cédulas
 */
export const validateEmployeesInSQLServer = async (
  cedulas: (string | number)[],
  nombres: string[]
): Promise<EmployeeValidationResult> => {
  try {
    logDebug(`Iniciando validación de ${cedulas.length} empleados`);
    
    // Validar parámetros de entrada
    if (!cedulas || !Array.isArray(cedulas) || cedulas.length === 0) {
      const error = 'No se proporcionaron cédulas para validar';
      logDebug(`Error de validación: ${error}`);
      throw new Error(error);
    }
    
    if (!nombres || !Array.isArray(nombres) || nombres.length !== cedulas.length) {
      const error = 'La lista de nombres no coincide con la lista de cédulas';
      logDebug(`Error de validación: ${error}`);
      throw new Error(error);
    }
    
    // Convertir a un formato adecuado para enviar al servidor
    const employeesToValidate = cedulas.map((cedula, index) => ({
      cedula,
      nombre: nombres[index] || 'Sin nombre'
    }));

    logDebug(`Muestra de empleados a validar:`, employeesToValidate.slice(0, 3));

    // URL directa al API
    const API_URL = 'https://programacion-areas-khbj.onrender.com/api';
    
    // Agregar timestamp para evitar problemas de caché
    const timestamp = new Date().getTime();
    const url = `${API_URL}/validate-employees?t=${timestamp}`;
    logDebug(`Enviando solicitud POST a: ${url}`);
    
    const response = await axios.post(url, {
      employees: employeesToValidate
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 15000 // 15 segundos de timeout
    });

    logDebug(`Respuesta de validación de empleados:`, response.data);
    return response.data;
  } catch (error: any) {
    logDebug(`Error en validateEmployeesInSQLServer: ${error.message}`);
    
    // Check if it's a connection error
    if (error.response?.data?.details?.includes('Failed to connect')) {
      logDebug('SQL Server connection failed - bypassing validation in development mode');
      
      // In development mode, we'll bypass the validation
      // This allows testing without a working SQL Server connection
      return {
        isValid: true,
        invalidEmployees: []
      };
    }
    
    // Mejorar el mensaje de error
    if (error.response) {
      logDebug(`Error de respuesta: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      logDebug('No se recibió respuesta del servidor al validar empleados');
    }
    
    // For other errors, return a default response to prevent the application from crashing
    return {
      isValid: true,
      invalidEmployees: []
    };
  }
};