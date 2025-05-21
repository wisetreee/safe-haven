#!/bin/bash

# Start both client and server in development mode
echo "Starting development environment..."

# Start the server in the background
cd server && npm run dev &
SERVER_PID=$!

# Start the client
cd ../client && npm run dev

# When client is terminated, also kill the server
trap "kill $SERVER_PID" EXIT

wait