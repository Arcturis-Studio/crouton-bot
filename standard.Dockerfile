FROM node:19.2 as base

WORKDIR /bot

COPY . .

RUN npm ci

FROM base as production

ENV NODE_PATH=./build

RUN npm run build