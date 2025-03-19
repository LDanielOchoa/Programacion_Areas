import * as XLSX from "xlsx"
import type { ExcelData } from "../types"

interface LunchSchedule {
  time: string
  deduction: number
}

// Definición de tipos de novedad con sus colores correspondientes
export const NOVEDAD_TYPES = {
  AUSENCIA: { color: "bg-pink-500 text-white" },
  SUSPENSION: { color: "bg-green-200 text-green-800" },
  "LIC REM": { color: "bg-green-500 text-white" },
  "LIC NO REM": { color: "bg-red-500 text-white" },
  "INC ENF": { color: "bg-blue-300 text-blue-800" },
  "INC ACC": { color: "bg-purple-500 text-white" },
  "CAMBIO TURNO": { color: "bg-yellow-300 text-yellow-800" },
  "HORA EXT NO PROG": { color: "bg-blue-600 text-white" },
}

// Lista de valores especiales para horarios
export const SPECIAL_SHIFTS = [
  "DESCANSO",
  "VACACIONES",
  "SUSPENSION",
  "LIC REM",
  "LIC NO REM",
  "INC ENF",
  "INC ACC",
  "CALAMIDAD",
]

export const parseExcelFile = async (file: File, type: "formato" | "novedades"): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result

        try {
          const workbook = XLSX.read(data, { type: "binary" })

          if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
            reject(new Error("El archivo Excel no contiene hojas de cálculo"))
            return
          }

          // Find the correct sheet based on type
          const sheetName =
            type === "formato"
              ? workbook.SheetNames.find((name) => name.toLowerCase().includes("formato programación"))
              : workbook.SheetNames.find((name) => name.toLowerCase().includes("formato de novedades"))

          const lunchSheet = workbook.SheetNames.find((name) => name.toLowerCase() === "almuerzo")

          if (!sheetName) {
            reject(
              new Error(
                `No se encontró la hoja "${type === "formato" ? "Formato programación" : "Formato de novedades"}" en el archivo`,
              ),
            )
            return
          }

          // Parse lunch schedule if available
          const lunchSchedules: LunchSchedule[] = []
          if (lunchSheet) {
            const lunchWorksheet = workbook.Sheets[lunchSheet]
            const lunchData = XLSX.utils.sheet_to_json(lunchWorksheet, { header: 1, raw: false })

            // Start from row 13 (index 12)
            for (let i = 12; i < lunchData.length; i++) {
              const row = lunchData[i]
              if (row && row[1] && row[2]) {
                lunchSchedules.push({
                  time: row[1].toString(),
                  deduction: Number.parseFloat(row[2].toString()) || 0,
                })
              }
            }
          }

          const worksheet = workbook.Sheets[sheetName]

          if (!worksheet || Object.keys(worksheet).length <= 2) {
            reject(new Error("La hoja de cálculo está vacía"))
            return
          }

          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false })

          if (jsonData.length === 0) {
            reject(new Error("El archivo Excel está vacía"))
            return
          }

          if (type === "formato") {
            return handleFormatType(jsonData, lunchSchedules, resolve, reject)
          } else {
            return handleNovedadesType(jsonData, lunchSchedules, resolve, reject)
          }
        } catch (parseError) {
          reject(new Error("El archivo no es un documento Excel válido o está dañado"))
          return
        }
      } catch (error) {
        reject(new Error("Error al procesar el archivo Excel"))
      }
    }

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo"))
    }

    const timeout = setTimeout(() => {
      reader.abort()
      reject(new Error("El archivo es demasiado grande o complejo para procesarlo"))
    }, 30000)

    reader.onloadend = () => {
      clearTimeout(timeout)
    }

    try {
      reader.readAsBinaryString(file)
    } catch (error) {
      clearTimeout(timeout)
      reject(new Error("No se pudo leer el archivo. Puede estar dañado o ser demasiado grande"))
    }
  })
}

