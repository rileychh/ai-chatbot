# Add pnpm to base image
FROM node:18 as base
RUN npm install --global pnpm

FROM base as build
WORKDIR /usr/src/app

# We don't need the standalone Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Install app dependencies and build
COPY ./ ./
RUN pnpm install
RUN pnpm build
RUN pnpm prune --prod


FROM base as deploy
WORKDIR /usr/src/app

# Tell the app we are in docker
ENV DOCKER true

# Install Google Chrome Stable and fonts
# Note: this installs the necessary libs to make the browser work with Puppeteer.
RUN apt-get update \
  && curl --location --silent https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \
  && sh -c 'echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' \
  && apt-get update \
  && apt-get install google-chrome-stable -y --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

COPY --from=build /usr/src/app/dist ./dist
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY package.json ./

EXPOSE 80
CMD [ "pnpm", "start" ]