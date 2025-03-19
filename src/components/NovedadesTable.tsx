"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calendar,
  Clock,
  FileText,
  AlertTriangle,
  UserCheck,
  FileEdit,
  ChevronLeft,
  Filter,
  Search,
  X,
  Database,
  Save,
  Loader2,
  FileSpreadsheet,
  User,
  ArrowRight
} from "lucide-react"
import type { ExcelData } from "../types"
import { validateEmployeesInMySQL } from "../utils/sqlServerService"
import { toast } from "react-toastify"
import SaveAnimation from "./SaveAnimation"
import EmployeeValidationModal from "./EmployeeValidationModal"
import DateExistModal from "./DateExistModal"
import axios from "axios"

interface NovedadesTableProps {
  data: ExcelData
  selectedArea: string
  onBack: () => void
}

// Definición de tipos de novedad con sus colores correspondientes
const NOVEDAD_TYPES = {
  AUSENCIA: { color: "bg-pink-500 text-white" },
  SUSPENSION: { color: "bg-green-200 text-green-800" },
  "LIC REM": { color: "bg-green-500 text-white" },
  "LIC NO REM": { color: "bg-red-500 text-white" },
  "INC ENF": { color: "bg-blue-300 text-blue-800" },
  "INC ACC": { color: "bg-purple-500 text-white" },
  "CAMBIO TURNO": { color: "bg-yellow-300 text-yellow-800" },
  "HORA EXT NO PROG": { color: "bg-blue-600 text-white" }
}

