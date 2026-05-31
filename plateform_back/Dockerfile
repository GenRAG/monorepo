FROM node:23-alpine

RUN apk add --no-cache postgresql-client

WORKDIR /usr/src/app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

RUN yarn prisma generate
RUN yarn build:production

CMD ["sh", "-c", "npx prisma migrate deploy && yarn start:prod"]