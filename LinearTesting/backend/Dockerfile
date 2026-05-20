FROM golang:1.22-alpine AS build

WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN go build -o /out/api ./cmd/api

FROM alpine:3.20

WORKDIR /app

RUN adduser -D -H appuser
COPY --from=build /out/api /app/api

ENV APP_PORT=8080
EXPOSE 8080

USER appuser
ENTRYPOINT ["/app/api"]
