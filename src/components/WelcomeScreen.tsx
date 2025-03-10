"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { AreaOption } from "../types"
import { Activity, Droplets, Wrench, Recycle, Building2, Shield, Leaf, ArrowRight, X } from "lucide-react"
import { toast } from "react-toastify"
import PasswordModal from "./PasswordModal"

interface WelcomeScreenProps {
  onSelectArea: (area: string) => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectArea }) => {
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [showWelcomePopup, setShowWelcomePopup] = useState(true)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 1200,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
  })

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
      password: "Operaciones123!",
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
      password: "Lavado123!",
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
      password: "Mantenimiento123!",
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
      password: "Remanofactura123!",
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
      password: "ServiciosGenerales123!",
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
      password: "Vigilantes123!",
    },
  ]

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
        setShowConfetti(true)
        toast.success(`¡Acceso concedido al área de ${selectedArea.name}!`, {
          position: "top-center",
          autoClose: 3000,
        })

        // Wait for confetti and toast before proceeding
        setTimeout(() => {
          onSelectArea(selectedArea.id)
          setShowConfetti(false)
        }, 2000)
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

  const handleClosePasswordModal = () => {
    setShowPasswordModal(false)
    setSelectedArea(null)
    setPasswordError("")
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

      {/* Area selection grid */}
      <motion.div
        variants={gridVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto px-4 relative z-10"
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
  )
}

export default WelcomeScreen

