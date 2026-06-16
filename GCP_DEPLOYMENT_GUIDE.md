# GCP Deployment Guide — အမောပြေ (Ah-Maw-Pyay)

## Water Delivery & Factory Management App

This guide provides complete step-by-step instructions to deploy the application on Google Cloud Platform (GCP) using Compute Engine with Docker containerization.

---

## Architecture Overview

The production deployment uses a three-container architecture managed by Docker Compose:

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **App Server** | Node.js 22 (Alpine) | Serves the React frontend and tRPC API |
| **Database** | MySQL 8.0 | Persistent data storage |
| **Reverse Proxy** | Nginx (Alpine) | SSL termination, compression, caching |

The application listens on port 3000 internally. Nginx proxies external traffic from port 80/443 to the app container.

---

## Prerequisites

Before starting, ensure you have:

- A Google Cloud Platform account with billing enabled
- `gcloud` CLI installed locally (optional, for command-line setup)
- SSH access capability (via browser or terminal)
- A domain name (optional, for SSL/HTTPS setup)

---

## Step 1: Create a GCP Compute Engine Instance

### Option A: Via Google Cloud Console (Recommended for beginners)

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **Compute Engine** → **VM Instances** → **Create Instance**
3. Configure the instance with these settings:

| Setting | Recommended Value |
|---------|------------------|
| **Name** | `amaw-pyay-server` |
| **Region** | `asia-southeast1` (Singapore) or closest to your users |
| **Zone** | `asia-southeast1-a` |
| **Machine type** | `e2-medium` (2 vCPU, 4 GB RAM) for production; `e2-micro` for testing |
| **Boot disk** | Ubuntu 22.04 LTS, 30 GB SSD |
| **Firewall** | Check "Allow HTTP traffic" and "Allow HTTPS traffic" |

4. Click **Create** and wait for the instance to start.

### Option B: Via gcloud CLI

```bash
gcloud compute instances create amaw-pyay-server \
  --zone=asia-southeast1-a \
  --machine-type=e2-medium \
  --image-family=ubuntu-2204-lts \
  --image-project=ubuntu-os-cloud \
  --boot-disk-size=30GB \
  --boot-disk-type=pd-ssd \
  --tags=http-server,https-server \
  --metadata=startup-script='#!/bin/bash
    apt-get update
    apt-get install -y git'
```

---

## Step 2: Configure Firewall Rules

### Open Required Ports

If you did not check the HTTP/HTTPS firewall boxes during instance creation, create firewall rules manually:

```bash
# Allow HTTP (port 80)
gcloud compute firewall-rules create allow-http \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:80 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server

# Allow HTTPS (port 443)
gcloud compute firewall-rules create allow-https \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:443 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=https-server

# Allow direct app access (port 3000) - optional for debugging
gcloud compute firewall-rules create allow-app-port \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:3000 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=http-server
```

### Via Google Cloud Console

1. Go to **VPC Network** → **Firewall**
2. Click **Create Firewall Rule**
3. Set:
   - Name: `allow-http-https`
   - Direction: Ingress
   - Targets: All instances in the network (or specified target tags)
   - Source IP ranges: `0.0.0.0/0`
   - Protocols and ports: TCP: `80, 443, 3000`
4. Click **Create**

---

## Step 3: SSH into the VM and Install Docker

### Connect via SSH

```bash
# Option 1: Via gcloud CLI
gcloud compute ssh amaw-pyay-server --zone=asia-southeast1-a

# Option 2: Via Cloud Console
# Click the "SSH" button next to your instance in the VM list
```

### Install Docker and Docker Compose

Run these commands on the VM:

```bash
# Update system packages
sudo apt-get update && sudo apt-get upgrade -y

# Install prerequisites
sudo apt-get install -y \
  ca-certificates \
  curl \
  gnupg \
  lsb-release \
  git \
  ufw

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine + Compose plugin
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add current user to docker group (avoids needing sudo for docker commands)
sudo usermod -aG docker $USER

# Apply group change (or log out and back in)
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## Step 4: Upload Application Code to the VM

### Option A: Clone from Git Repository (Recommended)

If your code is in a Git repository:

```bash
# Create app directory
mkdir -p ~/apps && cd ~/apps

