import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FileSpreadsheet, Upload, X, AlertCircle, ArrowLeft, FileImage, FileBadge } from 'lucide-react';
import { FileWithPreview, AreaType } from '../types';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  selectedArea: AreaType;
  onBack: () => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, selectedArea, onBack }) => {
  const [file, setFile] = useState<FileWithPreview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<'format' | 'size' | 'general' | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
    setError(null);
    setErrorType(null);
    
    // Handle rejected files first
    if (fileRejections.length > 0) {
      const rejection = fileRejections[0];
      
      // Check if it's a file type error
      if (rejection.errors.some((e: any) => e.code === 'file-invalid-type')) {
        const fileType = rejection.file.name.split('.').pop()?.toLowerCase();
        
        if (fileType === 'jpg' || fileType === 'jpeg' || fileType === 'png' || fileType === 'gif') {
          setError('Has subido una imagen. Por favor, sube un archivo Excel (.xlsx o .xls)');
          setErrorType('format');
        } else if (fileType === 'pdf') {
          setError('Has subido un PDF. Por favor, sube un archivo Excel (.xlsx o .xls)');
          setErrorType('format');
        } else if (fileType === 'doc' || fileType === 'docx') {
          setError('Has subido un documento Word. Por favor, sube un archivo Excel (.xlsx o .xls)');
          setErrorType('format');
        } else if (fileType === 'txt' || fileType === 'csv') {
          setError(`Has subido un archivo ${fileType.toUpperCase()}. Por favor, sube un archivo Excel (.xlsx o .xls)`);
          setErrorType('format');
        } else {
          setError('Formato de archivo no válido. Por favor, sube un archivo Excel (.xlsx o .xls)');
          setErrorType('format');
        }
      } else if (rejection.errors.some((e: any) => e.code === 'file-too-large')) {
        setError('El archivo es demasiado grande. El tamaño máximo es 10MB.');
        setErrorType('size');
      } else {
        setError('Error al cargar el archivo. Inténtalo de nuevo.');
        setErrorType('general');
      }
      return;
    }
    
    if (acceptedFiles.length === 0) {
      return;
    }
    
    const selectedFile = acceptedFiles[0];
    
    // Additional validation for Excel files
    if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      setError('Por favor, sube un archivo de Excel válido (.xlsx o .xls)');
      setErrorType('format');
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. El tamaño máximo es 10MB.');
      setErrorType('size');
      return;
    }
    
    const fileWithPreview = Object.assign(selectedFile, {
      preview: URL.createObjectURL(selectedFile)
    });
    
    setFile(fileWithPreview);
    onFileUpload(selectedFile);
  }, [onFileUpload]);

  const removeFile = () => {
    if (file && file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setFile(null);
    setError(null);
    setErrorType(null);
  };

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false
  });

  const getAreaColor = () => {
    switch (selectedArea) {
      case 'Operaciones': return 'border-blue-400 hover:border-blue-500 text-blue-600';
      case 'Lavado': return 'border-cyan-400 hover:border-cyan-500 text-cyan-600';
      case 'Mantenimiento': return 'border-amber-400 hover:border-amber-500 text-amber-600';
      case 'Remanofactura': return 'border-emerald-400 hover:border-emerald-500 text-emerald-600';
      case 'ServiciosGenerales': return 'border-purple-400 hover:border-purple-500 text-purple-600';
      case 'Vigilantes': return 'border-red-400 hover:border-red-500 text-red-600';
      default: return 'border-green-400 hover:border-green-500 text-green-600';
    }
  };

  const getAreaBgColor = () => {
    switch (selectedArea) {
      case 'Operaciones': return 'bg-blue-50';
      case 'Lavado': return 'bg-cyan-50';
      case 'Mantenimiento': return 'bg-amber-50';
      case 'Remanofactura': return 'bg-emerald-50';
      case 'ServiciosGenerales': return 'bg-purple-50';
      case 'Vigilantes': return 'bg-red-50';
      default: return 'bg-green-50';
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'format':
        return <FileImage size={24} className="text-red-500 mr-3 flex-shrink-0" />;
      case 'size':
        return <FileBadge size={24} className="text-red-500 mr-3 flex-shrink-0" />;
      default:
        return <AlertCircle size={24} className="text-red-500 mr-3 flex-shrink-0" />;
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <button 
          onClick={onBack}
          className="flex items-center text-gray-600 hover:text-green-700 transition-colors"
        >
          <ArrowLeft size={18} className="mr-1" />
          <span>Volver a selección de área</span>
        </button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-3">Área de {selectedArea}</h2>
        <p className="text-gray-600">Por favor cargue el archivo Excel necesario para esta área</p>
        <p className="text-green-600 mt-2">Bienvenido, esperamos que disfrutes este espacio</p>
      </motion.div>

      {!file ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`border-3 border-dashed rounded-xl p-8 ${
            isDragActive ? 'border-green-400 bg-green-50' : 
            isDragReject ? 'border-red-400 bg-red-50' : 
            `${getAreaColor()} ${getAreaBgColor()} hover:bg-opacity-70`
          } transition-all duration-300 cursor-pointer`}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              className={`w-20 h-20 mb-5 rounded-full ${getAreaBgColor()} flex items-center justify-center ${getAreaColor().split(' ')[2]}`}
            >
              {isDragReject ? (
                <X size={32} className="text-red-500" />
              ) : (
                <Upload size={32} />
              )}
            </motion.div>
            <h3 className="text-xl font-medium text-gray-700 mb-3">
              {isDragActive 
                ? isDragReject 
                  ? '¡Este archivo no es válido!' 
                  : '¡Suelta el archivo aquí!' 
                : 'Arrastra y suelta un archivo Excel'}
            </h3>
            <p className="text-base text-gray-500 mb-4">
              o haz clic para seleccionar un archivo
            </p>
            <p className="text-xs text-gray-400">
              Formatos soportados: .xlsx, .xls (máx. 10MB)
            </p>
            <p className="text-sm text-green-600 mt-4">
              Recuerda que el archivo debe contener la hoja "Formato programación"
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`${getAreaBgColor()} rounded-xl shadow-md p-6 border ${getAreaColor().split(' ')[0]}`}
        >
          <div className="flex items-center">
            <div className={`w-14 h-14 rounded-lg ${getAreaBgColor()} flex items-center justify-center ${getAreaColor().split(' ')[2]} mr-4`}>
              <FileSpreadsheet size={28} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-gray-800 truncate">
                {file.name}
              </h3>
              <p className="text-sm text-gray-500">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={removeFile}
              className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 transition-colors"
            >
              <X size={18} />
            </motion.button>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg shadow-md"
          >
            <div className="flex items-start">
              {getErrorIcon()}
              <div>
                <h4 className="font-medium text-red-700 mb-1">Error al cargar el archivo</h4>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-red-100">
              <p className="text-xs text-red-500">
                {errorType === 'format' 
                  ? 'Recuerda que solo se aceptan archivos Excel (.xlsx o .xls) con la hoja "Formato programación"' 
                  : errorType === 'size' 
                  ? 'Intenta comprimir el archivo o dividirlo en partes más pequeñas' 
                  : 'Si el problema persiste, contacta al soporte técnico'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="text-center mt-10 text-green-700 font-medium"
      >
        <p>Sistema Alimentador Oriental 6</p>
      </motion.div>
    </div>
  );
};

export default FileUploader;