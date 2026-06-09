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

ENV DATA_DIR=/data
ENV NODE_ENV=production
ENV PORT=4178

# Create non-root user, own both /app and /data before switching user
# so the volume mount at /data is writable when the container starts
RUN addgroup -g 1001 -S arcs && \
    adduser -S arcs -u 1001 -G arcs && \
    chown -R arcs:arcs /app && \
    mkdir -p /data && chown -R arcs:arcs /data

USER arcs

EXPOSE 4178

CMD ["node", "server.js"]
