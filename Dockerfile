FROM node:latest

ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm install --production

COPY ./dist ./dist/

EXPOSE 3000

CMD [ "npm", "run", "start:prod"]