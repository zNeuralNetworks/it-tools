# build stage
FROM --platform=$BUILDPLATFORM node:24-alpine AS build-stage
# Set environment variables for non-interactive npm installs
ENV NPM_CONFIG_LOGLEVEL=warn
ENV CI=true

RUN apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches patches
COPY stubs stubs
# Homelab: fetch packages via the LAN Verdaccio proxy-cache (storage-vm, HS-221) and keep
# the pnpm store in a BuildKit cache mount so installs survive layer invalidation.
# Override for a non-homelab build: --build-arg NPM_REGISTRY=https://registry.npmjs.org/
# NOTE: pnpm 11 ignores the npm_config_registry ENV (verified 2026-07-16) — it must be
# written to ~/.npmrc, which pnpm does read. The ENV still covers plain npm.
ARG NPM_REGISTRY=http://192.168.1.64:4873/
ENV npm_config_registry=${NPM_REGISTRY}
RUN npm install -g pnpm@11 && echo "registry=${NPM_REGISTRY}" > /root/.npmrc
RUN --mount=type=cache,id=pnpm-store,target=/pnpm-store \
    pnpm config set store-dir /pnpm-store && pnpm i --ignore-scripts --frozen-lockfile
COPY . .
ARG BASE_URL
ENV BASE_URL=${BASE_URL}
ARG VITE_AVAILABLE_LOCALES
ENV VITE_AVAILABLE_LOCALES=${VITE_AVAILABLE_LOCALES}
ENV VITE_VERCEL_ENV=production
RUN pnpm build

# production stage
FROM nginxinc/nginx-unprivileged:stable-alpine AS production-stage

LABEL maintainer="ShareVB <sharevb@gmail.com>" \
      org.opencontainers.image.authors="ShareVB <sharevb@gmail.com>"
LABEL org.opencontainers.image.source=github.com/sharevb/it-tools

ENV VITE_VERCEL_ENV=production
ARG BASE_URL
ENV BASE_URL=${BASE_URL}
COPY --from=build-stage /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV PORT=8080
EXPOSE $PORT

CMD ["nginx", "-g", "daemon off;"]
