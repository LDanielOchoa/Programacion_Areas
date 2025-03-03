"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileSpreadsheet, Database, CheckCircle, Loader2, AlertCircle, ArrowUpRight } from "lucide-react"

interface SaveAnimationProps {
  isVisible: boolean
  area: string
  recordCount: number
  stage: "validating" | "transferring" | "saving"
}

const SaveAnimation: React.FC<SaveAnimationProps> = ({ isVisible, area, recordCount, stage }) => {
  const [progress, setProgress] = useState(0)
  const [completedRows, setCompletedRows] = useState<number[]>([])

  // Reset progress when stage changes
  useEffect(() => {
    setProgress(0)
    setCompletedRows([])

    if (isVisible) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 1
        })
      }, 50)

      return () => clearInterval(interval)
    }
  }, [isVisible])

  // Add completed rows as progress increases
  useEffect(() => {
    if (progress > 0 && progress % 20 === 0) {
      const newRow = Math.floor(progress / 20) - 1
      if (!completedRows.includes(newRow) && newRow < 5) {
        setCompletedRows((prev) => [...prev, newRow])
      }
    }
  }, [progress, completedRows])

  if (!isVisible) return null

  const getAreaTheme = () => {
    switch (area) {
      case "Operaciones":
        return { primary: "#3b82f6", secondary: "#93c5fd", accent: "#1d4ed8" }
      case "Lavado":
        return { primary: "#06b6d4", secondary: "#67e8f9", accent: "#0e7490" }
      case "Mantenimiento":
        return { primary: "#f59e0b", secondary: "#fcd34d", accent: "#b45309" }
      case "Remanofactura":
        return { primary: "#10b981", secondary: "#6ee7b7", accent: "#047857" }
      case "ServiciosGenerales":
        return { primary: "#8b5cf6", secondary: "#c4b5fd", accent: "#6d28d9" }
      case "Vigilantes":
        return { primary: "#ef4444", secondary: "#fca5a5", accent: "#b91c1c" }
      default:
        return { primary: "#10b981", secondary: "#6ee7b7", accent: "#047857" }
    }
  }

  const theme = getAreaTheme()

  const getStageInfo = () => {
    switch (stage) {
      case "validating":
        return {
          title: "Validando empleados",
          description: "Verificando que todos los empleados existan en el sistema...",
          icon: AlertCircle,
          color: "#f59e0b",
        }
      case "transferring":
        return {
          title: "Transfiriendo datos",
          description: "Preparando los registros para su almacenamiento...",
          icon: ArrowUpRight,
          color: "#3b82f6",
        }
      case "saving":
        return {
          title: "Guardando registros",
          description: "Almacenando los datos en la base de datos del Sistema Alimentador...",
          icon: Database,
          color: "#10b981",
        }
      default:
        return {
          title: "Procesando datos",
          description: "Por favor espere mientras se procesan los datos...",
          icon: Loader2,
          color: "#8b5cf6",
        }
    }
  }

  const stageInfo = getStageInfo()
  const StageIcon = stageInfo.icon

  // Generate mock data for visualization
  const dataRows = Array.from({ length: 5 }, (_, i) => i)

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/40 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-3xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Main container with glass effect */}
            <div className="relative overflow-hidden rounded-3xl backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 shadow-2xl border border-white/20 dark:border-gray-800/30">
              {/* Decorative elements */}
              <div
                className="absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-30 blur-3xl"
                style={{ background: `radial-gradient(circle, ${theme.secondary} 0%, ${theme.primary} 70%)` }}
              ></div>
              <div
                className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-20 blur-3xl"
                style={{ background: `radial-gradient(circle, ${theme.secondary} 0%, ${theme.primary} 70%)` }}
              ></div>

              <div className="relative z-10 p-8">
                {/* Header with area badge and stage info */}
                <div className="flex flex-col items-center mb-8">
                  <motion.div
                    className="rounded-full px-4 py-1 text-sm font-medium mb-6"
                    style={{ backgroundColor: theme.primary, color: "white" }}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Área de {area}
                  </motion.div>

                  <motion.div
                    className="flex items-center justify-center w-20 h-20 rounded-full mb-4"
                    style={{ backgroundColor: `${stageInfo.color}20` }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.3 }}
                  >
                    <motion.div
                      animate={stage === "validating" ? { rotate: 360 } : {}}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <StageIcon size={40} style={{ color: stageInfo.color }} />
                    </motion.div>
                  </motion.div>

                  <motion.h2
                    className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {stageInfo.title}
                  </motion.h2>

                  <motion.p
                    className="text-gray-600 dark:text-gray-300 text-center max-w-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    {stageInfo.description}
                  </motion.p>
                </div>

                {/* Circular progress indicator */}
                <motion.div
                  className="flex justify-center mb-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="relative w-48 h-48">
                    {/* Background circle */}
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e2e8f0"
                        strokeWidth="8"
                        className="dark:stroke-gray-700"
                      />

                      {/* Progress circle */}
                      <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={theme.primary}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={251.2} // 2 * PI * r
                        initial={{ strokeDashoffset: 251.2 }}
                        animate={{
                          strokeDashoffset: 251.2 - (progress / 100) * 251.2,
                        }}
                        transition={{ duration: 0.5 }}
                      />
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.div
                        className="text-4xl font-bold"
                        style={{ color: theme.primary }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 10, delay: 0.7 }}
                      >
                        {progress}%
                      </motion.div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{recordCount} registros</div>
                    </div>

                    {/* Orbiting elements */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-10 h-10 rounded-full flex items-center justify-center"
                        style={{
                          backgroundColor: `${theme.primary}20`,
                          boxShadow: `0 0 10px ${theme.primary}40`,
                        }}
                        initial={{
                          x: 0,
                          y: 0,
                          scale: 0,
                        }}
                        animate={{
                          x: 60 * Math.cos(2 * Math.PI * (i / 3) - Math.PI / 2),
                          y: 60 * Math.sin(2 * Math.PI * (i / 3) - Math.PI / 2),
                          scale: 1,
                        }}
                        transition={{
                          type: "spring",
                          damping: 10,
                          delay: 0.8 + i * 0.1,
                        }}
                      >
                        {i === 0 && <FileSpreadsheet size={20} style={{ color: theme.primary }} />}
                        {i === 1 && <Database size={20} style={{ color: theme.primary }} />}
                        {i === 2 && <CheckCircle size={20} style={{ color: theme.primary }} />}
                      </motion.div>
                    ))}

                    {/* Animated particles */}
                    {Array.from({ length: 12 }, (_, i) => (
                      <motion.div
                        key={`particle-${i}`}
                        className="absolute w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: theme.primary }}
                        initial={{
                          x: 0,
                          y: 0,
                          opacity: 0,
                        }}
                        animate={{
                          x: 70 * Math.cos(2 * Math.PI * (i / 12) - Math.PI / 2),
                          y: 70 * Math.sin(2 * Math.PI * (i / 12) - Math.PI / 2),
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          delay: i * 0.2,
                          times: [0, 0.5, 1],
                        }}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Data visualization */}
                <motion.div
                  className="space-y-3 mb-8"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                >
                  {dataRows.map((i) => (
                    <motion.div
                      key={i}
                      className="relative h-12 rounded-xl overflow-hidden backdrop-blur-sm"
                      style={{
                        backgroundColor: completedRows.includes(i) ? `${theme.primary}15` : "rgba(226, 232, 240, 0.5)",
                        borderLeft: completedRows.includes(i) ? `4px solid ${theme.primary}` : "4px solid transparent",
                      }}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 1 + i * 0.1 }}
                    >
                      {/* Progress bar */}
                      <motion.div
                        className="absolute top-0 left-0 h-full"
                        style={{ backgroundColor: `${theme.primary}30` }}
                        initial={{ width: "0%" }}
                        animate={{
                          width: completedRows.includes(i) ? "100%" : "0%",
                        }}
                        transition={{ duration: 0.8 }}
                      />

                      {/* Content */}
                      <div className="relative z-10 flex items-center justify-between h-full px-4">
                        <div className="flex items-center">
                          <div
                            className="w-2 h-2 rounded-full mr-3"
                            style={{ backgroundColor: completedRows.includes(i) ? theme.primary : "#94a3b8" }}
                          />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            Registro #{i + 1}
                          </span>
                        </div>

                        {completedRows.includes(i) ? (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", damping: 10 }}
                          >
                            <CheckCircle size={18} style={{ color: theme.primary }} />
                          </motion.div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-300 dark:border-gray-600" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Footer status */}
                <motion.div
                  className="flex justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                >
                  <div
                    className="flex items-center space-x-2 px-6 py-2 rounded-full"
                    style={{ backgroundColor: `${theme.primary}15` }}
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Loader2 size={18} style={{ color: theme.primary }} />
                    </motion.div>
                    <span style={{ color: theme.primary }}>
                      {stage === "validating"
                        ? "Validando..."
                        : stage === "transferring"
                          ? "Transfiriendo..."
                          : "Guardando..."}
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default SaveAnimation

