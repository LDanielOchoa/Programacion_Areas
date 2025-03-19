"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, AlertCircle, AlertTriangle, Loader2, Database, Shield, X, Info } from "lucide-react"
import { saveToDatabase, checkDatesExist } from "../utils/databaseService"
import { validateEmployeesInMySQL } from "../utils/sqlServerService"
import SaveAnimation from "./SaveAnimation"
import EmployeeValidationModal from "./EmployeeValidationModal"
import DateExistModal from "./DateExistModal"
import axios from "axios"
import DateHolidays from "date-holidays"
import type { ExcelData, AreaType } from "../types"

interface DataTableProps {
  data: ExcelData | null
  selectedArea: AreaType
  onBack: () => void
}

// Define validation error types
interface ValidationError {
  rowIndex: number
  colIndex: number
  value: string
  message: string
  suggestion: string
  type: "format" | "missing" | "invalid" | "duplicate" | "other"
}

// Lista de valores especiales válidos con sus colores
const SPECIAL_VALUES: Record<string, { color: string }> = {
  DESCANSO: { color: "bg-gray-200 text-gray-800" },
  VACACIONES: { color: "bg-cyan-200 text-cyan-800" },
  AUSENCIA: { color: "bg-pink-500 text-white" },
  SUSPENSION: { color: "bg-green-200 text-green-800" },
  "LIC REM": { color: "bg-green-500 text-white" },
  "LIC NO REM": { color: "bg-red-500 text-white" },
  "INC ENF": { color: "bg-blue-300 text-blue-800" },
  "INC ACC": { color: "bg-purple-500 text-white" },
  "CAMBIO TURNO": { color: "bg-yellow-300 text-yellow-800" },
  "HORA EXT NO PROG": { color: "bg-blue-600 text-white" },
  CALAMIDAD: { color: "bg-orange-300 text-orange-800" },
}

