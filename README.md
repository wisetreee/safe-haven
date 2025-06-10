# SafeHaven - Support Platform for Domestic Violence Survivors

A specialized web application designed to support domestic violence survivors in Russia, providing a secure and compassionate platform for finding safe housing with advanced privacy and user protection features.

## Project Structure

This project uses a separated client-server architecture:

- `/client` - React frontend with TypeScript
- `/server` - Express backend API
- `/shared` - Shared types and utilities used by both client and server

## Development

The project is configured to run the client and server independently:

### Running the Server

```bash
# From the root directory
./server-dev.sh

# Or directly
cd server
npm run dev
```

The server will run on port 5000 by default.

### Running the Client

```bash
# From the root directory
./client-dev.sh

# Or directly
cd client
npm run dev
```

The client will run on port 3000 by default.

### Environment Variables

#### Client Environment Variables
- `VITE_API_URL` - URL of the API server (default: http://localhost:5000)

#### Server Environment Variables
- `PORT` - Port to run the server on (default: 5000)
- `CLIENT_URL` - URL of the client for CORS (default: http://localhost:3000)
- `DATABASE_URL` - PostgreSQL database connection string

## Deployment

The project is configured for containerized deployment using Docker:

```bash
# Build and run both client and server containers
docker-compose up -d

# Stop containers
docker-compose down
```

### Separate Container Deployment

You can also build and run the client and server containers separately:

```bash
# Build and run the client container
cd client
docker build -t safehaven-client .
docker run -p 3000:80 -e VITE_API_URL=http://api.example.com safehaven-client

# Build and run the server container
cd server
docker build -t safehaven-server .
docker run -p 5000:5000 -e CLIENT_URL=https://client.example.com safehaven-server
```

## Database

The application uses PostgreSQL for data storage. The connection string should be provided in the `DATABASE_URL` environment variable.

## API Documentation

The API endpoints are documented in the server code. The main API base path is `/api`.