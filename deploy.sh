#!/bin/bash

# Exit on error
set -e

# Variables
DOMAIN="your-domain.com"
EMAIL="admin@your-domain.com"
PROJECT_ROOT="/var/www"
BACKEND_DIR="$PROJECT_ROOT/backend"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Update system
echo "Updating system..."
apt update && apt upgrade -y

# Install required packages
echo "Installing required packages..."
apt install -y python3-venv python3-pip nginx postgresql postgresql-contrib certbot python3-certbot-nginx

# Create project user
echo "Creating project user..."
useradd -m -s /bin/bash petscale || true
usermod -aG www-data petscale

# Create project directories
echo "Creating project directories..."
mkdir -p $BACKEND_DIR $FRONTEND_DIR
chown -R petscale:petscale $PROJECT_ROOT

# Setup PostgreSQL
echo "Setting up PostgreSQL..."
sudo -u postgres psql -c "CREATE DATABASE petscale;" || true
sudo -u postgres psql -c "CREATE USER petscale WITH PASSWORD 'your_db_password';" || true
sudo -u postgres psql -c "ALTER ROLE petscale SET client_encoding TO 'utf8';"
sudo -u postgres psql -c "ALTER ROLE petscale SET default_transaction_isolation TO 'read committed';"
sudo -u postgres psql -c "ALTER ROLE petscale SET timezone TO 'UTC';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE petscale TO petscale;"

# Setup SSL
echo "Setting up SSL..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

# Setup Nginx
echo "Setting up Nginx..."
cp nginx.conf /etc/nginx/sites-available/$DOMAIN
ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

# Setup backend
echo "Setting up backend..."
cd $BACKEND_DIR
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp petscale.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable petscale
systemctl start petscale

# Setup frontend
echo "Setting up frontend..."
cd $FRONTEND_DIR
npm install
npm run build
cp -r dist/* /var/www/frontend/

# Setup email forwarding (using Postfix)
echo "Setting up email forwarding..."
apt install -y postfix
# Configure Postfix for forwarding only
postconf -e "inet_interfaces = loopback-only"
postconf -e "mydestination = $DOMAIN, localhost.localdomain, localhost"
postconf -e "relay_domains = $DOMAIN"
postconf -e "virtual_alias_domains = $DOMAIN"
postconf -e "virtual_alias_maps = hash:/etc/postfix/virtual"

# Create virtual aliases
echo "Creating email aliases..."
echo "support@$DOMAIN    your-email@gmail.com" > /etc/postfix/virtual
postmap /etc/postfix/virtual
systemctl restart postfix

echo "Deployment completed!"
echo "Next steps:"
echo "1. Update environment variables in .env file"
echo "2. Run database migrations"
echo "3. Test email functionality"
echo "4. Setup monitoring (recommended)" 