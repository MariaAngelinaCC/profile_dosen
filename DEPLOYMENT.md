# Deployment Guide - Website Profil Dosen

Panduan lengkap untuk mendeploy aplikasi ke production.

## Pre-Deployment Checklist

- [ ] Semua testing sudah selesai
- [ ] Database sudah dimigrasi ke cloud
- [ ] Environment variables sudah dikonfigurasi
- [ ] Security checks sudah dilakukan
- [ ] Performance optimization sudah diterapkan
- [ ] Backup database sudah dibuat

## Option 1: Deploy ke Vercel (Recommended)

### 1. Persiapan

Vercel support Node.js backend, tapi MySQL di localhost tidak akan accessible. Anda harus:

1. Pindahkan database ke cloud (Neon PostgreSQL atau Upstash untuk MySQL)
2. Update .env.local dengan credentials cloud database

### 2. Setup Neon PostgreSQL (Recommended)

a. Buat account di [neon.tech](https://neon.tech)

b. Buat project baru dan copy connection string

c. Update dependencies:
\`\`\`bash
npm install @neondatabase/serverless
\`\`\`

d. Update `lib/db.ts` untuk PostgreSQL:
\`\`\`typescript
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function query(sqlQuery: string, params?: any[]) {
  const result = await sql(sqlQuery, params)
  return result
}

export default { query }
\`\`\`

e. Set environment variables di Vercel dashboard:
\`\`\`
DATABASE_URL = your_neon_connection_string
\`\`\`

### 3. Push ke GitHub

\`\`\`bash
git add .
git commit -m "Ready for production"
git push origin main
\`\`\`

### 4. Deploy ke Vercel

a. Buka [vercel.com](https://vercel.com)

b. Login dengan GitHub account

c. Import project dari GitHub

d. Configure project:
   - Framework: Next.js
   - Root directory: ./
   - Build command: `npm run build`
   - Start command: `npm run start`

e. Add environment variables:
   - DATABASE_URL (dari Neon atau cloud provider)
   - Semua variables dari .env.local

f. Deploy!

### 5. Post-Deployment

- [ ] Setup custom domain
- [ ] Enable HTTPS (automatic di Vercel)
- [ ] Setup monitoring & logging
- [ ] Configure backups
- [ ] Setup CI/CD pipeline

## Option 2: Deploy ke Railway

Railway juga support Next.js dan database integration.

### 1. Setup Railway

a. Buat account di [railway.app](https://railway.app)

b. Create new project

c. Connect GitHub repository

### 2. Add Services

- Add MySQL database service
- Or connect ke cloud MySQL

### 3. Deploy

Push ke GitHub, Railway automatically deploy!

## Option 3: Deploy ke Self-Hosted VPS

### 1. VPS Setup

Rent VPS dari DigitalOcean, Linode, AWS, dll

### 2. Setup Server

\`\`\`bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (process manager)
sudo npm install -g pm2

# Install MySQL
sudo apt-get install -y mysql-server

# Setup SSL certificate (Let's Encrypt)
sudo apt-get install -y certbot python3-certbot-nginx
\`\`\`

### 3. Clone & Setup Project

\`\`\`bash
cd /var/www
git clone <your-repo>
cd website-profil-dosen
npm install
npm run build
\`\`\`

### 4. Configure Environment

\`\`\`bash
nano .env.local
# Paste environment variables
\`\`\`

### 5. Start Application

\`\`\`bash
# Start with PM2
pm2 start "npm run start" --name "dosen-profile"
pm2 save
pm2 startup
\`\`\`

### 6. Setup Nginx Reverse Proxy

\`\`\`bash
sudo nano /etc/nginx/sites-available/dosen-profile
\`\`\`

Configure:
\`\`\`nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
\`\`\`

### 7. Enable SSL

\`\`\`bash
sudo certbot --nginx -d yourdomain.com
\`\`\`

## Database Migration

### From Local MySQL to Cloud

1. **Export dari local**:
\`\`\`bash
mysqldump -u root -p db_biodosen > backup.sql
\`\`\`

2. **Import ke cloud** (sesuaikan dengan provider)

3. **Update connection string** di environment variables

## Performance Optimization

1. **Enable caching**:
   - Setup Redis untuk caching
   - Cache API responses

2. **Database optimization**:
   - Add indexes on frequently queried columns
   - Optimize queries

3. **Code optimization**:
   - Enable Next.js compression
   - Minify assets
   - Setup CDN

## Monitoring & Maintenance

1. **Setup monitoring**:
   - Sentry for error tracking
   - New Relic atau DataDog for performance

2. **Regular backups**:
   - Setup automated daily backups
   - Test restore process

3. **Updates**:
   - Keep dependencies updated
   - Monitor security advisories

## Troubleshooting

### App crashes after deploy
- Check logs: `pm2 logs`
- Verify environment variables
- Check database connection

### Database connection timeout
- Check cloud database status
- Verify connection string
- Check firewall rules

### High memory usage
- Check for memory leaks
- Optimize database queries
- Scale up resources

## Domain Setup

1. Purchase domain dari registrar (Namecheap, GoDaddy, dll)
2. Point domain ke Vercel/Railway/VPS:
   - Update nameservers (untuk VPS)
   - Or update DNS records
3. Enable HTTPS

## Rollback Plan

If deployment goes wrong:

\`\`\`bash
# Git rollback
git revert <commit-hash>
git push

# Database rollback
# Restore dari backup: backup.sql
mysql -u root -p db_biodosen < backup.sql
\`\`\`

## Production Security Checklist

- [ ] Change all default passwords
- [ ] Setup firewall rules
- [ ] Enable HTTPS everywhere
- [ ] Setup rate limiting
- [ ] Enable security headers
- [ ] Setup backup & disaster recovery
- [ ] Monitor for suspicious activity
- [ ] Regular security updates
- [ ] Setup WAF (Web Application Firewall)
\`\`\`
