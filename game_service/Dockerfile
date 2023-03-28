FROM node:16-alpine

EXPOSE 3000

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN mkdir /app
WORKDIR /app
ADD package.json yarn.lock /app/

COPY patches /app/patches
RUN apk --no-cache add procps

RUN yarn --pure-lockfile
ADD . /app


CMD ["yarn", "docker:start"]
