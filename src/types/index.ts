export interface ExcelData {
  headers: string[];
  rows: any[][];
  lunchSchedules?: {
    time: string;
    deduction: number;
  }[];
}

export interface FileWithPreview extends File {
  preview?: string;
}

export type AreaType = 'Operaciones' | 'Lavado' | 'Mantenimiento' | 'Remanofactura' | 'ServiciosGenerales' | 'Vigilantes';

export interface AreaOption {
  id: AreaType;
  name: string;
  icon: string;
  description: string;
  color: string;
  password?: string;
}

export interface DatabaseRecord {
  CEDULA: string | number;
  Fecha_programacion: string;
  Horario_programacion: string | number;
  Area: string;
  Tiempo_a_descontar: number;
  Quincena: string;
  clasificacion: string;
  fecha_consulta: string;
}