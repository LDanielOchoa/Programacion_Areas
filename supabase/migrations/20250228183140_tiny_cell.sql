-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS sistema_alimentador;

-- Use the database
USE sistema_alimentador;

-- Create table for schedule data
CREATE TABLE IF NOT EXISTS programacion_turnos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  CEDULA BIGINT(20) NOT NULL,
  Fecha_programacion TEXT NOT NULL,
  Horario_programacion TEXT NOT NULL,
  Area VARCHAR(50) NOT NULL,
  Tiempo_a_descontar DOUBLE DEFAULT 0,
  Quincena VARCHAR(20) NOT NULL,
  clasificacion VARCHAR(100) NOT NULL,
  fecha_consulta TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_cedula ON programacion_turnos(CEDULA);
CREATE INDEX idx_fecha_programacion ON programacion_turnos(Fecha_programacion);
CREATE INDEX idx_area ON programacion_turnos(Area);
CREATE INDEX idx_quincena ON programacion_turnos(Quincena);