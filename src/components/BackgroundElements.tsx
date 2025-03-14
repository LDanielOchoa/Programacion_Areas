"use client"

import type React from "react"
import { motion } from "framer-motion"
import { Leaf } from "lucide-react"

interface BackgroundElementsProps {
  windowSize: {
    width: number
    height: number
  }
}

export const BackgroundElements: React.FC<BackgroundElementsProps> = ({ windowSize }) => {
  // Función para generar animaciones aleatorias para las hojas
  const getRandomLeafAnimation = (index: number) => {
    const baseDelay = index * 0.5
    return {
      initial: {
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        rotate: Math.random() * 360,
        opacity: 0.03 + Math.random() * 0.05, // Reducido de 0.07 a 0.05
      },
      animate: {
        y: [null, Math.random() * windowSize.height, null],
        x: [null, Math.random() * windowSize.width, null],
        rotate: [null, Math.random() * 360, null],
        transition: {
          duration: 30 + Math.random() * 30, // Aumentado para reducir CPU
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: baseDelay,
        },
      },
    }
  }

  return (
    <>
      {/* Patrón de fondo animado */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 25%)`,
            backgroundSize: "120px 120px",
          }}
        ></div>
      </div>

      {/* Hojas animadas de fondo (reducidas de 12 a 8) */}
      {[...Array(8)].map((_, i) => {
        const animation = getRandomLeafAnimation(i)
        return (
          <motion.div
            key={i}
            initial={animation.initial}
            animate={animation.animate}
            className="absolute text-green-500 pointer-events-none"
          >
            <Leaf size={20 + Math.random() * 40} /> {/* Reducido de 50 a 40 */}
          </motion.div>
        )
      })}
    </>
  )
}

