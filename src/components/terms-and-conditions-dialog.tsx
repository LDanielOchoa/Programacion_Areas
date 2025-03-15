"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Lock, FileText, Info, AlertTriangle, MessageSquare, Shield, X, Check, ChevronDown } from 'lucide-react'

interface TermsDialogProps {
  isVisible: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
}

// Replace the cn utility with a direct implementation
function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ")
}

export function TermsDialog({ isVisible, onClose, onAccept, onDecline }: TermsDialogProps) {
  const [activeSection, setActiveSection] = useState("security")
  const [hasRead, setHasRead] = useState(false)
  const [mounted, setMounted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Reset state when dialog is opened
  useEffect(() => {
    if (isVisible) {
      setHasRead(false)
      // Reset scroll position when dialog opens
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }
      setActiveSection("security")
    }
  }, [isVisible])

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isVisible) {
        e.preventDefault()
        onClose()
      }
    }

    if (isVisible) {
      window.addEventListener("keydown", handleKeyDown)
    }
    
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isVisible, onClose])

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

  const sections = [
    {
      id: "security",
      title: "Seguridad de la Cuenta",
      icon: Lock,
      content: `Al activar la función "Recordar mi acceso", usted reconoce y acepta que está permitiendo que este dispositivo mantenga una sesión persistente para acceder a su cuenta sin necesidad de ingresar sus credenciales en cada visita. Esta funcionalidad está diseñada para mejorar su experiencia de usuario, pero conlleva ciertos riesgos de seguridad que debe comprender.

Entendemos que la comodidad es importante, pero también lo es la seguridad. Al utilizar esta función, usted reconoce que cualquier persona con acceso físico a este dispositivo podría potencialmente acceder a su cuenta sin necesidad de conocer su contraseña.`,
    },
    {
      id: "liability",
      title: "Limitación de Responsabilidad",
      icon: FileText,
      content: `Al activar la función "Recordar mi acceso", usted acepta expresamente que la empresa no será responsable por ningún daño directo, indirecto, incidental, especial o consecuente que pueda surgir del uso o la imposibilidad de uso de esta función.

La empresa no se hace responsable por accesos no autorizados a su cuenta que resulten de la activación de esta función. Es su responsabilidad mantener la seguridad física de los dispositivos donde ha decidido permanecer conectado.`,
    },
    {
      id: "storage",
      title: "Almacenamiento de Datos",
      icon: Info,
      content: `Para proporcionar la funcionalidad "Recordar mi acceso", necesitamos almacenar un token de autenticación en su dispositivo. Este token se almacena localmente en su navegador utilizando el mecanismo de almacenamiento local (localStorage).

Este token no contiene su contraseña real, sino una cadena cifrada que permite la autenticación automática. El token permanecerá almacenado indefinidamente hasta que usted cierre sesión explícitamente, borre los datos de navegación o desactive esta función.`,
    },
    {
      id: "recommendations",
      title: "Recomendaciones",
      icon: Shield,
      content: `Para minimizar los riesgos asociados con la función "Recordar mi acceso", le recomendamos seguir estas prácticas de seguridad básicas:

1. Active esta función únicamente en dispositivos personales y de confianza.
2. Asegúrese de que su dispositivo esté protegido con una contraseña, PIN o biometría.
3. Mantenga su sistema operativo y navegador actualizados con los últimos parches.
4. Cierre sesión explícitamente cuando utilice dispositivos compartidos o públicos.`,
    },
    {
      id: "contact",
      title: "Contacto",
      icon: MessageSquare,
      content: `Si tiene alguna inconformidad con respecto a estos términos y condiciones, por favor comuníquese con el Área de Mejora Continua:

Email: mejora.continua@ejemplo.com
Teléfono: (55) 1234-5678`,
    },
  ]

  // Handle scroll to mark as read and update active section
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget

    // Mark as read when scrolled to bottom
    if (scrollHeight - scrollTop - clientHeight < 50) {
      setHasRead(true)
    }

    // Update active section based on scroll position
    const container = e.currentTarget
    const sectionElements = container.querySelectorAll("[data-section]")

    sectionElements.forEach((section) => {
      const rect = section.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      if (rect.top <= containerRect.top + 100 && rect.bottom >= containerRect.top) {
        const sectionId = section.getAttribute("data-section")
        if (sectionId) {
          setActiveSection(sectionId)
        }
      }
    })
  }

  // Scroll to section when tab is clicked
  const scrollToSection = (sectionId: string) => {
    const sectionElement = document.querySelector(`[data-section="${sectionId}"]`)
    if (sectionElement && contentRef.current) {
      contentRef.current.scrollTo({
        top: (sectionElement as HTMLElement).offsetTop - 20,
        behavior: "smooth",
      })
    }
  }

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    // Only close if clicking directly on the backdrop, not on the dialog
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  }

  const dialogVariants = {
    hidden: { scale: 0.95, opacity: 0, y: 10 },
    visible: { 
      scale: 1, 
      opacity: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        damping: 30, 
        stiffness: 400,
        duration: 0.2
      } 
    },
    exit: { 
      scale: 0.95, 
      opacity: 0, 
      y: 10, 
      transition: { 
        duration: 0.15 
      } 
    },
  }

  const sectionVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: (i: number) => ({ 
      opacity: 1, 
      y: 0, 
      transition: { 
        delay: 0.05 + i * 0.05,
        duration: 0.2 
      } 
    }),
  }

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[60] overflow-hidden">
          <motion.div
            className="fixed inset-0 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={backdropVariants}
            onClick={handleBackdropClick}
          >
            <motion.div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              ref={dialogRef}
              className="relative w-full max-w-2xl overflow-hidden bg-white rounded-xl shadow-2xl"
              variants={dialogVariants}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <motion.div 
                className="relative bg-gradient-to-r from-green-700 to-green-600 p-6"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onClose()
                  }} 
                  className="absolute right-4 top-4 text-white/80 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                  aria-label="Cerrar"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Términos y Condiciones</h2>
                    <p className="text-white/80 text-base">Por favor lea antes de continuar</p>
                  </div>
                </div>

                {/* Navigation Pills */}
                <div className="flex flex-wrap gap-2 mt-5 overflow-x-auto pb-1 hide-scrollbar">
                  {sections.map((section, index) => {
                    const Icon = section.icon
                    return (
                      <motion.button
                        key={section.id}
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          scrollToSection(section.id)
                        }}
                        className={classNames(
                          "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
                          activeSection === section.id
                            ? "bg-white text-green-700"
                            : "bg-white/20 text-white hover:bg-white/30",
                        )}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + index * 0.03 }}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{section.title}</span>
                      </motion.button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Warning Banner */}
              <motion.div 
                className="bg-amber-50 border-y border-amber-200 px-6 py-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 }}
              >
                <div className="flex gap-3">
                  <AlertTriangle className="h-6 w-6 text-amber-600 flex-shrink-0" />
                  <p className="text-amber-800 font-medium">
                    Al activar la función "Recordar mi acceso", usted acepta los siguientes términos y condiciones
                    relacionados con la seguridad de su cuenta y la privacidad de sus datos.
                  </p>
                </div>
              </motion.div>

              {/* Scroll indicator */}
              <AnimatePresence>
                {!hasRead && (
                  <motion.div 
                    className="absolute bottom-24 left-1/2 transform -translate-x-1/2 text-green-600 z-10 bg-white/80 backdrop-blur-sm rounded-full p-2 shadow-lg"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "reverse", 
                      duration: 1.5 
                    }}
                  >
                    <ChevronDown className="h-6 w-6" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Content - All sections visible and scrollable */}
              <div
                ref={contentRef}
                className="max-h-[400px] overflow-y-auto p-6 scroll-smooth"
                onScroll={handleScroll}
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#10b981 #f3f4f6",
                }}
              >
                {sections.map((section, index) => (
                  <motion.div 
                    key={section.id} 
                    data-section={section.id} 
                    className="mb-8 last:mb-0 scroll-mt-4"
                    custom={index}
                    variants={sectionVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div
                        className={classNames(
                          "rounded-full p-3",
                          activeSection === section.id ? "bg-green-600 text-white" : "bg-green-100 text-green-600",
                        )}
                      >
                        <section.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                    </div>
                    <div className="pl-16">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line text-base">{section.content}</p>
                    </div>
                  </motion.div>
                ))}
                
                <motion.div 
                  className="mt-8 p-4 border-2 border-green-100 rounded-lg bg-green-50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-green-800 text-sm">
                      Para continuar con la función "Recordar mi acceso", debe leer y aceptar estos términos y condiciones. 
                      Desplácese hasta el final para habilitar el botón de aceptar.
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Footer */}
              <motion.div 
                className="border-t border-gray-200 bg-gray-50 p-5 flex gap-3 justify-end"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onDecline()
                  }}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
                >
                  Rechazar
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    if (hasRead) onAccept()
                  }}
                  disabled={!hasRead}
                  className={classNames(
                    "px-5 py-2.5 text-sm font-medium rounded-lg flex items-center gap-2 shadow-sm",
                    hasRead 
                      ? "bg-green-600 text-white hover:bg-green-700" 
                      : "bg-gray-200 text-gray-500 cursor-not-allowed",
                  )}
                >
                  {hasRead && <Check className="h-4 w-4" />}
                  {hasRead ? "Aceptar Términos" : "Lea para continuar"}
                </button>
              </motion.div>
              
              {/* Reading progress indicator */}
              <motion.div 
                className="absolute bottom-0 left-0 h-1 bg-green-500"
                initial={{ width: "0%" }}
                animate={{ width: hasRead ? "100%" : "0%" }}
                transition={{ duration: 0.5 }}
              />
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
