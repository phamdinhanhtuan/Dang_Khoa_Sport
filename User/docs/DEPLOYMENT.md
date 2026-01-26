# Deployment Guide

## Prerequisites
- **Docker** v20.10+
- **Docker Compose** v1.29+
- **Node.js** v18+ (for local dev)

## Environment Configuration
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Update the credentials in `.env`.
   - **Important**: For production, ensure `NODE_ENV=production` and strong secrets for `JWT_SECRET` and `SESSION_SECRET`.

## Docker Deployment (Recommended)

The project includes a production-ready `docker-compose.yml` that orchestrates:
- **App**: The Node.js application.
- **MongoDB**: Persistent database.
- **Redis**: In-memory cache.
- **Nginx**: Reverse proxy.

### Steps:
1. **Build and Run**:
   ```bash
   docker-compose up --build -d
   ```
2. **Verify**:
   Check if containers are running:
   ```bash
   docker-compose ps
   ```
3. **Access**:
   - Web App: `http://localhost` (Port 80 is mapped by Nginx).
   - API: `http://localhost/api`.

## Manual Deployment (PM2)

If you prefer running on bare metal or a VM without Docker:

1. **Install Dependencies**:
   ```bash
   npm ci --only=production
   ```
2. **Install PM2**:
   ```bash
   npm install -g pm2
   ```
3. **Start Application**:
   ```bash
   pm2 start src/server.js --name "dangkhoa-sport" -i max
   ```
   *`-i max` runs in cluster mode utilizing all CPU cores.*

## CI/CD Pipeline (GitHub Actions - Example)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy
on:
  push:
    branches: [ main ]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - name: Build Docker Image
      run: docker build -t my-registry/dangkhoa-sport:${{ github.sha }} .
    - name: Push to Registry
      run: docker push my-registry/dangkhoa-sport:${{ github.sha }}
```

## Monitoring & Logs
- **Health Check**: `GET /health` returns status and uptime.
- **Logs**:
  - Docker: `docker-compose logs -f app`
  - File System: `./logs/error.log` and `./logs/all.log` (Winston).
