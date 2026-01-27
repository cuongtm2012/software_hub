# 🐳 Docker Quick Start Guide

## Triển khai nhanh với Docker

### Bước 1: Chuẩn bị

```bash
# Sao chép file environment
cp .env.production.example .env.production

# Chỉnh sửa file .env.production
nano .env.production
```

### Bước 2: Deploy

```bash
# Sử dụng script tự động (Khuyến nghị)
chmod +x deploy.sh
./deploy.sh

# Hoặc chạy thủ công
docker-compose -f docker-compose.prod.yml up -d --build
```

### Bước 3: Kiểm tra

```bash
# Xem status
docker-compose -f docker-compose.prod.yml ps

# Xem logs
docker-compose -f docker-compose.prod.yml logs -f

# Test health
curl http://localhost:5000/api/health
```

## 📚 Tài liệu chi tiết

Xem [DOCKER_DEPLOYMENT.md](./docs/DOCKER_DEPLOYMENT.md) để biết thêm chi tiết.

## 🔧 Lệnh hữu ích

```bash
# Stop
docker-compose -f docker-compose.prod.yml down

# Restart
docker-compose -f docker-compose.prod.yml restart

# Backup DB
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U postgres software_hub > backup.sql

# View logs
docker-compose -f docker-compose.prod.yml logs -f app
```

## ⚡ Quick Commands

| Command | Description |
|---------|-------------|
| `./deploy.sh` | Interactive deployment menu |
| `docker-compose -f docker-compose.prod.yml up -d` | Start services |
| `docker-compose -f docker-compose.prod.yml down` | Stop services |
| `docker-compose -f docker-compose.prod.yml logs -f` | View logs |
| `docker-compose -f docker-compose.prod.yml ps` | Check status |

## 🆘 Troubleshooting

### Container không khởi động
```bash
docker-compose -f docker-compose.prod.yml logs app
```

### Reset toàn bộ (⚠️ XÓA DỮ LIỆU)
```bash
docker-compose -f docker-compose.prod.yml down -v
```

### Rebuild từ đầu
```bash
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```
