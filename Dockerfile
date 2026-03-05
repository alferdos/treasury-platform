FROM node:14

WORKDIR /app

# Copy frontend source and package files
COPY frontend/package*.json ./frontend/
COPY frontend/src ./frontend/src
COPY frontend/public ./frontend/public

# Install frontend dependencies and build with webpack fix
RUN cd frontend && \
    rm -rf node_modules package-lock.json && \
    SKIP_PREFLIGHT_CHECK=true npm install --force && \
    SKIP_PREFLIGHT_CHECK=true npm run build -- --openssl-legacy-provider || \
    SKIP_PREFLIGHT_CHECK=true npm run build

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
