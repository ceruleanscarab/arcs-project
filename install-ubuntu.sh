#!/bin/bash

# ARCS! Comic Reading Tracker - Ubuntu Installation Script
# This script sets up ARCS! on an Ubuntu server

set -e

echo "=== ARCS! Comic Reading Tracker Installation ==="
echo ""

# Configuration
INSTALL_DIR="/opt/arcs"
SERVICE_NAME="arcs-tracker"
PORT=4177
USER="arcs"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    print_error "Please run as root (use sudo)"
    exit 1
fi

# Update system packages
echo "Updating system packages..."
apt update && apt upgrade -y
print_success "System packages updated"

# Install Node.js if not present
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    print_success "Node.js installed"
else
    print_success "Node.js already installed ($(node -v))"
fi

# Install PM2 for process management
if ! command -v pm2 &> /dev/null; then
    echo "Installing PM2..."
    npm install -g pm2
    print_success "PM2 installed"
else
    print_success "PM2 already installed"
fi

# Create arcs user
if ! id -u $USER > /dev/null 2>&1; then
    echo "Creating $USER user..."
    useradd -r -s /bin/false $USER
    print_success "User $USER created"
else
    print_success "User $USER already exists"
fi

# Create installation directory
echo "Creating installation directory..."
mkdir -p $INSTALL_DIR
print_success "Installation directory created"

# Create covers directory
mkdir -p $INSTALL_DIR/covers
print_success "Covers directory created"

# Copy application files
echo "Copying application files..."
# Note: You'll need to manually copy these files or update the script to download them
# For now, we'll create empty files that need to be replaced
cat > $INSTALL_DIR/server.js << 'EOF'
// server.js should be copied here
EOF

cat > $INSTALL_DIR/index.html << 'EOF'
<!-- index.html should be copied here -->
EOF

cat > $INSTALL_DIR/app.js << 'EOF'
// app.js should be copied here
EOF

cat > $INSTALL_DIR/styles.css << 'EOF'
/* styles.css should be copied here */
EOF

# Create empty data files
touch $INSTALL_DIR/profiles.json
touch $INSTALL_DIR/reset-tokens.json
echo "{}" > $INSTALL_DIR/profiles.json
echo "{}" > $INSTALL_DIR/reset-tokens.json

print_warning "Application files need to be manually copied to $INSTALL_DIR"
print_warning "Required files: server.js, index.html, app.js, styles.css, arcs-logo.jpg, and avatar PNG files"

# Set permissions
echo "Setting permissions..."
chown -R $USER:$USER $INSTALL_DIR
chmod 755 $INSTALL_DIR
chmod 644 $INSTALL_DIR/*.json
chmod 755 $INSTALL_DIR/covers
print_success "Permissions set"

# Create PM2 ecosystem file
echo "Creating PM2 ecosystem file..."
cat > /etc/pm2.config.d/arcs.config.js << EOF
module.exports = {
  apps: [{
    name: '$SERVICE_NAME',
    script: '$INSTALL_DIR/server.js',
    cwd: '$INSTALL_DIR',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      PORT: $PORT,
      NODE_ENV: 'production'
    }
  }]
}
EOF
print_success "PM2 ecosystem file created"

# Setup firewall (if ufw is installed)
if command -v ufw &> /dev/null; then
    echo "Configuring firewall..."
    ufw allow $PORT/tcp
    print_success "Firewall configured for port $PORT"
fi

# Start the service
echo "Starting ARCS! service..."
sudo -u $USER pm2 restart /etc/pm2.config.d/arcs.config.js
sudo -u $USER pm2 save
sudo -u $USER pm2 startup
print_success "ARCS! service started"

echo ""
echo "=== Installation Complete ==="
echo ""
echo "IMPORTANT: Before the application will work, you need to:"
echo "1. Copy these files to $INSTALL_DIR:"
echo "   - server.js"
echo "   - index.html"
echo "   - app.js"
echo "   - styles.css"
echo "   - arcs-logo.jpg"
echo "   - All avatar PNG files (Doom-6.png, HawkEye-5.png, etc.)"
echo ""
echo "2. Restart the service:"
echo "   sudo -u $USER pm2 restart $SERVICE_NAME"
echo ""
echo "3. Access the application at:"
echo "   http://your-server-ip:$PORT"
echo ""
echo "Service management commands:"
echo "  sudo -u $USER pm2 status"
echo "  sudo -u $USER pm2 logs $SERVICE_NAME"
echo "  sudo -u $USER pm2 restart $SERVICE_NAME"
echo "  sudo -u $USER pm2 stop $SERVICE_NAME"
echo ""