const DataTable: React.FC<DataTableProps> = ({ data, selectedArea, onBack }) => {
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"success" | "error" | null>(null)
  const [statusMessage, setStatusMessage] = useState("")
  const [recordCount, setRecordCount] = useState(0)
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationStage, setAnimationStage] = useState<"validating" | "transferring" | "saving">("validating")
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [invalidEmployees, setInvalidEmployees] = useState<{ cedula: string | number; nombre: string }[]>([])
  const [showDateExistModal, setShowDateExistModal] = useState(false)
  const [existingDates, setExistingDates] = useState<string[]>([])
  const [preparedRecords, setPreparedRecords] = useState<any[]>([])
  const [sqlServerError, setSqlServerError] = useState<string | null>(null)
  const [mysqlError, setMysqlError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)
  const tableContainerRef = useRef<HTMLDivElement>(null)
  // State for validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [showErrorDetails, setShowErrorDetails] = useState<boolean>(false)
  const [selectedError, setSelectedError] = useState<ValidationError | null>(null)
  const [isValidating, setIsValidating] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState("all")
  const [filteredRows, setFilteredRows] = useState<any[]>([])
  const [tooltipVisible, setTooltipVisible] = useState<{ visible: boolean; content: string; x: number; y: number }>({
    visible: false,
    content: "",
    x: 0,
    y: 0,
  })

  const obtenerFechasFestivas = (year: number): string[] => {
    const hd = new DateHolidays("CO") // Configura para Colombia
    const holidays = hd.getHolidays(year)
    const fechasFestivas = holidays.map((holiday: any) => holiday.date)
    return fechasFestivas
  }

  // Uso en tu componente
  const fechasFestivas = obtenerFechasFestivas(2023) // Obtiene festivos de 2023

  useEffect(() => {
    if (data) {
      console.log("[DEBUG] Excel Data Structure:", {
        headers: data.headers,
        rowCount: data.rows.length,
        sampleRow: data.rows[0],
      })
      // Run initial validation when data is loaded
      validateData()
      applyFilters()
    }
  }, [data])

  useEffect(() => {
    if (data) {
      applyFilters()
    }
  }, [activeTab, data])

  useEffect(() => {
    if (saveStatus && tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [saveStatus])

  useEffect(() => {
    const handleScroll = () => {
      if (tableContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = tableContainerRef.current
        const progress = scrollTop / (scrollHeight - clientHeight)
        setScrollProgress(progress || 0)
        setIsScrolling(true)

        const scrollTimer = setTimeout(() => {
          setIsScrolling(false)
        }, 150)

        return () => clearTimeout(scrollTimer)
      }
    }

    const tableContainer = tableContainerRef.current
    if (tableContainer) {
      tableContainer.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [])

  // Función para aplicar filtros
  const applyFilters = () => {
    if (!data) return

    const hasMetadata = data.rows[0] && data.rows[0][0] === "Responsable:"
    let displayRows = hasMetadata ? data.rows.slice(1) : data.rows

    // Aplicar filtro por tab
    if (activeTab !== "all") {
      if (activeTab === "errors") {
        // Filtrar filas con errores
        const rowsWithErrors = validationErrors.map((error) => error.rowIndex)
        displayRows = displayRows.filter((_, index) => rowsWithErrors.includes(index))
      } else if (activeTab === "special") {
        // Filtrar filas con valores especiales
        displayRows = displayRows.filter((row) => {
          return row.some((cell: any) => cell && isSpecialValue(cell.toString()))
        })
      }
    }

    setFilteredRows(displayRows)
  }

  // Función para validar el formato de hora estricto (HH:MM - HH:MM)
  const isValidTimeFormat = (timeStr: string): boolean => {
    // Formato exacto: dos dígitos para hora (00-23), dos dígitos para minutos (00-59)
    const strictTimeFormat = /^([0-1][0-9]|2[0-3]):[0-5][0-9] - ([0-1][0-9]|2[0-3]):[0-5][0-9]$/
    return strictTimeFormat.test(timeStr)
  }

  // Función para validar el formato de hora con deducción (HH:MM - HH:MM [X.X])
  const isValidTimeWithDeduction = (timeStr: string): boolean => {
    // Formato exacto con deducción: HH:MM - HH:MM [X.X]
    const strictTimeWithDeduction = /^([0-1][0-9]|2[0-3]):[0-5][0-9] - ([0-1][0-9]|2[0-3]):[0-5][0-9] \[\d+(\.\d+)?\]$/
    return strictTimeWithDeduction.test(timeStr)
  }

  // Función para validar si es un valor especial válido
  const isValidSpecialValue = (value: string): boolean => {
    return Object.keys(SPECIAL_VALUES).includes(value.toUpperCase())
  }

  // Modificar la función validateData para que tenga en cuenta las columnas filtradas
  const validateData = () => {
    if (!data || !data.rows.length) return false

    setIsValidating(true)
    const errors: ValidationError[] = []
    const hasMetadata = data.rows[0] && data.rows[0][0] === "Responsable:"
    const displayRows = hasMetadata ? data.rows.slice(1) : data.rows
    const dateHeaders = data.headers.slice(4)

    // Check for valid schedule formats
    displayRows.forEach((row, rowIndex) => {
      // Check employee ID (cedula) - solo si no está vacío
      if (row[1] !== undefined && row[1] !== null && row[1] !== "") {
        if (!/^\d+$/.test(String(row[1]))) {
          errors.push({
            rowIndex,
            colIndex: 1, // Índice directo para la cédula
            value: String(row[1]),
            message: "Formato de cédula inválido",
            suggestion: "La cédula debe contener solo números",
            type: "format",
          })
        }
      }

      // Solo validamos nombre y cargo si hay una cédula (empleado válido)
      if (row[1] !== undefined && row[1] !== null && row[1] !== "") {
        // Check employee name solo si no está vacío
        if (row[2] === undefined || row[2] === null || row[2] === "") {
          errors.push({
            rowIndex,
            colIndex: 2, // Índice directo para el nombre
            value: "",
            message: "Nombre faltante",
            suggestion: "Ingrese el nombre del empleado",
            type: "missing",
          })
        }

        // Check position/role solo si no está vacío
        if (row[3] === undefined || row[3] === null || row[3] === "") {
          errors.push({
            rowIndex,
            colIndex: 3, // Índice directo para el cargo
            value: "",
            message: "Cargo faltante",
            suggestion: "Ingrese el cargo del empleado",
            type: "missing",
          })
        }
      }

      // Check schedule formats - solo validar si hay un valor (permitir vacíos)
      for (let i = 0; i < dateHeaders.length; i++) {
        const colIndex = i + 4 // Índice real de la columna en los datos
        const schedule = row[colIndex]

        // Si está vacío, no validar
        if (!schedule || schedule === "" || schedule.toString().trim() === "") continue

        const scheduleStr = String(schedule).trim()

        // Verificar si es un valor especial válido
        if (isValidSpecialValue(scheduleStr)) continue

        // Verificar si tiene formato de hora válido
        if (isValidTimeFormat(scheduleStr)) continue

        // Verificar si tiene formato de hora con deducción válido
        if (isValidTimeWithDeduction(scheduleStr)) continue

        // Si llegamos aquí, el formato no es válido
        // Detectar si es un problema de formato de hora (falta cero a la izquierda)
        if (/\b[0-9]:[0-5][0-9]\b/.test(scheduleStr)) {
          errors.push({
            rowIndex,
            colIndex,
            value: scheduleStr,
            message: "Formato de hora incorrecto",
            suggestion: "Las horas deben tener dos dígitos (ej: 05:00 en lugar de 5:00)",
            type: "format",
          })
        } else {
          // Otro tipo de error de formato
          errors.push({
            rowIndex,
            colIndex,
            value: scheduleStr,
            message: "Formato de horario inválido",
            suggestion: 'Use el formato "HH:MM - HH:MM" o uno de los valores especiales permitidos',
            type: "format",
          })
        }
      }
    })

    // Check for duplicate employee IDs
    const cedulaMap = new Map()
    displayRows.forEach((row, rowIndex) => {
      const cedula = row[1]
      if (cedula && cedula !== "") {
        if (cedulaMap.has(cedula)) {
          errors.push({
            rowIndex,
            colIndex: 1, // Índice directo para la cédula
            value: String(cedula),
            message: "Cédula duplicada",
            suggestion: "Elimine o corrija uno de los registros duplicados",
            type: "duplicate",
          })
        } else {
          cedulaMap.set(cedula, rowIndex)
        }
      }
    })

    setValidationErrors(errors)
    setIsValidating(false)
    applyFilters()

    return errors.length === 0
  }

  if (!data || !data.headers.length) {
    return null
  }

  const getAreaColor = () => {
    switch (selectedArea) {
      case "Operaciones":
        return "bg-blue-600"
      case "Lavado":
        return "bg-cyan-600"
      case "Mantenimiento":
        return "bg-amber-600"
      case "Remanofactura":
        return "bg-emerald-600"
      case "ServiciosGenerales":
        return "bg-purple-600"
      case "Vigilantes":
        return "bg-red-600"
      default:
        return "bg-green-600"
    }
  }

  const getAreaTextColor = () => {
    switch (selectedArea) {
      case "Operaciones":
        return "text-blue-600"
      case "Lavado":
        return "text-cyan-600"
      case "Mantenimiento":
        return "text-amber-600"
      case "Remanofactura":
        return "text-emerald-600"
      case "ServiciosGenerales":
        return "text-purple-600"
      case "Vigilantes":
        return "text-red-600"
      default:
        return "text-green-600"
    }
  }

  const getAreaLightColor = () => {
    switch (selectedArea) {
      case "Operaciones":
        return "bg-blue-50 text-blue-800"
      case "Lavado":
        return "bg-cyan-50 text-cyan-800"
      case "Mantenimiento":
        return "bg-amber-50 text-amber-800"
      case "Remanofactura":
        return "bg-emerald-50 text-emerald-800"
      case "ServiciosGenerales":
        return "bg-purple-50 text-purple-800"
      case "Vigilantes":
        return "bg-red-50 text-red-800"
      default:
        return "bg-green-50 text-green-800"
    }
  }

  const getAreaHoverColor = () => {
    switch (selectedArea) {
      case "Operaciones":
        return "hover:bg-blue-100"
      case "Lavado":
        return "hover:bg-cyan-100"
      case "Mantenimiento":
        return "hover:bg-amber-100"
      case "Remanofactura":
        return "hover:bg-emerald-100"
      case "ServiciosGenerales":
        return "hover:bg-purple-100"
      case "Vigilantes":
        return "hover:bg-red-100"
      default:
        return "hover:bg-green-100"
    }
  }

  const getButtonColor = () => {
    switch (selectedArea) {
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

  const getAreaGradient = () => {
    switch (selectedArea) {
      case "Operaciones":
        return "from-blue-600 to-blue-700"
      case "Lavado":
        return "from-cyan-600 to-cyan-700"
      case "Mantenimiento":
        return "from-amber-600 to-amber-700"
      case "Remanofactura":
        return "from-emerald-600 to-emerald-700"
      case "ServiciosGenerales":
        return "from-purple-600 to-purple-700"
      case "Vigilantes":
        return "from-red-600 to-red-700"
      default:
        return "from-green-600 to-green-700"
    }
  }

  // Get error color based on error type
  const getErrorColor = (type: string) => {
    switch (type) {
      case "format":
        return "bg-orange-100 border-orange-500"
      case "missing":
        return "bg-red-100 border-red-500"
      case "invalid":
        return "bg-purple-100 border-purple-500"
      case "duplicate":
        return "bg-yellow-100 border-yellow-500"
      default:
        return "bg-red-100 border-red-500"
    }
  }

  // Get error icon based on error type
  const getErrorIcon = (type: string) => {
    switch (type) {
      case "format":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "missing":
        return <X className="h-4 w-4 text-red-500" />
      case "invalid":
        return <AlertCircle className="h-4 w-4 text-purple-500" />
      case "duplicate":
        return <Info className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-red-500" />
    }
  }

  // Obtener el color para un valor especial
  const getSpecialValueColor = (value: string) => {
    const upperValue = value.toUpperCase()
    return SPECIAL_VALUES[upperValue]?.color || ""
  }

  const hasMetadata = data.rows[0] && data.rows[0][0] === "Responsable:"
  const metadata = hasMetadata ? data.rows[0] : null
  const displayRows = hasMetadata ? data.rows.slice(1) : data.rows

  const dateRange = metadata ? metadata[3] : ""

  const getQuincena = () => {
    const today = new Date() // Obtener la fecha actual
    const day = today.getDate() // Día del mes (1-31)
    const month = today.getMonth() // Mes (0-11, 0 = Enero)
    const year = today.getFullYear() // Año actual

    // Mapear números de mes a nombres en español
    const meses = [
      "Enero",
      "Febrero",
      "Marzo",
      "Abril",
      "Mayo",
      "Junio",
      "Julio",
      "Agosto",
      "Septiembre",
      "Octubre",
      "Noviembre",
      "Diciembre",
    ]

    // Determinar quincena basada en el día actual
    const quincena = day <= 15 ? "Q1" : "Q2"

    return `${quincena}_${meses[month]}_${year}`
  }

  const filterEmptyColumns = () => {
    if (!data || !data.headers.length) return { headers: [], rows: [] }

    const nonEmptyColumnIndexes: number[] = []

    for (let colIndex = 0; colIndex < data.headers.length; colIndex++) {
      if (data.headers[colIndex]) {
        const hasData = displayRows.some((row) => {
          return row[colIndex] !== undefined && row[colIndex] !== null && row[colIndex] !== ""
        })

        if (hasData || colIndex < 4) {
          nonEmptyColumnIndexes.push(colIndex)
        }
      }
    }

    const filteredHeaders = nonEmptyColumnIndexes.map((index) => data.headers[index])

    const filteredRows = displayRows.map((row) => {
      return nonEmptyColumnIndexes.map((index) => row[index])
    })

    return { headers: filteredHeaders, rows: filteredRows }
  }

  const filteredData = filterEmptyColumns()

  const continueWithSave = async () => {
    if (!preparedRecords || preparedRecords.length === 0) {
      console.error("[DEBUG] No hay registros para guardar:", preparedRecords)
      setDebugInfo("Error crítico: No hay datos válidos para guardar")
      setSaveStatus("error")
      setStatusMessage("Error interno: No se prepararon los registros correctamente")
      return
    }

    try {
      setShowDateExistModal(false)
      setSaveStatus(null)
      setStatusMessage("")
      setDebugInfo(`Iniciando proceso de guardado...\nRegistros a guardar: ${preparedRecords.length}`)

      // Iniciar animación
      setAnimationStage("saving")
      setShowAnimation(true)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("[DEBUG] Enviando registros:", preparedRecords)
      setDebugInfo((prev) => `${prev}\nEnviando datos al servidor...`)

      const startTime = Date.now()
      const result = await saveToDatabase(preparedRecords)
      const elapsedTime = ((Date.now() - startTime) / 1000).toFixed(2)

      console.log("[DEBUG] Respuesta del servidor:", result)
      setDebugInfo((prev) => `${prev}\nServidor respondió en ${elapsedTime}s: ${JSON.stringify(result, null, 2)}`)

      if (!result?.success) {
        throw new Error(result?.error || "Respuesta inválida del servidor")
      }

      setDebugInfo((prev) => `${prev}\nActualizando interfaz...`)
      await new Promise((resolve) => setTimeout(resolve, 500)) // Espera para animación

      setSaveStatus("success")
      setStatusMessage(`${preparedRecords.length} registros guardados exitosamente`)
    } catch (error: any) {
      console.error("[DEBUG] Error completo:", error)

      const errorMessage = error.response?.data?.error?.includes("duplicado")
        ? "Datos duplicados: Algunos registros ya existen"
        : error.message

      setDebugInfo(
        (prev) =>
          `${prev || "Error durante el guardado"}\n` +
          `ERROR: ${errorMessage}\n` +
          `Stack: ${error.stack || "No disponible"}`,
      )

      setSaveStatus("error")
      setStatusMessage(errorMessage)

      if (error.response) {
        console.error("Error del servidor:", {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        })
      } else if (error.request) {
        console.error("No hubo respuesta del servidor:", error.request)
      }
    } finally {
      setTimeout(() => {
        setShowAnimation(false)
        setAnimationStage("validating")
        setIsSaving(false)
        setDebugInfo(null)
      }, 2000)
    }
  }

  const formatDateForDatabase = (dateHeader: any): string => {
    console.log("[DEBUG] Formatting date:", dateHeader)

    const currentYear = new Date().getFullYear()

    if (typeof dateHeader === "string") {
      if (/^\d{1,2}-[A-Za-z]{3}$/i.test(dateHeader)) {
        const parts = dateHeader.split("-")
        if (parts.length === 2) {
          const day = parts[0].trim().padStart(2, "0")
          const month = parts[1].trim().substring(0, 3).toLowerCase()

          const monthMap: { [key: string]: string } = {
            ene: "01",
            feb: "02",
            mar: "03",
            abr: "04",
            may: "05",
            jun: "06",
            jul: "07",
            ago: "08",
            sep: "09",
            oct: "10",
            nov: "11",
            dic: "12",
          }

          const monthNum = monthMap[month] || "01"
          return `${currentYear}-${monthNum}-${day}`
        }
      }
    }

    const date = new Date(dateHeader)
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0]
    }

    console.log("[DEBUG] Using original date string:", dateHeader)
    return String(dateHeader)
  }

  // Función para corregir el formato de hora (añadir ceros a la izquierda)
  const fixTimeFormat = (timeStr: string): string => {
    // Si es un valor especial, devolverlo tal cual
    if (isValidSpecialValue(timeStr)) {
      return timeStr
    }

    // Corregir formato de horas sin ceros a la izquierda
    let fixed = timeStr.replace(/\b(\d):(\d\d)\b/g, "0$1:$2")

    // Extraer y preservar la deducción si existe
    const deductionMatch = fixed.match(/\[(\d+(?:\.\d+)?)\]$/)
    let deduction = ""

    if (deductionMatch) {
      deduction = deductionMatch[0]
      fixed = fixed.replace(/\s*\[\d+(?:\.\d+)?\]$/, "")
    }

    // Añadir la deducción de nuevo si existía
    if (deduction) {
      fixed = `${fixed} ${deduction}`
    }

    return fixed
  }

  // Actualizar la función handleSaveToDatabase para manejar mejor los horarios
  const handleSaveToDatabase = async () => {
    // First validate the data
    const isValid = validateData()

    if (!isValid && validationErrors.length > 0) {
      setSaveStatus("error")
      setStatusMessage(`Se encontraron ${validationErrors.length} errores. Corrija los errores antes de guardar.`)
      setShowErrorDetails(true)
      return
    }

    if (!data || isSaving) return

    setIsSaving(true)
    setSaveStatus(null)
    setStatusMessage("")
    setSqlServerError(null)
    setMysqlError(null)
    setDebugInfo("Iniciando proceso de guardado...")
    setPreparedRecords([])

    try {
      // Obtén las fechas festivas para el año actual
      const year = new Date().getFullYear()
      const fechasFestivas = await obtenerFechasFestivas(year) // Usa la API o librería

      const currentDate = new Date()
      const quincena = getQuincena()
      const dateHeaders = data.headers.slice(4)
      const localRecords = []

      for (const row of displayRows) {
        const cedula = row[1]
        // Ignorar filas sin cédula o con cédula vacía
        if (!cedula || cedula === "") continue

        for (let i = 0; i < dateHeaders.length; i++) {
          const horario = row[i + 4]
          // Ignorar celdas vacías o con solo espacios en blanco
          if (!horario || horario === "" || horario.toString().trim() === "") continue

          let tiempoDescontar = 0
          let horarioLimpio = horario.toString().trim()

          // Si es un valor especial, mantenerlo tal cual
          if (isValidSpecialValue(horarioLimpio)) {
            // Para valores especiales, no hay deducción
            tiempoDescontar = 0
          } else {
            // Extraer el tiempo a descontar si está en formato [X.X]
            const deductionMatch = horarioLimpio.match(/\[(\d+(?:\.\d+)?)\]$/)
            if (deductionMatch) {
              tiempoDescontar = Number.parseFloat(deductionMatch[1])
              // Eliminar la parte [X.X] del horario
              horarioLimpio = horarioLimpio.replace(/\s*\[\d+(?:\.\d+)?\]$/, "").trim()
            } else {
              // Buscar en la tabla de almuerzos solo si no tiene ya una deducción explícita
              const matchingSchedule = data.lunchSchedules?.find((schedule) => schedule.time === horarioLimpio)
              if (matchingSchedule) {
                tiempoDescontar = matchingSchedule.deduction
              }
            }

            // Corregir formato de horas sin ceros a la izquierda
            horarioLimpio = horarioLimpio.replace(/\b(\d):(\d\d)\b/g, "0$1:$2")
          }

          const fechaProgramacion = formatDateForDatabase(dateHeaders[i])
          const esFestivo = fechasFestivas.includes(fechaProgramacion) // Verifica si es festivo

          const record = {
            CEDULA: cedula,
            Fecha_programacion: fechaProgramacion,
            Horario_programacion: horarioLimpio,
            Area: selectedArea,
            Tiempo_a_descontar: tiempoDescontar,
            Quincena: quincena,
            clasificacion: esFestivo ? row[3] || "Festivo" : null, // Solo si es festivo
            fecha_consulta: currentDate.toISOString(),
          }

          localRecords.push(record)
        }
      }

      if (localRecords.length === 0) {
        throw new Error("No hay registros válidos para guardar")
      }

      setAnimationStage("validating")
      setShowAnimation(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const employees = Array.from(new Map(displayRows.map((row) => [row[1], row[2]]))).map(([cedula, nombre]) => ({
        cedula,
        nombre,
      }))

      const validationResult = await validateEmployeesInMySQL(
        employees.map((e) => e.cedula),
        employees.map((e) => e.nombre),
      )

      if (!validationResult.isValid) {
        setInvalidEmployees(validationResult.invalidEmployees)
        setShowValidationModal(true)
        return
      }

      setAnimationStage("transferring")
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const uniqueDates = [...new Set(dateHeaders.map(formatDateForDatabase))]
      const dateCheckResult = await checkDatesExist(uniqueDates, selectedArea)

      if (dateCheckResult.exists) {
        setExistingDates(dateCheckResult.existingDates)
        setShowDateExistModal(true)
        return
      }

      setAnimationStage("saving")
      setPreparedRecords(localRecords)
      setRecordCount(localRecords.length)

      try {
        const result = await axios.post(
          "https://programacion-areas-khbj.onrender.com/api/save-schedule",
          {
            records: localRecords,
            area: selectedArea,
            timestamp: new Date().toISOString(),
          },
          {
            timeout: 30000,
            headers: { "Content-Type": "application/json" },
          },
        )

        if (result.data && (result.data.success || result.data.message)) {
          setSaveStatus("success")
          setStatusMessage(`${localRecords.length} registros guardados exitosamente`)
        } else {
          throw new Error("Respuesta del servidor sin confirmación de éxito")
        }
      } catch (axiosError: any) {
        console.error("[AXIOS ERROR]", axiosError)

        if (axiosError.response) {
          const serverMessage = axiosError.response.data?.error || "Error en la respuesta del servidor"
          throw new Error(serverMessage)
        } else if (axiosError.request) {
          throw new Error("No se recibió respuesta del servidor. Verifique la conexión.")
        } else {
          throw axiosError
        }
      }
    } catch (error: any) {
      console.error("[FINAL ERROR]", error)
      let errorMessage = "Error desconocido al guardar"

      if (error.message) {
        errorMessage = error.message
      } else if (typeof error === "string") {
        errorMessage = error
      }

      setSaveStatus("error")
      setStatusMessage(errorMessage)

      setDebugInfo(`
        Error: ${errorMessage}
        Stack: ${error.stack || "No disponible"}
        ${error.response ? `Respuesta: ${JSON.stringify(error.response.data)}` : ""}
      `)
    } finally {
      setTimeout(() => {
        setShowAnimation(false)
        setIsSaving(false)
        setAnimationStage("validating")
      }, 2000)
    }
  }

  const calculateStats = () => {
    if (!filteredData.rows.length) return { employees: 0, dates: 0, shifts: 0 }

    const uniqueEmployees = new Set()
    const uniqueDates = new Set()
    let totalShifts = 0

    filteredData.rows.forEach((row) => {
      if (row[1]) uniqueEmployees.add(row[1])

      for (let i = 4; i < row.length; i++) {
        if (row[i]) totalShifts++
      }
    })

    const dateHeaders = filteredData.headers.slice(4)
    dateHeaders.forEach((header) => uniqueDates.add(header))

    return {
      employees: uniqueEmployees.size,
      dates: dateHeaders.length,
      shifts: totalShifts,
    }
  }

  const stats = calculateStats()

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
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  }

  const rowVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.03,
        type: "spring",
        stiffness: 100,
        damping: 15,
      },
    }),
  }

  // Mejorar la visualización de errores para que sea más clara
  const getErrorForCell = (rowIndex: number, colIndex: number) => {
    // Solo devolver errores para celdas que no estén vacías
    const error = validationErrors.find((error) => error.rowIndex === rowIndex && error.colIndex === colIndex)

    // Si la celda está vacía y hay un error, verificar si es un error de "faltante"
    if (error && error.type === "missing") {
      // Para errores de tipo "missing", sí queremos mostrarlos aunque la celda esté vacía
      return error
    }

    // Para otros tipos de errores, solo mostrarlos si hay un valor en la celda
    return error
  }

  // Mejorar la función para mostrar tooltips con información de error
  const showTooltip = (content: string, event: React.MouseEvent) => {
    setTooltipVisible({
      visible: true,
      content,
      x: event.clientX,
      y: event.clientY,
    })
  }

  // Ocultar tooltip
  const hideTooltip = () => {
    setTooltipVisible({ ...tooltipVisible, visible: false })
  }

  // Check if a cell has an error
  const hasError = (rowIndex: number, colIndex: number) => {
    return validationErrors.some((error) => error.rowIndex === rowIndex && error.colIndex === colIndex)
  }

  // Handle clicking on an error cell
  const handleErrorCellClick = (error: ValidationError) => {
    setSelectedError(error)
    setShowErrorDetails(true)
  }

  // Determinar si una celda es un valor especial
  const isSpecialValue = (value: string | null | undefined) => {
    if (!value) return false
    return Object.keys(SPECIAL_VALUES).includes(value.toString().toUpperCase())
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full mt-8"
    >
      {tooltipVisible.visible && (
        <div
          className="fixed bg-black text-white text-xs rounded py-1 px-2 z-50 pointer-events-none shadow-lg"
          style={{
            left: `${tooltipVisible.x + 10}px`,
            top: `${tooltipVisible.y + 10}px`,
            maxWidth: "250px",
          }}
        >
          {tooltipVisible.content}
        </div>
      )}
      <AnimatePresence>
        {showAnimation && (
          <SaveAnimation
            isVisible={showAnimation}
            area={selectedArea}
            recordCount={recordCount}
            stage={animationStage}
          />
        )}
      </AnimatePresence>

      <EmployeeValidationModal
        isVisible={showValidationModal}
        onClose={() => setShowValidationModal(false)}
        invalidEmployees={invalidEmployees}
        area={selectedArea}
      />

      <DateExistModal
        isVisible={showDateExistModal}
        onClose={() => {
          setShowDateExistModal(false)
          setIsSaving(false)
        }}
        existingDates={existingDates}
        area={selectedArea}
        onProceed={continueWithSave}
      />

      {/* Error Details Modal */}
      <AnimatePresence>
        {showErrorDetails && selectedError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`bg-white rounded-lg shadow-xl p-6 max-w-md w-full border-l-4 ${getErrorColor(selectedError.type).split(" ")[1]}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  {getErrorIcon(selectedError.type)}
                  <h3 className="text-lg font-semibold ml-2">Error de validación</h3>
                </div>
                <button onClick={() => setShowErrorDetails(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Valor actual:</p>
                  <p className="font-mono bg-gray-100 p-2 rounded text-sm">{selectedError.value || "(vacío)"}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Problema:</p>
                  <p className="text-sm">{selectedError.message}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-500">Solución sugerida:</p>
                  <p className="text-sm">{selectedError.suggestion}</p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowErrorDetails(false)}
                  className={`px-4 py-2 rounded-md text-white ${getButtonColor()}`}
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Card */}
      <div className="mb-6 bg-white rounded-xl shadow-lg border-0 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-gray-50 to-white">
          <motion.div
            className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            <div className="flex items-center">
              <motion.button
                onClick={onBack}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors bg-white rounded-full p-2 shadow-sm hover:shadow"
                whileHover={{ scale: 1.05, x: -5 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={18} />
              </motion.button>
              <div className="h-10 w-px bg-gray-200 mx-4"></div>
              <motion.div
                className="flex flex-col"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <h3 className={`text-xl font-bold ${getAreaTextColor()}`}>Área de {selectedArea}</h3>
                <p className="text-gray-500 text-sm">Programación de horarios</p>
              </motion.div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getAreaLightColor()} shadow-sm`}
              >
                <span className="mr-1.5 flex h-2 w-2 rounded-full bg-current"></span>
                {stats.employees} Empleados
              </span>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getAreaLightColor()} shadow-sm`}
              >
                <span className="mr-1.5 flex h-2 w-2 rounded-full bg-current"></span>
                {stats.dates} Fechas
              </span>
              <span
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getAreaLightColor()} shadow-sm`}
              >
                <span className="mr-1.5 flex h-2 w-2 rounded-full bg-current"></span>
                {stats.shifts} Turnos
              </span>
              {validationErrors.length > 0 && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-50 text-red-800 shadow-sm">
                  <span className="mr-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
                  {validationErrors.length} Errores
                </span>
              )}
            </div>
          </motion.div>

          {metadata && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring", delay: 0.2 }}
              className="mt-6 p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">{metadata[0]}</span>
                  <span className="text-gray-800 font-semibold">{metadata[1]}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-700 mr-2">{metadata[2]}</span>
                  <span className="text-gray-800 font-semibold">{metadata[3]}</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Error Summary Banner */}
      <AnimatePresence>
        {validationErrors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6 p-4 rounded-lg shadow-md border-l-4 border-l-red-500 bg-red-50 text-red-800"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AlertCircle size={20} className="text-red-600 mr-3 flex-shrink-0" />
                <span className="font-medium">
                  Se encontraron {validationErrors.length} errores en los datos. Corrija los errores antes de guardar.
                </span>
              </div>
              <button
                onClick={() => {
                  // Scroll to the first error
                  if (validationErrors.length > 0 && tableContainerRef.current) {
                    const firstError = validationErrors[0]
                    const errorRow = tableContainerRef.current.querySelector(`[data-row="${firstError.rowIndex}"]`)
                    if (errorRow) {
                      errorRow.scrollIntoView({ behavior: "smooth", block: "center" })
                    }
                  }
                }}
                className="text-sm font-medium text-red-600 hover:text-red-800 bg-white px-3 py-1 rounded-md shadow-sm hover:shadow"
              >
                Ver primer error
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        className="mb-6 flex justify-between items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <div className="flex gap-3">
          <button
            onClick={validateData}
            disabled={isValidating}
            className={`flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2.5 ${getButtonColor()} text-white shadow-md hover:shadow-lg`}
          >
            {isValidating ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                <span>Validando...</span>
              </>
            ) : (
              <>
                <Shield size={18} className="mr-2" />
                <span>Validar datos</span>
              </>
            )}
          </button>

          <button
            onClick={handleSaveToDatabase}
            disabled={isSaving || validationErrors.length > 0}
            className={`flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none px-4 py-2.5 ${getButtonColor()} text-white shadow-md hover:shadow-lg`}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                <span>Procesando...</span>
              </>
            ) : (
              <>
                <Database size={18} className="mr-2" />
                <span>Guardar en BD</span>
              </>
            )}
          </button>
        </div>

        {/* Custom Tabs Component */}
        <div className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 shadow-inner">
          <button
            onClick={() => setActiveTab("all")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus:outline-none ${
              activeTab === "all"
                ? `bg-white text-gray-800 shadow-sm ${getAreaTextColor()}`
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setActiveTab("errors")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus:outline-none relative ${
              activeTab === "errors"
                ? `bg-white text-gray-800 shadow-sm ${getAreaTextColor()}`
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Errores
            {validationErrors.length > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center rounded-full bg-red-500 text-white text-xs">
                {validationErrors.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("special")}
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition-all focus:outline-none ${
              activeTab === "special"
                ? `bg-white text-gray-800 shadow-sm ${getAreaTextColor()}`
                : "text-gray-600 hover:text-gray-800"
            }`}
          >
            Especiales
          </button>
        </div>
      </motion.div>

      <div ref={tableRef}>
        <AnimatePresence>
          {sqlServerError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-4 rounded-lg shadow-md border-l-4 border-l-amber-500 bg-amber-50 text-amber-800"
            >
              <div className="flex items-center">
                <AlertTriangle size={20} className="text-amber-600 mr-2 flex-shrink-0" />
                <span className="font-medium">{sqlServerError}</span>
              </div>
            </motion.div>
          )}

          {mysqlError && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-4 p-4 rounded-lg shadow-md border-l-4 border-l-amber-500 bg-amber-50 text-amber-800"
            >
              <div className="flex items-center">
                <AlertTriangle size={20} className="text-amber-600 mr-2 flex-shrink-0" />
                <span className="font-medium">{mysqlError}</span>
              </div>
            </motion.div>
          )}

          {saveStatus && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.3 }}
              className={`mb-4 p-4 rounded-lg shadow-md border-l-4 ${
                saveStatus === "success"
                  ? "bg-green-50 border-l-green-500 text-green-800"
                  : "bg-red-50 border-l-red-500 text-red-800"
              }`}
            >
              <div className="flex items-center">
                {saveStatus === "success" ? (
                  <Check size={20} className="text-green-600 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle size={20} className="text-red-600 mr-2 flex-shrink-0" />
                )}
                <span className="font-medium">{statusMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="overflow-hidden bg-white rounded-xl shadow-lg border border-gray-200"
      >
        <div
          ref={tableContainerRef}
          className="max-h-[500px] overflow-y-auto relative"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: `var(--${selectedArea.toLowerCase()}-color) transparent`,
          }}
        >
          <motion.div
            className={`absolute right-0 top-0 w-1.5 bg-gradient-to-b ${getAreaGradient()} opacity-70 z-20 rounded-r-md`}
            initial={{ height: "0%" }}
            animate={{
              height: `${scrollProgress * 100}%`,
              opacity: isScrolling ? 0.7 : 0.3,
            }}
            transition={{ duration: 0.1 }}
          />

          <div className={`h-1.5 w-full sticky top-0 z-10 bg-gray-100 overflow-hidden`}>
            <div className={`h-full ${getAreaColor()}`} style={{ width: `${scrollProgress * 100}%` }} />
          </div>

          <table className="min-w-full divide-y divide-gray-200">
            <thead className={`bg-gradient-to-r ${getAreaGradient()} text-white sticky top-1.5 z-10`}>
              <tr>
                {filteredData.headers.map((header, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-6 py-4 text-left text-sm font-medium uppercase tracking-wider"
                  >
                    <div className="flex items-center">{header}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <AnimatePresence>
                {filteredRows.slice(0, 100).map((row, rowIndex) => (
                  <motion.tr
                    key={rowIndex}
                    custom={rowIndex}
                    variants={rowVariants}
                    initial="hidden"
                    animate="visible"
                    className={`${rowIndex % 2 === 0 ? "bg-white" : getAreaLightColor()} ${getAreaHoverColor()} transition-colors`}
                    data-row={rowIndex}
                  >
                    {row.map((cell, cellIndex) => {
                      const error = getErrorForCell(rowIndex, cellIndex)
                      const isSpecial = cell && isSpecialValue(cell.toString())
                      const specialColor = isSpecial ? getSpecialValueColor(cell.toString()) : ""

                      return (
                        <td
                          key={cellIndex}
                          className={`px-6 py-4 whitespace-nowrap text-sm ${
                            error
                              ? `${getErrorColor(error.type)} border-l-4 cursor-pointer`
                              : isSpecial
                                ? `${specialColor} rounded-md`
                                : "text-gray-700"
                          }`}
                          onClick={() => error && handleErrorCellClick(error)}
                          onMouseEnter={(e) => error && showTooltip(error.message, e)}
                          onMouseLeave={hideTooltip}
                        >
                          <div className="flex items-center">
                            {error && <div className="mr-2 flex-shrink-0">{getErrorIcon(error.type)}</div>}
                            <span className={error ? "font-medium" : ""}>{cell?.toString() || ""}</span>
                          </div>
                        </td>
                      )
                    })}
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={filteredData.headers.length} className="px-6 py-10 text-center text-gray-500">
                    No se encontraron registros que coincidan con los criterios de búsqueda
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {filteredRows.length > 100 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="bg-gray-50 px-6 py-3 text-center text-sm text-gray-500 border-t border-gray-200"
            >
              Mostrando 100 de {filteredRows.length} filas
            </motion.div>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        className="text-center mt-10"
      >
        <motion.p
          className={`font-bold text-lg bg-gradient-to-r ${getAreaGradient()} bg-clip-text text-transparent`}
          whileHover={{ scale: 1.05 }}
        >
          Sistema Alimentador Oriental 6
        </motion.p>
        <motion.div
          className="flex items-center justify-center mt-2 text-xs text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 1.2 }}
        >
          <Shield size={12} className="mr-1" />
          <span>Datos protegidos y seguros</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

export default DataTable

