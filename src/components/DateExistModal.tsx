import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Calendar } from 'lucide-react';

interface DateExistModalProps {
  isVisible: boolean;
  onClose: () => void;
  existingDates: string[];
  area: string;
  onProceed: () => void;
}

const DateExistModal: React.FC<DateExistModalProps> = ({ 
  isVisible, 
  onClose, 
  existingDates,
  area
}) => {
  if (!isVisible) return null;

  const getAreaColor = () => {
    switch (area) {
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
    switch (area) {
      case 'Operaciones': return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'Lavado': return 'bg-cyan-50 text-cyan-800 border-cyan-200';
      case 'Mantenimiento': return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Remanofactura': return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'ServiciosGenerales': return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'Vigilantes': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-green-50 text-green-800 border-green-200';
    }
  };

  // Format date to a more readable format
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      return dateString;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Full screen backdrop with blur effect */}
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-xl shadow-2xl max-w-3xl w-full mx-auto overflow-hidden"
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`${getAreaColor()} text-white p-6 flex items-start justify-between`}>
                <div className="flex items-center">
                  <AlertCircle size={28} className="mr-3" />
                  <div>
                    <h3 className="text-xl font-bold">Fechas ya existentes</h3>
                    <p className="text-white text-opacity-90">
                      Las siguientes fechas ya existen en la base de datos para el área de {area}
                    </p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="text-white text-opacity-80 hover:text-opacity-100 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 max-h-[60vh] overflow-y-auto">
                <p className="text-gray-700 mb-4">
                  Se encontraron <span className="font-bold">{existingDates.length}</span> fechas que ya existen en la base de datos para esta área. 
                </p>
                
                <div className="space-y-3">
                  {existingDates.map((date, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`${getAreaLightColor()} p-4 rounded-lg border flex items-center`}
                    >
                      <div className="bg-white p-2 rounded-full mr-3">
                        <Calendar size={20} className="text-red-500" />
                      </div>
                      <div>
                        <div className="font-medium">{formatDate(date)}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 flex justify-end border-t space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg shadow-md transition-colors hover:bg-gray-300"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DateExistModal;