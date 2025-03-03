import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full py-6 bg-gradient-to-r from-green-600 to-emerald-500 text-white shadow-lg"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center">
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="mr-3 bg-white/20 p-2 rounded-lg"
          >
            <Leaf size={28} />
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Sistema Alimentador Oriental 6</h1>
            <p className="text-green-100 text-sm">Visualizador de datos por departamento</p>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;