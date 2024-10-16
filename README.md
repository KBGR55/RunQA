
# RunQA

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
    
   INSERT INTO rol (external_id, estado, nombre, createdAt, updatedAt)
   VALUES 
   (UUID(), 1, 'ADMINISTRADOR DEL SISTEMA', NOW(), NOW()),
   (UUID(), 1, 'GERENTE DE PRUEBAS', NOW(), NOW()),
   (UUID(), 1, 'ANALISTA DE PRUEBAS', NOW(), NOW()),
   (UUID(), 1, 'TESTER', NOW(), NOW()),
   (UUID(), 1, 'DESARROLLADOR', NOW(), NOW());

  ```