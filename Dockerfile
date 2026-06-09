# Use Node.js LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files (if they exist)
COPY package*.json ./

# Install dependencies (if package.json exists)
RUN if [ -f package.json ]; then npm install; fi

# Copy application files
COPY server.js ./
COPY index.html ./
COPY app.js ./
COPY styles.css ./
COPY arcs-logo.jpg ./

# Create non-root user for security
RUN addgroup -g 1001 -S arcs && \
    adduser -S arcs -u 1001 -G arcs

# Change ownership of app directory
RUN chown -R arcs:arcs /app

# Switch to non-root user
USER arcs

# Expose the default port
EXPOSE 4177

# Set environment variables
ENV PORT=4177
ENV NODE_ENV=production
ENV DATA_DIR=/data

# Start the server
CMD ["node", "server.js"]