# Clone repository
git clone https://github.com/YOUR_USERNAME/amaw_pyay.git
cd amaw_pyay
```

### Option B: Upload via SCP

From your local machine:

```bash
# Compress the project
cd /path/to/amaw_pyay
tar -czf amaw_pyay.tar.gz --exclude=node_modules --exclude=.git --exclude=dist .

# Upload to VM
gcloud compute scp amaw_pyay.tar.gz amaw-pyay-server:~/apps/ --zone=asia-southeast1-a

# SSH into VM and extract
gcloud compute ssh amaw-pyay-server --zone=asia-southeast1-a
mkdir -p ~/apps/amaw_pyay && cd ~/apps/amaw_pyay
tar -xzf ~/apps/amaw_pyay.tar.gz
rm ~/apps/amaw_pyay.tar.gz
```

### Option C: Upload via Cloud Console

1. Click **SSH** on your VM instance
2. In the SSH window, click the gear icon → **Upload file**
3. Upload the compressed archive and extract it

---

## Step 5: Configure Environment Variables

```bash
cd ~/apps/amaw_pyay

# Copy the environment template
cp docker/env.template .env

# Generate a secure JWT secret
JWT_SECRET=$(openssl rand -hex 32)
echo "Generated JWT_SECRET: $JWT_SECRET"

# Edit the .env file
nano .env
```

Update these critical values in `.env`:

```bash
# MUST CHANGE these for security:
DB_ROOT_PASSWORD=YourStrongRootPassword2024!
DB_PASSWORD=YourStrongAppPassword2024!
JWT_SECRET=<paste the generated hex string>

# Optional - only if using Manus OAuth:
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://id.manus.im
OWNER_OPEN_ID=your-owner-open-id
OWNER_NAME=Your Name
```

> **Security Note:** Never commit the `.env` file to version control. The file contains sensitive credentials that should remain on the server only.

---

## Step 6: Build and Deploy

### Using the Automated Deploy Script

```bash
cd ~/apps/amaw_pyay
chmod +x docker/deploy.sh
./docker/deploy.sh
```

### Manual Deployment

```bash
cd ~/apps/amaw_pyay

# Build Docker images
docker compose build --no-cache

# Start all services in detached mode
docker compose up -d

# Wait for MySQL to initialize (first run takes ~30 seconds)
sleep 30

# Verify all containers are running
docker compose ps

# Check application logs
docker compose logs -f app
```

---

## Step 7: Verify Deployment

### Check Service Status

```bash
# All containers should show "Up" and "healthy"
docker compose ps

# Expected output:
# NAME              IMAGE              STATUS                    PORTS
# amaw_pyay_app    amaw_pyay-app     Up (healthy)              0.0.0.0:3000->3000/tcp
# amaw_pyay_db     mysql:8.0         Up (healthy)              0.0.0.0:3306->3306/tcp
# amaw_pyay_nginx  nginx:alpine      Up                        0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
```

### Test the Application

```bash
# Get your VM's external IP
EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")
echo "Application URL: http://$EXTERNAL_IP"

# Test HTTP response
curl -I http://localhost
curl -I http://$EXTERNAL_IP
```

Open your browser and navigate to `http://YOUR_EXTERNAL_IP` to see the application.

---

## Step 8: SSL/HTTPS Setup (Optional but Recommended)

### Using Certbot with Let's Encrypt

```bash
# Install Certbot
sudo apt-get install -y certbot

# Stop nginx temporarily
docker compose stop nginx

# Obtain SSL certificate (replace with your domain)
sudo certbot certonly --standalone -d your-domain.com -d www.your-domain.com

# Copy certificates to Docker SSL directory
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem docker/ssl/
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem docker/ssl/
sudo chown $USER:$USER docker/ssl/*.pem
```

Then update `docker/nginx.conf` — uncomment the SSL lines:

```nginx
listen 443 ssl;
ssl_certificate /etc/nginx/ssl/fullchain.pem;
ssl_certificate_key /etc/nginx/ssl/privkey.pem;
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
```

Restart nginx:

```bash
docker compose restart nginx
```

### Auto-Renewal Cron Job

```bash
# Add auto-renewal cron job
sudo crontab -e
# Add this line:
0 3 * * * certbot renew --quiet && cp /etc/letsencrypt/live/your-domain.com/fullchain.pem /home/$USER/apps/amaw_pyay/docker/ssl/ && cp /etc/letsencrypt/live/your-domain.com/privkey.pem /home/$USER/apps/amaw_pyay/docker/ssl/ && cd /home/$USER/apps/amaw_pyay && docker compose restart nginx
```