const NovedadesTable: React.FC<NovedadesTableProps> = ({ data, selectedArea, onBack }) => {
  const records = data.rows.slice(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // State for saving functionality
  const [isSaving, setIsSaving] = useState(false)
  const [showAnimation, setShowAnimation] = useState(false)
  const [animationStage, setAnimationStage] = useState<"validating" | "transferring" | "saving">("validating")
  const [showValidationModal, setShowValidationModal] = useState(false)
  const [invalidEmployees, setInvalidEmployees] = useState<{ cedula: string | number; nombre: string }[]>([])
  const [showDateExistModal, setShowDateExistModal] = useState(false)
  const [existingDates, setExistingDates] = useState<string[]>([])

  // Get theme colors based on selected area
  const theme = {
    primary: selectedArea === "Operaciones" ? "bg-blue-600" :
             selectedArea === "Lavado" ? "bg-cyan-600" :
             selectedArea === "Mantenimiento" ? "bg-amber-600" :
             selectedArea === "Remanofactura" ? "bg-emerald-600" :
             selectedArea === "ServiciosGenerales" ? "bg-purple-600" :
             selectedArea === "Vigilantes" ? "bg-red-600" : "bg-green-600",
    gradient: selectedArea === "Operaciones" ? "from-blue-600 to-blue-700" :
              selectedArea === "Lavado" ? "from-cyan-600 to-cyan-700" :
              selectedArea === "Mantenimiento" ? "from-amber-600 to-amber-700" :
              selectedArea === "Remanofactura" ? "from-emerald-600 to-emerald-700" :
              selectedArea === "ServiciosGenerales" ? "from-purple-600 to-purple-700" :
              selectedArea === "Vigilantes" ? "from-red-600 to-red-700" : "from-green-600 to-green-700",
    light: selectedArea === "Operaciones" ? "bg-blue-50" :
           selectedArea === "Lavado" ? "bg-cyan-50" :
           selectedArea === "Mantenimiento" ? "bg-amber-50" :
           selectedArea === "Remanofactura" ? "bg-emerald-50" :
           selectedArea === "ServiciosGenerales" ? "bg-purple-50" :
           selectedArea === "Vigilantes" ? "bg-red-50" : "bg-green-50"
  }

  // Function to get current quincena
  const getQuincena = () => {
    const today = new Date()
    const day = today.getDate()
    const month = today.getMonth()
    const year = today.getFullYear()
    
    const meses = [
      "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
    ]
    
    const quincena = day <= 15 ? "Q1" : "Q2"
    return `${quincena}_${meses[month]}_${year}`
  }

  // Filter records based on search term and selected type
  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm === "" || 
      record.some(cell => 
        cell?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesType = !selectedType || 
      record[3]?.toString().toUpperCase() === selectedType

    return matchesSearch && matchesType
  })

  const handleSaveData = async () => {
    if (isSaving) return
    
    try {
      setIsSaving(true)
      setAnimationStage("validating")
      setShowAnimation(true)

      // Extract unique employees for validation
      const employees = Array.from(
        new Set(
          records.map(record => ({
            cedula: record[1],
            nombre: record[2]
          }))
        )
      )

      // Validate employees
      const validationResult = await validateEmployeesInMySQL(
        employees.map(e => e.cedula),
        employees.map(e => e.nombre)
      )

      if (!validationResult.isValid) {
        setInvalidEmployees(validationResult.invalidEmployees)
        setShowValidationModal(true)
        return
      }

      setAnimationStage("transferring")

      // Prepare records for database
      const currentDate = new Date()
      const quincena = getQuincena()
      
      const preparedRecords = records.map(record => ({
        FECHA_PROGRAMACION: record[0],
        CEDULA: record[1],
        TIPO_NOVEDAD: record[3],
        FECHA_HORA_EXTRA: record[4] || null,
        HORA_INICIO_FIN: record[5] || null,
        MOTIVO: record[6] || null,
        CEDULA_AUTORIZA: record[8] || null,
        AREA: selectedArea,
        QUINCENA: quincena,
        TIEMPO_DESCONTAR: 0,
        FECHA_CONSULTA: currentDate.toISOString().slice(0, 19).replace('T', ' ')
      }))

      setAnimationStage("saving")

      // Save to database
      const response = await axios.post(
        'https://programacion-areas-khbj.onrender.com/api/save-novedades',
        {
          records: preparedRecords,
          area: selectedArea,
          timestamp: new Date().toISOString()
        }
      )

      if (response.data.success) {
        toast.success('Datos guardados exitosamente')
      } else {
        throw new Error(response.data.error || 'Error al guardar los datos')
      }

    } catch (error: any) {
      console.error('Error saving data:', error)
      toast.error(error.message || 'Error al guardar los datos')
    } finally {
      setIsSaving(false)
      setShowAnimation(false)
    }
  }

  // Calculate statistics
  const stats = {
    totalRecords: records.length,
    uniqueEmployees: new Set(records.map(r => r[1])).size,
    uniqueTypes: new Set(records.map(r => r[3])).size
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100 w-full max-w-[1920px] mx-auto"
    >
      <div className={`${theme.primary} bg-gradient-to-r ${theme.gradient} text-white`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 text-white transition-colors">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h2 className="text-2xl font-bold">Registro de Novedades: {selectedArea}</h2>
            </div>
            <button
              onClick={handleSaveData}
              disabled={isSaving}
              className="flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 transition-colors rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <Database className="animate-spin h-5 w-5 mr-2" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  <span>Guardar Datos</span>
                </>
              )}
            </button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <FileSpreadsheet className="h-5 w-5 mr-2" />
                <span>Total Registros</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.totalRecords}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                <span>Empleados Únicos</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.uniqueEmployees}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <FileEdit className="h-5 w-5 mr-2" />
                <span>Tipos de Novedad</span>
              </div>
              <p className="text-2xl font-bold mt-2">{stats.uniqueTypes}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar..."
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
            </div>
            <div className="relative">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white flex items-center space-x-2 hover:bg-white/20 transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span>Filtrar por Tipo</span>
              </button>
              {isFilterOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-10 p-2">
                  {Object.keys(NOVEDAD_TYPES).map((type) => (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedType(selectedType === type ? null : type)
                        setIsFilterOpen(false)
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg mb-1 last:mb-0 flex items-center justify-between ${
                        selectedType === type ? NOVEDAD_TYPES[type as keyof typeof NOVEDAD_TYPES].color : "hover:bg-gray-100"
                      }`}
                    >
                      <span>{type}</span>
                      {selectedType === type && <ArrowRight className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRecords.map((record, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {record.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {cellIndex === 3 && cell ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        NOVEDAD_TYPES[cell.toString().toUpperCase() as keyof typeof NOVEDAD_TYPES]?.color || "bg-gray-100 text-gray-800"
                      }`}>
                        {cell}
                      </span>
                    ) : (
                      cell
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAnimation && (
          <SaveAnimation
            isVisible={showAnimation}
            area={selectedArea}
            recordCount={records.length}
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
        onClose={() => setShowDateExistModal(false)}
        existingDates={existingDates}
        area={selectedArea}
        onProceed={handleSaveData}
      />
    </motion.div>
  )
}

export default NovedadesTable
export { NovedadesTable }