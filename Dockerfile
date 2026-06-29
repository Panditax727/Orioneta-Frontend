FROM node:22-alpine AS build

WORKDIR /app

ARG VITE_API_BASE_URL=""
ARG VITE_REALTIME_BASE_URL=""
ARG VITE_BUILD_ID="local"

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_REALTIME_BASE_URL=$VITE_REALTIME_BASE_URL
ENV VITE_BUILD_ID=$VITE_BUILD_ID

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
