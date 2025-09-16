FROM node:lts-alpine

WORKDIR /app

# Installiamo le dipendenze prima di montare i volumi (per caching)
COPY package*.json ./
RUN npm install


EXPOSE 5173
CMD ["npm", "run", "dev"]