import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExcelData, AreaType } from '../types';
import { ArrowLeft, Save, Check, AlertCircle, AlertTriangle } from 'lucide-react';
import { saveToDatabase, checkDatesExist } from '../utils/databaseService';
import { validateEmployeesInSQLServer } from '../utils/sqlServerService';
import SaveAnimation from './SaveAnimation';
import EmployeeValidationModal from './EmployeeValidationModal';
import DateExistModal from './DateExistModal';

interface DataTableProps {
  data: ExcelData | null;
  selectedArea: AreaType;
  onBack: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, selectedArea, onBack }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [recordCount, setRecordCount] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);
  const [animationStage, setAnimationStage] = useState<'validating' | 'transferring' | 'saving'>('validating');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [invalidEmployees, setInvalidEmployees] = useState<{cedula: string | number, nombre: string}[]>([]);
  const [showDateExistModal, setShowDateExistModal] = useState(false);
  const [existingDates, setExistingDates] = useState<string[]>([]);
  const [preparedRecords, setPreparedRecords] = useState<any[]>([]);
  const [sqlServerError, setSqlServerError] = useState<string | null>(null);
  const [mysqlError, setMysqlError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  // Debug effect to log data changes
  useEffect(() => {
    if (data) {
      console.log('[DEBUG] Excel Data Structure:', {
        headers: data.headers,
        rowCount: data.rows.length,
        sampleRow: data.rows[0]
      });
    }
  }, [data]);

  if (!data || !data.headers.length) {
    return null;
  }

  const getAreaColor = () => {
    switch (selectedArea) {
      case 'Operaciones': return 'bg-blue-500';
      case 'Lavado': return 'bg-cyan-500';
      case 'Mantenimiento': return 'bg-amber-500';
      case 'Remanofactura': return 'bg-emerald-500';
      case 'ServiciosGenerales': return 'bg-purple-500';
      case 'Vigilantes': return 'bg-red-500';
      default: return 'bg-green-500';
    }
  };

  const getAreaLightColor = () => {
    switch (selectedArea) {
      case 'Operaciones': return 'bg-blue-50 text-blue-800';
      case 'Lavado': return 'bg-cyan-50 text-cyan-800';
      case 'Mantenimiento': return 'bg-amber-50 text-amber-800';
      case 'Remanofactura': return 'bg-emerald-50 text-emerald-800';
      case 'ServiciosGenerales': return 'bg-purple-50 text-purple-800';
      case 'Vigilantes': return 'bg-red-50 text-red-800';
      default: return 'bg-green-50 text-green-800';
    }
  };

  const getAreaHoverColor = () => {
    switch (selectedArea) {
      case 'Operaciones': return 'hover:bg-blue-100';
      case 'Lavado': return 'hover:bg-cyan-100';
      case 'Mantenimiento': return 'hover:bg-amber-100';
      case 'Remanofactura': return 'hover:bg-emerald-100';
      case 'ServiciosGenerales': return 'hover:bg-purple-100';
      case 'Vigilantes': return 'hover:bg-red-100';
      default: return 'hover:bg-green-100';
    }
  };

  const getButtonColor = () => {
    switch (selectedArea) {
      case 'Operaciones': return 'bg-blue-600 hover:bg-blue-700';
      case 'Lavado': return 'bg-cyan-600 hover:bg-cyan-700';
      case 'Mantenimiento': return 'bg-amber-600 hover:bg-amber-700';
      case 'Remanofactura': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'ServiciosGenerales': return 'bg-purple-600 hover:bg-purple-700';
      case 'Vigilantes': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-green-600 hover:bg-green-700';
    }
  };

  // Extract metadata from the first row if it exists
  const hasMetadata = data.rows[0] && data.rows[0][0] === 'Responsable:';
  const metadata = hasMetadata ? data.rows[0] : null;
  const displayRows = hasMetadata ? data.rows.slice(1) : data.rows;
  

  // Extract date range from metadata
  const dateRange = metadata ? metadata[3] : '';
  
  // Determine quincena based on date range
  const getQuincena = () => {
    if (!dateRange) return '';
    
    // Assuming date range is in format "DD - DD" of the current month
    const parts = dateRange.split('-').map(part => part.trim());
    if (parts.length !== 2) return '';
    
    const startDay = parseInt(parts[0]);
    return startDay <= 15 ? 'Primera' : 'Segunda';
  };

  // Filter out empty columns from the data
  const filterEmptyColumns = () => {
    if (!data || !data.headers.length) return { headers: [], rows: [] };
    
    // Find columns that have data
    const nonEmptyColumnIndexes: number[] = [];
    
    // Check each column
    for (let colIndex = 0; colIndex < data.headers.length; colIndex++) {
      // Check if header exists
      if (data.headers[colIndex]) {
        // Check if any row has data in this column
        const hasData = displayRows.some(row => {
          return row[colIndex] !== undefined && row[colIndex] !== null && row[colIndex] !== '';
        });
        
        if (hasData || colIndex < 4) { // Always keep the first 4 columns (ID, CEDULA, NOMBRE, CARGO)
          nonEmptyColumnIndexes.push(colIndex);
        }
      }
    }
    
    // Filter headers
    const filteredHeaders = nonEmptyColumnIndexes.map(index => data.headers[index]);
    
    // Filter rows
    const filteredRows = displayRows.map(row => {
      return nonEmptyColumnIndexes.map(index => row[index]);
    });
    
    return { headers: filteredHeaders, rows: filteredRows };
  };
  
  // Get filtered data
  const filteredData = filterEmptyColumns();

  const continueWithSave = async () => {
    if (!preparedRecords.length) {
      console.error('[DEBUG] No records to save!');
      setDebugInfo('Error: No hay registros preparados para guardar');
      return;
    }
    
    setShowDateExistModal(false);
    setAnimationStage('saving');
    setShowAnimation(true);
    setDebugInfo(null);
    
    try {
      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('[DEBUG] Records to save:', preparedRecords);
      setDebugInfo(`Iniciando guardado de ${preparedRecords.length} registros...`);
      
      // Save to database
      const result = await saveToDatabase(preparedRecords);
      
      console.log('[DEBUG] Save result:', result);
      setDebugInfo(prev => `${prev}\nGuardado completado. Respuesta: ${JSON.stringify(result)}`);
      
      // Keep animation visible for a bit longer after saving
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setShowAnimation(false);
      setSaveStatus('success');
      setStatusMessage(`${preparedRecords.length} registros guardados correctamente en la base de datos`);
    } catch (error: any) {
      console.error('[DEBUG] Save error:', error);
      setShowAnimation(false);
      
      let errorDetails = `Error: ${error.message}`;
      if (error.response) {
        errorDetails += `\nStatus: ${error.response.status}`;
        errorDetails += `\nData: ${JSON.stringify(error.response.data)}`;
      } else if (error.request) {
        errorDetails += `\nNo se recibió respuesta del servidor`;
      }
      setDebugInfo(errorDetails);
      
      if (error.response?.data?.message?.includes('development mode')) {
        setSaveStatus('success');
        setStatusMessage(`${preparedRecords.length} registros guardados correctamente (modo desarrollo)`);
      } else {
        setSaveStatus('error');
        setStatusMessage(error instanceof Error ? error.message : 'Error al guardar en la base de datos');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Función para convertir fechas de formato "DD-MMM" a "YYYY-MM-DD"
  const formatDateForDatabase = (dateHeader: any): string => {
    console.log('[DEBUG] Formatting date:', dateHeader);
    
    if (dateHeader instanceof Date) {
      const formatted = dateHeader.toISOString().split('T')[0];
      console.log('[DEBUG] Date object formatted:', formatted);
      return formatted;
    } 
    
    if (typeof dateHeader === 'string') {
      // Si ya está en formato YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(dateHeader)) {
        const formatted = dateHeader.split('T')[0];
        console.log('[DEBUG] Already in YYYY-MM-DD format:', formatted);
        return formatted;
      }
      
      // Si está en formato DD-MMM (ej: "17-Feb")
      if (/^\d{1,2}-[A-Za-z]{3}$/.test(dateHeader)) {
        const parts = dateHeader.split('-');
        if (parts.length === 2) {
          const day = parts[0].trim().padStart(2, '0');
          const month = parts[1].trim();
          
          // Mapeo de nombres de mes a números
          const monthMap: {[key: string]: string} = {
            'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
            'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12',
            'Ene': '01', 'Feb': '02', 'Mar': '03', 'Abr': '04', 'May': '05', 'Jun': '06',
            'Jul': '07', 'Ago': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dic': '12'
          };
          
          let monthNum = '01';
          for (const [key, value] of Object.entries(monthMap)) {
            if (month.includes(key)) {
              monthNum = value;
              break;
            }
          }
          
          // Usar el año actual
          const currentYear = new Date().getFullYear();
          const formatted = `${currentYear}-${monthNum}-${day}`;
          console.log('[DEBUG] DD-MMM format converted:', formatted);
          return formatted;
        }
      }
      
      // Intentar parsear como fecha
      try {
        const date = new Date(dateHeader);
        if (!isNaN(date.getTime())) {
          const formatted = date.toISOString().split('T')[0];
          console.log('[DEBUG] Parsed as Date object:', formatted);
          return formatted;
        }
      } catch (e) {
        console.error('[DEBUG] Error parsing date:', e);
      }
    }
    
    console.log('[DEBUG] Using original date string:', dateHeader);
    return String(dateHeader);
  };

  const handleSaveToDatabase = async () => {
    if (!data || isSaving) return;
    
    setIsSaving(true);
    setSaveStatus(null);
    setStatusMessage('');
    setSqlServerError(null);
    setMysqlError(null);
    setDebugInfo(null);
    
    try {
      // Prepare data for database
      const currentDate = new Date();
      const quincena = getQuincena();
      
      // Get date headers (assuming they are in positions 4-10)
      const dateHeaders = data.headers.slice(4); // Requiere al menos 5 columnas
      console.log('[DEBUG] Date headers:', dateHeaders);
      
      // Prepare records for database
      const records = [];
      
      // Extract unique employees for validation
      const uniqueEmployees = new Map();
      
      console.log('[DEBUG] Starting record preparation');
      setDebugInfo('Preparando registros para guardar...');
      
      for (const row of displayRows) {
        console.log('[DEBUG] Fila completa:', row);
        const cedula = row[1]; // Column B - Cédula
        const nombre = row[2]; // Column C - Nombre
        const area = selectedArea;
        const clasificacion = row[3]; // Column D - Cargo
        console.log('[DEBUG] displayRows:', displayRows);
        console.log('[DEBUG] Number of date headers:', dateHeaders.length);
        console.log('[DEBUG] displayRows:', displayRows);
        console.log('[DEBUG] Number of date headers:', dateHeaders.length);
        console.log('[DEBUG] Processing row:', {
          cedula,
          nombre,
          area,
          clasificacion
        });
        
        // Validar que la cédula sea un valor válido
        if (!cedula) {
          console.log('[DEBUG] Skipping row - no cedula');
          continue;
        }
        
        // Add to unique employees map
        if (cedula && !uniqueEmployees.has(cedula.toString())) {
          uniqueEmployees.set(cedula.toString(), nombre || 'Sin nombre');
        }
        
        // For each date in the headers
        for (let i = 0; i < dateHeaders.length; i++) {
          const dateHeader = dateHeaders[i];
          const horario = row[i + 4]; // Shift for this date (columns E-K)
          
          if (horario) {
            console.log('[DEBUG] Processing schedule:', {
              date: dateHeader,
              horario
            });
            
            // Calculate tiempo a descontar if needed
            const tiempoDescontar = horario.toString().toUpperCase() === 'DESCANSO' || 
                                   horario.toString().toUpperCase() === 'VACACIONES' ? 
                                   0 : 8; // Default to 8 hours for regular shifts
            
            // Formatear la fecha para la base de datos
            const fechaProgramacion = formatDateForDatabase(dateHeader);
            
            const record = {
              CEDULA: cedula,
              Fecha_programacion: fechaProgramacion,
              Horario_programacion: horario,
              Area: area,
              Tiempo_a_descontar: tiempoDescontar,
              Quincena: quincena,
              clasificacion: clasificacion || 'No especificado',
              fecha_consulta: currentDate.toISOString()
            };
            
            for (let i = 0; i < dateHeaders.length; i++) {
              const horario = row[i + 4];
              console.log(`[DEBUG] Celda de horario (col ${i + 4}):`, horario); // <- ¡Esto es crítico!
            }

            console.log('[DEBUG] Created record:', record);
            records.push(record);
          }
        }
      }
      
      // Verificar que haya registros para guardar
      if (records.length === 0) {
        console.error('[DEBUG] No valid records found');
        setIsSaving(false);
        setSaveStatus('error');
        setStatusMessage('No hay datos válidos para guardar en la base de datos');
        setDebugInfo('Error: No hay datos válidos para guardar');
        return;
      }
      
      console.log('[DEBUG] Total records prepared:', records.length);
      setDebugInfo(prev => `${prev}\nRegistros preparados: ${records.length}`);
      
      setRecordCount(records.length);
      setPreparedRecords(records);
      setAnimationStage('validating');
      setShowAnimation(true);
      
      // Validate employees in SQL Server
      try {
        const employeesToValidate = Array.from(uniqueEmployees.entries()).map(([cedula, nombre]) => ({
          cedula,
          nombre: nombre as string
        }));
        
        console.log('[DEBUG] Employees to validate:', employeesToValidate);
        setDebugInfo(prev => `${prev}\nValidando ${employeesToValidate.length} empleados...`);
        
        // Wait for validation animation to show
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const validationResult = await validateEmployeesInSQLServer(
          employeesToValidate.map(e => e.cedula),
          employeesToValidate.map(e => e.nombre)
        );
        
        console.log('[DEBUG] Employee validation result:', validationResult);
        setDebugInfo(prev => `${prev}\nResultado de validación: ${JSON.stringify(validationResult)}`);
        
        if (!validationResult.isValid) {
          setShowAnimation(false);
          setInvalidEmployees(validationResult.invalidEmployees);
          setShowValidationModal(true);  
          setIsSaving(false);
          return;  
        }
        
        // Continue with checking dates if employee validation passed
        setAnimationStage('transferring');
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Check if dates already exist in the database
        try {
          // Extract unique dates from date headers and format them properly
          const uniqueDates = [...new Set(dateHeaders.map(date => formatDateForDatabase(date)))];
          
          console.log('[DEBUG] Dates to check:', uniqueDates);
          setDebugInfo(prev => `${prev}\nVerificando ${uniqueDates.length} fechas...`);
          
          const dateCheckResult = await checkDatesExist(uniqueDates, selectedArea);
          
          console.log('[DEBUG] Date check result:', dateCheckResult);
          setDebugInfo(prev => `${prev}\nResultado de verificación de fechas: ${JSON.stringify(dateCheckResult)}`);
          
          if (dateCheckResult.exists && dateCheckResult.existingDates.length > 0) {
            setShowAnimation(false);
            setExistingDates(dateCheckResult.existingDates);
            setShowDateExistModal(true);  
            return;  
          }
          
          // If no dates exist, continue with saving
          await continueWithSave();
        } catch (dateError: any) {
          console.error('[DEBUG] Date check error:', dateError);
          setShowAnimation(false);
          
          let errorDetails = `Error al verificar fechas: ${dateError.message}`;
          if (dateError.response) {
            errorDetails += `\nStatus: ${dateError.response.status}`;
            errorDetails += `\nData: ${JSON.stringify(dateError.response.data)}`;
          } else if (dateError.request) {
            errorDetails += `\nNo se recibió respuesta del servidor`;
          }
          setDebugInfo(errorDetails);
          
          if (dateError.response?.status === 500) {
            setMysqlError('No se pudo verificar las fechas en la base de datos. Continuando en modo de desarrollo.');
            await continueWithSave();
          } else {
            setSaveStatus('error');
            setStatusMessage('Error al verificar fechas en la base de datos');
            setIsSaving(false);
          }
        }
        
      } catch (error: any) {
        console.error('[DEBUG] Employee validation error:', error);
        setShowAnimation(false);
        
        let errorDetails = `Error al validar empleados: ${error.message}`;
        if (error.response) {
          errorDetails += `\nStatus: ${error.response.status}`;
          errorDetails += `\nData: ${JSON.stringify(error.response.data)}`;
        } else if (error.request) {
          errorDetails += `\nNo se recibió respuesta del servidor`;
        }
        setDebugInfo(errorDetails);
        
        // Check if it's a SQL Server connection error
        if (error.response?.data?.details?.includes('Failed to connect')) {
          setSqlServerError('No se pudo conectar al servidor SQL para validar empleados. Continuando en modo de desarrollo.');
          
          // Continue with date checking in development mode
          setAnimationStage('transferring');
          setShowAnimation(true);
          
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Check if dates already exist in the database
          try {
            // Extract unique dates from date headers and format them properly
            const uniqueDates = [...new Set(dateHeaders.map(date => formatDateForDatabase(date)))];
            
            console.log('[DEBUG] Checking dates after SQL error:', uniqueDates);
            setDebugInfo(prev => `${prev}\nVerificando ${uniqueDates.length} fechas (después de error SQL)...`);
            
            const dateCheckResult = await checkDatesExist(uniqueDates, selectedArea);
            
            console.log('[DEBUG] Date check result:', dateCheckResult);
            setDebugInfo(prev => `${prev}\nResultado de verificación de fechas: ${JSON.stringify(dateCheckResult)}`);
            
            if (dateCheckResult.exists && dateCheckResult.existingDates.length > 0) {
              setShowAnimation(false);
              setExistingDates(dateCheckResult.existingDates);
              setShowDateExistModal(true);
              return;
            }
            console.log('[DEBUG] Records to save:', records);
            // Y dentro de continueWithSave:
            console.log('[DEBUG] Final records being sent:', preparedRecords);
            // If no dates exist, continue with saving
            await continueWithSave();
          } catch (dateError: any) {
            console.error('[DEBUG] Date check error after SQL error:', dateError);
            setShowAnimation(false);
            
            let errorDetails = `Error al verificar fechas (después de error SQL): ${dateError.message}`;
            if (dateError.response) {
              errorDetails += `\nStatus: ${dateError.response.status}`;
              errorDetails += `\nData: ${JSON.stringify(dateError.response.data)}`;
            } else if (dateError.request) {
              errorDetails += `\nNo se recibió respuesta del servidor`;
            }
            setDebugInfo(errorDetails);
            
            if (dateError.response?.status === 500) {
              setMysqlError('No se pudo verificar las fechas en la base de datos. Continuando en modo de desarrollo.');
              await continueWithSave();
            } else {
              setSaveStatus('error');
              setStatusMessage('Error al verificar fechas en la base de datos');
              setIsSaving(false);
            }
          }
        } else {
          setSaveStatus('error');
          setStatusMessage('Error al validar empleados en la base de datos');
          setIsSaving(false);
        }
      }
    } catch (error: any) {
      console.error('[DEBUG] General error:', error);
      setShowAnimation(false);
      setSaveStatus('error');
      setStatusMessage(error instanceof Error ? error.message : 'Error al guardar en la base de datos');
      
      let errorDetails = `Error general: ${error.message}`;
      setDebugInfo(errorDetails);
      
      setIsSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="w-full mt-8"
    >
      <AnimatePresence>
        {showAnimation && (
          <SaveAnimation 
            isVisible={showAnimation} 
            area={selectedArea} 
            recordCount={recordCount}
            stage={animationStage}
          />
        )}
      </AnimatePresence>

      <EmployeeValidationModal 
        isVisible={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        invalidEmployees={invalidEmployees}
        area={selectedArea}
      />

      <DateExistModal
        isVisible={showDateExistModal}
        onClose={() => {
          setShowDateExistModal(false);
          setIsSaving(false);
        }}
        existingDates={existingDates}
        area={selectedArea}
        onProceed={continueWithSave}
      />

      <div className="mb-6 flex items-center">
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Volver a cargar archivo</span>
        </button>
        <h3 className="ml-auto text-lg font-semibold text-gray-700">
          Datos del área de {selectedArea}
        </h3>
      </div>

      {metadata && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 p-4 bg-white rounded-lg shadow-md border border-gray-200"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center">
              <span className="font-medium text-gray-700 mr-2">{metadata[0]}</span>
              <span className="text-gray-800">{metadata[1]}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-gray-700 mr-2">{metadata[2]}</span>
              <span className="text-gray-800">{metadata[3]}</span>
            </div>
          </div>
        </motion.div>
      )}

      <div className="mb-4 flex justify-end">
        <button
          onClick={handleSaveToDatabase}
          disabled={isSaving}
          className={`flex items-center px-4 py-2 ${getButtonColor()} text-white rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSaving ? (
            <>
              <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
              <span>Procesando...</span>
            </>
          ) : (
            <>
              <Save size={18} className="mr-2" />
              <span>Guardar en la base de datos</span>
            </>
          )}
        </button>
      </div>

      {sqlServerError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 p-4 rounded-lg shadow-md border bg-amber-50 border-amber-200 text-amber-800"
        >
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-amber-600 mr-2 flex-shrink-0" />
            <span>{sqlServerError}</span>
          </div>
        </motion.div>
      )}

      {mysqlError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 p-4 rounded-lg shadow-md border bg-amber-50 border-amber-200 text-amber-800"
        >
          <div className="flex items-center">
            <AlertTriangle size={20} className="text-amber-600 mr-2 flex-shrink-0" />
            <span>{mysqlError}</span>
          </div>
        </motion.div>
      )}

      {saveStatus && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`mb-4 p-4 rounded-lg shadow-md border ${
            saveStatus === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center">
            {saveStatus === 'success' ? (
              <Check size={20} className="text-green-600 mr-2" />
            ) : (
              <AlertCircle size={20} className="text-red-600 mr-2" />
            )}
            <span>{statusMessage}</span>
          </div>
        </motion.div>
      )}

      {debugInfo && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-4 p-4 rounded-lg shadow-md border bg-gray-50 border-gray-200 text-gray-800 font-mono text-xs overflow-auto max-h-60"
        >
          <div className="flex items-start">
            <div className="flex-1">
              <h4 className="font-medium text-gray-700 mb-2">Información de depuración:</h4>
              <pre className="whitespace-pre-wrap">{debugInfo}</pre>
            </div>
          </div>
        </motion.div>
      )}

      <div className="overflow-x-auto bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="max-h-[500px] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`${getAreaColor()} text-white sticky top-0 z-10`}>
              <tr>
                {filteredData.headers.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.rows.slice(0, 100).map((row, rowIndex) => (
                <motion.tr
                  key={rowIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: rowIndex * 0.02 }}
                  className={`${rowIndex % 2 === 0 ? 'bg-white' : getAreaLightColor()} ${getAreaHoverColor()} transition-colors`}
                 >
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
                    >
                      {cell?.toString() || ''}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredData.rows.length > 100 && (
            <div className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-500 border-t border-gray-200">
              Mostrando 100 de {filteredData.rows.length} filas
            </div>
          )}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="text-center mt-10 text-green-700 font-medium"
      >
        <p>Sistema Alimentador Oriental 6</p>
      </motion.div>
    </motion.div>
  );
};

export default DataTable;

