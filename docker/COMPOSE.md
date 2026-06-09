# Docker Compose — which file to use

| File | Purpose |
|------|---------|
| **`docker-compose.vps.yml`** | **Production VPS** — Redis + MongoDB only (app runs via PM2; DB on Supabase) |
| **`docker-compose.yml`** | Full local stack — Postgres + Redis + Mongo + microservices + gateweaver (heavy) |
| **`docker-compose.dev.yml`** | Override for hot-reload microservices — use with `-f docker-compose.yml -f docker-compose.dev.yml` |

## Deprecated (do not use for new setups)

| File | Use instead |
|------|-------------|
| `docker-compose.prod.yml` | `docker-compose.vps.yml` + Supabase |
| `docker-compose.production.yml` | `docker-compose.vps.yml` + Supabase |

## Quick commands

```bash
# Production VPS (Redis + Mongo)
docker compose -f docker-compose.vps.yml up -d

# Local full stack (optional legacy microservices dev)
docker compose up -d postgres redis mongo
```
