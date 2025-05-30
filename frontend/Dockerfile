# Use Node.js for building
FROM node:18-alpine AS builder
WORKDIR /app

# Set environment variables for Vite 
ARG VITE_API_URL="__VITE_API_URL__"
ENV VITE_API_URL=${VITE_API_URL}

# Copy package files and install dependencies
COPY package.json package-lock.json ./
RUN npm install

# Copy app files
COPY . .

# Build the Vite app (this will replace the VITE_API_URL variable with the one set above)
RUN npm run build

# Use Nginx for serving the static files
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
ENTRYPOINT ["/entrypoint.sh"]
# Expose port 80 and keep the container running
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
