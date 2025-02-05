CREATE DATABASE IF NOT EXISTS bd_runqa;
USE bd_runqa;

-- 1. Crear las tablas sin dependencias primero
CREATE TABLE IF NOT EXISTS proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE,
    estado TINYINT(1) DEFAULT 1,
    nombre VARCHAR(40) NOT NULL,
    fecha_inicio DATETIME,
    descripcion VARCHAR(350),
    terminado TINYINT(1) DEFAULT 0,
    razon_terminado VARCHAR(255),
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS funcionalidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE,
    nombre VARCHAR(100) UNIQUE NOT NULL,
    descripcion VARCHAR(350) NOT NULL,
    estado TINYINT(1) DEFAULT 1,
    tipo ENUM('REQUISITO','CASO DE USO','HISTORIA DE USUARIO','REGLA DE NEGOCIO') DEFAULT 'CASO DE USO',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    id_entidad INT,
    id_proyecto INT,
    FOREIGN KEY (id_proyecto) REFERENCES proyecto(id)
);

CREATE TABLE IF NOT EXISTS entidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE,
    estado TINYINT(1) DEFAULT 1,
    foto VARCHAR(80) DEFAULT 'NO_DATA',
    nombres VARCHAR(20) DEFAULT 'NO_DATA',
    apellidos VARCHAR(20) DEFAULT 'NO_DATA',
    fecha_nacimiento DATETIME,
    telefono VARCHAR(20) UNIQUE DEFAULT 'NO_DATA',
    horasDisponibles INT DEFAULT 8,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS rol (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE,
    estado TINYINT(1) DEFAULT 1,
    nombre VARCHAR(20) DEFAULT 'NO_DATA',
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL
);

-- 2. Crear las tablas dependientes de las anteriores
CREATE TABLE IF NOT EXISTS rol_entidad (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36),
    estado TINYINT(1) DEFAULT 1,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    id_entidad INT,
    id_rol INT,
    FOREIGN KEY (id_entidad) REFERENCES entidad(id),
    FOREIGN KEY (id_rol) REFERENCES rol(id)
);

-- Tabla caso_prueba
CREATE TABLE IF NOT EXISTS caso_prueba (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    estado ENUM('DISENADO','REVISADO','PENDIENTE','EN PROGRESO','BLOQUEADO','DUPLICADO','OBSOLETO','NO APLICABLE','FALLIDO','EXITOSO','CERRADO','REABIERTO') NOT NULL DEFAULT 'DISENADO',
    estadoAsignacion ENUM('ASIGNADO','NO ASIGNADO','REASIGNADO') NOT NULL DEFAULT 'NO ASIGNADO',
    descripcion VARCHAR(350),
    precondiciones VARCHAR(350),
    datos_entrada VARCHAR(350),
    pasos TEXT,
    resultado_esperado VARCHAR(350) NOT NULL,
    resultado_obtenido VARCHAR(350),
    clasificacion ENUM('ALTA','MEDIA','BAJA') NOT NULL DEFAULT 'MEDIA',
    tipo_prueba ENUM('FUNCIONAL','INTEGRACION','SISTEMA','REGRESION','EXPLORATORIA','ACEPTACION USUARIO','RENDIMIENTO','SEGURIDAD') NOT NULL,
    fecha_disenio DATETIME,
    fecha_ejecucion_prueba DATETIME,
    fecha_limite_ejecucion DATETIME,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    id_proyecto INT,
    id_funcionalidad INT,
    FOREIGN KEY (id_proyecto) REFERENCES proyecto(id),
    FOREIGN KEY (id_funcionalidad) REFERENCES funcionalidad(id)
);

-- Tabla error
CREATE TABLE IF NOT EXISTS error (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE,
    descripcion VARCHAR(350) DEFAULT 'SIN_DATOS',
    titulo VARCHAR(100) DEFAULT 'SIN_DATOS',
    severidad ENUM('CRITICA','MEDIA','BAJA') NOT NULL DEFAULT 'BAJA',
    prioridad ENUM('ALTA','MEDIA','BAJA') NOT NULL DEFAULT 'BAJA',
    estado ENUM('NUEVO','CERRADO','PENDIENTE_VALIDACION','CORRECCION','DEVUELTO') DEFAULT 'NUEVO',
    anexo_foto VARCHAR(80) DEFAULT 'NO_DATA',
    pasos_repetir VARCHAR(350),
    resultado_obtenido VARCHAR(350),
    fecha_reporte DATETIME,
    fecha_resolucion DATETIME,
    fecha_devolucion DATETIME,
    fecha_cierre DATETIME,
    motivo_devolucion VARCHAR(350) DEFAULT 'SIN_DATOS',
    ciclo_error INT DEFAULT 1,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    id_caso_prueba INT,
    FOREIGN KEY (id_caso_prueba) REFERENCES caso_prueba(id)
);

