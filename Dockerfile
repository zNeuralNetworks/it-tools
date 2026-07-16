# build stage
FROM --platform=$BUILDPLATFORM node:24-alpine@sha256:a0b9bf06e4e6193cf7a0f58816cc935ff8c2a908f81e6f1a95432d679c54fbfd AS build-stage
# Set environment variables for non-interactive npm installs
ENV NPM_CONFIG_LOGLEVEL=warn
ENV CI=true

RUN apk add --update python3 make g++\
   && rm -rf /var/cache/apk/*

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches patches
COPY stubs stubs
RUN npm install -g pnpm@11 && pnpm i --ignore-scripts --frozen-lockfile
COPY . .
ARG BASE_URL
ENV BASE_URL=${BASE_URL}
ARG VITE_AVAILABLE_LOCALES
ENV VITE_AVAILABLE_LOCALES=${VITE_AVAILABLE_LOCALES}
ENV VITE_VERCEL_ENV=production
RUN pnpm build

# production stage
FROM nginxinc/nginx-unprivileged:stable-alpine@sha256:dcea25a6593307a74b09e59a47f8695c4d56943750e45add532ae0bf8b24bfd6 AS production-stage

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
