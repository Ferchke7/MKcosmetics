# Stage 1: Build Frontend (Vite)
FROM node:24-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Build Backend (Go)
FROM golang:1.24-alpine AS backend-builder
WORKDIR /app
ENV GOTOOLCHAIN=local \
    GOPROXY=https://proxy.golang.org,direct \
    CGO_ENABLED=0

COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN GOOS=linux go build -ldflags="-s -w" -o /app/bin/server ./server/cmd/server

# Stage 3: Production Runtime (Ultra-light Alpine)
FROM alpine:3.21
WORKDIR /app

RUN apk add --no-cache ca-certificates tzdata curl wget

COPY --from=backend-builder /app/bin/server /app/server
COPY --from=frontend-builder /app/dist /app/dist
COPY --from=frontend-builder /app/server/data /app/server/data

ENV PORT=3001 \
    DB_PATH=/app/data/mkcosmetics.db \
    STATIC_DIR=/app/dist \
    TELEGRAM_CHANNEL=mkcosmetkor

EXPOSE 3001

CMD ["/app/server"]
