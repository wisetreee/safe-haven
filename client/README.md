# SafeHaven Client Application

This is the client-side component of the SafeHaven platform - a specialized web application designed to support domestic violence survivors in Russia, providing a secure and compassionate platform for finding safe housing.

## Getting Started

To run the client independently:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The client will run on port 3000 by default.

## Environment Variables

- `VITE_API_URL` - URL of the API server (default: http://localhost:5000)

## Building for Production

```bash
# Build the client
npm run build

# Preview the production build
npm run preview
```

## Docker Deployment

You can build and run the client using Docker:

```bash
# Build the Docker image
docker build -t safehaven-client .

# Run the container
docker run -p 80:80 -e VITE_API_URL=http://api.example.com safehaven-client
```

## Features

- User authentication and profile management
- Interactive map for finding safe housing
- Booking system for temporary accommodations
- Status tracking for bookings
- Real-time communication with staff
- Resource access for domestic violence survivors