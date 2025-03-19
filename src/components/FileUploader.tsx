"use client"

import type React from "react"
import { useCallback, useState, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileSpreadsheet,
  Upload,
  X,
  AlertCircle,
  ArrowLeft,
  FileImage,
  FileBadge,
  CheckCircle2,
  Table,
  ChevronRight,
  Sparkles,
  Info,
  XCircle,
} from "lucide-react"
import type { FileWithPreview, AreaType, ScheduleType } from "../types"

interface FileUploaderProps {
  onFileUpload: (file: File, type: ScheduleType) => void
  selectedArea: AreaType
  scheduleType: ScheduleType
  onBack: () => void
}

interface ErrorDetails {
  title: string
  message: string
  type: "format" | "size" | "general"
  suggestion: string
  technicalDetails?: string
}

interface NotificationProps {
  type: "success" | "error"
  message: string
}

const Notification: React.FC<NotificationProps> = ({ type, message }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white`}
  >
    <div className="flex items-center">
      {type === "success" ? <CheckCircle2 className="mr-2" /> : <AlertCircle className="mr-2" />}
      <span>{message}</span>
    </div>
  </motion.div>
)

const FileUploader: React.FC<FileUploaderProps> = ({ onFileUpload, selectedArea, scheduleType, onBack }) => {
  const [file, setFile] = useState<FileWithPreview | null>(null)
  const [error, setError] = useState<ErrorDetails | null>(null)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [notification, setNotification] = useState<NotificationProps | null>(null)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      setError(null)
      setShowErrorModal(false)
      setUploadSuccess(false)

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0]
        let errorDetails: ErrorDetails = {
          title: "Error al cargar el archivo",
          message: "Error al cargar el archivo. Inténtalo de nuevo.",
          type: "general",
          suggestion: "Si el problema persiste, contacta al soporte técnico",
        }

        if (rejection.errors.some((e: any) => e.code === "file-invalid-type")) {
          const fileType = rejection.file.name.split(".").pop()?.toLowerCase()
          errorDetails = {
            title: "Formato de archivo incorrecto",
            message: `Has subido un archivo ${fileType}. Por favor, sube un archivo Excel (.xlsx o .xls)`,
            type: "format",
            suggestion: 'Recuerda que solo se aceptan archivos Excel con la hoja "Formato programación"',
            technicalDetails: `Tipo detectado: ${fileType}, Tamaño: ${(rejection.file.size / 1024).toFixed(2)} KB`,
          }
        } else if (rejection.errors.some((e: any) => e.code === "file-too-large")) {
          errorDetails = {
            title: "Archivo demasiado grande",
            message: "El archivo es demasiado grande. El tamaño máximo es 10MB.",
            type: "size",
            suggestion: "Intenta comprimir el archivo o dividirlo en partes más pequeñas",
            technicalDetails: `Tamaño: ${(rejection.file.size / (1024 * 1024)).toFixed(2)} MB, Máximo permitido: 10MB`,
          }
        }

        setError(errorDetails)
        setShowErrorModal(true)
        return
      }

      if (acceptedFiles.length === 0) {
        return
      }

      const selectedFile = acceptedFiles[0]

      if (!selectedFile.name.match(/\.(xlsx|xls)$/i)) {
        const errorDetails: ErrorDetails = {
          title: "Formato de archivo incorrecto",
          message: "Por favor, sube un archivo de Excel válido (.xlsx o .xls)",
          type: "format",
          suggestion: 'Recuerda que solo se aceptan archivos Excel con la hoja "Formato programación"',
          technicalDetails: `Tipo detectado: ${selectedFile.name.split(".").pop()}, Tamaño: ${(
            selectedFile.size / 1024
          ).toFixed(2)} KB`,
        }
        setError(errorDetails)
        setShowErrorModal(true)
        return
      }

      if (selectedFile.size > 10 * 1024 * 1024) {
        const errorDetails: ErrorDetails = {
          title: "Archivo demasiado grande",
          message: "El archivo es demasiado grande. El tamaño máximo es 10MB.",
          type: "size",
          suggestion: "Intenta comprimir el archivo o dividirlo en partes más pequeñas",
          technicalDetails: `Tamaño: ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB, Máximo permitido: 10MB`,
        }
        setError(errorDetails)
        setShowErrorModal(true)
        return
      }

      const fileWithPreview = Object.assign(selectedFile, {
        preview: URL.createObjectURL(selectedFile),
      })

      setFile(fileWithPreview)
      setUploadSuccess(true)
      showNotification("success", "Archivo cargado correctamente")

      setTimeout(() => {
        onFileUpload(selectedFile, scheduleType)
      }, 800)
    },
    [onFileUpload, scheduleType],
  )

  const removeFile = () => {
    if (file && file.preview) {
      URL.revokeObjectURL(file.preview)
    }
    setFile(null)
    setError(null)
    setShowErrorModal(false)
    setUploadSuccess(false)
  }

  const processFile = () => {
    if (!file) return

    setIsProcessing(true)

    setTimeout(() => {
      onFileUpload(file, scheduleType)
      setIsProcessing(false)
      showNotification("success", "Archivo procesado correctamente")
    }, 1500)
  }

  const { getRootProps, getInputProps, isDragActive, isDragReject, open } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.ms-excel": [".xls"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
    noClick: file !== null,
  })

  const getAreaColor = () => {
    switch (selectedArea) {
      case "Operaciones":
        return "blue"
      case "Lavado":
        return "cyan"
      case "Mantenimiento":
        return "amber"
      case "Remanofactura":
        return "emerald"
      case "ServiciosGenerales":
        return "purple"
      case "Vigilantes":
        return "red"
      default:
        return "green"
    }
  }

  const getAreaGradient = () => {
    const color = getAreaColor()
    return `from-${color}-600 via-${color}-500 to-${color}-400`
  }

  const getAreaBorderColor = () => {
    const color = getAreaColor()
    return `border-${color}-400 hover:border-${color}-500`
  }

  const getAreaTextColor = () => {
    const color = getAreaColor()
    return `text-${color}-600`
  }

  const getAreaBgColor = () => {
    const color = getAreaColor()
    return `bg-${color}-50`
  }

  const getAreaButtonBg = () => {
    const color = getAreaColor()
    return `bg-${color}-600 hover:bg-${color}-500`
  }

  const getErrorIcon = () => {
    switch (error?.type) {
      case "format":
        return <FileImage size={24} className="text-red-500 mr-3 flex-shrink-0" />
      case "size":
        return <FileBadge size={24} className="text-red-500 mr-3 flex-shrink-0" />
      default:
        return <AlertCircle size={24} className="text-red-500 mr-3 flex-shrink-0" />
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    },
  }

  const buttonVariants = {
    idle: { scale: 1 },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
    tap: { scale: 0.95 },
  }

  const successVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20,
      },
    },
  }

  const modalVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      y: -20,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Background particle animation
  const getRandomParticleAnimation = (index: number) => {
    const baseDelay = index * 0.3
    return {
      initial: {
        x: Math.random() * windowSize.width * 0.8,
        y: Math.random() * windowSize.height * 0.8,
        rotate: Math.random() * 360,
        opacity: 0.03 + Math.random() * 0.07,
        scale: 0.5 + Math.random() * 0.5,
      },
      animate: {
        y: [null, Math.random() * windowSize.height * 0.8, null],
        x: [null, Math.random() * windowSize.width * 0.8, null],
        rotate: [null, Math.random() * 360, null],
        transition: {
          duration: 15 + Math.random() * 20,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: baseDelay,
        },
      },
    }
  }

  return (
    <motion.div
      className="w-full max-w-2xl mx-auto relative"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Decorative background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => {
          const animation = getRandomParticleAnimation(i)
          return (
            <motion.div
              key={i}
              initial={animation.initial}
              animate={animation.animate}
              className={`absolute ${getAreaTextColor()} opacity-5`}
            >
              <Table size={20 + Math.random() * 30} />
            </motion.div>
          )
        })}
      </div>

      <motion.div variants={itemVariants} className="mb-8">
        <motion.button
          onClick={onBack}
          className={`flex items-center ${getAreaTextColor()} hover:opacity-80 transition-colors rounded-full px-4 py-2 ${getAreaBgColor()} bg-opacity-50`}
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={18} className="mr-2" />
          <span>Volver a selección de área</span>
        </motion.button>
      </motion.div>

      <motion.div variants={itemVariants} className="text-center mb-10">
        <div className="inline-block relative mb-6">
          <motion.div
            className={`h-20 w-20 rounded-full bg-gradient-to-br ${getAreaGradient()} mx-auto flex items-center justify-center shadow-lg`}
            whileHover={{
              rotate: [0, -5, 5, -3, 3, 0],
              transition: { duration: 0.5 },
            }}
          >
            <Table className="h-10 w-10 text-white" />

            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full -z-10"
              animate={{
                boxShadow: [
                  `0 0 0 0 rgba(var(--${getAreaColor()}-500-rgb), 0)`,
                  `0 0 0 15px rgba(var(--${getAreaColor()}-500-rgb), 0.2)`,
                  `0 0 0 0 rgba(var(--${getAreaColor()}-500-rgb), 0)`,
                ],
              }}
              transition={{
                duration: 2.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "loop",
              }}
            />
          </motion.div>
        </div>

        <motion.p
          className="text-gray-600 text-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Por favor cargue el archivo Excel necesario para esta área
        </motion.p>

        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={`h-1 w-40 mx-auto mt-6 mb-4 bg-gradient-to-r ${getAreaGradient()} rounded-full`}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        {!file ? (
          <motion.div
            className={`border-3 border-dashed rounded-2xl overflow-hidden ${
              isDragActive
                ? `border-${getAreaColor()}-400 ${getAreaBgColor()}`
                : isDragReject
                  ? "border-red-400 bg-red-50"
                  : `${getAreaBorderColor()} bg-white hover:${getAreaBgColor()} hover:bg-opacity-50`
            } transition-all duration-300 cursor-pointer shadow-md relative`}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
            {...getRootProps()}
          >
            {/* Background gradient */}
            <motion.div
              className="absolute inset-0 opacity-10 -z-10"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%"],
              }}
              transition={{ duration: 8, ease: "linear", repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
              style={{
                backgroundImage: `radial-gradient(circle at 50% 50%, var(--${getAreaColor()}-500) 0%, transparent 70%)`,
                backgroundSize: "200% 200%",
              }}
            />

            <div className="p-10">
              <input {...getInputProps()} />
              <div className="flex flex-col items-center justify-center text-center">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-24 h-24 mb-6 rounded-full ${getAreaBgColor()} flex items-center justify-center ${getAreaTextColor()} relative`}
                >
                  {isDragReject ? (
                    <X size={40} className="text-red-500" />
                  ) : (
                    <>
                      <Upload size={40} />
                      <motion.div
                        className="absolute inset-0 rounded-full"
                        animate={{
                          boxShadow: [
                            `0 0 0 0 rgba(var(--${getAreaColor()}-500-rgb), 0)`,
                            `0 0 0 10px rgba(var(--${getAreaColor()}-500-rgb), 0.2)`,
                            `0 0 0 0 rgba(var(--${getAreaColor()}-500-rgb), 0)`,
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Number.POSITIVE_INFINITY,
                          repeatType: "loop",
                        }}
                      />
                    </>
                  )}
                </motion.div>

                <motion.h3
                  className="text-2xl font-medium text-gray-700 mb-4"
                  animate={{
                    scale: isDragActive ? 1.05 : 1,
                    color: isDragActive ? `var(--${getAreaColor()}-600)` : "",
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  {isDragActive
                    ? isDragReject
                      ? "¡Este archivo no es válido!"
                      : "¡Suelta el archivo aquí!"
                    : "Arrastra y suelta un archivo Excel"}
                </motion.h3>

                <motion.p className="text-base text-gray-500 mb-5" animate={{ opacity: isDragActive ? 0.5 : 1 }}>
                  o haz clic para seleccionar un archivo
                </motion.p>

                <motion.div
                  className="flex flex-col items-center gap-3 mt-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
                    <FileSpreadsheet size={14} />
                    <span>Formatos soportados: .xlsx, .xls (máx. 10MB)</span>
                  </div>

                  <div
                    className={`flex items-center gap-2 text-xs ${getAreaTextColor()} ${getAreaBgColor()} px-4 py-2 rounded-full`}
                  >
                    <CheckCircle2 size={14} />
                    <span>El archivo debe contener la hoja "Formato programación"</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            {/* Success indicator */}
            {uploadSuccess && (
              <motion.div
                className={`h-2 bg-gradient-to-r ${getAreaGradient()}`}
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 0.8 }}
              />
            )}

            <div className="p-8">
              <div className="flex items-center">
                <motion.div
                  className={`w-16 h-16 rounded-xl ${getAreaBgColor()} flex items-center justify-center ${getAreaTextColor()} mr-5 relative`}
                  whileHover={{ rotate: [0, -5, 5, -3, 3, 0], transition: { duration: 0.5 } }}
                >
                  <FileSpreadsheet size={32} />

                  {/* Success checkmark */}
                  <AnimatePresence>
                    {uploadSuccess && (
                      <motion.div
                        className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md"
                        variants={successVariants}
                        initial="hidden"
                        animate="visible"
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-medium text-gray-800 truncate mb-1">{file.name}</h3>
                  <div className="flex items-center gap-3">
                    <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                    <span className="text-gray-300">•</span>
                    <p className={`text-sm ${getAreaTextColor()} font-medium`}>Listo para procesar</p>
                  </div>
                </div>

                <motion.button
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={removeFile}
                  className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 hover:bg-red-200 transition-colors ml-4"
                >
                  <X size={18} />
                </motion.button>
              </div>

              <motion.div
                className="mt-8 flex justify-between items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <button onClick={open} className="text-gray-500 hover:text-gray-700 text-sm flex items-center gap-1">
                  <Upload size={14} />
                  <span>Cambiar archivo</span>
                </button>

                <motion.button
                  variants={buttonVariants}
                  initial="idle"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={processFile}
                  disabled={isProcessing}
                  className={`px-5 py-2 ${getAreaButtonBg()} text-white rounded-lg shadow-md transition-all flex items-center gap-2 ${
                    isProcessing ? "opacity-80" : ""
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        className="mr-2"
                      >
                        <Sparkles size={16} />
                      </motion.div>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <span>Procesar archivo</span>
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5 }}
                      >
                        <ChevronRight size={16} />
                      </motion.div>
                    </>
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Error Modal */}
      <AnimatePresence>
        {showErrorModal && error && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <motion.div
              className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Modal header with gradient based on error type */}
              <div
                className={`p-6 ${error.type === "format" ? "bg-red-500" : error.type === "size" ? "bg-amber-500" : "bg-red-500"} text-white`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {error.type === "format" ? (
                      <FileImage size={24} className="mr-3" />
                    ) : error.type === "size" ? (
                      <FileBadge size={24} className="mr-3" />
                    ) : (
                      <AlertCircle size={24} className="mr-3" />
                    )}
                    <h3 className="text-xl font-bold">{error.title}</h3>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowErrorModal(false)}
                    className="text-white hover:text-gray-100"
                  >
                    <XCircle size={24} />
                  </motion.button>
                </div>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <div className="mb-6">
                  <p className="text-gray-800 text-lg mb-4">{error.message}</p>

                  <div className="flex items-start mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <Info size={20} className="text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
                    <p className="text-amber-700 text-sm">{error.suggestion}</p>
                  </div>
                </div>

                {/* Technical details (collapsible) */}
                {error.technicalDetails && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <details className="group">
                      <summary className="flex items-center cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                        <ChevronRight size={16} className="mr-2 transition-transform group-open:rotate-90" />
                        Detalles técnicos
                      </summary>
                      <div className="mt-2 pl-6 text-xs text-gray-500 font-mono bg-gray-50 p-3 rounded">
                        {error.technicalDetails}
                      </div>
                    </details>
                  </div>
                )}

                {/* Action buttons */}
                <div className="mt-6 flex justify-end gap-3">
                  <motion.button
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setShowErrorModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium"
                  >
                    Cerrar
                  </motion.button>
                  <motion.button
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => {
                      setShowErrorModal(false)
                      open()
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Upload size={14} />
                    <span>Intentar de nuevo</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.div variants={itemVariants} className="text-center mt-12 mb-6">
        <div className="inline-block">
          <motion.div
            className={`h-0.5 bg-gradient-to-r ${getAreaGradient()} mt-1 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, delay: 0.5 }}
          />
        </div>
      </motion.div>

      <AnimatePresence>
        {notification && <Notification type={notification.type} message={notification.message} />}
      </AnimatePresence>
    </motion.div>
  )
}

export default FileUploader