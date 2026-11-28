# Frontend React (CRA): build tĩnh rồi phục vụ bằng nginx (SPA fallback).
# Biến REACT_APP_* được NHÚNG LÚC BUILD và chạy ở trình duyệt, nên REACT_APP_BACKEND_URL phải là địa chỉ
# backend mà TRÌNH DUYỆT truy cập được (ví dụ http://localhost:6969), không phải tên service nội bộ của Docker.
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG REACT_APP_BACKEND_URL=http://localhost:6969
ARG REACT_APP_GOOGLE_CLIENT_ID=
ARG REACT_APP_FACEBOOK_APP_ID=
ARG REACT_APP_CHATBOT_URL=
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL \
    REACT_APP_GOOGLE_CLIENT_ID=$REACT_APP_GOOGLE_CLIENT_ID \
    REACT_APP_FACEBOOK_APP_ID=$REACT_APP_FACEBOOK_APP_ID \
    REACT_APP_CHATBOT_URL=$REACT_APP_CHATBOT_URL \
    GENERATE_SOURCEMAP=false \
    CI=false \
    NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=15s --timeout=3s --retries=3 CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
