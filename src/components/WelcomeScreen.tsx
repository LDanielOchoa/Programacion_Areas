"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { AreaOption, ScheduleType } from "../types"
import {
  Activity,
  Droplets,
  Wrench,
  Recycle,
  Building2,
  Shield,
  FileSpreadsheet,
  FileWarning,
  Construction,
} from "lucide-react"
import { toast } from "react-toastify"
import PasswordModal from "./PasswordModal"
import { BackgroundElements } from "./BackgroundElements"
import { WelcomePopup } from "./WelcomePopup"
import { ScheduleTypeModal } from "./ScheduleTypeModal"
import { AreaCard } from "./AreaCard"

interface WelcomeScreenProps {
  onSelectArea: (area: string, type: ScheduleType) => void
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectArea }) => {
  // Estados principales
  const [selectedArea, setSelectedArea] = useState<AreaOption | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [hoveredArea, setHoveredArea] = useState<string | null>(null)
  const [showWelcomePopup, setShowWelcomePopup] = useState(true)
  const [showScheduleTypeModal, setShowScheduleTypeModal] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const gridRef = useRef<HTMLDivElement>(null)
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

  const scheduleTypes = useMemo(
    () => [
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
        disabled: true,
      },
    ],
    [],
  )

  const areas = useMemo<AreaOption[]>(
    () => [
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
      {
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
      },
    ],
    [],
  )

  const getIcon = useCallback((iconName: string, size = 24, className = "") => {
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
  }, [])

  const saveAuthToken = useCallback(
    (area: AreaOption) => {
      if (rememberMe) {
        localStorage.setItem(`auth_token_${area.id}`, `secure_token_for_${area.id}`)
      }
    },
    [rememberMe],
  )

  const handleAreaClick = useCallback((area: AreaOption) => {
    setSelectedArea(area)
    setIsAuthenticating(true)

    const storedToken = localStorage.getItem(`auth_token_${area.id}`)

    if (storedToken) {
      setTimeout(() => {
        setIsAuthenticating(false)
        setShowScheduleTypeModal(true)
      }, 800) 
    } else {
      setIsAuthenticating(false)
      setShowPasswordModal(true)
      setPasswordError("")
    }
  }, [])

  const handlePasswordSubmit = useCallback(
    (password: string) => {
      if (!selectedArea) return

      setIsAuthenticating(true)

      setTimeout(() => {
        if (password === selectedArea.password) {
          if (rememberMe) {
            saveAuthToken(selectedArea)
          }

          setShowPasswordModal(false)
          setShowScheduleTypeModal(true)
          toast.success(`¡Acceso concedido al área de ${selectedArea.name}!`, {
            position: "top-center",
            autoClose: 2000,
          })
        } else {
          setPasswordError("Contraseña incorrecta. Por favor, inténtelo de nuevo.")
          toast.error("Contraseña incorrecta", {
            position: "top-center",
            autoClose: 2000,
          })
        }
        setIsAuthenticating(false)
      }, 600)
    },
    [selectedArea, rememberMe, saveAuthToken],
  )

  const handleScheduleTypeSelect = useCallback(
    (type: ScheduleType) => {
      if (!selectedArea) return
      const scheduleType = scheduleTypes.find((t) => t.id === type)
      if (scheduleType?.disabled) {
        toast.info("Esta funcionalidad estará disponible próximamente", {
          position: "top-center",
          autoClose: 2000,
        })
        return
      }

      setShowScheduleTypeModal(false)

      setTimeout(() => {
        onSelectArea(selectedArea.id, type)
      }, 300)
    },
    [selectedArea, scheduleTypes, onSelectArea],
  )

  const handleClosePasswordModal = useCallback(() => {
    setShowPasswordModal(false)
    setSelectedArea(null)
    setPasswordError("")
  }, [])

  const handleCloseScheduleTypeModal = useCallback(() => {
    setShowScheduleTypeModal(false)
    setSelectedArea(null)
  }, [])

  const handleRememberMeChange = useCallback((value: boolean) => {
    setRememberMe(value)
  }, [])

  const gridVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.1,
      },
    },
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Elementos de fondo animados (optimizados) */}
      <BackgroundElements windowSize={windowSize} />

      {/* Popup de bienvenida */}
      <AnimatePresence>
        {showWelcomePopup && <WelcomePopup onClose={() => setShowWelcomePopup(false)} />}
      </AnimatePresence>

      {/* Modal de tipo de programación */}
      <AnimatePresence>
        {showScheduleTypeModal && selectedArea && (
          <ScheduleTypeModal
            selectedArea={selectedArea}
            scheduleTypes={scheduleTypes}
            onClose={handleCloseScheduleTypeModal}
            onSelect={handleScheduleTypeSelect}
            getIcon={getIcon}
          />
        )}
      </AnimatePresence>

      {/* Grid de selección de áreas */}
      <div className="relative max-w-6xl mx-auto px-4 z-10">
        <motion.div
          ref={gridRef}
          variants={gridVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {areas.map((area) => (
            <AreaCard
              key={area.id}
              area={area}
              hoveredArea={hoveredArea}
              setHoveredArea={setHoveredArea}
              onClick={() => handleAreaClick(area)}
              getIcon={getIcon}
            />
          ))}
        </motion.div>

        {/* Pie de página */}
        <div className="text-center mt-16 mb-8 relative z-10">
          <div className="inline-block">
            <p className="text-green-700 font-medium">Sistema Alimentador Oriental 6</p>
            <motion.div
              className="h-0.5 bg-gradient-to-r from-green-500 to-green-300 mt-1 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />
          </div>
        </div>

        {/* Modal de contraseña */}
        <PasswordModal
          isVisible={showPasswordModal}
          onClose={handleClosePasswordModal}
          onSubmit={handlePasswordSubmit}
          area={selectedArea}
          isAuthenticating={isAuthenticating}
          error={passwordError}
          rememberMe={rememberMe}
          onRememberMeChange={handleRememberMeChange}
        />
      </div>

      {/* Overlay de carga cuando se está autenticando pero no se muestra el modal */}
      <AnimatePresence>
        {isAuthenticating && !showPasswordModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="bg-white rounded-xl p-6 flex flex-col items-center">
              <svg
                className="animate-spin h-10 w-10 text-green-600 mb-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <p className="text-gray-700 font-medium">Verificando acceso...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default WelcomeScreen

