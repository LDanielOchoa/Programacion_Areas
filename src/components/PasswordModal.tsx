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
import TermsAndConditionsDialog from "./terms-and-conditions-dialog"

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
  rememberMe?: boolean
  onRememberMeChange?: (value: boolean) => void
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  area,
  isAuthenticating,
  error,
  rememberMe = false,
  onRememberMeChange = () => {},
}) => {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [capsLockOn, setCapsLockOn] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const [rememberMeState, setRememberMe] = useState(false)
  const [showTermsDialog, setShowTermsDialog] = useState(false)
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(false)

  useEffect(() => {
    setRememberMe(rememberMe)
  }, [rememberMe])

  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) {
      setPassword("")
      setShowPassword(false)
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
      onSubmit(password)
    }
  }

  const getAreaGradient = () => {
    switch (area?.id) {
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
    switch (area?.id) {
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
    switch (area?.id) {
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

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.checked

    if (newValue && !hasAcceptedTerms) {
    
      setShowTermsDialog(true)
    } else {
      setRememberMe(newValue)
      onRememberMeChange(newValue)
    }
  }

  const handleAcceptTerms = () => {
    setHasAcceptedTerms(true)
    setShowTermsDialog(false)
    setRememberMe(true)
    onRememberMeChange(true)
  }

  const handleDeclineTerms = () => {
    setShowTermsDialog(false)
    setRememberMe(false)
    onRememberMeChange(false)
  }

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

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose} />

            <motion.div
              className="w-full max-w-md overflow-hidden rounded-2xl relative z-10 bg-white"
              variants={modalVariants}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`bg-gradient-to-r ${getAreaGradient()} p-6 sm:p-8 relative`}>
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
                  aria-label="Cerrar"
                >
                  <X size={20} />
                </button>

                <div className="flex items-center">
                  <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm border border-white/30">
                    {getAreaIcon(area?.icon || "", 32, "text-white")}
                  </div>

                  <div className="text-white">
                    <h3 className="text-2xl font-bold" id="modal-title">
                      {area?.name}
                    </h3>
                    <p className="text-white/80">{area?.description}</p>
                  </div>
                </div>

                <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center text-white">
                    <Lock size={18} className="mr-2" />
                    <span>Área protegida - Ingrese su contraseña</span>
                  </div>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock size={18} />
                      </div>

                      <input
                        ref={inputRef}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full pl-12 pr-12 py-4 border ${
                          error ? "border-red-300" : "border-gray-200"
                        } rounded-xl focus:outline-none focus:ring-2 ${getAreaRingColor()} transition-all duration-300 text-lg bg-gray-50`}
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
                        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>

                    {capsLockOn && (
                      <div className="mt-2 flex items-center text-amber-600 text-sm">
                        <AlertTriangle size={16} className="mr-1" />
                        <span>Bloq Mayús está activado</span>
                      </div>
                    )}

                    {error && (
                      <div className="mt-2 flex items-center text-red-600 text-sm">
                        <AlertTriangle size={16} className="mr-1" />
                        <span>{error}</span>
                      </div>
                    )}
                  </div>
                  <div className="mb-4 flex items-center">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMeState}
                      onChange={handleRememberMeChange}
                      className={`h-4 w-4 rounded border-gray-300 text-${area?.color || "green"}-600 focus:ring-${area?.color || "green"}-500`}
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Recordar mi acceso permanentemente
                    </label>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isAuthenticating || !password}
                      className={`w-full px-6 py-3 ${getAreaColor()} text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                    >
                      {isAuthenticating ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
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
                          </svg>
                          Verificando...
                        </>
                      ) : (
                        <>
                          Acceder
                          <ArrowRight size={18} className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Diálogo de términos y condiciones */}
      <TermsAndConditionsDialog
        isVisible={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </>
  )
}

export default PasswordModal

