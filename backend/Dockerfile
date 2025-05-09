FROM golang:1.24-alpine AS builder

RUN apk add --no-cache gcc musl-dev

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o runner ./cmd/main.go

FROM alpine:latest

RUN apk add --no-cache postgresql-client ca-certificates

WORKDIR /app

COPY --from=builder /app/runner .
COPY --from=builder /app/migrations ./migrations

RUN adduser -D runner
USER runner

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s \
    CMD pg_isready -h $DB_HOST -p $DB_PORT -U $DB_USER || exit 1

CMD ["./runner"]