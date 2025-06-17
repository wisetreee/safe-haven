FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json .
COPY tsconfig.json .

# Install dependencies
RUN npm install && chmod +x ./node_modules/.bin/esbuild

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]