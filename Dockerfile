ARG NODE_TAG=12
FROM node:$NODE_TAG

WORKDIR /monofo

COPY /scripts/* /usr/local/bin/
ENTRYPOINT ["/usr/local/bin/entrypoint"]

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . ./
RUN yarn build
