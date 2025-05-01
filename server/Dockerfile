
FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --production

COPY . .

# Expose the port the app runs on
EXPOSE 5000

CMD ["npm", "start"]
