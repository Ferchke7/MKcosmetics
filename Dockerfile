FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Build Vite frontend
RUN npm run build

# Expose server port
EXPOSE 3001

ENV PORT=3001 \
    NODE_ENV=production

CMD ["npm", "start"]
