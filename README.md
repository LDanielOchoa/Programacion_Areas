# Sistema Alimentador Oriental 6 - Visualizador de Datos

Esta aplicación permite cargar y visualizar datos de programación de turnos para diferentes áreas del Sistema Alimentador Oriental 6.

## Características

- Interfaz de usuario intuitiva y atractiva
- Carga de archivos Excel con validación de formato
- Visualización de datos por departamento
- Guardado de datos en base de datos MySQL

## Estructura de la Base de Datos

La aplicación guarda los siguientes datos en la base de datos:

- **CEDULA** (bigint): Número de identificación del empleado
- **Fecha_programacion** (date): Fecha de la programación
- **Horario_programacion** (text): Horario asignado
- **Area** (text): Área a la que pertenece el empleado
- **Tiempo a descontar [h]** (double): Horas a descontar
- **Quincena** (text): Quincena correspondiente
- **clasificacion** (text): Cargo o clasificación del empleado
- **fecha_consulta** (datetime): Fecha y hora de la consulta

## Configuración

### Frontend

1. Instalar dependencias:
   ```
   npm install
   ```

2. Iniciar servidor de desarrollo:
   ```
   npm run dev
   ```

### Backend

1. Navegar a la carpeta del servidor:
   ```
   cd server
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar la base de datos:
   - Crear una base de datos MySQL
   - Ejecutar el script SQL en `server/database.sql`
   - Configurar las variables de entorno en el archivo `.env`

4. Iniciar el servidor:
   ```
   npm run dev
   ```

## Uso

1. Seleccionar el área para la que se desea cargar datos
2. Cargar un archivo Excel con el formato correcto
3. Visualizar los datos cargados
4. Hacer clic en "Guardar en la base de datos" para almacenar los datos

## Formato del Archivo Excel

El archivo Excel debe contener:
- Hoja "Formato programación"
- Nombre del responsable en la celda C9
- Rango de fechas en la celda C10
- Encabezados en las celdas A12-D12
- Fechas en las celdas E12-K12
- Datos de empleados a partir de la fila 13