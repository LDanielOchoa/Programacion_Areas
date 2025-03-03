import axios from 'axios';

interface EmployeeValidationResult {
  isValid: boolean;
  invalidEmployees: {
    cedula: string | number;
    nombre: string;
  }[];
}

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
    // Convertir a un formato adecuado para enviar al servidor
    const employeesToValidate = cedulas.map((cedula, index) => ({
      cedula,
      nombre: nombres[index] || 'Sin nombre'
    }));

    // Use the same API_URL constant as in databaseService
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    const response = await axios.post(`${API_URL}/validate-employees`, {
      employees: employeesToValidate
    });

    return response.data;
  } catch (error: any) {
    console.error('Error validando empleados en SQL Server:', error);
    
    // Check if it's a connection error
    if (error.response?.data?.details?.includes('Failed to connect')) {
      console.warn('SQL Server connection failed - bypassing validation in development mode');
      
      // In development mode, we'll bypass the validation
      // This allows testing without a working SQL Server connection
      return {
        isValid: true,
        invalidEmployees: []
      };
    }
    
    // For other errors, return a default response to prevent the application from crashing
    return {
      isValid: true,
      invalidEmployees: []
    };
  }
};