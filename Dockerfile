ARG NODE_TAG=lts
FROM node:$NODE_TAG

ARG DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        apt-transport-https \
        ca-certificates \
        curl \
        lz4 \
        gnupg-agent \
        software-properties-common \
        gettext-base \
        git \
        jq \
        less \
        zip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Upgrade npm
RUN npm install npm@latest -g

# Upgrade yarn
ENV YARN_VERSION 1.22.15
RUN set -ex \
    && for key in \
      "6A010C5166006599AA17F08146C2130DFD2497F5" \
    ; do \
      gpg --batch --keyserver hkps://keys.openpgp.org --recv-keys "$key" || \
      gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" ; \
    done \
    && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz" \
    && curl -fsSLO --compressed "https://yarnpkg.com/downloads/$YARN_VERSION/yarn-v$YARN_VERSION.tar.gz.asc" \
    && gpg --batch --verify yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
    && mkdir -p /opt \
    && tar -xzf yarn-v$YARN_VERSION.tar.gz -C /opt/ \
    && ln -sf /opt/yarn-v$YARN_VERSION/bin/yarn /usr/local/bin/yarn \
    && ln -sf /opt/yarn-v$YARN_VERSION/bin/yarnpkg /usr/local/bin/yarnpkg \
    && rm yarn-v$YARN_VERSION.tar.gz.asc yarn-v$YARN_VERSION.tar.gz \
    # smoke test
    && yarn --version

# Verify versions
RUN echo "node version: $(node -v)" && \
    echo "npm version: $(npm -v)" && \
    echo "yarn version: $(yarn -v)"

WORKDIR /monofo
