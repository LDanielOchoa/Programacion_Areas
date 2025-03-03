import React from 'react';
import { motion } from 'framer-motion';
import { AreaOption } from '../types';
import { FileSpreadsheet, Droplets, Wrench, Recycle, Building2, Shield, Activity } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectArea: (area: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectArea }) => {
  const areas: AreaOption[] = [
    {
      id: 'Operaciones',
      name: 'Operaciones',
      icon: 'Activity',
      description: 'Gestión de operaciones diarias',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'Lavado',
      name: 'Lavado',
      icon: 'Droplets',
      description: 'Control de procesos de lavado',
      color: 'from-cyan-500 to-cyan-600'
    },
    {
      id: 'Mantenimiento',
      name: 'Mantenimiento',
      icon: 'Wrench',
      description: 'Mantenimiento de equipos e instalaciones',
      color: 'from-amber-500 to-amber-600'
    },
    {
      id: 'Remanofactura',
      name: 'Remanofactura',
      icon: 'Recycle',
      description: 'Procesos de remanufactura y reciclaje',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      id: 'ServiciosGenerales',
      name: 'Servicios Generales',
      icon: 'Building2',
      description: 'Administración de servicios generales',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'Vigilantes',
      name: 'Vigilantes',
      icon: 'Shield',
      description: 'Control de seguridad y vigilancia',
      color: 'from-red-500 to-red-600'
    }
  ];

  const getIcon = (iconName: string, size = 24) => {
    switch (iconName) {
      case 'Activity': return <Activity size={size} />;
      case 'Droplets': return <Droplets size={size} />;
      case 'Wrench': return <Wrench size={size} />;
      case 'Recycle': return <Recycle size={size} />;
      case 'Building2': return <Building2 size={size} />;
      case 'Shield': return <Shield size={size} />;
      default: return <FileSpreadsheet size={size} />;
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } }
  };

  return (
    <div className="py-10 px-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-green-800 mb-4">Bienvenido al Sistema</h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Selecciona el área para la que deseas cargar y visualizar datos
        </p>
        <p className="text-md text-green-600 mt-4 max-w-2xl mx-auto">
          Bienvenido, esperamos que disfrutes este espacio de gestión de programación de turnos
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto"
      >
        {areas.map((area) => (
          <motion.div
            key={area.id}
            variants={item}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectArea(area.id)}
            className={`bg-gradient-to-br ${area.color} text-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:shadow-xl`}
          >
            <div className="bg-white/20 w-14 h-14 rounded-full flex items-center justify-center mb-4">
              {getIcon(area.icon, 28)}
            </div>
            <h3 className="text-xl font-bold mb-2">{area.name}</h3>
            <p className="text-white/80 text-sm">{area.description}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        className="text-center mt-16 text-green-700 font-medium"
      >
        <p>Sistema Alimentador Oriental 6</p>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;