
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
   npm start
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

## Cómo Correr Ambos Proyectos

1. Abre dos terminales:

   - En la primera, navega a la carpeta `frontend` y ejecuta `npm start` para iniciar la interfaz.
   - En la segunda, navega a la carpeta `backend` y ejecuta `node index.js` para iniciar el servidor.

2. Puedes acceder a la aplicación frontend en `http://localhost:3000` y verificar las conexiones con el backend que estará corriendo en `http://localhost:3000` (o el puerto configurado).

## Tecnologías Utilizadas

- **Frontend**: React, JavaScript
- **Backend**: Node.js, Express
- **Control de versiones**: Git
## Configurar la Base de Datos

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

6. Para crear las tablas necesarias en la base de datos, accede a [http://localhost:3006/privado/NOCHE_RunQA](http://localhost:3006/privado/NOCHE_RunQA). Cuando veas un mensaje que diga "OK!", significa que la configuración de la base de datos ha sido exitosa.

7. Para completar la configuración de la base de datos, ejecuta los siguientes comandos SQL para insertar roles, personas, asociar personas y roles, insertar cuentas, insertar periodo, e insertar ciclo:

    ```sql
         USE bd_runqa;

         START TRANSACTION;

         INSERT INTO rol (id, external_id, estado, nombre, createdAt, updatedAt) VALUES
         (1, '1376cf7e-907c-11ef-8f4d-30e37a2aa82d', 1, 'ADMINISTRADOR SYS', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
         (2, '2df3ca7a-8e05-11ef-80ac-b48c9d91f915', 1, 'GERENTE DE PRUEBAS', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
         (3, '1fe548cb-907c-11ef-8f4d-30e37a2aa82d', 1, 'ANALISTA DE PRUEBAS', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
         (4, '26214891-907c-11ef-8f4d-30e37a2aa82d', 1, 'TESTER', '2024-10-19 05:30:36', '2024-10-19 05:30:36'),
         (5, '29b40789-907c-11ef-8f4d-30e37a2aa82d', 1, 'DESARROLLADOR', '2024-10-19 05:30:36', '2024-10-19 05:30:36');


         INSERT INTO entidad (id, external_id, estado, foto, nombres, apellidos, fecha_nacimiento, telefono, createdAt, updatedAt) 
         VALUES 
         (1, '93a9e3f1-907c-11ef-8f4d-30e37a2aa82d', 1, '3efe8462-5255-4839-b694-c269ca4475b3.jpeg', 'KAREN BRIGITH', 'GONZAGA RIVAS', '2003-12-05 00:00:00', '0980735353', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (2, '93a9e97e-907c-11ef-8f4d-30e37a2aa82d', 1, '2307fd96-9917-4da1-a666-90d0711162c3.jpeg', 'HILARY MADELEY', 'CALVA CAMACHO', '1995-08-15 00:00:00', '0987654321', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (3, '93a9eb2d-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'MARÍA ELENA', 'PÉREZ MARTÍNEZ', '1998-03-22 00:00:00', '0980123456', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (4, '25b65566-907d-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'PEDRO ANTONIO', 'RAMÍREZ VARGAS', '1987-07-30 00:00:00', '0998765432', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (5, '93a9ed2c-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'ANA MARÍA', 'TORRES QUINTERO', '2000-11-10 00:00:00', '0976543210', '2024-10-22 08:50:19', '2024-10-22 08:50:19'),
         (6, '93a9ee14-907c-11ef-8f4d-30e37a2aa82d', 1, 'USUARIO_ICONO.png', 'SOFÍA ALEJANDRA', 'MENDOZA PÉREZ', '2003-12-05 00:00:00', '0980735353', '2024-10-22 08:50:19', '2024-10-22 08:50:19');



         INSERT INTO cuenta (id, external_id, estado, correo, clave, createdAt, updatedAt, id_entidad) 
         VALUES 
         (1, '594760f1-907e-11ef-8f4d-30e37a2aa82d', 1, 'karen.b.gonzaga@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 1),
         (2, '59476a5b-907e-11ef-8f4d-30e37a2aa82d', 1, 'hilary.calva@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 2),
         (3, '59476cb2-907e-11ef-8f4d-30e37a2aa82d', 1, 'maria.perez@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 3),
         (4, '59476e19-907e-11ef-8f4d-30e37a2aa82d', 1, 'pedro.ramirez@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 4),
         (5, '59476f57-907e-11ef-8f4d-30e37a2aa82d', 1, 'ana.torres@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 5),
         (6, '594770e6-907e-11ef-8f4d-30e37a2aa82d', 1, 'sofia.mendoza@unl.edu.ec', '$2a$08$vcbwdzAoBjH027Yt6B9PwO3G65afLhrMfejne1EJ7uoPGuLslHLC6', '2024-10-22 09:03:00', '2024-10-22 09:03:00', 6);

         INSERT INTO proyecto (external_id, estado, nombre, fecha_inicio, descripcion, createdAt, updatedAt)
         VALUES
         (UUID(), 1, 'ADMINISTRADOR SYS', '2024-10-22 09:08:40', 'Encargado de gestionar el sistema', NOW(), NOW()),
         (UUID(), 1, 'Proyecto Alpha', '2024-10-22 09:08:40', 'Aplicación para gestión de tareas.', NOW(), NOW()),
         (UUID(), 1, 'Proyecto Beta', '2024-10-22 09:08:40', 'Sistema de seguimiento de gastos.', NOW(), NOW()),
         (UUID(), 1, 'Proyecto Gamma', '2024-10-22 09:08:40', 'Plataforma de e-learning online.', NOW(), NOW()),
         (UUID(), 1, 'Proyecto Delta', '2024-10-22 09:08:40', 'Sitio web para restaurante.', NOW(), NOW()),
         (UUID(), 1, 'Proyecto Epsilon', '2024-10-22 09:08:40', 'Red social para comunidad local.', NOW(), NOW());


         INSERT INTO rol_proyecto (external_id, estado, createdAt, updatedAt, id_entidad, id_proyecto, id_rol)
         VALUES
         ('c5137e95-907f-11ef-8f4d-30e37a2aa82d', 1, '2024-10-22 09:13:11', '2024-10-22 09:13:11', 1, 1, 1),
         ('c513841c-907f-11ef-8f4d-30e37a2aa82d', 1, '2024-10-22 09:13:11', '2024-10-22 09:13:11', 2, 2, 2),
         ('c5138511-907f-11ef-8f4d-30e37a2aa82d', 1, '2024-10-22 09:13:11', '2024-10-22 09:13:11', 3, 3, 3),
         ('c51385a4-907f-11ef-8f4d-30e37a2aa82d', 1, '2024-10-22 09:13:11', '2024-10-22 09:13:11', 4, 4, 4),
         ('c5138633-907f-11ef-8f4d-30e37a2aa82d', 1, '2024-10-22 09:13:11', '2024-10-22 09:13:11', 3, 5, 5),
         ('c51386bf-907f-11ef-8f4d-30e37a2aa82d', 1, '2024-10-22 09:13:11', '2024-10-22 09:13:11', 2, 6, 2),
         ('7323850d-9080-11ef-8f4d-30e37a2aa82d', 1, '2024-10-22 09:18:03', '2024-10-22 09:18:03', 3, 4, 2),
         ('73238d10-9080-11ef-8f4d-30e37a2aa82d', 1, '2024-10-22 09:18:03', '2024-10-22 09:18:03', 4, 5, 2),
         ('73238fec-9080-11ef-8f4d-30e37a2aa82d', 1, '2024-10-22 09:18:03', '2024-10-22 09:18:03', 3, 3, 2);
         
         INSERT INTO caso_prueba (id, external_id, nombre, estado, descripcion, precondiciones, pasos, resultado_esperado, resultado_obtenido, clasificacion, tipo_prueba, fecha_disenio, fecha_ejecucion_prueba, createdAt, updatedAt, id_proyecto)
         VALUES    (1, 'a1f5b821-9080-11ef-8f4d-30e37a2aa82d', 'VALIDAR CREACIÓN DE USUARIO ALPHA', 'OBSOLETO', 'Caso de prueba para validar la creación de un nuevo usuario en el sistema.\nTener en cuenta el rol.', 'El usuario debe estar registrado en la base de datos.', '1. Ingresar nombre, correo y contraseña.\n2. Hacer clic en "Registrar".\n3. Mostrar mensaje de éxito', 'El usuario debe ser creado.\nY se debe recibir un mensaje de éxito.', 'Usuario creado con éxito.', 'ALTA', 'SISTEMA', '2024-10-22 09:20:00', '2024-10-22 00:00:00', '2024-10-22 09:25:53', '2024-10-22 22:38:05', 2),
   (2, 'a1f5b822-9080-11ef-8f4d-30e37a2aa82d', 'Comprobar inicio de sesión Alpha', 'APROBADO', 'Verificar que un usuario registrado pueda iniciar sesión.', 'El usuario debe estar registrado y activo.', '1. Ingresar correo y contraseña.\n2. Hacer clic en "Iniciar sesión".', 'El usuario debe ser redirigido al panel de control.', 'Usuario redirigido al panel de control.', 'MEDIA', 'FUNCIONAL', '2024-10-22 09:20:00', '2024-10-22 09:20:00', '2024-10-22 09:25:53', '2024-10-22 09:25:53', 2),
   (3, 'a1f5b823-9080-11ef-8f4d-30e37a2aa82d', 'Validar eliminación de usuario Alpha', 'RECHAZADO', 'Caso para validar que se puede eliminar un usuario del sistema.', 'El usuario debe estar registrado y activo.', '1. Seleccionar un usuario de la lista.\n2. Hacer clic en "Eliminar".', 'El usuario debe ser eliminado y se debe mostrar un mensaje de confirmación.', 'Error al eliminar el usuario debido a permisos insuficientes.', 'BAJA', 'FUNCIONAL', '2024-10-22 09:20:00', '2024-10-22 09:20:00', '2024-10-22 09:25:53', '2024-10-22 09:25:53', 2),
   (4, 'a1f5b824-9080-11ef-8f4d-30e37a2aa82d', 'Verificar carga de gastos Beta', 'APROBADO', 'Caso de prueba para comprobar que los gastos se cargan correctamente.', 'El usuario debe estar registrado y tener permisos de acceso.', '1. Iniciar sesión.\n2. Navegar a la sección de gastos.\n3. Cargar un nuevo gasto.', 'El gasto debe aparecer en la lista con los detalles correctos.', 'Gasto cargado correctamente.', 'ALTA', 'FUNCIONAL', '2024-10-22 09:20:00', '2024-10-22 09:20:00', '2024-10-22 09:25:53', '2024-10-22 09:25:53', 3),
   (5, 'a1f5b825-9080-11ef-8f4d-30e37a2aa82d', 'Comprobar informe de gastos Beta', 'BLOQUEADO', 'Verificar que el informe de gastos se genere correctamente.', 'El usuario debe tener al menos un gasto registrado.', '1. Iniciar sesión.\n2. Navegar a la sección de informes.\n3. Generar informe de gastos.', 'El informe debe generarse y mostrarse en pantalla.', 'Acceso bloqueado al generar el informe debido a restricciones de cuenta.', 'MEDIA', 'FUNCIONAL', '2024-10-22 09:20:00', '2024-10-22 09:20:00', '2024-10-22 09:25:53', '2024-10-22 09:25:53', 3),
   (6, 'a1f5b826-9080-11ef-8f4d-30e37a2aa82d', 'Validar actualización de gastos Beta', 'OBSOLETO', 'Caso para validar que un gasto existente puede ser actualizado.', 'El gasto debe existir en la base de datos.', '1. Seleccionar un gasto.\n2. Cambiar los detalles y guardar los cambios.', 'Los detalles del gasto deben actualizarse y reflejarse correctamente.', 'Gasto marcado como obsoleto y no se actualizó.', 'BAJA', 'FUNCIONAL', '2024-10-22 09:20:00', '2024-10-22 09:20:00', '2024-10-22 09:25:53', '2024-10-22 09:25:53', 3);


         COMMIT;

   ```

Una vez completados estos pasos, la base de datos estará configurada correctamente para su correcto funcionamiento.
## Cuentas de Acceso

| Correo                     | Contraseña |
|----------------------------|------------|
| karen.b.gonzaga@unl.edu.ec | clave123   |
| hilary.calva@unl.edu.ec    | clave123   |
| maria.perez@unl.edu.ec     | clave123   |
| pedro.ramirez@unl.edu.ec   | clave123   |
| ana.torres@unl.edu.ec      | clave123   |
| sofia.mendoza@unl.edu.ec   | clave123   |

Podrás acceder al sistema utilizando las cuentas proporcionadas.