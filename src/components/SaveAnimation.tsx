import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Server, 
  ArrowUpDown, 
  Loader2, 
  Shield, 
  UploadCloud, 
  DownloadCloud, 
  HardDrive, 
  Cpu, 
  Check, 
  Zap, 
  Calendar, 
  User, 
  Clock, 
  Database, 
  FileSpreadsheet 
} from 'lucide-react';

interface SaveAnimationProps {
  isVisible: boolean;
  area: string;
  recordCount: number;
  stage: 'validating' | 'transferring' | 'saving';
}

type ProcessStage = 'validating' | 'transferring' | 'saving' | 'complete' | 'error';
type DataPacket = {
  id: number;
  direction: 'up' | 'down';
  position: number;
  size?: number;
  speed?: number;
  color?: string;
};

const SaveAnimation: React.FC<SaveAnimationProps> = ({
  isVisible,
  area,
  recordCount,
  stage: initialStage,
}) => {
  const [stage, setStage] = useState<ProcessStage>(initialStage);
  const [progress, setProgress] = useState(0);
  const [validatedItems, setValidatedItems] = useState<number[]>([]);
  const [validatingItem, setValidatingItem] = useState<number | null>(null);
  const [serverConnection, setServerConnection] = useState(0);
  const [dataPackets, setDataPackets] = useState<DataPacket[]>([]);
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; opacity: number }[]>([]);
  const [showSuccessEffect, setShowSuccessEffect] = useState(false);
  const [dbAnimation, setDbAnimation] = useState<'idle' | 'receiving' | 'processing' | 'complete'>('idle');

  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const packetIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const particleIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const serverControls = useAnimation();
  const clientControls = useAnimation();
  const successControls = useAnimation();

  // Disable body scrolling when animation is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible]);

  // Limpiar todos los intervalos y timeouts
  const cleanupAnimations = () => {
    if (animationRef.current) clearInterval(animationRef.current);
    if (packetIntervalRef.current) clearInterval(packetIntervalRef.current);
    if (particleIntervalRef.current) clearInterval(particleIntervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  // Update stage when prop changes
  useEffect(() => {
    setStage(initialStage);
  }, [initialStage]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupAnimations();
    };
  }, []);

  // Generate particles effect - optimizado para mejor rendimiento
  useEffect(() => {
    if (!isVisible || (stage !== 'transferring' && stage !== 'saving')) return;

    // Limpiar intervalo anterior
    if (particleIntervalRef.current) {
      clearInterval(particleIntervalRef.current);
    }

    const createParticles = () => {
      // Limitar la cantidad de partículas según el rendimiento del dispositivo
      const count = Math.min(2, Math.floor(Math.random() * 3) + 1);
      
      const newParticles = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1, // Reducido el tamaño para mejor rendimiento
        opacity: Math.random() * 0.5 + 0.3, // Reducida la opacidad
      }));

      setParticles((prev) => [...prev, ...newParticles].slice(-30)); // Reducido a 30 partículas máximo
    };

    particleIntervalRef.current = setInterval(createParticles, 300); // Aumentado el intervalo para mejor rendimiento

    return () => {
      if (particleIntervalRef.current) clearInterval(particleIntervalRef.current);
    };
  }, [isVisible, stage]);

  // Main animation sequence - optimizado
  useEffect(() => {
    if (!isVisible) return;

    // Limpiar animaciones anteriores
    cleanupAnimations();

    const runAnimation = () => {
      // Reset state when animation starts
      setProgress(0);
      setValidatedItems([]);
      setValidatingItem(null);
      setServerConnection(0);
      setDataPackets([]);
      setParticles([]);
      setShowSuccessEffect(false);
      setDbAnimation('idle');

      // Validation stage
      const validateItems = () => {
        let currentProgress = 0;
        let validatedCount = 0;
        let currentValidating = 1;
        
        // Usar un intervalo más eficiente
        const interval = setInterval(() => {
          // Incremento más rápido para mejor UX
          currentProgress += 2;
          setProgress(Math.min(currentProgress, 100));

          // Animar validación de elementos de forma más eficiente
          if (currentProgress % 10 === 0 && currentValidating <= Math.min(recordCount, 20)) {
            setValidatingItem(currentValidating);
            
            // Validar más rápido
            setTimeout(() => {
              if (validatedCount < Math.min(recordCount, 20)) {
                validatedCount++;
                setValidatedItems(prev => [...prev, currentValidating]);
                currentValidating++;
              }
            }, 200);
          }

          // Cuando la validación alcanza el 100%
          if (currentProgress >= 100) {
            clearInterval(interval);
            setValidatingItem(null);
            
            // Pasar a la etapa de transferencia más rápido
            setTimeout(() => {
              setStage('transferring');
              startServerConnection();
            }, 300);
          }
        }, 30); // Intervalo más rápido

        return interval;
      };

      // Server connection animation - optimizado
      const startServerConnection = () => {
        setProgress(0);
        let connectionStrength = 0;

        // Animación de pulso para el cliente - más eficiente
        clientControls.start({
          scale: [1, 1.03, 1],
          boxShadow: [
            '0 0 0 rgba(59, 130, 246, 0)',
            '0 0 15px rgba(59, 130, 246, 0.4)',
            '0 0 0 rgba(59, 130, 246, 0)'
          ],
          transition: { duration: 1, repeat: 1, repeatType: 'reverse' },
        });

        // Conexión más rápida
        const interval = setInterval(() => {
          connectionStrength += 8;
          setServerConnection(connectionStrength > 100 ? 100 : connectionStrength);

          if (connectionStrength >= 100) {
            clearInterval(interval);
            startDataTransfer('up');
          }
        }, 40);

        return interval;
      };

      // Data transfer animation - optimizado
      const startDataTransfer = (direction: 'up' | 'down') => {
        setProgress(0);
        
        if (direction === 'up') {
          setDbAnimation('receiving');
        } else {
          setDbAnimation('processing');
        }

        // Animación de pulso para el servidor - más eficiente
        serverControls.start({
          scale: [1, 1.03, 1],
          boxShadow: [
            '0 0 0 rgba(59, 130, 246, 0)',
            '0 0 15px rgba(59, 130, 246, 0.4)',
            '0 0 0 rgba(59, 130, 246, 0)'
          ],
          transition: { duration: 0.8, repeat: 3, repeatType: 'reverse' },
        });

        // Crear paquetes de datos con propiedades variadas - más eficiente
        if (packetIntervalRef.current) {
          clearInterval(packetIntervalRef.current);
        }
        
        packetIntervalRef.current = setInterval(() => {
          setDataPackets((prev) => {
            // Eliminar paquetes que han completado su recorrido
            const filtered = prev.filter(
              (p) => (direction === 'up' && p.position < 100) || (direction === 'down' && p.position > 0)
            );

            // Limitar el número de paquetes para mejor rendimiento
            if (filtered.length >= 10) {
              return filtered;
            }

            // Añadir nuevo paquete con propiedades aleatorias
            const theme = getTheme();
            const colors = [theme.primary, theme.secondary, theme.accent];

            return [
              ...filtered,
              {
                id: Date.now(),
                direction,
                position: direction === 'up' ? 0 : 100,
                size: Math.random() * 2 + 2, // Tamaño más consistente
                speed: Math.random() * 2 + 4, // Velocidad más rápida
                color: colors[Math.floor(Math.random() * colors.length)],
              },
            ];
          });
        }, 250);

        // Progreso de la transferencia - más eficiente
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 1.2; // Más rápido

            // Cuando la carga se completa
            if (newProgress >= 100 && direction === 'up') {
              clearInterval(progressIntervalRef.current!);
              if (packetIntervalRef.current) clearInterval(packetIntervalRef.current);

              // Detener animación de pulso del servidor
              serverControls.stop();

              // Pasar al procesamiento del servidor
              setTimeout(() => {
                setDbAnimation('processing');
                setStage('saving');
                startProcessing();
              }, 300);
            }

            // Cuando la descarga se completa
            if (newProgress >= 100 && direction === 'down') {
              clearInterval(progressIntervalRef.current!);
              if (packetIntervalRef.current) clearInterval(packetIntervalRef.current);

              // Detener animación de pulso del servidor
              serverControls.stop();

              // Completar el proceso
              setTimeout(() => {
                setDbAnimation('complete');
                setStage('complete');
                setShowSuccessEffect(true);

                // Animación de éxito
                successControls.start({
                  scale: [0, 1.1, 1],
                  opacity: [0, 1],
                  transition: { duration: 0.4, type: 'spring' },
                });
              }, 300);
            }

            return newProgress > 100 ? 100 : newProgress;
          });
        }, 40);

        return progressIntervalRef.current;
      };

      // Server processing animation - optimizado
      const startProcessing = () => {
        setProgress(0);

        // Animación de pulso para el servidor durante el procesamiento - más eficiente
        serverControls.start({
          scale: [1, 1.05, 1],
          boxShadow: [
            '0 0 0 rgba(245, 158, 11, 0)',
            '0 0 20px rgba(245, 158, 11, 0.5)',
            '0 0 0 rgba(245, 158, 11, 0)'
          ],
          transition: { duration: 1, repeat: 2, repeatType: 'reverse' },
        });

        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
        
        progressIntervalRef.current = setInterval(() => {
          setProgress((prev) => {
            const newProgress = prev + 0.8; // Más rápido

            if (newProgress >= 100) {
              clearInterval(progressIntervalRef.current!);

              // Pasar a la etapa de descarga
              setTimeout(() => {
                serverControls.stop();
                startDataTransfer('down');
              }, 300);
            }

            return newProgress > 100 ? 100 : newProgress;
          });
        }, 25);

        return progressIntervalRef.current;
      };

      // Iniciar la secuencia de animación según la etapa actual
      if (stage === 'validating') {
        animationRef.current = validateItems();
      } else if (stage === 'transferring') {
        animationRef.current = startServerConnection();
      } else if (stage === 'saving') {
        setDbAnimation('processing');
        animationRef.current = startProcessing();
      }
    };

    runAnimation();

    // Función de limpieza
    return () => {
      cleanupAnimations();
    };
  }, [isVisible, recordCount, stage, clientControls, serverControls, successControls]);

  // Update data packet positions - optimizado
  useEffect(() => {
    if (dataPackets.length === 0) return;

    const interval = setInterval(() => {
      setDataPackets((prev) =>
        prev.map((packet) => ({
          ...packet,
          position:
            packet.direction === 'up' 
              ? packet.position + (packet.speed || 5) 
              : packet.position - (packet.speed || 5),
        }))
      );
    }, 40); // Más rápido

    return () => clearInterval(interval);
  }, [dataPackets]);

  // Get area-specific colors
  const getAreaColors = () => {
    switch (area) {
      case 'Operaciones': 
        return {
          primary: '#3b82f6', // blue-500
          secondary: '#93c5fd', // blue-300
          accent: '#1d4ed8', // blue-700
        };
      case 'Lavado': 
        return {
          primary: '#06b6d4', // cyan-500
          secondary: '#67e8f9', // cyan-300
          accent: '#0e7490', // cyan-700
        };
      case 'Mantenimiento': 
        return {
          primary: '#f59e0b', // amber-500
          secondary: '#fcd34d', // amber-300
          accent: '#b45309', // amber-700
        };
      case 'Remanofactura': 
        return {
          primary: '#10b981', // emerald-500
          secondary: '#6ee7b7', // emerald-300
          accent: '#047857', // emerald-700
        };
      case 'ServiciosGenerales': 
        return {
          primary: '#8b5cf6', // purple-500
          secondary: '#c4b5fd', // purple-300
          accent: '#6d28d9', // purple-700
        };
      case 'Vigilantes': 
        return {
          primary: '#ef4444', // red-500
          secondary: '#fca5a5', // red-300
          accent: '#b91c1c', // red-700
        };
      default: 
        return {
          primary: '#10b981', // emerald-500
          secondary: '#6ee7b7', // emerald-300
          accent: '#047857', // emerald-700
        };
    }
  };

  // Color theme based on current stage
  const getTheme = () => {
    const areaColors = getAreaColors();
    
    switch (stage) {
      case 'validating':
        return { 
          primary: areaColors.primary, 
          secondary: areaColors.secondary, 
          accent: areaColors.accent 
        };
      case 'transferring':
        return { 
          primary: areaColors.primary, 
          secondary: areaColors.secondary, 
          accent: areaColors.accent 
        };
      case 'saving':
        return { 
          primary: areaColors.primary, 
          secondary: areaColors.secondary, 
          accent: areaColors.accent 
        };
      case 'complete':
        return { 
          primary: '#10b981', // emerald-500
          secondary: '#6ee7b7', // emerald-300
          accent: '#047857', // emerald-700
        };
      case 'error':
        return { 
          primary: '#ef4444', // red-500
          secondary: '#fca5a5', // red-300
          accent: '#b91c1c', // red-700
        };
      default:
        return { 
          primary: areaColors.primary, 
          secondary: areaColors.secondary, 
          accent: areaColors.accent 
        };
    }
  };

  const theme = getTheme();

  // Get stage information
  const getStageInfo = () => {
    switch (stage) {
      case 'validating':
        return {
          title: 'Validando empleados',
          description: 'Verificando que todos los empleados existan en el sistema...',
          icon: Shield,
        };
      case 'transferring':
        return {
          title: 'Preparando datos',
          description: 'Preparando los registros para su almacenamiento...',
          icon: UploadCloud,
        };
      case 'saving':
        return {
          title: 'Guardando datos',
          description: 'Guardando los registros en la base de datos del Sistema Alimentador...',
          icon: Database,
        };
      case 'complete':
        return {
          title: 'Proceso completado',
          description: 'Todos los registros han sido guardados correctamente.',
          icon: CheckCircle,
        };
      case 'error':
        return {
          title: 'Error en el proceso',
          description: 'Se encontraron errores que impiden continuar.',
          icon: XCircle,
        };
      default:
        return {
          title: 'Procesando datos',
          description: 'Por favor espere mientras se procesan los datos...',
          icon: Loader2,
        };
    }
  };

  const stageInfo = getStageInfo();
  const StageIcon = stageInfo.icon;

  // Database animation based on state
  const renderDatabaseAnimation = () => {
    switch (dbAnimation) {
      case 'receiving':
        return (
          <motion.div
            className="absolute inset-0 bg-blue-500/20 rounded-xl"
            animate={{ opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
          />
        );
      case 'processing':
        return (
          <motion.div
            className="absolute inset-0 bg-amber-500/20 rounded-xl"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
          />
        );
      case 'complete':
        return (
          <motion.div
            className="absolute inset-0 bg-green-500/20 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
          />
        );
      default:
        return null;
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Full screen backdrop with blur effect */}
      <motion.div 
        className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <motion.div
          className="w-full max-w-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Main container with glass effect */}
          <div className="relative overflow-hidden rounded-2xl backdrop-blur-xl bg-white/95 shadow-2xl border border-white/20">
            {/* Decorative elements - reducidos para mejor rendimiento */}
            <div
              className="absolute -top-20 -right-20 w-48 h-48 rounded-full opacity-20 blur-2xl"
              style={{ background: `radial-gradient(circle, ${theme.secondary} 0%, ${theme.primary} 70%)` }}
            ></div>
            <div
              className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full opacity-15 blur-2xl"
              style={{ background: `radial-gradient(circle, ${theme.secondary} 0%, ${theme.primary} 70%)` }}
            ></div>

            <div className="relative z-10 p-6">
              {/* Header with stage info */}
              <div className="flex flex-col items-center mb-6">
                <motion.div
                  className="flex items-center justify-center w-16 h-16 rounded-full mb-3"
                  style={{ backgroundColor: `${theme.primary}20` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                >
                  <motion.div
                    animate={stage !== "complete" && stage !== "error" ? { rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                  >
                    <StageIcon size={32} style={{ color: theme.primary }} />
                  </motion.div>
                </motion.div>

                <motion.h2
                  className="text-xl font-bold text-gray-800 mb-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {stageInfo.title}
                </motion.h2>

                <motion.p
                  className="text-gray-600 text-center text-sm max-w-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {stageInfo.description}
                </motion.p>
              </div>

              {/* Progress visualization */}
              <div className="mb-6">
                {/* Progress bar */}
                <motion.div
                  className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden mb-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <motion.div
                    className="h-full rounded-full relative overflow-hidden"
                    style={{ backgroundColor: theme.primary }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Animated shine effect */}
                    <motion.div
                      className="absolute inset-0 w-16 h-full bg-white/30 skew-x-12"
                      animate={{ x: [-80, 400] }}
                      transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.8 }}
                    />
                  </motion.div>
                </motion.div>

                {/* Progress percentage */}
                <motion.div
                  className="text-right text-xs text-gray-600"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  {Math.round(progress)}% completado
                </motion.div>
              </div>

              {/* Validation stage visualization - optimizado */}
              <AnimatePresence>
                {stage === "validating" && (
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-base font-medium text-gray-800 mb-2">Validación de empleados</h3>
                    <div className="grid grid-cols-5 gap-1.5">
                      {Array.from({ length: Math.min(recordCount, 20) }, (_, i) => (
                        <motion.div
                          key={`item-${i}`}
                          className="aspect-square rounded-lg flex items-center justify-center relative overflow-hidden"
                          style={{
                            backgroundColor: validatedItems.includes(i + 1)
                              ? `${theme.primary}20`
                              : "rgba(226, 232, 240, 0.5)",
                            border: validatingItem === i + 1 ? `2px solid ${theme.primary}` : "none",
                          }}
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{
                            scale: 1,
                            opacity: 1,
                            boxShadow:
                              validatingItem === i + 1
                                ? [
                                    `0 0 0 rgba(${theme.primary}, 0)`,
                                    `0 0 8px rgba(${theme.primary}, 0.4)`,
                                    `0 0 0 rgba(${theme.primary}, 0)`,
                                  ]
                                : "none",
                          }}
                          transition={{
                            delay: 0.6 + i * 0.03, // Más rápido
                            boxShadow: { duration: 0.8, repeat: Number.POSITIVE_INFINITY },
                          }}
                        >
                          {validatingItem === i + 1 && (
                            <motion.div
                              className="absolute inset-0 bg-blue-500/10"
                              animate={{ opacity: [0.1, 0.2, 0.1] }}
                              transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY }}
                            />
                          )}

                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{
                              scale: validatedItems.includes(i + 1) ? 1 : 0,
                            }}
                            transition={{ type: "spring", damping: 10 }}
                          >
                            {validatedItems.includes(i + 1) ? (
                              <Check size={16} style={{ color: theme.primary }} />
                            ) : (
                              <User size={16} style={{ color: theme.primary }} />
                            )}
                          </motion.div>

                          <div
                            className="absolute bottom-0.5 right-0.5 text-xs font-medium"
                            style={{ color: theme.primary }}
                          >
                            {i + 1}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    
                    {recordCount > 20 && (
                      <div className="text-center mt-2 text-xs text-gray-500">
                        Mostrando 20 de {recordCount} empleados
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Server connection visualization - optimizado */}
              <AnimatePresence>
                {(stage === "transferring" || stage === "saving") && (
                  <motion.div
                    className="mb-6"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="relative h-48 rounded-xl overflow-hidden bg-gray-100 p-3">
                      {/* Background particles - reducidos para mejor rendimiento */}
                      {particles.slice(0, 15).map((particle) => (
                        <motion.div
                          key={particle.id}
                          className="absolute rounded-full"
                          style={{
                            width: `${particle.size}px`,
                            height: `${particle.size}px`,
                            backgroundColor: theme.primary,
                            opacity: particle.opacity,
                            left: `${particle.x}%`,
                            top: `${particle.y}%`,
                          }}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.4 }}
                        />
                      ))}

                      {/* Client side */}
                      <motion.div
                        className="absolute left-5 top-1/2 -translate-y-1/2 w-28 h-28 rounded-xl bg-white shadow-md flex flex-col items-center justify-center"
                        animate={clientControls}
                      >
                        <div className="relative">
                          <FileSpreadsheet size={28} className="text-gray-600 mb-1.5" />
                          <div className="text-sm font-medium text-gray-700">Excel</div>

                          {/* Animated data glow effect - reducido */}
                          <motion.div
                            className="absolute -inset-1 rounded-full bg-blue-500/20 z-0"
                            animate={{
                              scale: [1, 1.1, 1],
                              opacity: [0.2, 0.3, 0.2],
                            }}
                            transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
                          />
                        </div>

                        {/* Small animated icons around client - reducidos */}
                        <motion.div
                          className="absolute -top-1.5 -right-1.5 bg-white rounded-full p-1 shadow-sm"
                          animate={{
                            y: [0, -3, 0],
                            rotate: [0, 8, 0],
                          }}
                          transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                        >
                          <User size={12} style={{ color: theme.primary }} />
                        </motion.div>

                        <motion.div
                          className="absolute -bottom-1.5 -left-1.5 bg-white rounded-full p-1 shadow-sm"
                          animate={{
                            y: [0, 3, 0],
                            rotate: [0, -8, 0],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            delay: 0.4,
                          }}
                        >
                          <Clock size={12} style={{ color: theme.primary }} />
                        </motion.div>
                      </motion.div>

                      {/* Server side */}
                      <motion.div
                        className="absolute right-5 top-1/2 -translate-y-1/2 w-28 h-28 rounded-xl bg-white shadow-md flex flex-col items-center justify-center overflow-hidden"
                        animate={serverControls}
                      >
                        <div className="relative z-10">
                          <Database size={28} className="text-gray-600 mb-1.5" />
                          <div className="text-sm font-medium text-gray-700">Base de Datos</div>
                        </div>

                        {/* Database animation */}
                        {renderDatabaseAnimation()}

                        {/* Small animated icons around server - reducidos */}
                        <motion.div
                          className="absolute -top-1.5 -left-1.5 bg-white rounded-full p-1 shadow-sm"
                          animate={{
                            y: [0, -3, 0],
                            rotate: [0, -8, 0],
                          }}
                          transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
                        >
                          <HardDrive size={12} style={{ color: theme.accent }} />
                        </motion.div>

                        <motion.div
                          className="absolute -bottom-1.5 -right-1.5 bg-white rounded-full p-1 shadow-sm"
                          animate={{
                            y: [0, 3, 0],
                            rotate: [0, 8, 0],
                          }}
                          transition={{
                            duration: 2.6,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            delay: 0.6,
                          }}
                        >
                          <Cpu size={12} style={{ color: theme.accent }} />
                        </motion.div>
                      </motion.div>

                      {/* Connection line */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full relative overflow-hidden"
                          style={{ backgroundColor: theme.primary }}
                          initial={{ width: "0%" }}
                          animate={{ width: `${serverConnection}%` }}
                          transition={{ duration: 0.4 }}
                        >
                          {/* Animated shine effect */}
                          <motion.div
                            className="absolute inset-0 w-8 h-full bg-white/30 skew-x-12"
                            animate={{ x: [-16, 48] }}
                            transition={{ duration: 0.7, repeat: Number.POSITIVE_INFINITY, repeatDelay: 0.4 }}
                          />
                        </motion.div>
                      </div>

                      {/* Data packets - reducidos y optimizados */}
                      {dataPackets.slice(0, 8).map((packet) => (
                        <motion.div
                          key={packet.id}
                          className="absolute top-1/2 -translate-y-1/2 rounded-md flex items-center justify-center"
                          style={{
                            backgroundColor: packet.color || theme.primary,
                            width: `${(packet.size || 3) * 3}px`,
                            height: `${(packet.size || 3) * 3}px`,
                            left: `calc(30% + ${packet.position * 0.4}%)`,
                            opacity: Math.min(1, Math.max(0.3, 1 - Math.abs(packet.position - 50) / 50)),
                          }}
                          initial={{ scale: 0, rotate: 0 }}
                          animate={{
                            scale: 1,
                            rotate: packet.direction === "up" ? 45 : -45,
                          }}
                          exit={{ scale: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Zap size={8} className="text-white" />
                        </motion.div>
                      ))}

                      {/* Direction indicator */}
                      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-full p-1.5 shadow-md z-10">
                        <ArrowUpDown size={16} style={{ color: theme.primary }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Completion message - optimizado */}
              <AnimatePresence>
                {stage === "complete" && (
                  <motion.div
                    className="mb-6 p-5 rounded-xl relative overflow-hidden"
                    style={{ backgroundColor: `${theme.primary}15` }}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", damping: 15 }}
                  >
                    {/* Success animation - simplificada */}
                    {showSuccessEffect && (
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-green-500/10"
                          animate={{
                            scale: [1, 1.1, 1],
                            opacity: [0.1, 0.2, 0.1],
                          }}
                          transition={{ duration: 1.8, repeat: Number.POSITIVE_INFINITY }}
                        />

                        <motion.div animate={successControls} className="relative">
                          <div className="absolute -inset-3">
                            <motion.div
                              className="w-full h-full rounded-full bg-green-500/20"
                              animate={{
                                scale: [1, 1.4],
                                opacity: [0.3, 0],
                              }}
                              transition={{ duration: 1.2, repeat: Number.POSITIVE_INFINITY }}
                            />
                          </div>
                        </motion.div>
                      </motion.div>
                    )}

                    <div className="flex items-center relative z-10">
                      <CheckCircle size={28} style={{ color: theme.primary }} className="mr-3" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          Proceso completado con éxito
                        </h3>
                        <p className="text-sm text-gray-600">
                          Se han procesado {recordCount} registros correctamente
                        </p>
                        <div className="mt-1.5 flex items-center text-xs text-green-600">
                          <Zap size={12} className="mr-1" />
                          <span>Datos guardados en la base de datos correctamente</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Record count info */}
              <div className="text-center mb-3">
                <span className="text-xs text-gray-500">
                  Procesando {recordCount} registros del área de {area}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SaveAnimation;