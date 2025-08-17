FROM node:lts-alpine

WORKDIR /app

# Installiamo le dipendenze prima di montare i volumi (per caching)
COPY package*.json ./
RUN npm install



# Ora lasciamo che il resto del codice venga montato come volume (niente COPY . .)


EXPOSE 5173
CMD ["npm", "run", "dev"]