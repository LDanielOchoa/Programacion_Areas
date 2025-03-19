"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Leaf, X } from "lucide-react"

interface WelcomePopupProps {
  onClose: () => void
}

export const WelcomePopup: React.FC<WelcomePopupProps> = ({ onClose }) => {
  // Variantes de animación optimizadas
  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3, // Reducido de 0.4 a 0.3
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.2, // Reducido de 0.3 a 0.2
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  // Variantes para el logo
  const leafLogoVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
        delay: 0.1,
      },
    },
    pulse: {
      scale: [1, 1.05, 1],
      rotate: [0, 5, 0, -5, 0],
      transition: {
        duration: 4,
        ease: "easeInOut",
        times: [0, 0.25, 0.5, 0.75, 1],
        repeat: Number.POSITIVE_INFINITY,
        repeatDelay: 0.5,
      },
    },
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-lg w-full relative border border-green-100"
        variants={popupVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} />
        </motion.button>

        <div className="flex flex-col items-center text-center">
          {/* Logo animado */}
          <motion.div
            className="relative mb-6"
            variants={leafLogoVariants}
            initial="hidden"
            animate={["visible", "pulse"]}
          >
            <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-600 via-green-500 to-green-400 border-2 border-white/50">
              <Leaf className="h-12 w-12 text-white" />

              {/* Efecto de brillo animado */}
              <motion.div
                className="absolute inset-0 rounded-full bg-green-400 -z-10"
                animate={{
                  boxShadow: [
                    "0 0 0 0 rgba(52, 211, 153, 0)",
                    "0 0 0 15px rgba(52, 211, 153, 0.2)",
                    "0 0 0 0 rgba(52, 211, 153, 0)",
                  ],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "loop",
                }}
              />
            </div>

            {/* Puntos orbitales (reducidos) */}
            <motion.div
              className="absolute top-0 left-0 right-0 bottom-0 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 15, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
            >
              <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-green-300"></motion.div>
            </motion.div>

            <motion.div
              className="absolute top-0 left-0 right-0 bottom-0 rounded-full"
              animate={{ rotate: -360 }}
              transition={{ duration: 20, ease: "linear", repeat: Number.POSITIVE_INFINITY }}
            >
              <motion.div className="absolute top-1/2 left-0 -translate-y-1/2 w-2 h-2 rounded-full bg-green-200"></motion.div>
            </motion.div>
          </motion.div>

          {/* Título y contenido */}
          <motion.h2
            className="text-3xl font-bold text-green-800 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Bienvenidos
          </motion.h2>

          <motion.p
            className="text-lg text-gray-600 mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Seleccione el área para la que deseas cargar y visualizar datos
          </motion.p>

          <motion.p
            className="text-md text-green-700 font-medium mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            Bienvenido, esperamos que disfrutes este espacio de gestión de programación de turnos
          </motion.p>

          <motion.button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-full font-medium hover:from-green-500 hover:to-green-400 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)",
            }}
            whileTap={{ scale: 0.95 }}
          >
            Comenzar
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

