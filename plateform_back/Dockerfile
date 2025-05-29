FROM node:23

RUN apt-get update && apt-get install -y postgresql-client

WORKDIR /usr/src/app

COPY . .

RUN yarn install

#RUN npx prisma generate

CMD ["yarn", "start:dev"]