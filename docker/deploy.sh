#!/bin/bash
# ============================================
# Deployment Script for GCP Compute Engine
# အမောပြေ (Ah-Maw-Pyay) Water Delivery App
# ============================================
# Usage: chmod +x deploy.sh && ./deploy.sh
# ============================================

set -e

echo "============================================"
echo "  အမောပြေ - Deployment Script"
echo "  Water Delivery & Factory Management App"
echo "============================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# --- Step 1: Check if Docker is installed ---
echo -e "${YELLOW}[1/6] Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker not found. Installing Docker...${NC}"
    sudo apt-get update
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    sudo usermod -aG docker $USER
    echo -e "${GREEN}Docker installed successfully!${NC}"
    echo -e "${YELLOW}NOTE: You may need to log out and back in for group changes to take effect.${NC}"
else
    echo -e "${GREEN}Docker is already installed: $(docker --version)${NC}"
fi

# --- Step 2: Check Docker Compose ---
echo -e "${YELLOW}[2/6] Checking Docker Compose...${NC}"
if ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose plugin not found. Installing...${NC}"
    sudo apt-get install -y docker-compose-plugin
fi
echo -e "${GREEN}Docker Compose: $(docker compose version)${NC}"

# --- Step 3: Check .env file ---
echo -e "${YELLOW}[3/6] Checking environment configuration...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from template...${NC}"
    if [ -f docker/env.template ]; then
        cp docker/env.template .env
        echo -e "${YELLOW}Please edit .env file with your actual values:${NC}"
        echo -e "${YELLOW}  nano .env${NC}"
        echo ""
        echo -e "${RED}IMPORTANT: Update these values before continuing:${NC}"
        echo "  - DB_ROOT_PASSWORD (use a strong password)"
        echo "  - DB_PASSWORD (use a strong password)"
        echo "  - JWT_SECRET (generate with: openssl rand -hex 32)"
        echo ""
        read -p "Press Enter after editing .env, or Ctrl+C to abort..."
    else
        echo -e "${RED}ERROR: No .env template found. Please create .env manually.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}.env file exists.${NC}"
fi

# --- Step 4: Build Docker images ---
echo -e "${YELLOW}[4/6] Building Docker images...${NC}"
docker compose build --no-cache
echo -e "${GREEN}Docker images built successfully!${NC}"

# --- Step 5: Start services ---
echo -e "${YELLOW}[5/6] Starting services...${NC}"
docker compose up -d
echo -e "${GREEN}Services started!${NC}"

# --- Step 6: Wait for health checks ---
echo -e "${YELLOW}[6/6] Waiting for services to be healthy...${NC}"
echo "Waiting for database to initialize (30 seconds)..."
sleep 30

# Check if services are running
echo ""
echo "============================================"
echo "  Service Status:"
echo "============================================"
docker compose ps
echo ""

# Get external IP
EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null || curl -s ifconfig.me 2>/dev/null || echo "unknown")

echo "============================================"
echo -e "${GREEN}  Deployment Complete!${NC}"
echo "============================================"
echo ""
echo "  Application URL: http://${EXTERNAL_IP}:80"
echo "  Direct App Port: http://${EXTERNAL_IP}:3000"
echo ""
echo "  Useful Commands:"
echo "    docker compose logs -f app    # View app logs"
echo "    docker compose logs -f db     # View DB logs"
echo "    docker compose restart app    # Restart app"
echo "    docker compose down           # Stop all"
echo "    docker compose up -d          # Start all"
echo ""
echo "============================================"
