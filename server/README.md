# SafeHaven API Server

This is the server-side component of the SafeHaven platform - providing the API for the domestic violence survivor support application.

## Getting Started

To run the server independently:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The server will run on port 5000 by default.

## Environment Variables

- `PORT` - Port to run the server on (default: 5000)
- `CLIENT_URL` - URL of the client for CORS (default: http://localhost:3000)
- `DATABASE_URL` - PostgreSQL database connection string
- `SERVE_CLIENT` - Set to 'true' to serve the client from the server (for backward compatibility)

## Building for Production

```bash
# Build the server
npm run build

# Start the production server
npm start
```

## Docker Deployment

You can build and run the server using Docker:

```bash
# Build the Docker image
docker build -t safehaven-server .

# Run the container
docker run -p 5000:5000 \
  -e PORT=5000 \
  -e CLIENT_URL=https://client.example.com \
  -e DATABASE_URL=postgresql://user:password@host:port/database \
  safehaven-server
```

## API Endpoints

The server provides the following main API endpoints:

- `/api/auth/*` - Authentication endpoints
- `/api/housings` - Housing management
- `/api/bookings` - Booking and reservation management
- `/api/messages` - Communication system

## Database

The application uses PostgreSQL for data storage. The connection string should be provided in the `DATABASE_URL` environment variable.