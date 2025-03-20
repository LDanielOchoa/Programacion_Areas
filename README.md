# 🎯 Sistema Alimentador Oriental 6 - Visualizador de Datos

Bienvenido al **Sistema Alimentador Oriental 6**, una plataforma moderna para gestionar y visualizar la programación de turnos en diferentes áreas. Con una interfaz intuitiva y un backend sólido, permite la carga eficiente de datos desde archivos **Excel** y su almacenamiento en **MySQL**.

---

## 🚀 Características Principales

✅ **Interfaz amigable y moderna** con navegación sencilla.
✅ **Carga de archivos Excel** con validación automática.
✅ **Filtrado y visualización de datos** por departamento y fecha.
✅ **Persistencia de datos** en una base de datos MySQL.
✅ **Historial de consultas** para rastrear información en tiempo real.

---

## 📸 Capturas de Pantalla

- Inicio previo
![image](https://github.com/user-attachments/assets/c0a521cf-f92b-4c9d-904b-34294020bf84)

- Áreas
![image](https://github.com/user-attachments/assets/db4dd15c-c9b2-47ab-b599-6f2abe1c200c)

- Login
![image](https://github.com/user-attachments/assets/d4209a29-c6e0-408b-8204-bdc345b9c6be)

- Cargar programación
![image](https://github.com/user-attachments/assets/9ed37a8d-28fb-458a-b1f1-97650ddbf439)

- Visualización de la información
![image](https://github.com/user-attachments/assets/14d2a50d-515d-42cc-bd8d-d0a2b5ca8f3a)

---

## 🗄️ Estructura de la Base de Datos

La aplicación gestiona la siguiente información:

| 🏷 Campo | 📌 Tipo de Dato | 📖 Descripción |
|----------|---------------|---------------|
| **CEDULA** | bigint | Número de identificación del empleado |
| **Fecha_programacion** | date | Fecha de la programación |
| **Horario_programacion** | text | Horario asignado |
| **Area** | text | Área de trabajo del empleado |
| **Tiempo a descontar [h]** | double | Horas descontadas |
| **Quincena** | text | Período de pago asociado |
| **Clasificacion** | text | Cargo o clasificación del empleado |
| **Fecha_consulta** | datetime | Fecha y hora de la consulta |

---

## ⚙️ Configuración del Proyecto

### 🔹 Frontend

1️⃣ Instalar dependencias:
   ```bash
   npm install
   ```
2️⃣ Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

### 🔹 Backend

1️⃣ Acceder a la carpeta del servidor:
   ```bash
   cd server
   ```
2️⃣ Instalar dependencias:
   ```bash
   npm install
   ```
3️⃣ Configurar la base de datos:
   - Crear una base de datos **MySQL**.
   - Ejecutar el script SQL en `server/database.sql`.
   - Definir variables en el archivo `.env`.
4️⃣ Iniciar el servidor backend:
   ```bash
   npm run dev
   ```

---

## 📝 Uso del Sistema

1️⃣ Seleccionar el área de trabajo.
2️⃣ Cargar un archivo **Excel** con el formato adecuado.
3️⃣ Verificar y visualizar los datos procesados.
4️⃣ Guardar la información en la base de datos para su posterior consulta.

---

## 📑 Requisitos del Archivo Excel

Para que la carga sea exitosa, el archivo **Excel** debe cumplir con estas especificaciones:

📌 **Hoja:** `Formato programación`
📌 **Responsable:** Celda `C9`
📌 **Rango de fechas:** Celda `C10`
📌 **Encabezados:** Celdas `A12-D12`
📌 **Fechas:** Celdas `E12-K12`
📌 **Datos de empleados:** Desde la fila `13`

---

## 📥 Descarga

La última versión de la aplicación está disponible en la sección de [Releases](https://github.com/SistemaAlimentadorOriental6/GR_PROGRAMACION_AREAS/releases) del repositorio.

---

## 📌 Repositorio

🔗 **Repositorio Oficial:** [Sistema Alimentador Oriental 6 - GitHub](https://github.com/SistemaAlimentadorOriental6/GR_PROGRAMACION_AREAS)

Si este proyecto te resulta útil, **¡déjanos una estrella ⭐ en GitHub!**

---

## 📧 Contacto y Soporte

Si tienes dudas, problemas o sugerencias, puedes abrir un **issue** en el repositorio o comunicarte a través de nuestros canales de soporte.

✨ _¡Gracias por usar el Sistema Alimentador Oriental 6!_ 🚀

