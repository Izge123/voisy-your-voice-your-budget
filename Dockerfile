# Stage 1: Build the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json bun.lockb ./
RUN npm install --force

# Copy the rest of the application
COPY . .

# Build the application
RUN npm run build

FROM nginx:alpine

# Удаляем default конфиг
RUN rm /etc/nginx/conf.d/default.conf

COPY myapp.conf /etc/nginx/conf.d/myapp.conf

# SSL certificates should be mounted at runtime or managed by orchestration platform
# DO NOT commit private keys to the repository
# Копируем собранный frontend
COPY --from=builder /app/dist /var/www/myapp


# Expose port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
