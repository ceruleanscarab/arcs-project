#!/bin/bash

# ARCS! Comic Reading Tracker - Deployment Script
# This script transfers files to your Ubuntu server and runs the installation

set -e

# Configuration - UPDATE THESE
SERVER_USER="your-username"
SERVER_HOST="your-server-ip"
SERVER_PORT="22"
SERVER_PATH="/home/$SERVER_USER/arcs-files"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "=== ARCS! Deployment Script ==="
echo ""

# Check if server details are configured
if [ "$SERVER_USER" = "your-username" ] || [ "$SERVER_HOST" = "your-server-ip" ]; then
    echo "Please update the SERVER_USER and SERVER_HOST variables in this script"
    echo "Current values:"
    echo "  SERVER_USER: $SERVER_USER"
    echo "  SERVER_HOST: $SERVER_HOST"
    exit 1
fi

echo "Deploying to $SERVER_USER@$SERVER_HOST:$SERVER_PATH"
echo ""

# Create deployment directory on server
echo "Creating deployment directory on server..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "mkdir -p $SERVER_PATH"

# Copy application files
echo "Copying application files..."
scp -P $SERVER_PORT server.js $SERVER_USER@$SERVER_HOST:$SERVER_PATH/
scp -P $SERVER_PORT index.html $SERVER_USER@$SERVER_HOST:$SERVER_PATH/
scp -P $SERVER_PORT app.js $SERVER_USER@$SERVER_HOST:$SERVER_PATH/
scp -P $SERVER_PORT styles.css $SERVER_USER@$SERVER_HOST:$SERVER_PATH/
scp -P $SERVER_PORT arcs-logo.jpg $SERVER_USER@$SERVER_HOST:$SERVER_PATH/
scp -P $SERVER_PORT *.png $SERVER_USER@$SERVER_HOST:$SERVER_PATH/
scp -P $SERVER_PORT install-ubuntu.sh $SERVER_USER@$SERVER_HOST:$SERVER_PATH/

echo -e "${GREEN}âœ“ Files copied successfully${NC}"
echo ""

# Run installation script on server
echo "Running installation script on server..."
ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST "cd $SERVER_PATH && sudo bash install-ubuntu.sh"

echo ""
echo -e "${GREEN}=== Deployment Complete ===${NC}"
echo ""
echo "Next steps:"
echo "1. SSH into your server: ssh -p $SERVER_PORT $SERVER_USER@$SERVER_HOST"
echo "2. Copy files from deployment directory to installation directory:"
echo "   sudo cp -r /home/$SERVER_USER/arcs-files/* /opt/arcs/"
echo "   sudo chown -R arcs:arcs /opt/arcs"
echo "3. Restart the service:"
echo "   sudo -u arcs pm2 restart arcs-tracker"
echo ""