CREATE TABLE IF NOT EXISTS contrato (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE,
    estado TINYINT(1) DEFAULT 1,
    fecha_inicio DATETIME,
    fecha_fin DATETIME,
    tipo_contrato ENUM('CASO_PRUEBA','ERROR') NOT NULL,
    id_error INT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    id_caso_prueba INT,
    id_rol_proyecto_asignado INT,
    id_rol_proyecto_responsable INT,
    FOREIGN KEY (id_caso_prueba) REFERENCES caso_prueba(id),
    FOREIGN KEY (id_error) REFERENCES error(id)
);

CREATE TABLE IF NOT EXISTS cuenta (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE,
    estado ENUM('ACEPTADO','DENEGADO','ESPERA') DEFAULT 'ESPERA',
    correo VARCHAR(50) UNIQUE NOT NULL,
    clave VARCHAR(150) NOT NULL,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    id_entidad INT,
    FOREIGN KEY (id_entidad) REFERENCES entidad(id)
);

CREATE TABLE IF NOT EXISTS rol_proyecto (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) UNIQUE,
    estado TINYINT(1) DEFAULT 1,
    horasDiarias INT DEFAULT 2,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    id_proyecto INT,
    id_rol_entidad INT,
    FOREIGN KEY (id_proyecto) REFERENCES proyecto(id),
    FOREIGN KEY (id_rol_entidad) REFERENCES rol_entidad(id)
);

CREATE TABLE IF NOT EXISTS peticion (
    id INT AUTO_INCREMENT PRIMARY KEY,
    peticion VARCHAR(300) DEFAULT 'NO_DATA',
    external_id CHAR(36) UNIQUE,
    estado ENUM('ES','AC','RE') DEFAULT 'ES',
    tipo ENUM('RI','CC') DEFAULT 'RI',
    motivo_rechazo VARCHAR(300) DEFAULT 'NO_DATA',
    id_rechazador_aceptador INT,
    createdAt DATETIME NOT NULL,
    updatedAt DATETIME NOT NULL,
    id_cuenta INT,
    FOREIGN KEY (id_cuenta) REFERENCES cuenta(id)
);


