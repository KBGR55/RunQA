# Usa una imagen base de Node.js 22
FROM node:22

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos de configuración de tu proyecto
COPY package.json package-lock.json ./

# Instala las dependencias de Node.js
RUN npm install

# Copia el resto del código de la aplicación
COPY . .

# Expone el puerto que utiliza tu aplicación
EXPOSE 3006

# Comando por defecto para ejecutar tu aplicación
CMD ["npm", "start"]
