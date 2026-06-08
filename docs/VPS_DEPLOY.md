# Deploy Full VPS — Software Hub (Supabase + PM2)

Hướng dẫn deploy **toàn bộ app trên VPS** (Contabo), DB trên **Supabase cloud**.

```
Internet → Nginx (80/443) → PM2 app :5000
                              ↓
                    Supabase (DB + Auth + Storage)
                    Docker: Redis + Mongo (local)
```

---

## 1. Chuẩn bị VPS (một lần)

**Yêu cầu:** Ubuntu 22.04+, 2GB RAM, Docker, Node 20, PM2, Nginx.

```bash
# SSH vào VPS
ssh root@<IP-VPS>

# Node 20 + PM2
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2

# Docker
curl -fsSL https://get.docker.com | sh
```

Tạo thư mục app:

```bash
mkdir -p /var/www/software-hub
```

---

## 2. File `.env` trên VPS (một lần)

```bash
cd /var/www/software-hub
nano .env
```

Copy từ `.env.vps.example` trong repo và điền key từ **Supabase Dashboard**.

| Biến | Lấy ở đâu |
|------|-----------|
| `SUPABASE_URL` | Project Settings → API |
| `SUPABASE_PUBLISHABLE_KEY` | API → publishable key |
| `SUPABASE_SERVICE_KEY` | API → secret key (server only) |
| `SUPABASE_DB_PASSWORD` | Settings → Database |
| `SUPABASE_DB_HOST` | Connection string pooler (vd. `aws-1-ap-southeast-1.pooler.supabase.com`) |

**Lưu ý:** File `.env` **không** nằm trong git. Mỗi lần deploy tarball **không ghi đè** `.env` nếu đã có sẵn trên VPS.

---

## 3. Domain + SSL (một lần)

Xem chi tiết: [DOMAIN_SETUP.md](./DOMAIN_SETUP.md)

1. DNS A record `@` và `www` → IP VPS  
2. Trên VPS:

```bash
cd /var/www/software-hub
sudo ./scripts/setup-domain.sh
# hoặc cấu hình Nginx proxy → localhost:5000 thủ công
```

---

## 4. Deploy tự động — GitHub Actions (khuyến nghị)

Mỗi `git push main` → build → SCP lên VPS → PM2 reload.

### GitHub Secrets (Settings → Secrets → Actions)

| Secret | Mô tả |
|--------|--------|
| `SSH_HOST` | IP VPS |
| `SSH_USERNAME` | `root` hoặc user deploy |
| `SSH_KEY` | Private key SSH |
| `SSH_PORT` | `22` |
| `VITE_SUPABASE_URL` | Cho build frontend |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Cho build frontend |

Workflow: `.github/workflows/deploy.yml`

### Chạy thủ công

GitHub → Actions → **Deploy to Contabo VPS** → Run workflow

---

## 5. Deploy thủ công trên VPS

```bash
cd /var/www/software-hub
git pull origin main
npm ci
npm run build
docker compose -f docker-compose.vps.yml up -d
npm ci --omit=dev
pm2 reload ecosystem.config.cjs --env production
pm2 save
```

---

## 6. Kiểm tra sau deploy

```bash
# App
curl http://localhost:5000/health

# PM2
pm2 status
pm2 logs software-hub-server --lines 50

# Docker
docker compose -f docker-compose.vps.yml ps
```

Trình duyệt: `https://swhubco.com`

---

## 7. Cấu trúc chạy trên VPS

| Thành phần | Cách chạy | Port |
|------------|-----------|------|
| Main app (Express + React build) | PM2 `software-hub-server` | 5000 |
| Email service | PM2 | 3001 |
| Chat service | PM2 | 3002 |
| Notification service | PM2 | 3003 |
| Redis | Docker | 127.0.0.1:6379 |
| MongoDB | Docker | 127.0.0.1:27017 |
| PostgreSQL | **Supabase cloud** | — |

---

## 8. Lệnh thường dùng

```bash
# Restart app
pm2 restart software-hub-server

# Xem log
pm2 logs

# Cập nhật chỉ infrastructure
docker compose -f docker-compose.vps.yml up -d

# Backup: DB nằm trên Supabase → dùng Supabase Dashboard backup
```

---

## 9. Khác với Vercel?

| | Full VPS (cách này) | Vercel |
|--|---------------------|--------|
| Express + WebSocket | ✅ PM2 | ❌ cần refactor |
| Redis queue | ✅ Docker local | ❌ |
| Env secrets | `.env` trên VPS | Vercel dashboard |
| Deploy | git push → Actions | git push → Vercel |

**Kết luận:** Giữ full VPS như document — không cần Vercel cho app này.
