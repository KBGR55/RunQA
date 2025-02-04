# Dockerfile para proyecto Express con Node.js 22

FROM node:22

# Establecer el directorio de trabajo en /app
WORKDIR /app

# Copiar los archivos de configuración de la aplicación
COPY package.json package-lock.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación al directorio de trabajo
COPY . .

# Exponer el puerto en el que corre la aplicación (por defecto 3000 para Express)
EXPOSE 3000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
