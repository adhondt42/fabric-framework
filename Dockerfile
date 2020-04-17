FROM node:12-alpine
COPY . /home
WORKDIR /home
RUN apk add bash && \
    yarn install && \
    yarn build
