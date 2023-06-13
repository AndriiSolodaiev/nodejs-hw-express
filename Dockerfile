FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /server
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 5000
USER node
CMD ["npm", "start"]
