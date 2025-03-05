"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  CheckCircle,
  XCircle,
  Shield,
  Database,
  FileSpreadsheet,
  Zap,
  User,
  ArrowRight,
  Loader2,
  Server,
} from "lucide-react"

interface SaveAnimationProps {
  isVisible: boolean
  area: string
  recordCount: number
  stage: "validating" | "transferring" | "saving"
}

type ProcessStage = "validating" | "transferring" | "saving" | "complete" | "error"

const SaveAnimation: React.FC<SaveAnimationProps> = ({ isVisible, area, recordCount, stage: initialStage }) => {
  const [stage, setStage] = useState<ProcessStage>(initialStage)
  const [progress, setProgress] = useState(0)
  const [validatedCount, setValidatedCount] = useState(0)
  const [transferredCount, setTransferredCount] = useState(0)

  // Refs for animation intervals
  const progressRef = useRef<NodeJS.Timeout | null>(null)

  // Disable body scrolling when animation is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isVisible])

  // Update stage when prop changes
  useEffect(() => {
    setStage(initialStage)
  }, [initialStage])

  // Clean up all animations
  const cleanupAnimations = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAnimations()
    }
  }, [cleanupAnimations])

  // Get theme colors based on area
  const getTheme = () => {
    const baseThemes = {
      Operaciones: {
        primary: "#3b82f6", // blue-500
        secondary: "#93c5fd", // blue-300
        accent: "#1d4ed8", // blue-700
        light: "#dbeafe", // blue-100
      },
      Lavado: {
        primary: "#06b6d4", // cyan-500
        secondary: "#67e8f9", // cyan-300
        accent: "#0e7490", // cyan-700
        light: "#cffafe", // cyan-100
      },
      Mantenimiento: {
        primary: "#f59e0b", // amber-500
        secondary: "#fcd34d", // amber-300
        accent: "#b45309", // amber-700
        light: "#fef3c7", // amber-100
      },
      Remanofactura: {
        primary: "#10b981", // emerald-500
        secondary: "#6ee7b7", // emerald-300
        accent: "#047857", // emerald-700
        light: "#d1fae5", // emerald-100
      },
      ServiciosGenerales: {
        primary: "#8b5cf6", // purple-500
        secondary: "#c4b5fd", // purple-300
        accent: "#6d28d9", // purple-700
        light: "#ede9fe", // purple-100
      },
      Vigilantes: {
        primary: "#ef4444", // red-500
        secondary: "#fca5a5", // red-300
        accent: "#b91c1c", // red-700
        light: "#fee2e2", // red-100
      },
    }

    // Default to Remanofactura if area not found
    const areaTheme = baseThemes[area as keyof typeof baseThemes] || baseThemes.Remanofactura

    // Modify theme based on current stage
    switch (stage) {
      case "complete":
        return {
          primary: "#10b981", // emerald-500
          secondary: "#6ee7b7", // emerald-300
          accent: "#047857", // emerald-700
          light: "#d1fae5", // emerald-100
        }
      case "error":
        return {
          primary: "#ef4444", // red-500
          secondary: "#fca5a5", // red-300
          accent: "#b91c1c", // red-700
          light: "#fee2e2", // red-100
        }
      default:
        return areaTheme
    }
  }

  const theme = getTheme()

  // Get stage information
  const getStageInfo = () => {
    switch (stage) {
      case "validating":
        return {
          title: "Validando empleados",
          description: "Verificando que todos los empleados existan en el sistema...",
          icon: Shield,
        }
      case "transferring":
        return {
          title: "Preparando datos",
          description: "Preparando los registros para su almacenamiento...",
          icon: FileSpreadsheet,
        }
      case "saving":
        return {
          title: "Guardando datos",
          description: "Guardando los registros en la base de datos del Sistema Alimentador...",
          icon: Database,
        }
      case "complete":
        return {
          title: "Proceso completado",
          description: "Todos los registros han sido guardados correctamente.",
          icon: CheckCircle,
        }
      case "error":
        return {
          title: "Error en el proceso",
          description: "Se encontraron errores que impiden continuar.",
          icon: XCircle,
        }
      default:
        return {
          title: "Procesando datos",
          description: "Por favor espere mientras se procesan los datos...",
          icon: Loader2,
        }
    }
  }

  const stageInfo = getStageInfo()
  const StageIcon = stageInfo.icon

  // Main animation sequence
  useEffect(() => {
    if (!isVisible) return

    // Clean up previous animations
    cleanupAnimations()

    // Reset state
    setProgress(0)
    setValidatedCount(0)
    setTransferredCount(0)

    // Start animation based on current stage
    const runAnimation = () => {
      switch (stage) {
        case "validating":
          startValidation()
          break
        case "transferring":
          startTransfer()
          break
        case "saving":
          startSaving()
          break
      }
    }

    // Validation stage animation
    const startValidation = () => {
      let currentProgress = 0

      progressRef.current = setInterval(() => {
        currentProgress += 1
        setProgress(Math.min(currentProgress, 100))

        // Update validated count
        const newValidatedCount = Math.floor((currentProgress / 100) * Math.min(recordCount, 20))
        setValidatedCount(newValidatedCount)

        if (currentProgress >= 100) {
          clearInterval(progressRef.current!)

          // Move to next stage after a short delay
          setTimeout(() => {
            setStage("transferring")
            startTransfer()
          }, 500)
        }
      }, 50)
    }

    // Transfer stage animation
    const startTransfer = () => {
      setProgress(0)
      let currentProgress = 0

      progressRef.current = setInterval(() => {
        currentProgress += 0.8
        setProgress(Math.min(currentProgress, 100))

        // Update transferred count
        const newTransferredCount = Math.floor((currentProgress / 100) * recordCount)
        setTransferredCount(newTransferredCount)

        if (currentProgress >= 100) {
          clearInterval(progressRef.current!)

          // Move to next stage after a short delay
          setTimeout(() => {
            setStage("saving")
            startSaving()
          }, 500)
        }
      }, 40)
    }

    // Saving stage animation
    const startSaving = () => {
      setProgress(0)
      let currentProgress = 0

      progressRef.current = setInterval(() => {
        currentProgress += 0.6
        setProgress(Math.min(currentProgress, 100))

        if (currentProgress >= 100) {
          clearInterval(progressRef.current!)

          // Complete the animation
          setTimeout(() => {
            setStage("complete")
          }, 500)
        }
      }, 30)
    }

    runAnimation()

    return () => {
      cleanupAnimations()
    }
  }, [isVisible, stage, recordCount, cleanupAnimations])

  // If not visible, don't render anything
  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 w-full h-full flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop with blur */}
      <motion.div
        className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-xl px-4">
        <motion.div
          className="w-full overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Card */}
          <motion.div
            className="bg-white rounded-xl shadow-xl overflow-hidden"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Header section */}
            <div className="relative p-6 pb-4 border-b" style={{ borderColor: `${theme.light}` }}>
              <div className="flex items-center">
                {/* Stage icon with animated glow */}
                <motion.div
                  className="relative flex items-center justify-center w-14 h-14 rounded-full mr-4"
                  style={{
                    backgroundColor: theme.light,
                  }}
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12 }}
                >
                  <motion.div
                    animate={stage !== "complete" && stage !== "error" ? { rotate: 360 } : {}}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <StageIcon style={{ color: theme.primary }} size={28} />
                  </motion.div>
                </motion.div>

                {/* Stage title and description */}
                <div>
                  <motion.h2
                    className="text-xl font-bold text-gray-800 mb-1"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    {stageInfo.title}
                  </motion.h2>

                  <motion.p
                    className="text-gray-600 text-sm"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {stageInfo.description}
                  </motion.p>
                </div>
              </div>
            </div>

            {/* Progress section */}
            <div className="p-6">
              {/* Progress bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-500 mb-2">
                  <span>Progreso</span>
                  <span>{Math.round(progress)}%</span>
                </div>

                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ backgroundColor: theme.primary }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Animated shine effect */}
                    <motion.div
                      className="absolute inset-0 w-16 h-full bg-white/30 skew-x-12"
                      animate={{ x: [-80, 400] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5 }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Visualization area - changes based on current stage */}
              <AnimatePresence mode="wait">
                {/* Validation stage visualization */}
                {stage === "validating" && (
                  <motion.div
                    key="validation"
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-gray-700 font-medium mb-3 text-sm">Validación de empleados</h3>

                    {/* User grid for employee validation */}
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: Math.min(recordCount, 20) }, (_, i) => {
                        const isValidated = i < validatedCount

                        return (
                          <motion.div
                            key={`user-${i}`}
                            className="aspect-square relative flex items-center justify-center rounded-md"
                            style={{
                              backgroundColor: isValidated ? theme.light : "rgba(243, 244, 246, 0.5)",
                              border: isValidated ? `1px solid ${theme.secondary}` : "1px solid transparent",
                            }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{
                              scale: 1,
                              opacity: 1,
                            }}
                            transition={{ delay: i * 0.01 }}
                          >
                            <User
                              size={16}
                              style={{
                                color: isValidated ? theme.primary : "#9ca3af",
                                opacity: isValidated ? 1 : 0.5,
                              }}
                            />

                            {isValidated && (
                              <motion.div
                                className="absolute bottom-0.5 right-0.5 bg-white rounded-full w-3 h-3 flex items-center justify-center"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12 }}
                              >
                                <CheckCircle size={10} style={{ color: theme.primary }} />
                              </motion.div>
                            )}
                          </motion.div>
                        )
                      })}
                    </div>

                    {recordCount > 20 && (
                      <div className="text-center mt-3 text-gray-500 text-xs">
                        Mostrando 20 de {recordCount} empleados
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Transfer and saving stage visualization */}
                {(stage === "transferring" || stage === "saving") && (
                  <motion.div
                    key="transfer"
                    className="mb-6 relative"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-gray-700 font-medium mb-4 text-sm">
                      {stage === "transferring" ? "Transferencia de datos" : "Guardando en base de datos"}
                    </h3>

                    {/* Data flow visualization */}
                    <div className="relative h-24 mb-4">
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between">
                        {/* Source */}
                        <div className="flex flex-col items-center">
                          <motion.div
                            className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-2"
                            animate={
                              stage === "transferring"
                                ? {
                                    boxShadow: [
                                      `0 0 0 rgba(${theme.primary}, 0)`,
                                      `0 0 10px ${theme.primary}40`,
                                      `0 0 0 rgba(${theme.primary}, 0)`,
                                    ],
                                  }
                                : {}
                            }
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                          >
                            <FileSpreadsheet size={24} className="text-gray-600" />
                          </motion.div>
                          <span className="text-xs text-gray-500">Excel</span>
                        </div>

                        {/* Connection line */}
                        <div className="flex-1 mx-4 relative">
                          <div className="h-1 bg-gray-200 rounded-full">
                            <motion.div
                              className="absolute top-0 h-1 rounded-full"
                              style={{ backgroundColor: theme.primary }}
                              initial={{ width: "0%" }}
                              animate={{ width: stage === "transferring" ? `${progress}%` : "100%" }}
                            />
                          </div>

                          {/* Data packets */}
                          {Array.from({ length: 3 }, (_, i) => (
                            <motion.div
                              key={`packet-${i}`}
                              className="absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full"
                              style={{ backgroundColor: theme.primary }}
                              initial={{ left: "0%", opacity: 0 }}
                              animate={{
                                left: ["0%", "100%"],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.6,
                                ease: "easeInOut",
                              }}
                            />
                          ))}

                          {/* Direction indicator */}
                          <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow-sm"
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                          >
                            <ArrowRight size={12} style={{ color: theme.primary }} />
                          </motion.div>
                        </div>

                        {/* Destination */}
                        <div className="flex flex-col items-center">
                          <motion.div
                            className="w-16 h-16 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-2"
                            animate={
                              stage === "saving"
                                ? {
                                    boxShadow: [
                                      `0 0 0 rgba(${theme.primary}, 0)`,
                                      `0 0 10px ${theme.primary}40`,
                                      `0 0 0 rgba(${theme.primary}, 0)`,
                                    ],
                                  }
                                : {}
                            }
                            transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                          >
                            {stage === "transferring" ? (
                              <Server size={24} className="text-gray-600" />
                            ) : (
                              <Database size={24} className="text-gray-600" />
                            )}
                          </motion.div>
                          <span className="text-xs text-gray-500">
                            {stage === "transferring" ? "Servidor" : "Base de datos"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Data processing stats */}
                    <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center">
                        <Zap size={16} style={{ color: theme.primary }} className="mr-2" />
                        <span className="text-gray-600 text-sm">
                          {stage === "transferring" ? "Transfiriendo" : "Guardando"}
                        </span>
                      </div>
                      <div className="text-gray-700 font-medium text-sm">
                        {stage === "transferring" ? transferredCount : Math.floor((progress / 100) * recordCount)} /{" "}
                        {recordCount}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Complete stage visualization */}
                {stage === "complete" && (
                  <motion.div
                    key="complete"
                    className="mb-6 bg-emerald-50 rounded-lg p-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center">
                      <motion.div
                        className="relative mr-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 8 }}
                      >
                        <CheckCircle size={32} className="text-emerald-500" />

                        {/* Success pulse effect */}
                        <motion.div
                          className="absolute -inset-1.5 rounded-full bg-emerald-500/20"
                          animate={{
                            scale: [1, 1.5],
                            opacity: [0.5, 0],
                          }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        />
                      </motion.div>

                      <div>
                        <h3 className="text-gray-800 font-medium text-base mb-1">Proceso completado con éxito</h3>
                        <p className="text-gray-600 text-sm">Se han procesado {recordCount} registros correctamente</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Area and record count info */}
              <div
                className="flex justify-between items-center text-xs text-gray-500 border-t pt-3"
                style={{ borderColor: `${theme.light}` }}
              >
                <div>
                  <span className="text-gray-600 mr-1">Área:</span>
                  <span>{area}</span>
                </div>
                <div>
                  <span className="text-gray-600 mr-1">Registros:</span>
                  <span>{recordCount}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default SaveAnimation

