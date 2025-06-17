FROM node:18-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install

# Удалить и пересобрать esbuild
RUN rm -f node_modules/esbuild/bin/esbuild
RUN npm rebuild esbuild --force
RUN chmod +x node_modules/.bin/esbuild

COPY . .

RUN npm run build

EXPOSE 5000

CMD ["node", "dist/index.js"]