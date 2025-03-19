"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, X, ArrowRight, AlertTriangle, HelpCircle } from "lucide-react"

interface ForgotPasswordModalProps {
  isVisible: boolean
  onClose: () => void
  area: string
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isVisible, onClose, area }) => {
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
            className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header with blue accent */}
            <div className="bg-blue-600 p-6 text-white">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
                aria-label="Cerrar"
              >
                <X size={24} />
              </button>

              <div className="flex items-center">
                <div className="bg-white/20 p-3 rounded-full mr-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold">Recuperar contraseña</h3>
                  <p className="text-white/80 text-sm mt-1">Área: {area}</p>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Alert box */}
              <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0 mt-0.5" />
                  <p className="text-blue-800 dark:text-blue-300 text-sm">
                    Para recuperar tu acceso, debes contactar directamente a mejora continua a través del correo:
                    <a href="mailto:natalia.ospina@sao6.com.co" className="font-medium block mt-1 hover:underline">
                      natalia.ospina@sao6.com.co
                    </a>
                  </p>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-4 mb-6">
                <h4 className="text-lg font-medium text-gray-900 dark:text-gray-100 flex items-center">
                  <HelpCircle className="h-5 w-5 mr-2 text-blue-600 dark:text-blue-400" />
                  Pasos para recuperar tu contraseña
                </h4>

                <div className="space-y-3">
                  <div className="flex">
                    <div className="bg-blue-100 dark:bg-blue-900/40 h-7 w-7 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium mr-3 flex-shrink-0">
                      1
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm pt-1">
                      Envía un correo a la dirección mencionada arriba indicando tu nombre completo.
                    </p>
                  </div>

                  <div className="flex">
                    <div className="bg-blue-100 dark:bg-blue-900/40 h-7 w-7 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium mr-3 flex-shrink-0">
                      2
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm pt-1">
                      Especifica el área ({area}) y el motivo por el que necesitas recuperar tu acceso.
                    </p>
                  </div>

                  <div className="flex">
                    <div className="bg-blue-100 dark:bg-blue-900/40 h-7 w-7 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 font-medium mr-3 flex-shrink-0">
                      3
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm pt-1">
                      El equipo de mejora continua te responderá con instrucciones para restablecer tu contraseña.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors flex items-center"
                >
                  Entendido
                  <ArrowRight size={16} className="ml-2" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default ForgotPasswordModal

