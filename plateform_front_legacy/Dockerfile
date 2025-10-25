FROM node:lts-alpine 

WORKDIR /usr/src/app

COPY yarn.lock package.json ./

RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "dev"]