FROM node:23

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn prisma generate

CMD ["yarn", "start:dev"]