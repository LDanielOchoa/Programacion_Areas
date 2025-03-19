"use client"

import type React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight } from "lucide-react"
import type { AreaOption } from "../types"

interface AreaCardProps {
  area: AreaOption
  hoveredArea: string | null
  setHoveredArea: (id: string | null) => void
  onClick: () => void
  getIcon: (iconName: string, size?: number, className?: string) => JSX.Element
}

export const AreaCard: React.FC<AreaCardProps> = ({ area, hoveredArea, setHoveredArea, onClick, getIcon }) => {
  // Variantes de animación optimizadas
  const cardVariants = {
    hidden: { opacity: 0, y: 20 }, // Reducido de 30 a 20
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
        duration: 0.4, // Añadido para limitar duración
      },
    },
  }

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{
        scale: 1.03,
        y: -5,
        transition: { type: "spring", stiffness: 400, damping: 10 },
      }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setHoveredArea(area.id)}
      onHoverEnd={() => setHoveredArea(null)}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl group"
    >
      {/* Fondo de tarjeta con gradiente */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${hoveredArea === area.id ? area.hoverColor : area.color} transition-all duration-500`}
        animate={{
          backgroundPosition: hoveredArea === area.id ? ["0% 0%", "100% 100%"] : "0% 0%",
        }}
        transition={{ duration: 3, ease: "easeInOut" }}
        style={{ backgroundSize: "200% 200%" }}
      />

      {/* Contenido de la tarjeta */}
      <div className="relative z-10 p-8 h-full flex flex-col">
        {/* Contenedor de icono */}
        <motion.div
          className={`bg-white/40 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/30 overflow-hidden group-hover:bg-white/50 transition-all duration-300`}
          whileHover={{ rotate: [0, -5, 5, -3, 3, 0], transition: { duration: 0.5 } }}
        >
          {getIcon(area.icon, 30, "text-white drop-shadow-md")}

          {/* Fondo animado para el icono */}
          <motion.div
            className="absolute inset-0 -z-10 opacity-30"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 3,
              ease: "easeInOut",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            style={{
              backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.8) 0%, transparent 70%)`,
              backgroundSize: "200% 200%",
            }}
          />
        </motion.div>

        {/* Título y descripción */}
        <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-sm">{area.name}</h3>
        <p className="text-white/90 text-base mb-6 flex-grow leading-relaxed">{area.description}</p>

        {/* Botón de acción */}
        <motion.div
          className="flex items-center justify-between mt-auto"
          initial={{ opacity: 0.7 }}
          animate={{ opacity: hoveredArea === area.id ? 1 : 0.7 }}
        >
          <span className="text-white font-medium">Seleccionar</span>
          <motion.div
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm"
            animate={{
              x: hoveredArea === area.id ? [0, 5, 0] : 0,
            }}
            transition={{
              duration: 1,
              repeat: hoveredArea === area.id ? Number.POSITIVE_INFINITY : 0,
              repeatDelay: 0.5,
            }}
          >
            <ArrowRight size={16} className="text-white" />
          </motion.div>
        </motion.div>

        {/* Elementos decorativos */}
        <motion.div
          className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-white/10"
          animate={{
            scale: hoveredArea === area.id ? [1, 1.2, 1.1] : 1,
            opacity: hoveredArea === area.id ? [0.1, 0.2, 0.15] : 0.1,
          }}
          transition={{ duration: 2, repeat: hoveredArea === area.id ? Number.POSITIVE_INFINITY : 0 }}
        />

        {/* Efecto de partículas al pasar el mouse */}
        <AnimatePresence>
          {hoveredArea === area.id && (
            <>
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`particle-${area.id}-${i}`}
                  initial={{
                    x: 0,
                    y: 0,
                    opacity: 0,
                    scale: 0,
                  }}
                  animate={{
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                    rotate: Math.random() * 360,
                    opacity: [0, 0.5, 0],
                    scale: [0, 1, 0],
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1 + Math.random() }}
                  className="absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-white"
                  style={{ x: "-50%", y: "-50%" }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

