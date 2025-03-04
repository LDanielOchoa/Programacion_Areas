import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  X, 
  AlertTriangle, 
  ArrowRight,
  Activity,
  Droplets,
  Wrench,
  Recycle,
  Building2,
  Shield
} from 'lucide-react';

interface PasswordModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSubmit: (password: string) => void;
  area: {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
  } | null;
  isAuthenticating: boolean;
  error: string;
}

const PasswordModal: React.FC<PasswordModalProps> = ({
  isVisible,
  onClose,
  onSubmit,
  area,
  isAuthenticating,
  error
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.getModifierState('CapsLock')) {
        setCapsLockOn(true);
      } else {
        setCapsLockOn(false);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.getModifierState('CapsLock')) {
        setCapsLockOn(true);
      } else {
        setCapsLockOn(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    // Disable body scrolling when modal is visible
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password) {
      onSubmit(password);
    }
  };

  if (!isVisible || !area) return null;

  const getAreaGradient = () => {
    switch (area.id) {
      case 'Operaciones': return 'from-blue-600 to-blue-500';
      case 'Lavado': return 'from-cyan-600 to-cyan-500';
      case 'Mantenimiento': return 'from-amber-600 to-amber-500';
      case 'Remanofactura': return 'from-emerald-600 to-emerald-500';
      case 'ServiciosGenerales': return 'from-purple-600 to-purple-500';
      case 'Vigilantes': return 'from-red-600 to-red-500';
      default: return 'from-green-600 to-emerald-500';
    }
  };

  const getAreaColor = () => {
    switch (area.id) {
      case 'Operaciones': return 'bg-blue-600 hover:bg-blue-700';
      case 'Lavado': return 'bg-cyan-600 hover:bg-cyan-700';
      case 'Mantenimiento': return 'bg-amber-600 hover:bg-amber-700';
      case 'Remanofactura': return 'bg-emerald-600 hover:bg-emerald-700';
      case 'ServiciosGenerales': return 'bg-purple-600 hover:bg-purple-700';
      case 'Vigilantes': return 'bg-red-600 hover:bg-red-700';
      default: return 'bg-green-600 hover:bg-green-700';
    }
  };

  const getAreaIcon = (iconName: string, size = 24) => {
    switch (iconName) {
      case 'Activity': return <Activity size={size} />;
      case 'Droplets': return <Droplets size={size} />;
      case 'Wrench': return <Wrench size={size} />;
      case 'Recycle': return <Recycle size={size} />;
      case 'Building2': return <Building2 size={size} />;
      case 'Shield': return <Shield size={size} />;
      default: return <Activity size={size} />;
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Full screen backdrop with blur effect */}
          <motion.div 
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <motion.div
              className="w-full max-w-md overflow-hidden rounded-2xl shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`bg-gradient-to-r ${getAreaGradient()} p-6 relative`}>
                <div className="absolute top-4 right-4">
                  <button 
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
                
                <div className="flex items-center">
                  <div className="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center mr-4">
                    {getAreaIcon(area.icon, 32)}
                  </div>
                  <div className="text-white">
                    <h3 className="text-2xl font-bold">{area.name}</h3>
                    <p className="text-white/80">{area.description}</p>
                  </div>
                </div>
                
                <div className="mt-6 bg-white/10 rounded-lg p-4">
                  <div className="flex items-center text-white">
                    <Lock size={18} className="mr-2" />
                    <span>Área protegida - Ingrese su contraseña</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6">
                <form onSubmit={handleSubmit}>
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 border ${error ? 'border-red-300' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-${area.id === 'Operaciones' ? 'blue' : area.id === 'Lavado' ? 'cyan' : area.id === 'Mantenimiento' ? 'amber' : area.id === 'Remanofactura' ? 'emerald' : area.id === 'ServiciosGenerales' ? 'purple' : area.id === 'Vigilantes' ? 'red' : 'green'}-500 transition-colors text-lg`}
                        placeholder="••••••••••••"
                        autoComplete="off"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {capsLockOn && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 flex items-center text-amber-600 text-sm"
                        >
                          <AlertTriangle size={16} className="mr-1" />
                          <span>Bloq Mayús está activado</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <AnimatePresence>
                      {error && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="mt-2 flex items-center text-red-600 text-sm"
                        >
                          <AlertTriangle size={16} className="mr-1" />
                          <span>{error}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isAuthenticating || !password}
                      className={`px-6 py-3 ${getAreaColor()} text-white rounded-lg shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center`}
                    >
                      {isAuthenticating ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Verificando...
                        </>
                      ) : (
                        <>
                          Acceder
                          <ArrowRight size={18} className="ml-2" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PasswordModal;