import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Timer, LogOut } from 'lucide-react';

interface SessionTimeoutModalProps {
  isVisible: boolean;
  onClose: () => void;
  onLogout: () => void;
  remainingTime: number;
}

const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isVisible,
  onClose,
  onLogout,
  remainingTime,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (isVisible) {
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.max(0, prev - (100 / 60))); // 60 seconds countdown
      }, 1000);

      return () => clearInterval(progressInterval);
    } else {
      setProgress(100);
    }
  }, [isVisible]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Progress bar */}
            <div className="h-1.5 bg-gray-100 w-full">
              <motion.div
                className="h-full bg-red-500"
                initial={{ width: "100%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="p-6">
              <div className="flex items-start mb-6">
                <div className="bg-red-100 p-3 rounded-full mr-4">
                  <Timer className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    Sesión por expirar
                  </h3>
                  <p className="text-gray-600">
                    Su sesión expirará en {formatTime(remainingTime)} por inactividad
                  </p>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                  <p className="text-amber-800 text-sm">
                    Para mantener su sesión activa, haga clic en "Continuar sesión". De lo contrario, será redirigido a la página principal.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onLogout}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar sesión
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors"
                >
                  Continuar sesión
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SessionTimeoutModal;