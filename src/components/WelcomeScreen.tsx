"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { AreaOption, ScheduleType } from "../types"
import {
  Activity,
  Droplets,
  Wrench,
  Recycle,
  Building2,
  Shield,
  Leaf,
  ArrowRight,
  X,
  FileSpreadsheet,
  FileWarning,
  Construction,
} from "lucide-react"
import { toast } from "react-toastify"
import PasswordModal from "./PasswordModal"

interface WelcomeScreenProps {
  onSelectArea: (area: string, type: ScheduleType) => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectArea }) => {
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [showWelcomePopup, setShowWelcomePopup] = useState(true)
  const [showScheduleTypeModal, setShowScheduleTypeModal] = useState(false)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  })

  const [showInfraArea, setShowInfraArea] = useState(true)
  const gridRef = useRef<HTMLDivElement>(null)
  // const [isScrolling, setIsScrolling] = useState(false) // No longer needed

  // Update window size for responsive design
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

  const scheduleTypes = [
    {
      id: "formato" as ScheduleType,
      name: "Formato de Programación",
      description: "Cargar y gestionar los formatos de programación de turnos",
      icon: "FileSpreadsheet",
      disabled: false,
    },
    {
      id: "novedades" as ScheduleType,
      name: "Novedades",
      description: "Gestionar novedades y cambios en la programación",
      icon: "FileWarning",
      disabled: true, // Marcar como deshabilitado
    },
  ]

  const areas: AreaOption[] = [
    {
      id: "Operaciones",
      name: "Operaciones",
      icon: "Activity",
      description: "Gestión de operaciones diarias y monitoreo de actividades en tiempo real",
      color: "from-blue-600 via-blue-500 to-blue-400",
      hoverColor: "from-blue-500 via-blue-400 to-blue-300",
      bgColor: "bg-blue-100",
      textColor: "text-blue-800",
      borderColor: "border-blue-300",
      password: "Operaciones098!",
    },
    {
      id: "Lavado",
      name: "Lavado",
      icon: "Droplets",
      description: "Control de procesos de lavado y gestión de recursos hídricos",
      color: "from-cyan-600 via-cyan-500 to-cyan-400",
      hoverColor: "from-cyan-500 via-cyan-400 to-cyan-300",
      bgColor: "bg-cyan-100",
      textColor: "text-cyan-800",
      borderColor: "border-cyan-300",
      password: "Lavado567@",
    },
    {
      id: "Mantenimiento",
      name: "Mantenimiento",
      icon: "Wrench",
      description: "Mantenimiento preventivo y correctivo de equipos e instalaciones",
      color: "from-amber-600 via-amber-500 to-amber-400",
      hoverColor: "from-amber-500 via-amber-400 to-amber-300",
      bgColor: "bg-amber-100",
      textColor: "text-amber-800",
      borderColor: "border-amber-300",
      password: "Mantenimiento278*",
    },
    {
      id: "Remanofactura",
      name: "Remanofactura",
      icon: "Recycle",
      description: "Procesos de remanufactura, reciclaje y gestión sostenible de recursos",
      color: "from-emerald-600 via-emerald-500 to-emerald-400",
      hoverColor: "from-emerald-500 via-emerald-400 to-emerald-300",
      bgColor: "bg-emerald-100",
      textColor: "text-emerald-800",
      borderColor: "border-emerald-300",
      password: "Remanofactura878?",
    },
    {
      id: "ServiciosGenerales",
      name: "Servicios Generales",
      icon: "Building2",
      description: "Administración de servicios generales y gestión de instalaciones",
      color: "from-purple-600 via-purple-500 to-purple-400",
      hoverColor: "from-purple-500 via-purple-400 to-purple-300",
      bgColor: "bg-purple-100",
      textColor: "text-purple-800",
      borderColor: "border-purple-300",
      password: "ServiciosGenerales741/",
    },
    {
      id: "Vigilantes",
      name: "Vigilantes",
      icon: "Shield",
      description: "Control de seguridad, vigilancia y protección de activos",
      color: "from-red-600 via-red-500 to-red-400",
      hoverColor: "from-red-500 via-red-400 to-red-300",
      bgColor: "bg-red-100",
      textColor: "text-red-800",
      borderColor: "border-red-300",
      password: "Vigilantes542_",
    },
  ]

  // Área adicional de Infraestructura
  const infraArea: AreaOption = {
    id: "Infraestructura",
    name: "Infraestructura",
    icon: "Construction",
    description: "Gestión y mantenimiento de infraestructura física y tecnológica",
    color: "from-teal-600 via-teal-500 to-teal-400",
    hoverColor: "from-teal-500 via-teal-400 to-teal-300",
    bgColor: "bg-teal-100",
    textColor: "text-teal-800",
    borderColor: "border-teal-300",
    password: "Infraestructura852#",
  }

  const getIcon = (iconName: string, size = 24, className = "") => {
    switch (iconName) {
      case "Activity":
        return <Activity size={size} className={className} />
      case "Droplets":
        return <Droplets size={size} className={className} />
      case "Wrench":
        return <Wrench size={size} className={className} />
      case "Recycle":
        return <Recycle size={size} className={className} />
      case "Building2":
        return <Building2 size={size} className={className} />
      case "Shield":
        return <Shield size={size} className={className} />
      case "FileSpreadsheet":
        return <FileSpreadsheet size={size} className={className} />
      case "FileWarning":
        return <FileWarning size={size} className={className} />
      case "Construction":
        return <Construction size={size} className={className} />
      default:
        return <Activity size={size} className={className} />
    }
  }

  const handleAreaClick = (area: AreaOption) => {
    setSelectedArea(area)
    setShowPasswordModal(true)
    setPasswordError("")
  }

  const handlePasswordSubmit = (password: string) => {
    if (!selectedArea) return

    setIsAuthenticating(true)

    // Simulate authentication delay
    setTimeout(() => {
      if (password === selectedArea.password) {
        setShowPasswordModal(false)
        setShowScheduleTypeModal(true)
        setShowConfetti(true)
        toast.success(`¡Acceso concedido al área de ${selectedArea.name}!`, {
          position: "top-center",
          autoClose: 3000,
        })
      } else {
        setPasswordError("Contraseña incorrecta. Por favor, inténtelo de nuevo.")
        toast.error("Contraseña incorrecta", {
          position: "top-center",
          autoClose: 3000,
        })
      }
      setIsAuthenticating(false)
    }, 1000)
  }

  const handleScheduleTypeSelect = (type: ScheduleType) => {
    if (!selectedArea) return

    // Verificar si el tipo está deshabilitado
    const scheduleType = scheduleTypes.find((t) => t.id === type)
    if (scheduleType?.disabled) {
      toast.info("Esta funcionalidad aún no está disponible", {
        position: "top-center",
        autoClose: 3000,
      })
      return
    }

    setShowScheduleTypeModal(false)

    // Wait for confetti and toast before proceeding
    setTimeout(() => {
      onSelectArea(selectedArea.id, type)
      setShowConfetti(false)
    }, 1000)
  }

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setSelectedArea(null)
    setPasswordError("")
  }

  const handleCloseScheduleTypeModal = () => {
    setShowScheduleTypeModal(false)
    setSelectedArea(null)
  }

  // Animation variants
  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.2,
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
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

  // Schedule type modal animation variants
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  }

  // Welcome popup animation variants
  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.4,
        ease: [0.22, 1, 0.36, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  // Leaf logo animation variants
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

  // Background leaf animation
  const getRandomLeafAnimation = (index: number) => {
    const baseDelay = index * 0.5
    return {
      initial: {
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        rotate: Math.random() * 360,
        opacity: 0.03 + Math.random() * 0.07,
      },
      animate: {
        y: [null, Math.random() * windowSize.height, null],
        x: [null, Math.random() * windowSize.width, null],
        rotate: [null, Math.random() * 360, null],
        transition: {
          duration: 25 + Math.random() * 35,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
          delay: baseDelay,
        },
      },
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 -z-10 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 25%)`,
            backgroundSize: "120px 120px",
          }}
        ></div>
      </div>

      {/* Animated background leaves */}
      {[...Array(12)].map((_, i) => {
        const animation = getRandomLeafAnimation(i)
        return (
          <motion.div
            key={i}
            initial={animation.initial}
            animate={animation.animate}
            className="absolute text-green-500 pointer-events-none"
          >
            <Leaf size={20 + Math.random() * 50} />
          </motion.div>
        )
      })}

      {/* Welcome Popup */}
      <AnimatePresence>
        {showWelcomePopup && (
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
                onClick={() => setShowWelcomePopup(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>

              <div className="flex flex-col items-center text-center">
                {/* Animated logo */}
                <motion.div
                  className="relative mb-6"
                  variants={leafLogoVariants}
                  initial="hidden"
                  animate={["visible", "pulse"]}
                >
                  <div className="relative flex items-center justify-center h-24 w-24 rounded-full bg-gradient-to-br from-green-600 via-green-500 to-green-400 border-2 border-white/50">
                    <Leaf className="h-12 w-12 text-white" />

                    {/* Animated glow effect */}
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

                  {/* Orbiting dots */}
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

                {/* Title and content */}
                <motion.h2
                  className="text-3xl font-bold text-green-800 mb-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  Bienvenido al Sistema
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
                  onClick={() => setShowWelcomePopup(false)}
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
        )}
      </AnimatePresence>

      {/* Schedule Type Modal */}
      <AnimatePresence>
        {showScheduleTypeModal && selectedArea && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl border border-gray-100"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              {/* Decorative background elements */}
              <div className="absolute inset-0 overflow-hidden rounded-2xl">
                <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-70"></div>
                <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-gray-50 to-gray-100 opacity-70"></div>
              </div>

              <motion.button
                onClick={handleCloseScheduleTypeModal}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white/80 backdrop-blur-sm rounded-full p-1"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={24} />
              </motion.button>

              <div className="relative z-10">
                <div className="flex items-center mb-8">
                  <div
                    className={`p-3 rounded-lg bg-${
                      selectedArea.id === "Operaciones"
                        ? "blue"
                        : selectedArea.id === "Lavado"
                          ? "cyan"
                          : selectedArea.id === "Mantenimiento"
                            ? "amber"
                            : selectedArea.id === "Remanofactura"
                              ? "emerald"
                              : selectedArea.id === "ServiciosGenerales"
                                ? "purple"
                                : selectedArea.id === "Vigilantes"
                                  ? "red"
                                  : "green"
                    }-100 mr-4`}
                  >
                    {getIcon(
                      selectedArea.icon,
                      24,
                      `text-${
                        selectedArea.id === "Operaciones"
                          ? "blue"
                          : selectedArea.id === "Lavado"
                            ? "cyan"
                            : selectedArea.id === "Mantenimiento"
                              ? "amber"
                              : selectedArea.id === "Remanofactura"
                                ? "emerald"
                                : selectedArea.id === "ServiciosGenerales"
                                  ? "purple"
                                  : selectedArea.id === "Vigilantes"
                                    ? "red"
                                    : "green"
                      }-600`,
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Seleccione el tipo de formato</h2>
                    <p className="text-gray-500">Área: {selectedArea.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {scheduleTypes.map((type) => (
                    <motion.div
                      key={type.id}
                      className={`relative overflow-hidden p-6 rounded-xl border cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-md ${type.disabled ? "opacity-70 cursor-not-allowed" : ""}`}
                      style={{
                        borderColor:
                          selectedArea.id === "Operaciones"
                            ? "#3b82f6"
                            : selectedArea.id === "Lavado"
                              ? "#06b6d4"
                              : selectedArea.id === "Mantenimiento"
                                ? "#f59e0b"
                                : selectedArea.id === "Remanofactura"
                                  ? "#10b981"
                                  : selectedArea.id === "ServiciosGenerales"
                                    ? "#8b5cf6"
                                    : selectedArea.id === "Vigilantes"
                                      ? "#ef4444"
                                      : "#10b981",
                      }}
                      onClick={() =>
                        type.disabled
                          ? toast.info("Esta funcionalidad aún no está disponible", {
                              position: "top-center",
                              autoClose: 3000,
                            })
                          : handleScheduleTypeSelect(type.id)
                      }
                      whileHover={{
                        scale: type.disabled ? 1.0 : 1.02,
                        backgroundColor:
                          selectedArea.id === "Operaciones"
                            ? "rgba(59, 130, 246, 0.05)"
                            : selectedArea.id === "Lavado"
                              ? "rgba(6, 182, 212, 0.05)"
                              : selectedArea.id === "Mantenimiento"
                                ? "rgba(245, 158, 11, 0.05)"
                                : selectedArea.id === "Remanofactura"
                                  ? "rgba(16, 185, 129, 0.05)"
                                  : selectedArea.id === "ServiciosGenerales"
                                    ? "rgba(139, 92, 246, 0.05)"
                                    : selectedArea.id === "Vigilantes"
                                      ? "rgba(239, 68, 68, 0.05)"
                                      : "rgba(16, 185, 129, 0.05)",
                      }}
                      whileTap={{ scale: type.disabled ? 1.0 : 0.98 }}
                    >
                      {/* Indicador de funcionalidad no disponible */}
                      {type.disabled && (
                        <div className="absolute inset-0 bg-gray-100 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-20">
                          <div className="bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium text-gray-600 border border-gray-200">
                            Funcionalidad no disponible
                          </div>
                        </div>
                      )}

                      {/* Resto del código existente */}
                      {/* Background decoration */}
                      <motion.div
                        className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-10"
                        style={{
                          background: `radial-gradient(circle, ${
                            selectedArea.id === "Operaciones"
                              ? "#3b82f6"
                              : selectedArea.id === "Lavado"
                                ? "#06b6d4"
                                : selectedArea.id === "Mantenimiento"
                                  ? "#f59e0b"
                                  : selectedArea.id === "Remanofactura"
                                    ? "#10b981"
                                    : selectedArea.id === "ServiciosGenerales"
                                      ? "#8b5cf6"
                                      : selectedArea.id === "Vigilantes"
                                        ? "#ef4444"
                                        : "#10b981"
                          } 0%, transparent 70%)`,
                        }}
                        initial={{ scale: 0.8 }}
                        whileHover={{ scale: type.disabled ? 0.8 : 1.2, opacity: type.disabled ? 0.1 : 0.2 }}
                      />

                      <div className="flex items-start space-x-4 relative z-10">
                        <div
                          className={`p-4 rounded-xl flex items-center justify-center`}
                          style={{
                            background: `linear-gradient(135deg, ${
                              selectedArea.id === "Operaciones"
                                ? "rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.25) 100%"
                                : selectedArea.id === "Lavado"
                                  ? "rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.25) 100%"
                                  : selectedArea.id === "Mantenimiento"
                                    ? "rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%"
                                    : selectedArea.id === "Remanofactura"
                                      ? "rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%"
                                      : selectedArea.id === "ServiciosGenerales"
                                        ? "rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.25) 100%"
                                        : selectedArea.id === "Vigilantes"
                                          ? "rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.25) 100%"
                                          : "rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%"
                            })`,
                          }}
                        >
                          {getIcon(
                            type.icon,
                            28,
                            `text-${
                              selectedArea.id === "Operaciones"
                                ? "blue"
                                : selectedArea.id === "Lavado"
                                  ? "cyan"
                                  : selectedArea.id === "Mantenimiento"
                                    ? "amber"
                                    : selectedArea.id === "Remanofactura"
                                      ? "emerald"
                                      : selectedArea.id === "ServiciosGenerales"
                                        ? "purple"
                                        : selectedArea.id === "Vigilantes"
                                          ? "red"
                                          : "green"
                            }-600`,
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">{type.name}</h3>
                          <p className="text-gray-600 text-sm">{type.description}</p>
                        </div>
                      </div>

                      {/* Arrow indicator */}
                      <motion.div
                        className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                        initial={{ x: -5, opacity: 0 }}
                        whileHover={{ x: 0, opacity: 1 }}
                      >
                        <div
                          className={`p-2 rounded-full bg-${
                            selectedArea.id === "Operaciones"
                              ? "blue"
                              : selectedArea.id === "Lavado"
                                ? "cyan"
                                : selectedArea.id === "Mantenimiento"
                                  ? "amber"
                                  : selectedArea.id === "Remanofactura"
                                    ? "emerald"
                                    : selectedArea.id === "ServiciosGenerales"
                                      ? "purple"
                                      : selectedArea.id === "Vigilantes"
                                        ? "red"
                                        : "green"
                          }-100`}
                        >
                          <ArrowRight
                            size={16}
                            className={`text-${
                              selectedArea.id === "Operaciones"
                                ? "blue"
                                : selectedArea.id === "Lavado"
                                  ? "cyan"
                                  : selectedArea.id === "Mantenimiento"
                                    ? "amber"
                                    : selectedArea.id === "Remanofactura"
                                      ? "emerald"
                                      : selectedArea.id === "ServiciosGenerales"
                                        ? "purple"
                                        : selectedArea.id === "Vigilantes"
                                          ? "red"
                                          : "green"
                            }-600`}
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Area selection grid */}
      <div className="relative max-w-6xl mx-auto px-4 z-10">
        <motion.div
          ref={gridRef}
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {areas.map((area, index) => (
            <motion.div
              key={area.id}
              variants={cardVariants}
              whileHover={{
                scale: 1.03,
                y: -5,
                transition: { type: "spring", stiffness: 400, damping: 10 },
              }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredArea(area.id)}
              onHoverEnd={() => setHoveredArea(null)}
              onClick={() => handleAreaClick(area)}
              className="relative overflow-hidden rounded-2xl group"
            >
              {/* Card background with gradient */}
              <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${hoveredArea === area.id ? area.hoverColor : area.color} transition-all duration-500`}
                animate={{
                  backgroundPosition: hoveredArea === area.id ? ["0% 0%", "100% 100%"] : "0% 0%",
                }}
                transition={{ duration: 3, ease: "easeInOut" }}
                style={{ backgroundSize: "200% 200%" }}
              />

              {/* Card content */}
              <div className="relative z-10 p-8 h-full flex flex-col">
                {/* Icon container */}
                <motion.div
                  className={`bg-white/40 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/30 overflow-hidden group-hover:bg-white/50 transition-all duration-300`}
                  whileHover={{ rotate: [0, -5, 5, -3, 3, 0], transition: { duration: 0.5 } }}
                >
                  {getIcon(area.icon, 30, "text-white drop-shadow-md")}

                  {/* Animated background for icon */}
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

                {/* Title and description */}
                <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-sm">{area.name}</h3>
                <p className="text-white/90 text-base mb-6 flex-grow leading-relaxed">{area.description}</p>

                {/* Action button */}
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

                {/* Decorative elements */}
                <motion.div
                  className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-white/10"
                  animate={{
                    scale: hoveredArea === area.id ? [1, 1.2, 1.1] : 1,
                    opacity: hoveredArea === area.id ? [0.1, 0.2, 0.15] : 0.1,
                  }}
                  transition={{ duration: 2, repeat: hoveredArea === area.id ? Number.POSITIVE_INFINITY : 0 }}
                />

                {/* Particle effect on hover */}
                <AnimatePresence>
                  {hoveredArea === area.id && (
                    <>
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={`particle-${index}-${i}`}
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
          ))}

          {/* Área de Infraestructura (siempre visible) */}
          <motion.div
            key="infraestructura"
            variants={cardVariants}
            whileHover={{
              scale: 1.03,
              y: -5,
              transition: { type: "spring", stiffness: 400, damping: 10 },
            }}
            whileTap={{ scale: 0.98 }}
            onHoverStart={() => setHoveredArea(infraArea.id)}
            onHoverEnd={() => setHoveredArea(null)}
            onClick={() => handleAreaClick(infraArea)}
            className="relative overflow-hidden rounded-2xl group"
          >
            {/* Card background with gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${hoveredArea === infraArea.id ? infraArea.hoverColor : infraArea.color} transition-all duration-500`}
              animate={{
                backgroundPosition: hoveredArea === infraArea.id ? ["0% 0%", "100% 100%"] : "0% 0%",
              }}
              transition={{ duration: 3, ease: "easeInOut" }}
              style={{ backgroundSize: "200% 200%" }}
            />

            {/* Card content */}
            <div className="relative z-10 p-8 h-full flex flex-col">
              {/* Icon container */}
              <motion.div
                className={`bg-white/40 backdrop-blur-sm w-16 h-16 rounded-2xl flex items-center justify-center mb-6 border border-white/30 overflow-hidden group-hover:bg-white/50 transition-all duration-300`}
                whileHover={{ rotate: [0, -5, 5, -3, 3, 0], transition: { duration: 0.5 } }}
              >
                {getIcon(infraArea.icon, 30, "text-white drop-shadow-md")}

                {/* Animated background for icon */}
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

              {/* Title and description */}
              <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-sm">{infraArea.name}</h3>
              <p className="text-white/90 text-base mb-6 flex-grow leading-relaxed">{infraArea.description}</p>

              {/* Action button */}
              <motion.div
                className="flex items-center justify-between mt-auto"
                initial={{ opacity: 0.7 }}
                animate={{ opacity: hoveredArea === infraArea.id ? 1 : 0.7 }}
              >
                <span className="text-white font-medium">Seleccionar</span>
                <motion.div
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm"
                  animate={{
                    x: hoveredArea === infraArea.id ? [0, 5, 0] : 0,
                  }}
                  transition={{
                    duration: 1,
                    repeat: hoveredArea === infraArea.id ? Number.POSITIVE_INFINITY : 0,
                    repeatDelay: 0.5,
                  }}
                >
                  <ArrowRight size={16} className="text-white" />
                </motion.div>
              </motion.div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-white/10"
                animate={{
                  scale: hoveredArea === infraArea.id ? [1, 1.2, 1.1] : 1,
                  opacity: hoveredArea === infraArea.id ? [0.1, 0.2, 0.15] : 0.1,
                }}
                transition={{ duration: 2, repeat: hoveredArea === infraArea.id ? Number.POSITIVE_INFINITY : 0 }}
              />

              {/* Particle effect on hover */}
              <AnimatePresence>
                {hoveredArea === infraArea.id && (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={`particle-infra-${i}`}
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
        </motion.div>

        {/* Footer */}
        <div className="text-center mt-16 mb-8 relative z-10">
          <div className="inline-block">
            <p className="text-green-700 font-medium">Sistema Alimentador Oriental 6</p>
            <motion.div
              className="h-0.5 bg-gradient-to-r from-green-500 to-green-300 mt-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>

        {/* Password Modal */}
        <PasswordModal
          isVisible={showPasswordModal}
          onClose={handleClosePasswordModal}
          onSubmit={handlePasswordSubmit}
          area={selectedArea}
          isAuthenticating={isAuthenticating}
          error={passwordError}
        />
      </div>
    </div>
  )
}

export default WelcomeScreen

