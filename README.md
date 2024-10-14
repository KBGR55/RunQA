
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