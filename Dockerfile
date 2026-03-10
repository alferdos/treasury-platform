FROM node:14

WORKDIR /app

# Copy pre-built frontend (build directory already contains compiled assets)
COPY frontend/build ./frontend/build
COPY frontend/public ./frontend/public

# Copy backend package files
COPY package*.json ./

# Install backend dependencies
RUN npm install --force 2>&1 || npm install

# Copy backend source
COPY server.js ./
COPY Routes/ ./Routes/
COPY Model/ ./Model/
COPY Controller/ ./Controller/
COPY config/ ./config/
COPY validation/ ./validation/
COPY middleware/ ./middleware/
COPY propertyCtrl.js ./

# Set environment variables (Railway provides CONNECTION_URL via env)
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# Start the server
# Build timestamp: 2026-03-10T05:00:00Z
CMD ["node", "server.js"]