const handleFormatType = (
  jsonData: any[][],
  lunchSchedules: LunchSchedule[],
  resolve: (value: ExcelData) => void,
  reject: (reason: Error) => void,
) => {
  const responsibleName = jsonData[8]?.[2]
  if (!responsibleName) {
    reject(new Error("No se encontró el nombre del responsable en la celda C9"))
    return
  }

  const dateRange = jsonData[9]?.[2]
  if (!dateRange) {
    reject(new Error("No se encontró el rango de fechas en la celda C10"))
    return
  }

  const headers = jsonData[11]?.slice(0, 4)
  if (!headers || headers.length < 4 || headers.some((h) => !h)) {
    reject(new Error("No se encontraron los encabezados correctos en las celdas A12-D12"))
    return
  }

  const dateHeaders = jsonData[11]?.slice(4, 11)
  if (!dateHeaders || dateHeaders.length < 1 || dateHeaders.some((h) => !h)) {
    reject(new Error("No se encontraron las fechas en las celdas E12-K12"))
    return
  }

  const ids = []
  for (let i = 12; i < jsonData.length; i++) {
    if (jsonData[i]?.[1]) {
      ids.push(jsonData[i][1])
    }
  }

  if (ids.length === 0) {
    reject(new Error("No se encontraron cédulas en la columna B"))
    return
  }

  const names = []
  for (let i = 12; i < jsonData.length; i++) {
    if (jsonData[i]?.[2]) {
      names.push(jsonData[i][2])
    }
  }

  if (names.length === 0) {
    reject(new Error("No se encontraron nombres en la columna C"))
    return
  }

  const positions = []
  for (let i = 12; i < jsonData.length; i++) {
    if (jsonData[i]?.[3]) {
      positions.push(jsonData[i][3])
    }
  }

  if (positions.length === 0) {
    reject(new Error("No se encontraron cargos en la columna D"))
    return
  }

  let hasInvalidShift = false
  let invalidShiftCell = ""

  for (let i = 12; i < jsonData.length; i++) {
    for (let j = 4; j < 11; j++) {
      const shift = jsonData[i]?.[j]
      if (shift) {
        const isValidFormat =
          typeof shift === "string" &&
          (SPECIAL_SHIFTS.includes(shift.toUpperCase()) ||
            /^\d{1,2}:\d{2} - \d{1,2}:\d{2}$/.test(shift) ||
            /^(?:\d{1,2}:\d{2} - \d{1,2}:\d{2})(?: \/ (?:\d{1,2}:\d{2} - \d{1,2}:\d{2}))?$/)

        if (!isValidFormat) {
          hasInvalidShift = true
          const col = String.fromCharCode(69 + (j - 4))
          invalidShiftCell = `${col}${i + 1}`
          break
        }
      }
    }
    if (hasInvalidShift) break
  }

  if (hasInvalidShift) {
    reject(
      new Error(
        `Se encontró un turno con formato inválido en la celda ${invalidShiftCell}. El formato debe ser "HH:MM-HH:MM" o uno de los valores especiales como "DESCANSO" o "VACACIONES"`,
      ),
    )
    return
  }

  const processedData = jsonData.map((row, rowIndex) => {
    if (rowIndex < 12) return row

    return row.map((cell, colIndex) => {
      if (colIndex < 4 || !cell) return cell

      const shift = cell.toString()

      if (SPECIAL_SHIFTS.includes(shift.toUpperCase())) {
        return shift
      }

      const matchingSchedule = lunchSchedules.find((schedule) => schedule.time === shift)
      if (matchingSchedule) {
        return `${shift} [${matchingSchedule.deduction}]`
      }

      return shift
    })
  })

  const metadataRow = ["Responsable:", responsibleName, "Fechas:", dateRange, "", "", ""]

  resolve({
    headers: [...headers, ...dateHeaders],
    rows: [metadataRow, ...processedData.slice(12)],
    lunchSchedules,
  })
}

