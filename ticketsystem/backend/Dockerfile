FROM node:20-alpine

WORKDIR /app

# Accept HOST_URL as build argument
ARG HOST_URL
ENV HOST_URL=${HOST_URL}

COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

COPY . .

# Set environment to production
ENV NODE_ENV=production

CMD ["node", "server.js"]
