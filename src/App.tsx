import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileUploader, DataTable, Header, StatsCard, WelcomeScreen } from './components';
import { parseExcelFile } from './utils/excelParser';
import { ExcelData, AreaType } from './types';
import { Loader2, AlertTriangle } from 'lucide-react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const [excelData, setExcelData] = useState<ExcelData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<AreaType | null>(null);
  const [step, setStep] = useState<'welcome' | 'upload' | 'results'>('welcome');
  const [theme, setTheme] = useState<string>('green');

  // Set theme based on selected area
  useEffect(() => {
    if (selectedArea) {
      switch (selectedArea) {
        case 'Operaciones':
          setTheme('blue');
          break;
        case 'Lavado':
          setTheme('cyan');
          break;
        case 'Mantenimiento':
          setTheme('amber');
          break;
        case 'Remanofactura':
          setTheme('emerald');
          break;
        case 'ServiciosGenerales':
          setTheme('purple');
          break;
        case 'Vigilantes':
          setTheme('red');
          break;
        default:
          setTheme('green');
      }
    }
  }, [selectedArea]);

  const handleSelectArea = (area: string) => {
    setSelectedArea(area as AreaType);
    setStep('upload');
    // Reset any previous data
    setExcelData(null);
    setFileName(null);
    setError(null);
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError(null);
    setExcelData(null);
    setFileName(file.name);
    
    try {
      const data = await parseExcelFile(file);
      setExcelData(data);
      setStep('results');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToWelcome = () => {
    setStep('welcome');
    setSelectedArea(null);
    setExcelData(null);
    setFileName(null);
    setError(null);
  };

  const handleBackToUpload = () => {
    setStep('upload');
    setExcelData(null);
    setFileName(null);
    setError(null);
  };

  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  const pageTransition = {
    type: "tween",
    ease: "anticipate",
    duration: 0.5
  };

  // Get theme-specific gradient
  const getThemeGradient = () => {
    switch (theme) {
      case 'blue':
        return 'from-blue-600 to-blue-500';
      case 'cyan':
        return 'from-cyan-600 to-cyan-500';
      case 'amber':
        return 'from-amber-600 to-amber-500';
      case 'emerald':
        return 'from-emerald-600 to-emerald-500';
      case 'purple':
        return 'from-purple-600 to-purple-500';
      case 'red':
        return 'from-red-600 to-red-500';
      default:
        return 'from-green-600 to-emerald-500';
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-b from-${theme}-50 to-white flex flex-col`}>
      <ToastContainer position="top-right" autoClose={5000} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
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

          {step === 'upload' && selectedArea && (
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
                    <div className={`flex items-center space-x-3 text-${theme}-600 bg-${theme}-50 px-6 py-4 rounded-lg shadow-md`}>
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
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="mt-8"
                  >
                    <div className="p-5 bg-red-50 border border-red-200 rounded-lg shadow-md">
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

          {step === 'results' && excelData && selectedArea && (
            <motion.div
              key="results"
              initial="initial"
              animate="in"
              exit="out"
              variants={pageVariants}
              transition={pageTransition}
              className="max-w-6xl mx-auto"
            >
              <StatsCard 
                data={excelData} 
                fileName={fileName} 
                selectedArea={selectedArea} 
              />
              <DataTable 
                data={excelData} 
                selectedArea={selectedArea}
                onBack={handleBackToUpload}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      <footer className={`bg-gradient-to-r ${getThemeGradient()} py-6 text-white shadow-inner`}>
        <div className="container mx-auto px-4 text-center">
          <p className="font-medium">Sistema Alimentador Oriental 6 &copy; {new Date().getFullYear()}</p>
          <p className="text-sm text-white/80 mt-1">Desarrollado con tecnología avanzada</p>
        </div>
      </footer>
    </div>
  );
}

export default App;