const handleNovedadesType = (
  jsonData: any[][],
  lunchSchedules: LunchSchedule[],
  resolve: (value: ExcelData) => void,
  reject: (reason: Error) => void,
) => {
  // First, find the area and responsible name
  let area = ""
  let responsibleName = ""

  // Look for area in the first 10 rows
  for (let i = 0; i < 10; i++) {
    const row = jsonData[i]
    if (row && row[0] === "Área:" && row[1]) {
      area = row[1]
    }
    if (row && row[0] === "Responsable:" && row[1]) {
      responsibleName = row[1]
    }
  }

  if (!responsibleName) {
    reject(new Error("No se encontró el nombre del responsable en el archivo"))
    return
  }

  if (!area) {
    reject(new Error("No se encontró el área en el archivo"))
    return
  }

  // Define headers for novedades format - asegurando que FECHA HORA EXTRA esté incluido
  const headers = [
    "FECHA PROGRAMACION",
    "CEDULA",
    "NOMBRE",
    "TIPO NOVEDAD",
    "FECHA HORA EXTRA",
    "HORA INICIO Y FIN",
    "MOTIVO",
    "NOMBRE DE QUIEN AUTORIZA",
    "CEDULA DE QUIEN AUTORIZA",
  ]

  // Find the header row (should be around row 9)
  let headerRowIndex = -1
  for (let i = 0; i < jsonData.length; i++) {
    if (
      jsonData[i] &&
      jsonData[i][0] === "FECHA PROGRAMACION" &&
      jsonData[i][1] === "CEDULA" &&
      jsonData[i][2] === "NOMBRE"
    ) {
      headerRowIndex = i
      break
    }
  }

  if (headerRowIndex === -1) {
    reject(new Error("No se encontró la fila de encabezados en el archivo"))
    return
  }

  // Validate data starting after the header row
  const validRows = []
  for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
    const row = jsonData[i]
    if (!row) continue

    // Skip empty rows
    if (!row[0] && !row[1] && !row[2]) continue

    // Validate required fields
    if (!row[0] || !row[1] || !row[2] || !row[3]) {
      reject(new Error(`Datos incompletos en la fila ${i + 1}. Se requieren fecha, cédula, nombre y tipo de novedad.`))
      return
    }

    // Validate date format
    const date = row[0]
    if (!(date instanceof Date) && isNaN(Date.parse(date.toString()))) {
      reject(new Error(`Fecha inválida en la fila ${i + 1}: ${date}`))
      return
    }

    // Validate cédula (should be a number)
    const cedula = row[1]
    if (isNaN(Number(cedula))) {
      reject(new Error(`Cédula inválida en la fila ${i + 1}: ${cedula}`))
      return
    }

    // Validate novedad type - asegurando que sea uno de los tipos definidos
    const novedadType = row[3]?.toString().toUpperCase()
    if (novedadType && !Object.keys(NOVEDAD_TYPES).includes(novedadType)) {
      // No rechazamos, pero podríamos mostrar una advertencia
      console.warn(`Tipo de novedad no reconocido en la fila ${i + 1}: ${novedadType}`)
    }

    // Validate time format if present, allowing special values
    if (row[5]) {
      const timeValue = row[5].toString().toUpperCase()
      const timePattern = /^\d{1,2}:\d{2} - \d{1,2}:\d{2}$/

      if (!SPECIAL_SHIFTS.includes(timeValue) && !timePattern.test(timeValue)) {
        reject(
          new Error(
            `Formato de hora inválido en la fila ${i + 1}. Debe ser "HH:MM - HH:MM" o uno de los valores especiales como "DESCANSO" o "VACACIONES"`,
          ),
        )
        return
      }
    }

    // Add row to valid rows
    validRows.push([
      row[0], // FECHA PROGRAMACION
      row[1], // CEDULA
      row[2], // NOMBRE
      row[3], // TIPO NOVEDAD
      row[4] || "", // FECHA HORA EXTRA
      row[5] || "", // HORA INICIO Y FIN
      row[6] || "", // MOTIVO
      row[7] || "", // NOMBRE DE QUIEN AUTORIZA
      row[8] || "", // CEDULA DE QUIEN AUTORIZA
    ])
  }

  if (validRows.length === 0) {
    reject(new Error("No se encontraron registros válidos en el archivo"))
    return
  }

  // Create metadata row with area and responsible
  const metadataRow = [
    "Área:",
    area,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "Responsable:",
    responsibleName,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
  ]

  resolve({
    headers,
    rows: [metadataRow, ...validRows],
    lunchSchedules,
    novedadTypes: Object.keys(NOVEDAD_TYPES), // Exportamos los tipos de novedad para usar en la visualización
  })
}

