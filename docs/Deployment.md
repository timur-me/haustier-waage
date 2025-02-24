# 🚀 Deployment Guide

## Overview

This guide covers the deployment process for the Haustier Waage application, including server setup, SSL configuration, and maintenance procedures.

## Prerequisites

- Ubuntu 22.04 LTS server
- Domain name pointing to your server
- SSH access with sudo privileges
- Python 3.11+
- Node.js 18+
- PostgreSQL 15+

## Initial Server Setup

### System Updates

```bash
sudo apt update
sudo apt upgrade -y
```

### Install Required Packages

```bash
# Install system dependencies
sudo apt install -y python3.11 python3.11-venv python3-pip nginx postgresql postgresql-contrib

# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install development tools
sudo apt install -y build-essential git
```

## Database Setup

### PostgreSQL Configuration

```bash
# Create database and user
sudo -u postgres psql

CREATE DATABASE petscale;
CREATE USER petscale WITH PASSWORD 'your_secure_password';
ALTER ROLE petscale SET client_encoding TO 'utf8';
ALTER ROLE petscale SET default_transaction_isolation TO 'read committed';
ALTER ROLE petscale SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE petscale TO petscale;
\q

# Enable remote access (if needed)
sudo nano /etc/postgresql/15/main/postgresql.conf
# Set listen_addresses = '*'

sudo nano /etc/postgresql/15/main/pg_hba.conf
# Add: host all all 0.0.0.0/0 md5

sudo systemctl restart postgresql
```

## Backend Deployment

### Application Setup

```bash
# Create application directory
sudo mkdir -p /var/www/petscale
sudo chown -R $USER:$USER /var/www/petscale

# Clone repository
git clone https://github.com/yourusername/petscale.git /var/www/petscale

# Setup virtual environment
cd /var/www/petscale
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env
nano .env  # Configure environment variables
```

### Systemd Service Configuration

Create a systemd service file:

```bash
sudo nano /etc/systemd/system/petscale.service
```

Add the following content:

```ini
[Unit]
Description=Haustier Waage FastAPI Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/petscale
Environment="PATH=/var/www/petscale/venv/bin"
EnvironmentFile=/var/www/petscale/.env
ExecStart=/var/www/petscale/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
sudo systemctl enable petscale
sudo systemctl start petscale
```

## Frontend Deployment

### Build Frontend

```bash
# Install dependencies
cd /var/www/petscale/frontend
npm install

# Build production version
npm run build

# Create frontend directory
sudo mkdir -p /var/www/frontend
sudo cp -r dist/* /var/www/frontend/
```

## Nginx Configuration

### SSL Certificate Setup

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d pet.executable.fun
```

### Nginx Configuration

Create Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/petscale
```

Add the following content:

```nginx
server {
    listen 80;
    server_name pet.executable.fun;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name pet.executable.fun;

    ssl_certificate /etc/letsencrypt/live/pet.executable.fun/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/pet.executable.fun/privkey.pem;

    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=63072000" always;

    # Frontend
    location / {
        root /var/www/frontend;
        try_files $uri $uri/ /index.html;
        expires 1h;
        add_header Cache-Control "public, no-transform";
    }

    # API
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 86400;
    }
}
```

Enable the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/petscale /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Maintenance

### Backup Setup

Create backup script:

```bash
sudo nano /usr/local/bin/backup-petscale.sh
```

Add the following content:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="/var/backups/petscale"
DB_NAME="petscale"
DB_USER="petscale"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup database
pg_dump -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$TIMESTAMP.sql

# Backup media files
tar -czf $BACKUP_DIR/media_backup_$TIMESTAMP.tar.gz /var/www/petscale/media

# Remove backups older than 30 days
find $BACKUP_DIR -type f -mtime +30 -exec rm {} \;
```

Make the script executable and schedule it:

```bash
sudo chmod +x /usr/local/bin/backup-petscale.sh

# Add to crontab
sudo crontab -e

# Add this line to run backup daily at 3 AM
0 3 * * * /usr/local/bin/backup-petscale.sh
```

### Log Rotation

Configure log rotation:

```bash
sudo nano /etc/logrotate.d/petscale
```

Add the following content:

```
/var/log/petscale/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        systemctl reload petscale
    endscript
}
```

### Monitoring

Install monitoring tools:

```bash
# Install Prometheus Node Exporter
sudo apt install -y prometheus-node-exporter

# Install and configure fail2ban
sudo apt install -y fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl restart fail2ban
```

## Updates and Maintenance

### Application Updates

```bash
# Stop services
sudo systemctl stop petscale

# Backup
sudo -u postgres pg_dump petscale > backup.sql

# Pull updates
cd /var/www/petscale
git pull origin main

# Update backend
source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head

# Update frontend
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/frontend/

# Restart services
sudo systemctl start petscale
sudo systemctl restart nginx
```

### SSL Certificate Renewal

Certbot will automatically renew certificates. To test the renewal process:

```bash
sudo certbot renew --dry-run
```

### Security Updates

```bash
# Update system packages
sudo apt update
sudo apt upgrade -y

# Check for security advisories
sudo apt install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Troubleshooting

### Check Service Status

```bash
# Backend service
sudo systemctl status petscale
sudo journalctl -u petscale -f

# Nginx
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log
```

### Database Maintenance

```bash
# Connect to database
sudo -u postgres psql petscale

# Check active connections
SELECT * FROM pg_stat_activity;

# Vacuum database
VACUUM ANALYZE;
```

### Common Issues

1. **502 Bad Gateway**

   - Check if backend service is running
   - Verify Nginx configuration
   - Check application logs

2. **WebSocket Connection Issues**

   - Verify Nginx WebSocket configuration
   - Check firewall settings
   - Inspect backend logs

3. **Database Connection Issues**
   - Verify database credentials
   - Check PostgreSQL logs
   - Ensure database service is running

## Performance Optimization

### Nginx Tuning

```bash
sudo nano /etc/nginx/nginx.conf
```

Add performance optimizations:

```nginx
worker_processes auto;
worker_rlimit_nofile 65535;

events {
    worker_connections 65535;
    multi_accept on;
    use epoll;
}

http {
    keepalive_timeout 65;
    keepalive_requests 100;
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;

    # File cache settings
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;

    # Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/xml+rss application/atom+xml image/svg+xml;
}
```

### PostgreSQL Tuning

```bash
sudo nano /etc/postgresql/15/main/postgresql.conf
```

Add performance optimizations:

```ini
# Memory Configuration
shared_buffers = 256MB
effective_cache_size = 768MB
maintenance_work_mem = 64MB
work_mem = 4MB

# Checkpoint Configuration
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Planner Configuration
random_page_cost = 1.1
effective_io_concurrency = 200
```
