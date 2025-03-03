import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Rows, Columns, Database, Clock } from 'lucide-react';
import { ExcelData, AreaType } from '../types';

interface StatsCardProps {
  data: ExcelData | null;
  fileName: string | null;
  selectedArea: AreaType;
}

const StatsCard: React.FC<StatsCardProps> = ({ data, fileName, selectedArea }) => {
  if (!data) return null;

  const getAreaColors = () => {
    switch (selectedArea) {
      case 'Operaciones': 
        return {
          primary: 'bg-blue-100 text-blue-600',
          secondary: 'bg-blue-500 text-white',
          border: 'border-blue-200'
        };
      case 'Lavado': 
        return {
          primary: 'bg-cyan-100 text-cyan-600',
          secondary: 'bg-cyan-500 text-white',
          border: 'border-cyan-200'
        };
      case 'Mantenimiento': 
        return {
          primary: 'bg-amber-100 text-amber-600',
          secondary: 'bg-amber-500 text-white',
          border: 'border-amber-200'
        };
      case 'Remanofactura': 
        return {
          primary: 'bg-emerald-100 text-emerald-600',
          secondary: 'bg-emerald-500 text-white',
          border: 'border-emerald-200'
        };
      case 'ServiciosGenerales': 
        return {
          primary: 'bg-purple-100 text-purple-600',
          secondary: 'bg-purple-500 text-white',
          border: 'border-purple-200'
        };
      case 'Vigilantes': 
        return {
          primary: 'bg-red-100 text-red-600',
          secondary: 'bg-red-500 text-white',
          border: 'border-red-200'
        };
      default: 
        return {
          primary: 'bg-green-100 text-green-600',
          secondary: 'bg-green-500 text-white',
          border: 'border-green-200'
        };
    }
  };

  const colors = getAreaColors();

  const stats = [
    {
      title: 'Archivo',
      value: fileName || 'Sin nombre',
      icon: FileText,
      color: colors.primary,
    },
    {
      title: 'Filas',
      value: data.rows.length,
      icon: Rows,
      color: colors.primary,
    },
    {
      title: 'Columnas',
      value: data.headers.length,
      icon: Columns,
      color: colors.primary,
    },
    {
      title: 'Celdas',
      value: data.rows.length * data.headers.length,
      icon: Database,
      color: colors.primary,
    },
    {
      title: 'Fecha',
      value: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      icon: Clock,
      color: colors.secondary,
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1,
            type: "spring",
            stiffness: 200
          }}
          className={`bg-white rounded-xl shadow-md p-5 border ${colors.border} hover:shadow-lg transition-shadow duration-300`}
        >
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mr-3`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <p className="text-lg font-semibold text-gray-800">
                {typeof stat.value === 'number' 
                  ? stat.value.toLocaleString() 
                  : stat.value}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCard;