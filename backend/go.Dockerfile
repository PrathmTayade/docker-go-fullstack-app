FROM golang:1-alpine3.19 

WORKDIR /app

COPY . .

# Download and install dependencies:

RUN go get -d -v ./...

# Build the go app

RUN go build -o api .

# expose port

EXPOSE 8000

CMD [ "./api" ]