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
  // Add optional callback to notify when animation is complete
  onComplete?: () => void
  // Add optional delay before starting animations
  initialDelay?: number
}

type ProcessStage = "initializing" | "validating" | "transferring" | "saving" | "complete" | "error"

const SaveAnimation: React.FC<SaveAnimationProps> = ({
  isVisible,
  area,
  recordCount,
  stage: initialStage,
  onComplete,
  initialDelay = 800, // Default delay of 800ms before starting animations
}) => {
  const [stage, setStage] = useState<ProcessStage>("initializing")
  const [progress, setProgress] = useState(0)
  const [validatedCount, setValidatedCount] = useState(0)
  const [transferredCount, setTransferredCount] = useState(0)
  const [isReady, setIsReady] = useState(false)

  // Refs for animation intervals
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const stageTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // Initialize with delay to ensure data is loaded
  useEffect(() => {
    if (isVisible) {
      // Start with initializing stage
      setStage("initializing")

      // Add delay before starting the actual animation sequence
      const timeout = setTimeout(() => {
        setIsReady(true)
        setStage(initialStage)
      }, initialDelay)

      return () => clearTimeout(timeout)
    }
  }, [isVisible, initialStage, initialDelay])

  // Clean up all animations
  const cleanupAnimations = useCallback(() => {
    if (progressRef.current) clearInterval(progressRef.current)
    if (stageTimeoutRef.current) clearTimeout(stageTimeoutRef.current)
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
      case "initializing":
        return areaTheme
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
      case "initializing":
        return {
          title: "Inicializando proceso",
          description: "Preparando el entorno para procesar los datos...",
          icon: Loader2,
        }
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
    if (!isVisible || !isReady) return

    // Clean up previous animations
    cleanupAnimations()

    // Reset state for new animation sequence
    if (stage === "validating") {
      setProgress(0)
      setValidatedCount(0)
      setTransferredCount(0)
    }

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

    // Validation stage animation - slower and more deliberate
    const startValidation = () => {
      let currentProgress = 0
      // Slow down validation to ensure data is properly loaded
      const incrementAmount = 0.7 // Reduced increment amount
      const interval = 60 // Increased interval time

      progressRef.current = setInterval(() => {
        currentProgress += incrementAmount
        setProgress(Math.min(currentProgress, 100))

        // Update validated count more gradually
        const newValidatedCount = Math.floor((currentProgress / 100) * Math.min(recordCount, 20))
        setValidatedCount(newValidatedCount)

        if (currentProgress >= 100) {
          clearInterval(progressRef.current!)

          // Longer delay before moving to next stage
          stageTimeoutRef.current = setTimeout(() => {
            setStage("transferring")
          }, 800) // Increased delay
        }
      }, interval)
    }

    // Transfer stage animation - more gradual
    const startTransfer = () => {
      setProgress(0)
      let currentProgress = 0
      // Slow down transfer stage
      const incrementAmount = 0.5 // Reduced increment amount
      const interval = 50 // Increased interval time

      progressRef.current = setInterval(() => {
        currentProgress += incrementAmount
        setProgress(Math.min(currentProgress, 100))

        // Update transferred count more gradually
        const newTransferredCount = Math.floor((currentProgress / 100) * recordCount)
        setTransferredCount(newTransferredCount)

        if (currentProgress >= 100) {
          clearInterval(progressRef.current!)

          // Longer delay before moving to next stage
          stageTimeoutRef.current = setTimeout(() => {
            setStage("saving")
          }, 800) // Increased delay
        }
      }, interval)
    }

    // Saving stage animation - even more gradual for final stage
    const startSaving = () => {
      setProgress(0)
      let currentProgress = 0
      // Slow down saving stage significantly
      const incrementAmount = 0.3 // Reduced increment amount
      const interval = 60 // Increased interval time

      progressRef.current = setInterval(() => {
        currentProgress += incrementAmount
        setProgress(Math.min(currentProgress, 100))

        if (currentProgress >= 100) {
          clearInterval(progressRef.current!)

          // Longer delay before completing
          stageTimeoutRef.current = setTimeout(() => {
            setStage("complete")
            // Notify parent component that animation is complete
            if (onComplete) {
              onComplete()
            }
          }, 1000) // Increased delay
        }
      }, interval)
    }

    runAnimation()

    return () => {
      cleanupAnimations()
    }
  }, [isVisible, stage, recordCount, cleanupAnimations, isReady, onComplete])

  // If not visible, don't render anything
  if (!isVisible) return null

  return (
    <motion.div
      className="fixed inset-0 z-50 w-full h-full flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }} // Slightly slower transition
    >
      {/* Backdrop with blur */}
      <motion.div
        className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }} // Slightly slower transition
      />

      {/* Main content container */}
      <div className="relative z-10 w-full max-w-xl px-4">
        <motion.div
          className="w-full overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }} // Slightly slower with delay
        >
          {/* Card */}
          <motion.div
            className="bg-white rounded-xl shadow-xl overflow-hidden"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }} // Softer spring animation
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
                  transition={{ type: "spring", damping: 10, stiffness: 100 }} // Softer spring
                >
                  {/* Pulsing background for icon */}
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: theme.light }}
                    animate={
                      stage !== "complete" && stage !== "error"
                        ? {
                            scale: [1, 1.15, 1],
                            opacity: [1, 0.7, 1],
                          }
                        : {}
                    }
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  />

                  <motion.div
                    animate={
                      stage !== "complete" && stage !== "error"
                        ? { rotate: 360 }
                        : stage === "complete"
                          ? { scale: [1, 1.2, 1] }
                          : {}
                    }
                    transition={
                      stage !== "complete" && stage !== "error"
                        ? { duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }
                        : { duration: 0.5, repeat: 3, repeatType: "reverse" }
                    }
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
                    transition={{ delay: 0.2 }}
                    key={stageInfo.title} // Force re-animation when title changes
                  >
                    {stageInfo.title}
                  </motion.h2>

                  <motion.p
                    className="text-gray-600 text-sm"
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    key={stageInfo.description} // Force re-animation when description changes
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

                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  {" "}
                  {/* Slightly taller progress bar */}
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ backgroundColor: theme.primary }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }} // Slightly slower transition
                  >
                    {/* Enhanced shine effect */}
                    <motion.div
                      className="absolute inset-0 w-20 h-full bg-white/30 skew-x-12"
                      animate={{ x: [-100, 500] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.7 }}
                    />

                    {/* Secondary shine effect for more visual interest */}
                    <motion.div
                      className="absolute inset-0 w-10 h-full bg-white/20 skew-x-12"
                      animate={{ x: [-50, 500] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5, delay: 0.3 }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Visualization area - changes based on current stage */}
              <AnimatePresence mode="wait">
                {/* Initializing stage visualization */}
                {stage === "initializing" && (
                  <motion.div
                    key="initializing"
                    className="mb-6 flex justify-center items-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="relative"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    >
                      <Loader2 size={40} style={{ color: theme.primary }} />
                    </motion.div>

                    {/* Pulsing circles for more visual interest */}
                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: 80,
                        height: 80,
                        border: `2px solid ${theme.primary}`,
                        opacity: 0.3,
                      }}
                      animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
                      transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
                    />

                    <motion.div
                      className="absolute rounded-full"
                      style={{
                        width: 60,
                        height: 60,
                        border: `2px solid ${theme.primary}`,
                        opacity: 0.5,
                      }}
                      animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                      transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY, ease: "easeOut", delay: 0.3 }}
                    />
                  </motion.div>
                )}

                {/* Validation stage visualization */}
                {stage === "validating" && (
                  <motion.div
                    key="validation"
                    className="mb-6"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
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
                            transition={{ delay: i * 0.02 }} // Slightly slower appearance
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
                                className="absolute bottom-0.5 right-0.5 bg-white rounded-full w-3.5 h-3.5 flex items-center justify-center shadow-sm"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 10, delay: 0.1 }}
                              >
                                <CheckCircle size={12} style={{ color: theme.primary }} />
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
                    transition={{ duration: 0.4 }}
                  >
                    <h3 className="text-gray-700 font-medium mb-4 text-sm">
                      {stage === "transferring" ? "Transferencia de datos" : "Guardando en base de datos"}
                    </h3>

                    {/* Data flow visualization */}
                    <div className="relative h-28 mb-4">
                      {" "}
                      {/* Slightly taller container */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex items-center justify-between">
                        {/* Source */}
                        <div className="flex flex-col items-center">
                          <motion.div
                            className="w-18 h-18 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-2"
                            animate={
                              stage === "transferring"
                                ? {
                                    boxShadow: [
                                      `0 0 0 rgba(${theme.primary}, 0)`,
                                      `0 0 15px ${theme.primary}40`,
                                      `0 0 0 rgba(${theme.primary}, 0)`,
                                    ],
                                  }
                                : {}
                            }
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          >
                            <FileSpreadsheet size={28} className="text-gray-600" /> {/* Slightly larger icon */}
                          </motion.div>
                          <span className="text-xs text-gray-500">Excel</span>
                        </div>

                        {/* Connection line */}
                        <div className="flex-1 mx-4 relative">
                          <div className="h-1.5 bg-gray-200 rounded-full">
                            {" "}
                            {/* Slightly thicker line */}
                            <motion.div
                              className="absolute top-0 h-1.5 rounded-full"
                              style={{ backgroundColor: theme.primary }}
                              initial={{ width: "0%" }}
                              animate={{ width: stage === "transferring" ? `${progress}%` : "100%" }}
                            />
                          </div>

                          {/* More data packets for visual interest */}
                          {Array.from({ length: 5 }, (_, i) => (
                            <motion.div
                              key={`packet-${i}`}
                              className="absolute top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: theme.primary }}
                              initial={{ left: "0%", opacity: 0 }}
                              animate={{
                                left: ["0%", "100%"],
                                opacity: [0, 1, 0],
                              }}
                              transition={{
                                duration: 2.5, // Slower packet movement
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.5, // More spaced out
                                ease: "easeInOut",
                              }}
                            />
                          ))}

                          {/* Direction indicator */}
                          <motion.div
                            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-sm"
                            animate={{
                              scale: [1, 1.15, 1],
                            }}
                            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
                          >
                            <ArrowRight size={14} style={{ color: theme.primary }} /> {/* Slightly larger icon */}
                          </motion.div>
                        </div>

                        {/* Destination */}
                        <div className="flex flex-col items-center">
                          <motion.div
                            className="w-18 h-18 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center mb-2"
                            animate={
                              stage === "saving"
                                ? {
                                    boxShadow: [
                                      `0 0 0 rgba(${theme.primary}, 0)`,
                                      `0 0 15px ${theme.primary}40`,
                                      `0 0 0 rgba(${theme.primary}, 0)`,
                                    ],
                                  }
                                : {}
                            }
                            transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                          >
                            {stage === "transferring" ? (
                              <Server size={28} className="text-gray-600" /> // Slightly larger icon
                            ) : (
                              <Database size={28} className="text-gray-600" /> // Slightly larger icon
                            )}
                          </motion.div>
                          <span className="text-xs text-gray-500">
                            {stage === "transferring" ? "Servidor" : "Base de datos"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Data processing stats */}
                    <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                      {" "}
                      {/* Slightly larger padding */}
                      <div className="flex items-center">
                        <motion.div
                          animate={stage === "transferring" || stage === "saving" ? { rotate: [0, 20, 0, -20, 0] } : {}}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1 }}
                        >
                          <Zap size={18} style={{ color: theme.primary }} className="mr-2" />{" "}
                          {/* Slightly larger icon */}
                        </motion.div>
                        <span className="text-gray-600 text-sm font-medium">
                          {" "}
                          {/* Added font-medium */}
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
                    className="mb-6 bg-emerald-50 rounded-lg p-5" // Slightly larger padding
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="flex items-center">
                      <motion.div
                        className="relative mr-5" // Slightly larger margin
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 6, stiffness: 100 }} // Bouncier animation
                      >
                        <CheckCircle size={36} className="text-emerald-500" /> {/* Larger icon */}
                        {/* Multiple success pulse effects for more visual interest */}
                        <motion.div
                          className="absolute -inset-2 rounded-full bg-emerald-500/20"
                          animate={{
                            scale: [1, 1.8],
                            opacity: [0.6, 0],
                          }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
                        />
                        <motion.div
                          className="absolute -inset-3 rounded-full bg-emerald-500/10"
                          animate={{
                            scale: [1, 2],
                            opacity: [0.4, 0],
                          }}
                          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, delay: 0.3 }}
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
                className="flex justify-between items-center text-xs text-gray-500 border-t pt-4" // Slightly larger padding
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

