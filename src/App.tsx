"use client"

import { useState, useEffect } from "react"
import { Leaf, Loader2, AlertTriangle } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { ToastContainer } from "react-toastify"
import { parseExcelFile } from "./utils/excelParser"
import WelcomeScreen from "./components/WelcomeScreen"
import FileUploader from "./components/FileUploader"
import DataTable from "./components/DataTable"
import NovedadesTable from "./components/NovedadesTable"
import StatsCard from "./components/StatsCard"
import type { ExcelData, AreaType, ScheduleType } from "./types"
import "react-toastify/dist/ReactToastify.css"

const App = () => {
  const [step, setStep] = useState<"welcome" | "upload" | "results">("welcome")
  const [selectedArea, setSelectedArea] = useState<AreaType | null>(null)
  const [scheduleType, setScheduleType] = useState<ScheduleType | null>(null)
  const [excelData, setExcelData] = useState<ExcelData | null>(null)
  const [fileName, setFileName] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [theme, setTheme] = useState("blue")

  // Set theme based on selected area
  useEffect(() => {
    if (selectedArea) {
      switch (selectedArea) {
        case "Operaciones":
          setTheme("blue")
          break
        case "Lavado":
          setTheme("cyan")
          break
        case "Mantenimiento":
          setTheme("amber")
          break
        case "Remanofactura":
          setTheme("emerald")
          break
        case "ServiciosGenerales":
          setTheme("purple")
          break
        case "Vigilantes":
          setTheme("red")
          break
        case "Infraestructura":
          setTheme("teal")
          break
        default:
          setTheme("green")
      }
    }
  }, [selectedArea])

  const handleFileUpload = async (file: File, type: ScheduleType) => {
    setLoading(true)
    setError(null)

    try {
      const data = await parseExcelFile(file, type)
      setExcelData(data)
      setFileName(file.name)
      setStep("results")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el archivo")
    } finally {
      setLoading(false)
    }
  }

  const handleSelectArea = (area: string, type: ScheduleType) => {
    setSelectedArea(area as AreaType)
    setScheduleType(type)
    setStep("upload")
  }

  const handleBackToWelcome = () => {
    setStep("welcome")
    setSelectedArea(null)
    setScheduleType(null)
    setExcelData(null)
  }

  const handleBackToUpload = () => {
    setStep("upload")
    setExcelData(null)
  }

  // Get theme-specific gradient
  const getThemeGradient = () => {
    switch (theme) {
      case "blue":
        return "from-blue-800 via-blue-600 to-blue-400"
      case "cyan":
        return "from-cyan-800 via-cyan-600 to-cyan-400"
      case "amber":
        return "from-amber-800 via-amber-600 to-amber-400"
      case "emerald":
        return "from-emerald-800 via-emerald-600 to-emerald-400"
      case "purple":
        return "from-purple-800 via-purple-600 to-purple-400"
      case "red":
        return "from-red-800 via-red-600 to-red-400"
      case "teal":
        return "from-teal-800 via-teal-600 to-teal-400"
      default:
        return "from-green-800 via-green-600 to-green-400"
    }
  }

  // Get theme color for text and elements
  const getThemeColor = () => {
    switch (theme) {
      case "blue":
        return "blue"
      case "cyan":
        return "cyan"
      case "amber":
        return "amber"
      case "emerald":
        return "emerald"
      case "purple":
        return "purple"
      case "red":
        return "red"
      case "teal":
        return "teal"
      default:
        return "green"
    }
  }

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 },
  }

  const pageTransition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
  }

  const leafVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
      },
    },
  }

  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.3,
        duration: 0.6,
      },
    },
  }

  const patternVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.1,
      transition: {
        duration: 1,
      },
    },
  }

  return (
    <div className={`min-h-screen bg-gradient-to-b from-${theme}-50 to-white flex flex-col`}>
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Enhanced Animated Header with Leaf Logo */}
      <header className={`relative overflow-hidden bg-gradient-to-r ${getThemeGradient()} py-8 text-white`}>
        {/* Animated background pattern */}
        <motion.div
          className="absolute inset-0 z-0 opacity-10"
          initial="hidden"
          animate="visible"
          variants={patternVariants}
        >
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </motion.div>

        {/* Animated light rays */}
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2 }}
        >
          <div className="absolute top-0 left-1/4 w-1/2 h-full bg-white/10 blur-3xl transform -rotate-45"></div>
          <div className="absolute top-0 right-1/4 w-1/2 h-full bg-white/10 blur-3xl transform rotate-45"></div>
        </motion.div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Animated Leaf Logo with glow effect */}
              <motion.div className="relative" initial="hidden" animate={["visible", "pulse"]} variants={leafVariants}>
                <motion.div
                  className="absolute inset-0 rounded-full bg-white/30 blur-md"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                />
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 relative z-10">
                  <Leaf className="h-8 w-8 text-white" />
                </div>
              </motion.div>

              <motion.div
                variants={titleVariants}
                initial="hidden"
                animate="visible"
                className="text-center md:text-left"
              >
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Sistema Alimentador Oriental 6</h1>
                <div className="flex items-center mt-1 text-white/90">
                  {selectedArea ? (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                      className="flex items-center"
                    >
                      <span className="text-sm md:text-base">Área:</span>
                      <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm md:text-base font-medium backdrop-blur-sm">
                        {selectedArea}
                      </span>
                      {scheduleType && (
                        <span className="ml-2 px-3 py-1 bg-white/20 rounded-full text-sm md:text-base font-medium backdrop-blur-sm">
                          {scheduleType === "formato" ? "Formato de Programación" : "Novedades"}
                        </span>
                      )}
                    </motion.div>
                  ) : (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="text-sm md:text-base italic"
                    >
                      Seleccione un área para comenzar
                    </motion.span>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Decorative wave at the bottom of the header */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-auto">
            <path
              fill="#ffffff"
              fillOpacity="1"
              d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,42.7C1120,32,1280,32,1360,32L1440,32L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"
            ></path>
          </svg>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-6 relative z-10">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
            >
              <WelcomeScreen onSelectArea={handleSelectArea} />
            </motion.div>
          )}

          {step === "upload" && selectedArea && (
            <motion.div
              key="upload"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="max-w-4xl mx-auto"
            >
              <FileUploader
                onFileUpload={handleFileUpload}
                selectedArea={selectedArea}
                scheduleType={scheduleType!}
                onBack={handleBackToWelcome}
              />

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="flex justify-center mt-8"
                  >
                    <div
                      className={`flex items-center space-x-3 text-${getThemeColor()}-600 bg-${getThemeColor()}-50 px-6 py-4 rounded-lg`}
                    >
                      <Loader2 className="animate-spin" size={28} />
                      <span className="text-lg">Procesando archivo...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="mt-8"
                  >
                    <div className="p-5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center mb-3">
                        <AlertTriangle className="text-red-500 mr-3" size={24} />
                        <h3 className="text-lg font-semibold text-red-700">Error en el procesamiento</h3>
                      </div>
                      <p className="text-red-600">{error}</p>
                      <div className="mt-4 pt-3 border-t border-red-100 flex justify-end">
                        <button
                          onClick={() => setError(null)}
                          className="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          Entendido
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === "results" && excelData && selectedArea && (
            <motion.div
              key="results"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="max-w-6xl mx-auto"
            >
              <StatsCard data={excelData} fileName={fileName} selectedArea={selectedArea} />
              {scheduleType === "formato" ? (
                <DataTable
                  data={excelData}
                  selectedArea={selectedArea}
                  scheduleType={scheduleType}
                  onBack={handleBackToUpload}
                />
              ) : (
                <NovedadesTable data={excelData} selectedArea={selectedArea} onBack={handleBackToUpload} />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative floating leaves in the background */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              rotate: Math.random() * 360,
              opacity: 0.1 + Math.random() * 0.2,
            }}
            animate={{
              y: [null, Math.random() * window.innerHeight, null],
              x: [null, Math.random() * window.innerWidth, null],
              rotate: [null, Math.random() * 360, null],
            }}
            transition={{
              duration: 20 + Math.random() * 30,
              ease: "linear",
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
            className={`absolute text-${getThemeColor()}-500`}
            style={{ opacity: 0.1 + Math.random() * 0.2 }}
          >
            <Leaf size={20 + Math.random() * 40} />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default App
