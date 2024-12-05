# Usar una imagen base oficial de Node.js
FROM node:20-alpine

# Crear un directorio en el contenedor para la aplicación
WORKDIR /app

# Copiar el archivo package.json y package-lock.json (si existe) al contenedor
COPY package*.json .

# Instalar las dependencias de la aplicación
RUN npm install --only=production

# Copiar el resto de los archivos de la aplicación al contenedor
COPY . .

EXPOSE 8000

# Definir el comando para ejecutar la aplicación
CMD ["npm", "start"]
