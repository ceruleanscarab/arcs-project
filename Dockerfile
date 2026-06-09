FROM node:20-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --omit=dev

# Copy all app source files
COPY server.js ./
COPY app.js ./
COPY index.html ./
COPY styles.css ./
COPY manifest.json ./
COPY sw.js ./
COPY icons/ ./icons/
COPY scripts/ ./scripts/
# Copy logo if it exists
COPY arcs-logo.jpg* ./

# Persistent data lives outside the image
RUN mkdir -p /data
ENV DATA_DIR=/data
ENV NODE_ENV=production
ENV PORT=4177

# Run as non-root for security
RUN addgroup -g 1001 -S arcs && \
    adduser -S arcs -u 1001 -G arcs && \
    chown -R arcs:arcs /app
USER arcs

EXPOSE 4177

CMD ["node", "server.js"]
