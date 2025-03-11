import React from 'react';
import { motion } from 'framer-motion';
import { FileText,  Clock, Calendar, Users, Briefcase } from 'lucide-react';
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
          border: 'border-blue-200',
          gradient: 'from-blue-500 to-blue-600'
        };
      case 'Lavado': 
        return {
          primary: 'bg-cyan-100 text-cyan-600',
          secondary: 'bg-cyan-500 text-white',
          border: 'border-cyan-200',
          gradient: 'from-cyan-500 to-cyan-600'
        };
      case 'Mantenimiento': 
        return {
          primary: 'bg-amber-100 text-amber-600',
          secondary: 'bg-amber-500 text-white',
          border: 'border-amber-200',
          gradient: 'from-amber-500 to-amber-600'
        };
      case 'Remanofactura': 
        return {
          primary: 'bg-emerald-100 text-emerald-600',
          secondary: 'bg-emerald-500 text-white',
          border: 'border-emerald-200',
          gradient: 'from-emerald-500 to-emerald-600'
        };
      case 'ServiciosGenerales': 
        return {
          primary: 'bg-purple-100 text-purple-600',
          secondary: 'bg-purple-500 text-white',
          border: 'border-purple-200',
          gradient: 'from-purple-500 to-purple-600'
        };
      case 'Vigilantes': 
        return {
          primary: 'bg-red-100 text-red-600',
          secondary: 'bg-red-500 text-white',
          border: 'border-red-200',
          gradient: 'from-red-500 to-red-600'
        };
      default: 
        return {
          primary: 'bg-green-100 text-green-600',
          secondary: 'bg-green-500 text-white',
          border: 'border-green-200',
          gradient: 'from-green-500 to-green-600'
        };
    }
  };

  const colors = getAreaColors();

  // Count unique employees (based on column B - Cédula)
  const countUniqueEmployees = () => {
    if (!data || !data.rows.length) return 0;
    
    // Skip metadata row if it exists
    const startIndex = data.rows[0] && data.rows[0][0] === 'Responsable:' ? 1 : 0;
    
    // Get unique cédulas
    const uniqueCedulas = new Set();
    for (let i = startIndex; i < data.rows.length; i++) {
      const cedula = data.rows[i][1]; // Column B - Cédula
      if (cedula) {
        uniqueCedulas.add(cedula.toString());
      }
    }
    
    return uniqueCedulas.size;
  };

  // Count unique positions (based on column D - Cargo)
  const countUniquePositions = () => {
    if (!data || !data.rows.length) return 0;
    
    // Skip metadata row if it exists
    const startIndex = data.rows[0] && data.rows[0][0] === 'Responsable:' ? 1 : 0;
    
    // Get unique positions
    const uniquePositions = new Set();
    for (let i = startIndex; i < data.rows.length; i++) {
      const position = data.rows[i][3]; // Column D - Cargo
      if (position) {
        uniquePositions.add(position.toString());
      }
    }
    
    return uniquePositions.size;
  };

  // Count total shifts (non-empty cells in columns E-K)
  const countTotalShifts = () => {
    if (!data || !data.rows.length) return 0;
    
    // Skip metadata row if it exists
    const startIndex = data.rows[0] && data.rows[0][0] === 'Responsable:' ? 1 : 0;
    
    let count = 0;
    for (let i = startIndex; i < data.rows.length; i++) {
      for (let j = 4; j < data.headers.length; j++) {
        if (data.rows[i][j]) {
          count++;
        }
      }
    }
    
    return count;
  };

  const stats = [
    {
      title: 'Archivo',
      value: fileName ? fileName.split('.')[0] : 'Sin nombre',
      icon: FileText,
      color: colors.primary,
    },
    {
      title: 'Empleados',
      value: countUniqueEmployees(),
      icon: Users,
      color: colors.primary,
    },
    {
      title: 'Cargos',
      value: countUniquePositions(),
      icon: Briefcase,
      color: colors.primary,
    },
    {
      title: 'Turnos',
      value: countTotalShifts(),
      icon: Clock,
      color: colors.primary,
    },
    {
      title: 'Fecha',
      value: new Date().toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }),
      icon: Calendar,
      color: `bg-gradient-to-r ${colors.gradient} text-white`,
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
          className={`bg-white rounded-xl shadow-md overflow-hidden border ${colors.border} hover:shadow-lg transition-all duration-300 group`}
        >
          <div className={`${stat.color} p-5 flex items-center`}>
            <div className="bg-white/20 w-12 h-12 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm opacity-90">{stat.title}</p>
              <p className="text-lg font-semibold">
                {typeof stat.value === 'number' 
                  ? stat.value.toLocaleString() 
                  : stat.value}
              </p>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50">
            <div className="h-1 w-full bg-gray-200 rounded-full overflow-hidden">
              <motion.div 
                className={`h-full ${stat.color.includes('gradient') ? stat.color : colors.secondary}`}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default StatsCard;