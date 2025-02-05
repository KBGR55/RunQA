
# RunQA
<div align="center">
  <img src="frontend/public/logo192.png" width="350px" alt="Logo de Quizizz" style="display: inline-block;">
</div>

**Descripción**:  
Este proyecto tiene como objetivo construir un sistema de gestión de pruebas de software que soporte varios proyectos y diferentes roles, tales como: analista de pruebas, tester, gerente de pruebas y desarrolladores. Es importante identificar los principales casos de uso para gestionar eficientemente el proceso de pruebas.

Este proyecto es realizado por los estudiantes de la materia **Software Quality** perteneciente al itinerario de software en la carrera de Computación de la **Universidad Nacional de Loja**.

## Estructura del Proyecto

La carpeta principal del proyecto `RunQA` contiene dos subcarpetas principales:

- `frontend`: Proyecto de React para la interfaz de usuario.
- `backend`: Proyecto de Node.js para la API y lógica del servidor.

## Tecnologías Utilizadas

- **Frontend**: React, JavaScript
- **Backend**: Node.js, Express
- **Control de versiones**: Git

## Instalación

### Clonar el repositorio

1. Abre una terminal y clona el repositorio del proyecto.

   ```bash
   git clone https://github.com/KBGR55/RunQA.git
   ```

2. Navega al directorio del proyecto:

   ```bash
   cd RunQA
   ```
## Opción 1: Ejecución para Dev
### Instalación del Frontend

1. Ve a la carpeta `frontend`:

   ```bash
   cd frontend
   ```

2. Instala las dependencias necesarias:

   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo para el frontend:

   ```bash
   npm run dev
   ```

   Esto iniciará la aplicación en modo de desarrollo en `http://localhost:3000`.

### Instalación del Backend

1. Abre una nueva terminal y ve a la carpeta `backend`:

   ```bash
   cd backend
   ```

2. Instala las dependencias necesarias:

   ```bash
   npm install
   ```

3. Inicia el servidor del backend:

   ```bash
   node index.js
   ```

   Esto iniciará el servidor en `http://localhost:3000` (o el puerto que configures).

### Configurar la Base de Datos

Antes de ejecutar el proyecto, asegúrate de configurar la base de datos. Sigue estos pasos:

1. Inicia sesión en MySQL con un usuario que tenga privilegios de administrador utilizando el siguiente comando y luego ingresa la contraseña del usuario:

    ```bash
    mysql -u root -p
    ```

2. Una vez que hayas ingresado a MySQL, ejecuta el siguiente comando para crear un nuevo usuario y asignarle todos los privilegios:

    ```sql
    CREATE USER 'desarrollo'@'localhost' IDENTIFIED BY 'desarrollo';
    GRANT ALL PRIVILEGES ON *.* TO 'desarrollo'@'localhost' WITH GRANT OPTION;
    FLUSH PRIVILEGES;
    exit;
    ```

3. Luego, ingresa a MySQL con el nuevo usuario creado:

    ```bash
    mysql -h 127.0.0.1 -u desarrollo -p
    ```

4. Crea la base de datos `bd_runqa` ejecutando el siguiente comando: 
    ```sql
    CREATE DATABASE bd_runqa;
    ```
5. Ahora, asegúrate de estar en la carpeta `backend` y luego levanta el proyecto con el siguiente comando:

    ```bash
    npm start
    ```

