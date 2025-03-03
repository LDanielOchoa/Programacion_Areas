import * as XLSX from 'xlsx';
import { ExcelData } from '../types';

export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        
        // Validate that the file is actually an Excel file
        try {
          const workbook = XLSX.read(data, { type: 'binary' });
          
          // Check if workbook has sheets
          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            reject(new Error('El archivo Excel no contiene hojas de cálculo'));
            return;
          }
          
          // Look for the specific sheet "Formato programación"
          const sheetName = workbook.SheetNames.find(name => name.toLowerCase().includes('formato programación'));
          
          if (!sheetName) {
            reject(new Error('No se encontró la hoja "Formato programación" en el archivo'));
            return;
          }
          
          const worksheet = workbook.Sheets[sheetName];
          
          // Check if worksheet has data
          if (!worksheet || Object.keys(worksheet).length <= 2) { // Usually '!ref' and some other metadata
            reject(new Error('La hoja de cálculo está vacía'));
            return;
          }
          
          // Convert to array of arrays
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false });
          
          if (jsonData.length === 0) {
            reject(new Error('El archivo Excel está vacío'));
            return;
          }
          
          // Validate specific cells for the expected format
          // Check for responsible name in C9
          const responsibleName = jsonData[8]?.[2];
          if (!responsibleName) {
            reject(new Error('No se encontró el nombre del responsable en la celda C9'));
            return;
          }
          
          // Check for dates in C10
          const dateRange = jsonData[9]?.[2];
          if (!dateRange) {
            reject(new Error('No se encontró el rango de fechas en la celda C10'));
            return;
          }
          
          // Check for headers in row 12 (A12-D12)
          const headers = jsonData[11]?.slice(0, 4);
          if (!headers || headers.length < 4 || headers.some(h => !h)) {
            reject(new Error('No se encontraron los encabezados correctos en las celdas A12-D12'));
            return;
          }
          
          // Check for dates in row 12 (E12-K12)
          const dateHeaders = jsonData[11]?.slice(4, 11);
          if (!dateHeaders || dateHeaders.length < 1 || dateHeaders.some(h => !h)) {
            reject(new Error('No se encontraron las fechas en las celdas E12-K12'));
            return;
          }
          
          // Validate IDs in column B (from B13 downwards)
          const ids = [];
          for (let i = 12; i < jsonData.length; i++) {
            if (jsonData[i]?.[1]) {
              ids.push(jsonData[i][1]);
            }
          }
          
          if (ids.length === 0) {
            reject(new Error('No se encontraron cédulas en la columna B'));
            return;
          }
          
          // Validate names in column C (from C13 downwards)
          const names = [];
          for (let i = 12; i < jsonData.length; i++) {
            if (jsonData[i]?.[2]) {
              names.push(jsonData[i][2]);
            }
          }
          
          if (names.length === 0) {
            reject(new Error('No se encontraron nombres en la columna C'));
            return;
          }
          
          // Validate positions in column D (from D13 downwards)
          const positions = [];
          for (let i = 12; i < jsonData.length; i++) {
            if (jsonData[i]?.[3]) {
              positions.push(jsonData[i][3]);
            }
          }
          
          if (positions.length === 0) {
            reject(new Error('No se encontraron cargos en la columna D'));
            return;
          }
          
          // Validate shifts in columns E-K (from row 13 downwards)
          let hasInvalidShift = false;
          let invalidShiftCell = '';
          
          for (let i = 12; i < jsonData.length; i++) {
            for (let j = 4; j < 11; j++) {
              const shift = jsonData[i]?.[j];
              if (shift) {
                // Check if shift has a valid format (e.g., "12:45-20:45" or "DESCANSO")
                const isValidFormat = 
                  typeof shift === 'string' && 
                  (shift.toUpperCase() === 'DESCANSO' || 
                   shift.toUpperCase() === 'VACACIONES' ||
                   /^\d{1,2}:\d{2} - \d{1,2}:\d{2}$/.test(shift));
                
                if (!isValidFormat) {
                  hasInvalidShift = true;
                  const col = String.fromCharCode(69 + (j - 4)); // E, F, G, etc.
                  invalidShiftCell = `${col}${i + 1}`;
                  break;
                }
              }
            }
            if (hasInvalidShift) break;
          }
          
          if (hasInvalidShift) {
            reject(new Error(`Se encontró un turno con formato inválido en la celda ${invalidShiftCell}. El formato debe ser "HH:MM-HH:MM" o "DESCANSO" o "VACACIONES"`));
            return;
          }
          
          // All validations passed, prepare the data
          const allHeaders = [...headers, ...dateHeaders];
          const rows = jsonData.slice(12).filter(row => row.length > 0);
          
          // Add metadata to the first row
          const metadataRow = [
            'Responsable:', responsibleName, 'Fechas:', dateRange, '', '', ''
          ];
          
          resolve({
            headers: allHeaders,
            rows: [metadataRow, ...rows]
          });
        } catch (parseError) {
          reject(new Error('El archivo no es un documento Excel válido o está dañado'));
          return;
        }
      } catch (error) {
        reject(new Error('Error al procesar el archivo Excel'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };
    
    // Set a timeout to handle very large files
    const timeout = setTimeout(() => {
      reader.abort();
      reject(new Error('El archivo es demasiado grande o complejo para procesarlo'));
    }, 30000); // 30 seconds timeout
    
    reader.onloadend = () => {
      clearTimeout(timeout);
    };
    
    try {
      reader.readAsBinaryString(file);
    } catch (error) {
      clearTimeout(timeout);
      reject(new Error('No se pudo leer el archivo. Puede estar dañado o ser demasiado grande'));
    }
  });
};