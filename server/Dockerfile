FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package.json .
COPY tsconfig.json .

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Build the application
RUN npm run build

EXPOSE 5000

CMD ["npm", "start"]