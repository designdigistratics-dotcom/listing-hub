# Skillpal Real Estate - Deployment Guide

Deploy the full-stack application to DigitalOcean Droplet with Spaces for image storage.

## Server Details

| Resource | Value |
|----------|-------|
| **Droplet IP** | 64.227.139.60 |
| **Region** | BLR1 (Bangalore) |
| **Specs** | 1 vCPU, 1GB RAM, 25GB Disk |
| **Spaces Bucket** | skillpal.sgp1.digitaloceanspaces.com |

---

## Step 1: Connect to Your Droplet

```bash
ssh root@64.227.139.60
```

---

## Step 2: Initial Server Setup

### Update System
```bash
apt update && apt upgrade -y
```

### Install Required Packages
```bash
# Install Node.js 20.x (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# Verify installation
node --version  # Should show v20.x.x
npm --version

# Install build essentials and git
apt install -y build-essential git

# Install PM2 globally
npm install -g pm2

# Install Nginx
apt install -y nginx
```

---

## Step 3: Install PostgreSQL

```bash
# Install PostgreSQL
apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# Switch to postgres user and create database
sudo -u postgres psql
```

Inside PostgreSQL shell:
```sql
-- Create database user (change the password!)
CREATE USER skillpal_user WITH PASSWORD 'YOUR_SECURE_PASSWORD_HERE';

-- Create database
CREATE DATABASE skillpal_db OWNER skillpal_user;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE skillpal_db TO skillpal_user;

-- Exit
\q
```

---

## Step 4: Clone Repository

```bash
# Create web directory
mkdir -p /var/www/skillpal
cd /var/www/skillpal

# Clone your repository
git clone https://github.com/YOUR_USERNAME/skillpal-real-estate.git .

# Or if private repo, use SSH:
# git clone git@github.com:YOUR_USERNAME/skillpal-real-estate.git .
```

---

## Step 5: Setup Backend

```bash
cd /var/www/skillpal/backend

# Install dependencies
npm install

# Copy production environment file
cp .env.production .env

# IMPORTANT: Edit .env and update:
# 1. DATABASE_URL with your PostgreSQL password
# 2. JWT_SECRET with a secure random string
nano .env
```

Generate a secure JWT secret:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# Build TypeScript
npm run build
```

---

## Step 6: Setup Frontend

```bash
cd /var/www/skillpal/frontend

# Install dependencies
npm install

# Copy production environment
cp .env.production .env.local

# Build Next.js
npm run build
```

---

## Step 7: Configure PM2

```bash
cd /var/www/skillpal

# Create PM2 logs directory
mkdir -p /var/log/pm2

# Start applications with ecosystem file
pm2 start backend/ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Copy and run the command it outputs
```

Check status:
```bash
pm2 status
pm2 logs
```

---

## Step 8: Configure Nginx

```bash
# Copy nginx configuration
cp /var/www/skillpal/deploy/nginx.conf /etc/nginx/sites-available/skillpal

# Enable the site
ln -s /etc/nginx/sites-available/skillpal /etc/nginx/sites-enabled/

# Remove default site
rm /etc/nginx/sites-enabled/default

# Test nginx configuration
nginx -t

# Restart nginx
systemctl restart nginx
systemctl enable nginx
```

---

## Step 9: Configure Firewall

```bash
# Allow SSH, HTTP, and HTTPS
ufw allow OpenSSH
ufw allow 'Nginx Full'

# Enable firewall
ufw enable

# Check status
ufw status
```

---

## Step 10: Verify Deployment

### Test Backend
```bash
curl http://localhost:5000/api/health
```

### Test Frontend
```bash
curl http://localhost:3000
```

### Test from Browser
Visit: `http://64.227.139.60`

---

## SSL Certificate (When You Have a Domain)

Once you have a domain pointing to your droplet:

```bash
# Install Certbot
apt install -y certbot python3-certbot-nginx

# Get SSL certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Test auto-renewal
certbot renew --dry-run
```

Update nginx.conf to use your domain instead of the IP address.

---

## Updating the Application

When you push new code to GitHub:

```bash
cd /var/www/skillpal

# Pull latest changes
git pull origin main

# Backend updates
cd backend
npm install
npm run build
npx prisma generate
npx prisma db push

# Frontend updates
cd ../frontend
npm install
npm run build

# Restart applications
pm2 restart all
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `pm2 status` | Check app status |
| `pm2 logs` | View all logs |
| `pm2 logs skillpal-backend` | Backend logs only |
| `pm2 restart all` | Restart all apps |
| `pm2 stop all` | Stop all apps |
| `systemctl status nginx` | Check Nginx status |
| `nginx -t` | Test Nginx config |
| `sudo -u postgres psql` | Access PostgreSQL |

---

## Troubleshooting

### Backend not starting
```bash
cd /var/www/skillpal/backend
node dist/index.js  # Run directly to see errors
```

### Database connection issues
```bash
# Check PostgreSQL status
systemctl status postgresql

# Test connection
sudo -u postgres psql -d skillpal_db -c "SELECT 1;"
```

### Nginx 502 Bad Gateway
```bash
# Check if apps are running
pm2 status

# Check Nginx logs
tail -f /var/log/nginx/error.log
```

### Permission issues
```bash
chown -R www-data:www-data /var/www/skillpal
chmod -R 755 /var/www/skillpal
```