START TRANSACTION;

     INSERT INTO rol (id, external_id, estado, nombre, createdAt, updatedAt) VALUES      
     (1, '1376cf7e-907c-11ef-8f4d-30e37a2aa82d', 1, 'ADMINISTRADOR SYS', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
     (2, '2df3ca7a-8e05-11ef-80ac-b48c9d91f915', 1, 'LIDER DE CALIDAD', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
     (3, '1fe548cb-907c-11ef-8f4d-30e37a2aa82d', 1, 'ANALISTA DE PRUEBAS', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
     (4, '26214891-907c-11ef-8f4d-30e37a2aa82d', 1, 'TESTER', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
     (5, '29b40789-907c-11ef-8f4d-30e37a2aa82d', 1, 'DESARROLLADOR', '2024-10-19 05:30:36', '2024-10-19 05:30:36');

     INSERT INTO entidad (id, external_id, estado, foto, nombres, apellidos, fecha_nacimiento, telefono, createdAt, updatedAt) 
     VALUES 
     (1, '93a9e3f1-907c-11ef-8f4d-30e37a2aa82d', 1, '3efe8462-5255-4839-b694-c269ca4475b3.jpeg', 'KAREN BRIGITH', 'GONZAGA RIVAS', '2003-12-05 00:00:00', '0980715353', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
     (2, '93a9e97e-907c-11ef-8f4d-30e37a2aa82d', 1, '2307fd96-9917-4da1-a666-90d0711162c3.jpeg', 'HILARY MADELEY', 'CALVA CAMACHO', '1995-08-15 00:00:00', '0987654321', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
     (3, '93a9eb2d-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'MARIA ELENA', 'PEREZ MARTINEZ', '1998-03-22 00:00:00', '0980123456', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
     (4, '25b65566-907d-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'PEDRO ANTONIO', 'RAMIREZ VARGAS', '1987-07-30 00:00:00', '0998765432', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
     (5, '93a9ed2c-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'ANA MARIA', 'TORRES QUINTERO', '2000-11-10 00:00:00', '0976543210', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
     (6, '93a9ee14-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'SOFIA ALEJANDRA', 'MENDOZA PEREZ', '2003-12-05 00:00:00', '0980735353', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
     (7, '670f8cfe-7132-42b5-9b09-7b257762ccc1', 1, 'USUARIO_ICONO.png', 'FRANCISCO JAVIER', 'ALVAREZ PINEDA', '1979-01-15 00:00:00', '09971789', '2024-12-06 13:09:05', '2024-12-06 13:29:31');

     INSERT INTO cuenta (id, external_id, estado, correo, clave, createdAt, updatedAt, id_entidad) 
     VALUES 
     (1, '594760f1-907e-11ef-8f4d-30e37a2aa82d', 1, 'karen.b.gonzaga@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 1),
     (2, '59476a5b-907e-11ef-8f4d-30e37a2aa82d', 1, 'hilary.calva@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 2),
     (3, '59476cb2-907e-11ef-8f4d-30e37a2aa82d', 1, 'maria.perez@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 3),
     (4, '59476e19-907e-11ef-8f4d-30e37a2aa82d', 1, 'pedro.ramirez@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 4),
     (5, '59476f57-907e-11ef-8f4d-30e37a2aa82d', 1, 'ana.torres@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 5),
     (6, '594770e6-907e-11ef-8f4d-30e37a2aa82d', 1, 'sofia.mendoza@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 6),
     (7, '59477377-907e-11ef-8f4d-30e37a2aa82d', 1, 'fjalvarez@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-12-06 09:03:00', '2024-12-06 09:03:00', 7);

     INSERT INTO rol_entidad (external_id, estado, createdAt, updatedAt, id_entidad, id_rol)
     VALUES 
     ('a1b2c3d4-e5f6-7890-1234-56789abcdef0', 1, NOW(), NOW(), 1, 1),
     ('a1b2c3d4-e5f6-7890-1234-56789abcdef1', 1, NOW(), NOW(), 2, 2),
     ('a1b2c3d4-e5f6-7890-1234-56789abcdef2', 1, NOW(), NOW(), 7, 2);

     INSERT INTO proyecto (external_id, estado, nombre, fecha_inicio, descripcion, createdAt, updatedAt)
     VALUES
     (UUID(), 1, 'Auditoria Interna de Calidad', '2024-12-01 10:00:00', 'Realizacion de auditorias internas para evaluar la calidad del sistema.', NOW(), NOW()),
     (UUID(), 1, 'Pruebas de Integracion Criticas', '2024-12-02 11:00:00', 'Ejecucion de pruebas de integracion en modulos criticos.', NOW(), NOW()),
     (UUID(), 1, 'Validacion de Seguridad Avanzada', '2024-12-03 09:00:00', 'Revision de medidas de seguridad en aplicaciones web.', NOW(), NOW()),
     (UUID(), 1, 'Optimizacion de Procesos Operativos', '2024-12-04 15:00:00', 'Mejora de procesos operativos en el sistema.', NOW(), NOW()),
     (UUID(), 1, 'ADMINISTRADOR SYS', '2024-10-22 09:08:40', 'Encargado de gestionar el sistema', NOW(), NOW());

     INSERT INTO rol_proyecto (external_id, estado, horasDiarias, createdAt, updatedAt, id_proyecto, id_rol_entidad)
     VALUES
     ('123e4567-e89b-12d3-a456-426614174000', 1, 2, NOW(), NOW(), 5, 1),
     ('123e4567-e89b-12d3-a456-426614174001', 1, 4, NOW(), NOW(), 1, 1),
     ('123e4567-e89b-12d3-a456-426614174002', 1, 4, NOW(), NOW(), 2, 2);

     INSERT INTO caso_prueba (external_id, nombre, estado, estadoAsignacion, descripcion, precondiciones, datos_entrada, pasos, resultado_esperado, clasificacion, tipo_prueba, fecha_disenio, fecha_ejecucion_prueba, createdAt, updatedAt, id_proyecto)
     VALUES
     (UUID(), 'Validacion de Inputs en Formularios', 'DISENADO', 'NO ASIGNADO', 'Verificacion de datos de entrada en formularios.', 'El formulario debe estar activo.', 'Entrada de datos validos.', 'Paso 1: Abrir formulario.\nPaso 2: Ingresar datos.', 'El sistema valida los datos correctamente.', 'MEDIA', 'FUNCIONAL', NOW(), NULL, NOW(), NOW(), 1),
     (UUID(), 'Prueba de Conexion de Enlaces', 'DISENADO', 'NO ASIGNADO', 'Validacion de enlaces en el sistema.', 'Sistema operativo configurado.', 'Enlace a servidores configurados.', 'Paso 1: Configurar red.\nPaso 2: Ejecutar enlace.', 'El sistema establece conexion correctamente.', 'ALTA', 'INTEGRACION', NOW(), NULL, NOW(), NOW(), 2);

     COMMIT;