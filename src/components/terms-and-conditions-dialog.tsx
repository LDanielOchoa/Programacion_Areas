"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, AlertTriangle, ShieldAlert, Lock, FileText, Info } from "lucide-react"

interface TermsAndConditionsDialogProps {
  isVisible: boolean
  onClose: () => void
  onAccept: () => void
  onDecline: () => void
}

export default function TermsAndConditionsDialog({
  isVisible,
  onClose,
  onAccept,
  onDecline,
}: TermsAndConditionsDialogProps) {
  const [scrolledToBottom, setScrolledToBottom] = useState(false)

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget
    // Consideramos que ha llegado al final si está a menos de 20px del final
    if (scrollHeight - scrollTop - clientHeight < 20) {
      setScrolledToBottom(true)
    }
  }

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: {
      opacity: 0,
      transition: { duration: 0.3, delay: 0.1 },
    },
  }

  const modalVariants = {
    hidden: {
      scale: 0.8,
      opacity: 0,
      y: 20,
    },
    visible: {
      scale: 1,
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 25,
        stiffness: 300,
        duration: 0.4,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      y: 20,
      transition: {
        duration: 0.3,
        ease: [0.43, 0.13, 0.23, 0.96],
      },
    },
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={backdropVariants}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />

          <motion.div
            className="w-full max-w-2xl overflow-hidden rounded-2xl relative z-10 bg-white"
            variants={modalVariants}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header section */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 p-6 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors rounded-full p-1 hover:bg-white/10"
                aria-label="Cerrar"
              >
                <X size={20} />
              </button>

              <div className="flex items-center">
                <div className="bg-white/20 w-12 h-12 rounded-full flex items-center justify-center mr-4 backdrop-blur-sm border border-white/30">
                  <ShieldAlert size={24} className="text-white" />
                </div>

                <div className="text-white">
                  <h3 className="text-xl font-bold" id="modal-title">
                    Términos y Condiciones de Seguridad
                  </h3>
                  <p className="text-white/80 text-sm">Por favor lea atentamente antes de continuar</p>
                </div>
              </div>
            </div>

            {/* Content section */}
            <div className="p-6 max-h-[60vh] overflow-y-auto" onScroll={handleScroll}>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <AlertTriangle size={20} className="text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-800 text-sm">
                    Al activar la función "Recordar mi acceso", usted acepta los siguientes términos y condiciones
                    relacionados con la seguridad de su cuenta y la privacidad de sus datos.
                  </p>
                </div>
              </div>

              <section className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <Lock size={18} className="mr-2 text-gray-600" />
                  Seguridad de la Cuenta
                </h4>
                <p className="text-gray-700 mb-3">
                  Al activar la función "Recordar mi acceso", usted reconoce y acepta que está permitiendo que este
                  dispositivo mantenga una sesión persistente para acceder a su cuenta sin necesidad de ingresar sus
                  credenciales en cada visita. Esta funcionalidad está diseñada para mejorar su experiencia de usuario,
                  pero conlleva ciertos riesgos de seguridad que debe comprender.
                </p>
                <p className="text-gray-700 mb-3">
                  Entendemos que la comodidad es importante, pero también lo es la seguridad. Al utilizar esta función,
                  usted reconoce que cualquier persona con acceso físico a este dispositivo podría potencialmente
                  acceder a su cuenta sin necesidad de conocer su contraseña. Por lo tanto, recomendamos encarecidamente
                  que solo active esta función en dispositivos personales que estén protegidos con contraseñas o métodos
                  biométricos de desbloqueo, y que no sean accesibles para terceros no autorizados.
                </p>
                <p className="text-gray-700 mb-3">
                  La empresa no se hace responsable por accesos no autorizados a su cuenta que resulten de la activación
                  de esta función. Es su responsabilidad mantener la seguridad física de los dispositivos donde ha
                  decidido permanecer conectado.
                </p>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <FileText size={18} className="mr-2 text-gray-600" />
                  Limitación de Responsabilidad
                </h4>
                <p className="text-gray-700 mb-3">
                  Al activar la función "Recordar mi acceso", usted acepta expresamente que la empresa no será
                  responsable por ningún daño directo, indirecto, incidental, especial o consecuente que pueda surgir
                  del uso o la imposibilidad de uso de esta función, incluyendo pero no limitado a:
                </p>
                <ul className="list-disc pl-6 mb-3 text-gray-700 space-y-2">
                  <li>
                    Acceso no autorizado a su cuenta por parte de terceros que tengan acceso físico a su dispositivo.
                  </li>
                  <li>Robo o pérdida del dispositivo donde ha activado esta función.</li>
                  <li>
                    Cualquier modificación, eliminación o alteración de datos realizada por personas que accedan a su
                    cuenta a través de esta función.
                  </li>
                  <li>
                    Cualquier brecha de seguridad que pueda comprometer la integridad de los tokens de autenticación
                    almacenados.
                  </li>
                  <li>
                    Cualquier consecuencia derivada de decisiones tomadas o acciones realizadas basadas en información
                    obtenida a través de un acceso no autorizado.
                  </li>
                </ul>
                <p className="text-gray-700 mb-3">
                  Usted reconoce que la activación de esta función es completamente voluntaria y que ha sido informado
                  de los riesgos asociados. La empresa ha implementado medidas de seguridad razonables para proteger los
                  tokens de autenticación, pero no puede garantizar una protección absoluta contra todas las posibles
                  vulnerabilidades o amenazas.
                </p>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <Info size={18} className="mr-2 text-gray-600" />
                  Almacenamiento de Datos y Privacidad
                </h4>
                <p className="text-gray-700 mb-3">
                  Para proporcionar la funcionalidad "Recordar mi acceso", necesitamos almacenar un token de
                  autenticación en su dispositivo. Este token se almacena localmente en su navegador utilizando el
                  mecanismo de almacenamiento local (localStorage). Es importante que comprenda cómo funciona este
                  almacenamiento y qué implicaciones tiene para su privacidad:
                </p>
                <ul className="list-disc pl-6 mb-3 text-gray-700 space-y-2">
                  <li>
                    El token de autenticación se almacena únicamente en su dispositivo y no se comparte con terceros.
                  </li>
                  <li>
                    Este token no contiene su contraseña real, sino una cadena cifrada que permite la autenticación
                    automática.
                  </li>
                  <li>
                    El token permanecerá almacenado indefinidamente hasta que usted cierre sesión explícitamente, borre
                    los datos de navegación o desactive esta función.
                  </li>
                  <li>
                    Si utiliza un dispositivo compartido, otros usuarios podrían potencialmente acceder a su cuenta si
                    utilizan el mismo navegador y perfil.
                  </li>
                </ul>
                <p className="text-gray-700 mb-3">
                  Nos comprometemos a proteger su privacidad y a utilizar estos datos únicamente con el propósito de
                  facilitar su acceso a la plataforma. Sin embargo, es importante que comprenda que el almacenamiento
                  local está sujeto a las políticas de privacidad y seguridad de su navegador, sobre las cuales no
                  tenemos control directo.
                </p>
              </section>

              <section className="mb-6">
                <h4 className="text-lg font-semibold text-gray-800 flex items-center mb-3">
                  <ShieldAlert size={18} className="mr-2 text-gray-600" />
                  Recomendaciones de Seguridad
                </h4>
                <p className="text-gray-700 mb-3">
                  Para minimizar los riesgos asociados con la función "Recordar mi acceso", le recomendamos seguir estas
                  prácticas de seguridad:
                </p>
                <ul className="list-disc pl-6 mb-3 text-gray-700 space-y-2">
                  <li>Active esta función únicamente en dispositivos personales y de confianza.</li>
                  <li>
                    Asegúrese de que su dispositivo esté protegido con una contraseña, PIN, patrón o autenticación
                    biométrica.
                  </li>
                  <li>Mantenga su sistema operativo y navegador actualizados con los últimos parches de seguridad.</li>
                  <li>Cierre sesión explícitamente cuando utilice dispositivos compartidos o públicos.</li>
                  <li>Considere utilizar software de seguridad como antivirus y anti-malware en su dispositivo.</li>
                  <li>
                    Revise periódicamente la actividad de su cuenta para detectar posibles accesos no autorizados.
                  </li>
                </ul>
                <p className="text-gray-700">
                  Recuerde que la seguridad de su cuenta es una responsabilidad compartida. Nosotros proporcionamos las
                  herramientas y la infraestructura, pero su comportamiento y decisiones juegan un papel crucial en
                  mantener la integridad de su cuenta.
                </p>
              </section>
            </div>

            {/* Footer section */}
            <div className="p-4 border-t border-gray-200 flex justify-between items-center bg-gray-50">
              <button onClick={onDecline} className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors">
                Rechazar
              </button>
              <button
                onClick={onAccept}
                disabled={!scrolledToBottom}
                className={`px-6 py-2 bg-green-600 text-white rounded-lg transition-all ${
                  scrolledToBottom ? "hover:bg-green-500" : "opacity-50 cursor-not-allowed"
                }`}
              >
                {scrolledToBottom ? "Acepto los términos" : "Lea hasta el final para aceptar"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