6. Para crear las tablas necesarias en la base de datos, accede a [http://localhost:3008/privado/NOCHE_RunQA](http://localhost:3008/privado/NOCHE_RunQA). Cuando veas un mensaje que diga "OK!", significa que la configuración de la base de datos ha sido exitosa.

7. Para completar la configuración de la base de datos, ejecuta los siguientes comandos SQL para insertar roles, personas, asociar personas y roles, insertar cuentas, insertar periodo, e insertar ciclo:

    ```sql
         USE bd_runqa;

         START TRANSACTION;

         INSERT INTO rol (id, external_id, estado, nombre, createdAt, updatedAt) VALUES      
         (1, '1376cf7e-907c-11ef-8f4d-30e37a2aa82d', 1, 'ADMINISTRADOR SYS', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
         (2, '2df3ca7a-8e05-11ef-80ac-b48c9d91f915', 1, 'LIDER DE CALIDAD', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
         (3, '1fe548cb-907c-11ef-8f4d-30e37a2aa82d', 1, 'ANALISTA DE PRUEBAS', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
         (4, '26214891-907c-11ef-8f4d-30e37a2aa82d', 1, 'TESTER', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
         (5, '29b40789-907c-11ef-8f4d-30e37a2aa82d', 1, 'DESARROLLADOR', '2024-10-19 05:30:36', '2024-10-19 05:30:36');

         INSERT INTO entidad (id, external_id, estado, foto, nombres, apellidos, fecha_nacimiento, telefono, createdAt, updatedAt) 
         VALUES 
         (1, '93a9e3f1-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'ADMIN', 'SISTEMA', '2003-12-05 00:00:00', '0980715353', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (2, '93a9e97e-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'HILARY MADELEY', 'CALVA CAMACHO', '1995-08-15 00:00:00', '0987654321', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (3, '93a9eb2d-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'MARIA ELENA', 'PEREZ MARTINEZ', '1998-03-22 00:00:00', '0980123456', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (4, '25b65566-907d-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'PEDRO ANTONIO', 'RAMIREZ VARGAS', '1987-07-30 00:00:00', '0998765432', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (5, '93a9ed2c-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'ANA MARIA', 'TORRES QUINTERO', '2000-11-10 00:00:00', '0976543210', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (6, '93a9ee14-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'SOFIA ALEJANDRA', 'MENDOZA PEREZ', '2003-12-05 00:00:00', '0980735353', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (7, '670f8cfe-7132-42b5-9b09-7b257762ccc1', 1, 'USUARIO_ICONO.png', 'FRANCISCO JAVIER', 'ALVAREZ PINEDA', '1979-01-15 00:00:00', '09971789', '2024-12-06 13:09:05', '2024-12-06 13:29:31');

         INSERT INTO cuenta (id, external_id, estado, correo, clave, createdAt, updatedAt, id_entidad) 
         VALUES 
         (1, '594760f1-907e-11ef-8f4d-30e37a2aa82d', 1, 'admin.admin@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 1),
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
         (UUID(), 'Validación de Inputs en Formularios', 'DISENADO', 'NO ASIGNADO', 'Verificacion de datos de entrada en formularios.', 'El formulario debe estar activo.', 'Entrada de datos validos.', 'Paso 1: Abrir formulario.\nPaso 2: Ingresar datos.', 'El sistema valida los datos correctamente.', 'MEDIA', 'FUNCIONAL', NOW(), NULL, NOW(), NOW(), 1),
         (UUID(), 'Prueba de Conexion de Enlaces', 'DISENADO', 'NO ASIGNADO', 'Validacion de enlaces en el sistema.', 'Sistema operativo configurado.', 'Enlace a servidores configurados.', 'Paso 1: Configurar red.\nPaso 2: Ejecutar enlace.', 'El sistema establece conexión correctamente.', 'ALTA', 'INTEGRACION', NOW(), NULL, NOW(), NOW(), 2);

         COMMIT;


   ```

Una vez completados estos pasos, la base de datos estará configurada correctamente para su correcto funcionamiento.

## Opción 2: Ejecución con Docker
Si prefieres ejecutar el sistema con Docker, simplemente usa el siguiente comando en la raíz del proyecto:
 
  ```bash
  sudo docker-compose up --build
  ```
Esto iniciará el frontend, backend y base de datos en contenedores.

Después de unos segundos, la aplicación estará disponible en http://localhost:80.

## Cuentas de Acceso

| Correo                     | Contraseña |
|----------------------------|------------|
| admin.admin@unl.edu.ec     | clave123   |
| hilary.calva@unl.edu.ec    | clave123   |
| maria.perez@unl.edu.ec     | clave123   |
| pedro.ramirez@unl.edu.ec   | clave123   |
| ana.torres@unl.edu.ec      | clave123   |
| sofia.mendoza@unl.edu.ec   | clave123   |

Podrás acceder al sistema utilizando las cuentas proporcionadas.
