FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install --registry=https://registry.npmmirror.com

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production --registry=https://registry.npmmirror.com

COPY --from=builder /app/dist ./dist

RUN mkdir -p /app/uploads /app/data

EXPOSE 3000

CMD ["node", "dist/main"]
