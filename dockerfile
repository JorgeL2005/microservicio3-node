# Usar la imagen oficial de Node.js basada en Alpine Linux
FROM node:18-alpine

# Crear un directorio de trabajo en el contenedor
WORKDIR /trabajo_parcial/API-Node

# Copiar package.json y package-lock.json para instalar las dependencias
COPY package*.json ./

# Instalar las dependencias de la aplicación
RUN npm install --production

# Copiar todo el código fuente de la aplicación al contenedor
COPY . .

# Exponer el puerto que usará la aplicación (8911)
EXPOSE 8911

# Comando para ejecutar la aplicación
CMD ["npm", "start"]
