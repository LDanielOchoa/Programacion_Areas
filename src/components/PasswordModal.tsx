"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, Eye, EyeOff, X, AlertTriangle, ArrowRight, Activity, Droplets, Wrench, Recycle, Building2, Shield, HelpCircle, Info, CheckCircle } from 'lucide-react'
import { TermsDialog } from "./terms-and-conditions-dialog"
import ForgotPasswordModal from "./ForgotPasswordModal"

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
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const modalRef = useRef<HTMLDivElement>(null)

  // Initialize rememberMe state from props
  useEffect(() => {
    setRememberMe(rememberMe)
  }, [rememberMe])

  // Focus input when modal opens
  useEffect(() => {
    if (isVisible && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 300)
    }
  }, [isVisible])

  // Reset state when modal closes
  useEffect(() => {
    if (!isVisible) {
      setPassword("")
      setShowPassword(false)
      setPasswordFocused(false)
    }
  }, [isVisible])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.getModifierState("CapsLock")) {
        setCapsLockOn(true)
      } else {
        setCapsLockOn(false)
      }

      // Close on escape
      if (e.key === "Escape" && isVisible && !showTermsDialog && !showForgotPassword) {
        e.preventDefault()
        onClose()
      }

      if (e.key === "Enter" && password && isVisible && !isAuthenticating && !showTermsDialog && !showForgotPassword) {
        e.preventDefault()
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

    if (isVisible) {
      window.addEventListener("keydown", handleKeyDown)
      window.addEventListener("keyup", handleKeyUp)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [isVisible, onClose, onSubmit, password, isAuthenticating, showTermsDialog, showForgotPassword])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isVisible) {
      const originalStyle = window.getComputedStyle(document.body).overflow
      document.body.style.overflow = "hidden"
      return () => {
        document.body.style.overflow = originalStyle
      }
    }
  }, [isVisible])

  // Calculate password strength
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0)
      return
    }

    let strength = 0
    
    // Length check
    if (password.length >= 8) strength += 1
    
    // Character variety checks
    if (/[A-Z]/.test(password)) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[0-9]/.test(password)) strength += 1
    if (/[^A-Za-z0-9]/.test(password)) strength += 1
    
    setPasswordStrength(strength)
  }, [password])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (password && !isAuthenticating) {
      onSubmit(password)
    }
  }

  const getAreaGradient = () => {
    switch (area?.id) {
      case "Operaciones":
        return "from-blue-700 via-blue-600 to-blue-500"
      case "Lavado":
        return "from-cyan-700 via-cyan-600 to-cyan-500"
      case "Mantenimiento":
        return "from-amber-700 via-amber-600 to-amber-500"
      case "Remanofactura":
        return "from-emerald-700 via-emerald-600 to-emerald-500"
      case "ServiciosGenerales":
        return "from-purple-700 via-purple-600 to-purple-500"
      case "Vigilantes":
        return "from-red-700 via-red-600 to-red-500"
      default:
        return "from-green-700 via-green-600 to-green-500"
    }
  }

  const getAreaColor = () => {
    switch (area?.id) {
      case "Operaciones":
        return "bg-blue-600 hover:bg-blue-700"
      case "Lavado":
        return "bg-cyan-600 hover:bg-cyan-700"
      case "Mantenimiento":
        return "bg-amber-600 hover:bg-amber-700"
      case "Remanofactura":
        return "bg-emerald-600 hover:bg-emerald-700"
      case "ServiciosGenerales":
        return "bg-purple-600 hover:bg-purple-700"
      case "Vigilantes":
        return "bg-red-600 hover:bg-red-700"
      default:
        return "bg-green-600 hover:bg-green-700"
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
    e.stopPropagation()
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

  const handleBackdropClick = (e: React.MouseEvent) => {

    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.2 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.2 },
    },
  }

  const modalVariants = {
    hidden: {
      scale: 0.95,
      opacity: 0,
      y: 10,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 30,
        stiffness: 400,
        duration: 0.2,
      },
    },
    exit: {
      scale: 0.95,
      opacity: 0,
      y: 10,
      transition: {
        duration: 0.15,
      },
    },
  }

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              className="fixed inset-0 flex items-center justify-center p-4"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={backdropVariants}
              onClick={handleBackdropClick}
            >
              <motion.div 
                className="absolute inset-0 bg-black/70 backdrop-blur-md" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />

              <motion.div
                ref={modalRef}
                className="w-full max-w-md overflow-hidden rounded-2xl relative z-10 bg-white shadow-2xl"
                variants={modalVariants}
                onClick={(e) => e.stopPropagation()}
              >
                <div className={`bg-gradient-to-r ${getAreaGradient()} p-6 sm:p-8 relative`}>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      onClose()
                    }}
                    className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
                    aria-label="Cerrar"
                  >
                    <X size={20} />
                  </button>

                  <motion.div 
                    className="flex items-center"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div 
                      className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm border border-white/30"
                    >
                      {getAreaIcon(area?.icon || "", 32, "text-white")}
                    </div>

                    <div className="text-white">
                      <h3 className="text-2xl font-bold" id="modal-title">
                        {area?.name}
                      </h3>
                      <p className="text-white/80">{area?.description}</p>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                  >
                    <div className="flex items-center text-white">
                      <Lock size={18} className="mr-2" />
                      <span>Área protegida - Ingrese su contraseña</span>
                    </div>
                  </motion.div>
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
                          onFocus={() => setPasswordFocused(true)}
                          onBlur={() => setPasswordFocused(false)}
                          className={`w-full pl-12 pr-12 py-4 border ${
                            error ? "border-red-300 bg-red-50" : "border-gray-200 bg-gray-50"
                          } rounded-xl focus:outline-none focus:ring-2 ${getAreaRingColor()} transition-all duration-300 text-lg`}
                          placeholder="••••••••••••"
                          autoComplete="current-password"
                        />

                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowPassword(!showPassword)
                          }}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-2"
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {capsLockOn && (
                          <motion.div 
                            className="mt-3 flex items-center text-amber-600 text-sm bg-amber-50 p-2 rounded-lg"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                          >
                            <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                            <span>Bloq Mayús está activado</span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <AnimatePresence>
                        {error && (
                          <motion.div 
                            className="mt-3 flex items-center text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100"
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                          >
                            <AlertTriangle size={16} className="mr-2 flex-shrink-0" />
                            <span>{error}</span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.div 
                      className="mb-6 flex items-center justify-between"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="remember-me"
                          checked={rememberMeState}
                          onChange={handleRememberMeChange}
                          className={`h-5 w-5 rounded border-gray-300 text-${area?.color || "green"}-600 focus:ring-${area?.color || "green"}-500`}
                        />
                        <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                          Recordar mi acceso
                        </label>
                        
                        {/* Info button for terms */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setShowTermsDialog(true)
                          }}
                          className="ml-1 text-gray-400 hover:text-gray-600"
                        >
                          <Info size={16} />
                        </button>
                      </div>
                      
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setShowForgotPassword(true)
                        }}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <HelpCircle size={16} className="mr-1" />
                        ¿Olvidó su contraseña?
                      </button>
                    </motion.div>

                    {/* Terms acceptance indicator */}
                    <AnimatePresence>
                      {hasAcceptedTerms && (
                        <motion.div 
                          className="mb-4 flex items-center text-green-600 text-sm bg-green-50 p-2 rounded-lg"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <CheckCircle size={16} className="mr-2 flex-shrink-0" />
                          <span>Ha aceptado los términos y condiciones para recordar su acceso</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div 
                      className="flex justify-end"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.25 }}
                    >
                      <button
                        type="submit"
                        disabled={isAuthenticating || !password}
                        className={`w-full px-6 py-3 ${getAreaColor()} text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg`}
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
                    </motion.div>
                  </form>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ForgotPasswordModal
        isVisible={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        area={area?.name || ""}
      />

      <TermsDialog
        isVisible={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        onAccept={handleAcceptTerms}
        onDecline={handleDeclineTerms}
      />
    </>
  )
}

export default PasswordModal
