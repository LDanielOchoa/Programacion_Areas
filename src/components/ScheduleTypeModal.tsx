"use client"

import type React from "react"
import { motion } from "framer-motion"
import { ArrowRight, X } from "lucide-react"
import type { AreaOption, ScheduleType } from "../types"

interface ScheduleTypeModalProps {
  selectedArea: AreaOption
  scheduleTypes: {
    id: ScheduleType
    name: string
    description: string
    icon: string
    disabled: boolean
  }[]
  onClose: () => void
  onSelect: (type: ScheduleType) => void
  getIcon: (iconName: string, size?: number, className?: string) => JSX.Element
}

export const ScheduleTypeModal: React.FC<ScheduleTypeModalProps> = ({
  selectedArea,
  scheduleTypes,
  onClose,
  onSelect,
  getIcon,
}) => {
  // Variantes de animación optimizadas
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4, // Reducido
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      y: 20,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }} // Reducido
    >
      <motion.div
        className="bg-white rounded-2xl p-8 max-w-2xl w-full relative shadow-2xl border border-gray-100"
        variants={modalVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Elementos decorativos de fondo */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 opacity-70"></div>
          <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-gradient-to-tr from-gray-50 to-gray-100 opacity-70"></div>
        </div>

        <motion.button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10 bg-white/80 backdrop-blur-sm rounded-full p-1"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} />
        </motion.button>

        <div className="relative z-10">
          <div className="flex items-center mb-8">
            <div
              className={`p-3 rounded-lg bg-${
                selectedArea.id === "Operaciones"
                  ? "blue"
                  : selectedArea.id === "Lavado"
                    ? "cyan"
                    : selectedArea.id === "Mantenimiento"
                      ? "amber"
                      : selectedArea.id === "Remanofactura"
                        ? "emerald"
                        : selectedArea.id === "ServiciosGenerales"
                          ? "purple"
                          : selectedArea.id === "Vigilantes"
                            ? "red"
                            : "green"
              }-100 mr-4`}
            >
              {getIcon(
                selectedArea.icon,
                24,
                `text-${
                  selectedArea.id === "Operaciones"
                    ? "blue"
                    : selectedArea.id === "Lavado"
                      ? "cyan"
                      : selectedArea.id === "Mantenimiento"
                        ? "amber"
                        : selectedArea.id === "Remanofactura"
                          ? "emerald"
                          : selectedArea.id === "ServiciosGenerales"
                            ? "purple"
                            : selectedArea.id === "Vigilantes"
                              ? "red"
                              : "green"
                }-600`,
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Seleccione el tipo de formato</h2>
              <p className="text-gray-500">Área: {selectedArea.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {scheduleTypes.map((type) => (
              <motion.div
                key={type.id}
                className={`relative overflow-hidden p-6 rounded-xl border cursor-pointer group transition-all duration-300 shadow-sm hover:shadow-md ${type.disabled ? "opacity-70 cursor-not-allowed" : ""}`}
                style={{
                  borderColor:
                    selectedArea.id === "Operaciones"
                      ? "#3b82f6"
                      : selectedArea.id === "Lavado"
                        ? "#06b6d4"
                        : selectedArea.id === "Mantenimiento"
                          ? "#f59e0b"
                          : selectedArea.id === "Remanofactura"
                            ? "#10b981"
                            : selectedArea.id === "ServiciosGenerales"
                              ? "#8b5cf6"
                              : selectedArea.id === "Vigilantes"
                                ? "#ef4444"
                                : "#10b981",
                }}
                onClick={() => !type.disabled && onSelect(type.id)}
                whileHover={{
                  scale: type.disabled ? 1.0 : 1.02,
                  backgroundColor:
                    selectedArea.id === "Operaciones"
                      ? "rgba(59, 130, 246, 0.05)"
                      : selectedArea.id === "Lavado"
                        ? "rgba(6, 182, 212, 0.05)"
                        : selectedArea.id === "Mantenimiento"
                          ? "rgba(245, 158, 11, 0.05)"
                          : selectedArea.id === "Remanofactura"
                            ? "rgba(16, 185, 129, 0.05)"
                            : selectedArea.id === "ServiciosGenerales"
                              ? "rgba(139, 92, 246, 0.05)"
                              : selectedArea.id === "Vigilantes"
                                ? "rgba(239, 68, 68, 0.05)"
                                : "rgba(16, 185, 129, 0.05)",
                }}
                whileTap={{ scale: type.disabled ? 1.0 : 0.98 }}
              >
                {/* Indicador de funcionalidad no disponible */}
                {type.disabled && (
                  <div className="absolute inset-0 bg-gray-100 bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-20">
                    <div className="bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium text-gray-600 border border-gray-200">
                      Funcionalidad no disponible
                    </div>
                  </div>
                )}

                {/* Decoración de fondo */}
                <motion.div
                  className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full opacity-10"
                  style={{
                    background: `radial-gradient(circle, ${
                      selectedArea.id === "Operaciones"
                        ? "#3b82f6"
                        : selectedArea.id === "Lavado"
                          ? "#06b6d4"
                          : selectedArea.id === "Mantenimiento"
                            ? "#f59e0b"
                            : selectedArea.id === "Remanofactura"
                              ? "#10b981"
                              : selectedArea.id === "ServiciosGenerales"
                                ? "#8b5cf6"
                                : selectedArea.id === "Vigilantes"
                                  ? "#ef4444"
                                  : "#10b981"
                    } 0%, transparent 70%)`,
                  }}
                  initial={{ scale: 0.8 }}
                  whileHover={{ scale: type.disabled ? 0.8 : 1.2, opacity: type.disabled ? 0.1 : 0.2 }}
                />

                <div className="flex items-start space-x-4 relative z-10">
                  <div
                    className={`p-4 rounded-xl flex items-center justify-center`}
                    style={{
                      background: `linear-gradient(135deg, ${
                        selectedArea.id === "Operaciones"
                          ? "rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.25) 100%"
                          : selectedArea.id === "Lavado"
                            ? "rgba(6, 182, 212, 0.15) 0%, rgba(8, 145, 178, 0.25) 100%"
                            : selectedArea.id === "Mantenimiento"
                              ? "rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%"
                              : selectedArea.id === "Remanofactura"
                                ? "rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%"
                                : selectedArea.id === "ServiciosGenerales"
                                  ? "rgba(139, 92, 246, 0.15) 0%, rgba(124, 58, 237, 0.25) 100%"
                                  : selectedArea.id === "Vigilantes"
                                    ? "rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.25) 100%"
                                    : "rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.25) 100%"
                      })`,
                    }}
                  >
                    {getIcon(
                      type.icon,
                      28,
                      `text-${
                        selectedArea.id === "Operaciones"
                          ? "blue"
                          : selectedArea.id === "Lavado"
                            ? "cyan"
                            : selectedArea.id === "Mantenimiento"
                              ? "amber"
                              : selectedArea.id === "Remanofactura"
                                ? "emerald"
                                : selectedArea.id === "ServiciosGenerales"
                                  ? "purple"
                                  : selectedArea.id === "Vigilantes"
                                    ? "red"
                                    : "green"
                      }-600`,
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">{type.name}</h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </div>
                </div>

                {/* Indicador de flecha */}
                <motion.div
                  className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -5, opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                >
                  <div
                    className={`p-2 rounded-full bg-${
                      selectedArea.id === "Operaciones"
                        ? "blue"
                        : selectedArea.id === "Lavado"
                          ? "cyan"
                          : selectedArea.id === "Mantenimiento"
                            ? "amber"
                            : selectedArea.id === "Remanofactura"
                              ? "emerald"
                              : selectedArea.id === "ServiciosGenerales"
                                ? "purple"
                                : selectedArea.id === "Vigilantes"
                                  ? "red"
                                  : "green"
                    }-100`}
                  >
                    <ArrowRight
                      size={16}
                      className={`text-${
                        selectedArea.id === "Operaciones"
                          ? "blue"
                          : selectedArea.id === "Lavado"
                            ? "cyan"
                            : selectedArea.id === "Mantenimiento"
                              ? "amber"
                              : selectedArea.id === "Remanofactura"
                                ? "emerald"
                                : selectedArea.id === "ServiciosGenerales"
                                  ? "purple"
                                  : selectedArea.id === "Vigilantes"
                                    ? "red"
                                    : "green"
                      }-600`}
                    />
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