---

## Maintenance & Operations

### Common Commands

| Command | Purpose |
|---------|---------|
| `docker compose ps` | Check service status |
| `docker compose logs -f app` | View app logs (live) |
| `docker compose logs -f db` | View database logs |
| `docker compose restart app` | Restart app only |
| `docker compose down` | Stop all services |
| `docker compose up -d` | Start all services |
| `docker compose build --no-cache app` | Rebuild app image |
| `docker compose exec db mysql -u root -p` | Access MySQL CLI |

### Updating the Application

```bash
cd ~/apps/amaw_pyay

# Pull latest code (if using git)
git pull origin main

# Rebuild and restart
docker compose build --no-cache app
docker compose up -d app

# Verify
docker compose ps
docker compose logs -f app
```

### Database Backup

```bash
# Create backup
docker compose exec db mysqldump -u root -p"$DB_ROOT_PASSWORD" amaw_pyay > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker compose exec -T db mysql -u root -p"$DB_ROOT_PASSWORD" amaw_pyay < backup_file.sql
```

### Monitoring Disk Usage

```bash
# Check disk space
df -h

# Check Docker disk usage
docker system df

# Clean unused Docker resources
docker system prune -f
```

---

## Troubleshooting

### App Container Won't Start

```bash
# Check logs for errors
docker compose logs app

# Common issues:
# - DATABASE_URL incorrect → verify .env DB credentials match
# - Port conflict → check if another service uses port 3000
# - Build failure → run: docker compose build --no-cache app
```

### Database Connection Refused

```bash
# Check if DB is healthy
docker compose ps db

# Check DB logs
docker compose logs db

# Verify connection from app container
docker compose exec app sh -c "wget -qO- http://db:3306 || echo 'DB port reachable'"
```

### Cannot Access from Browser

```bash
# Verify firewall rules
gcloud compute firewall-rules list

# Check if nginx is running
docker compose ps nginx

# Test locally first
curl http://localhost:80

# Check GCP firewall allows port 80
gcloud compute firewall-rules describe allow-http
```

### Out of Memory

If using `e2-micro` (1 GB RAM), the containers may exceed memory:

```bash
# Check memory usage
docker stats --no-stream

# Solution: Add swap space
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

---

## Cost Estimation

| Resource | Spec | Monthly Cost (approx.) |
|----------|------|----------------------|
| Compute Engine (e2-medium) | 2 vCPU, 4 GB RAM | ~$25-35 USD |
| Compute Engine (e2-micro) | 0.25 vCPU, 1 GB RAM | ~$6-8 USD (free tier eligible) |
| Boot Disk (30 GB SSD) | pd-ssd | ~$5 USD |
| Static IP (optional) | 1 address | ~$3 USD |
| **Total (e2-medium)** | | **~$33-43 USD/month** |
| **Total (e2-micro)** | | **~$14-16 USD/month** |

> **Tip:** For cost efficiency during development/testing, use `e2-micro` with 2 GB swap. For production with multiple concurrent users, `e2-medium` is recommended.

---

## Security Checklist

- [ ] Change all default passwords in `.env`
- [ ] Generate a unique `JWT_SECRET` using `openssl rand -hex 32`
- [ ] Set up SSL/HTTPS with a valid domain
- [ ] Restrict SSH access to your IP only (GCP Firewall)
- [ ] Remove port 3000 firewall rule after confirming nginx works
- [ ] Enable GCP Cloud Armor for DDoS protection (optional)
- [ ] Set up automated backups for the database
- [ ] Configure log rotation to prevent disk fill

---

## File Structure Reference

```
amaw_pyay/
├── Dockerfile              ← Multi-stage build (builder + production)
├── docker-compose.yml      ← Orchestrates app + db + nginx
├── .dockerignore           ← Files excluded from Docker build
├── docker/
│   ├── deploy.sh           ← Automated deployment script
│   ├── env.template        ← Environment variable template
│   ├── init.sql            ← Database schema + seed data
│   ├── nginx.conf          ← Nginx reverse proxy config
│   └── ssl/                ← SSL certificates (not committed)
├── server/                 ← Backend (tRPC + Express)
├── client/                 ← Frontend (React + Vite)
├── drizzle/                ← Database schema + migrations
└── shared/                 ← Shared types & i18n
```
