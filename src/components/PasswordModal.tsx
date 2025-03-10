"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Lock,
  Eye,
  EyeOff,
  X,
  AlertTriangle,
  ArrowRight,
  Activity,
  Droplets,
  Wrench,
  Recycle,
  Building2,
  Shield,
} from "lucide-react"

interface PasswordModalProps {
  isVisible: boolean
  onClose: () => void
  onSubmit: (password: string) => void
  area: {
    id: string
    name: string
    icon: string
    description: string
    color: string
  } | null
  isAuthenticating: boolean
  error: string
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  area,
  isAuthenticating,
  error,
}) => {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when modal opens
  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isVisible])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.getModifierState("CapsLock")) {
        setCapsLockOn(true)
      } else {
        setCapsLockOn(false)
      }

      // Close on escape
      if (e.key === "Escape" && isVisible) {
        onClose()
      }

      // Submit on enter if password is not empty
      if (e.key === "Enter" && password && isVisible && !isAuthenticating) {
        onSubmit(password)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.getModifierState("CapsLock")) {
        setCapsLockOn(true)
      } else {
        setCapsLockOn(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isVisible, onClose, onSubmit, password, isAuthenticating])

  useEffect(() => {
    // Disable body scrolling when modal is visible
    if (isVisible) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [isVisible])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password && !isAuthenticating) {
      setIsAnimating(true)
      onSubmit(password)
    }
  }

  if (!isVisible || !area) return null

  const getAreaGradient = () => {
    switch (area.id) {
      case "Operaciones":
        return "from-blue-600 via-blue-500 to-blue-400"
      case "Lavado":
        return "from-cyan-600 via-cyan-500 to-cyan-400"
      case "Mantenimiento":
        return "from-amber-600 via-amber-500 to-amber-400"
      case "Remanofactura":
        return "from-emerald-600 via-emerald-500 to-emerald-400"
      case "ServiciosGenerales":
        return "from-purple-600 via-purple-500 to-purple-400"
      case "Vigilantes":
        return "from-red-600 via-red-500 to-red-400"
      default:
        return "from-green-600 via-green-500 to-green-400"
    }
  }

  const getAreaColor = () => {
    switch (area.id) {
      case "Operaciones":
        return "bg-blue-600 hover:bg-blue-500"
      case "Lavado":
        return "bg-cyan-600 hover:bg-cyan-500"
      case "Mantenimiento":
        return "bg-amber-600 hover:bg-amber-500"
      case "Remanofactura":
        return "bg-emerald-600 hover:bg-emerald-500"
      case "ServiciosGenerales":
        return "bg-purple-600 hover:bg-purple-500"
      case "Vigilantes":
        return "bg-red-600 hover:bg-red-500"
      default:
        return "bg-green-600 hover:bg-green-500"
    }
  }

  const getAreaRingColor = () => {
    switch (area.id) {
      case "Operaciones":
        return "focus:ring-blue-500"
      case "Lavado":
        return "focus:ring-cyan-500"
      case "Mantenimiento":
        return "focus:ring-amber-500"
      case "Remanofactura":
        return "focus:ring-emerald-500"
      case "ServiciosGenerales":
        return "focus:ring-purple-500"
      case "Vigilantes":
        return "focus:ring-red-500"
      default:
        return "focus:ring-green-500"
    }
  }

  const getAreaIcon = (iconName: string, size = 24, className = "") => {
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

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3, delay: 0.1 },
    },
  }

  const modalVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 20,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.3,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  }

  const iconContainerVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 300,
        delay: 0.2,
      },
    },
  }

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
        >
          {/* Full screen backdrop with blur effect */}
          <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

          <motion.div
            className="w-full max-w-md overflow-hidden rounded-2xl relative z-10"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden">
              <motion.div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-20 blur-xl"
                style={{ background: `linear-gradient(to right, ${getAreaGradient()})` }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-20 blur-xl"
                style={{ background: `linear-gradient(to right, ${getAreaGradient()})` }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, delay: 4 }}
              />
            </div>

            {/* Header section */}
            <div className={`bg-gradient-to-r ${getAreaGradient()} p-8 relative`}>
              <motion.button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>

              <div className="flex items-center">
                <motion.div
                  className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm border border-white/30 overflow-hidden"
                  variants={iconContainerVariants}
                  animate={pulseAnimation}
                >
                  {getAreaIcon(area.icon, 32, "text-white")}

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

                <div className="text-white">
                  <motion.h3
                    className="text-2xl font-bold"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    {area.name}
                  </motion.h3>
                  <motion.p
                    className="text-white/80"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {area.description}
                  </motion.p>
                </div>
              </div>

              <motion.div
                className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center text-white">
                  <Lock size={18} className="mr-2" />
                  <span>Área protegida - Ingrese su contraseña</span>
                </div>
              </motion.div>

              {/* Decorative particles */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute w-1 h-1 rounded-full bg-white/60"
                  initial={{
                    x: Math.random() * 300,
                    y: Math.random() * 200,
                    opacity: 0,
                  }}
                  animate={{
                    y: [null, Math.random() * 200, null],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: 2 + Math.random() * 3,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: i * 0.8,
                  }}
                />
              ))}
            </div>

            {/* Form section */}
            <div className="bg-white p-8 relative">
              <form onSubmit={handleSubmit}>
                <motion.div
                  className="mb-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="relative">
                    <motion.div
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      animate={{ y: [-1, 1, -1] }}
                      transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                    >
                      <Lock size={18} />
                    </motion.div>

                    <input
                      ref={inputRef}
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`w-full pl-12 pr-12 py-4 border ${error ? "border-red-300" : "border-gray-200"} rounded-xl focus:outline-none focus:ring-2 ${getAreaRingColor()} transition-all duration-300 text-lg bg-gray-50`}
                      placeholder="••••••••••••"
                      autoComplete="off"
                    />

                    <motion.button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {capsLockOn && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mt-2 flex items-center text-amber-600 text-sm"
                      >
                        <AlertTriangle size={16} className="mr-1" />
                        <span>Bloq Mayús está activado</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="mt-2 flex items-center text-red-600 text-sm"
                      >
                        <AlertTriangle size={16} className="mr-1" />
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                <motion.div
                  className="flex justify-end"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  <motion.button
                    type="submit"
                    disabled={isAuthenticating || !password}
                    className={`px-6 py-3 ${getAreaColor()} text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                    variants={buttonVariants}
                    initial="idle"
                    whileHover="hover"
                    whileTap="tap"
                  >
                    {isAuthenticating ? (
                      <>
                        <motion.svg
                          className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </motion.svg>
                        Verificando...
                      </>
                    ) : (
                      <>
                        Acceder
                        <motion.div
                          animate={{
                            x: [0, 5, 0],
                          }}
                          transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.5 }}
                          className="ml-2"
                        >
                          <ArrowRight size={18} />
                        </motion.div>
                      </>
                    )}
                  </motion.button>
                </motion.div>
              </form>

              {/* Decorative elements */}
              <motion.div
                className="absolute bottom-0 right-0 w-32 h-32 opacity-5"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.05, scale: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                {getAreaIcon(area.icon, 128)}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default PasswordModal

