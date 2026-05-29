FROM golang:1.26-alpine AS build
WORKDIR /app
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN go build -o /projectm-api ./cmd/api

FROM alpine:3.22
WORKDIR /app
COPY --from=build /projectm-api /usr/local/bin/projectm-api
EXPOSE 8080
CMD ["projectm-api"]
