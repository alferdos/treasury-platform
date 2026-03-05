FROM node:16

WORKDIR /app

# Copy frontend source and package files
COPY frontend/package*.json ./frontend/
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public

# Install frontend dependencies and build
RUN cd frontend && npm install --force && npm run build

# Copy backend package files
COPY package*.json ./

# Install backend dependencies without optional packages
RUN npm install --no-optional --force 2>&1 || npm install --force

# Copy backend source
COPY server.js ./
COPY Routes/ ./Routes/
COPY Model/ ./Model/
COPY Controller/ ./Controller/
COPY config/ ./config/
COPY validation/ ./validation/
COPY propertyCtrl.js ./

EXPOSE 8080

ENV NODE_ENV=production

CMD ["node", "server.js"]
