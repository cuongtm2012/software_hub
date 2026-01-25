# 🔧 Deployment Scripts

Automated scripts for VPS setup and Docker deployment.

## 📋 Available Scripts

### 1. `setup-complete.sh` ⭐ **Recommended**

**All-in-one automated setup script**

```bash
# Upload and run
scp scripts/setup-complete.sh root@95.111.253.111:/tmp/
ssh root@95.111.253.111 "bash /tmp/setup-complete.sh"
```

**What it does:**
- ✓ Installs Docker & Docker Compose
- ✓ Sets up project directory
- ✓ Configures environment variables
- ✓ Builds Docker images
- ✓ Starts all services
- ✓ Runs database migrations
- ✓ Performs health checks

**Use when:** First-time setup or complete reinstall

---

### 2. `setup-vps-docker.sh`

**VPS setup with Docker installation**

```bash
scp scripts/setup-vps-docker.sh root@95.111.253.111:/tmp/
ssh root@95.111.253.111 "bash /tmp/setup-vps-docker.sh"
```

**What it does:**
- Installs Docker Engine
- Installs Docker Compose
- Configures Docker daemon
- Sets up firewall (UFW)
- Installs additional tools (git, curl, htop)
- Creates project directory
- Installs fail2ban

**Use when:** Setting up a fresh VPS

---

### 3. `configure-env.sh`

**Interactive environment configuration**

```bash
# On VPS
cd /var/www/software-hub
bash scripts/configure-env.sh
```

**What it does:**
- Generates secure random passwords
- Prompts for API keys (interactive)
- Creates `.env.production`
- Backs up existing configuration
- Saves credentials securely

**Use when:** Need to configure or update environment variables

---

### 4. `migrate-db-to-docker.sh`

**Database migration from host to Docker**

```bash
# On VPS
cd /var/www/software-hub
bash scripts/migrate-db-to-docker.sh [db_name] [db_user]
```

**What it does:**
- Backs up existing PostgreSQL database
- Stops Docker containers
- Optionally removes old volume
- Starts PostgreSQL container
- Restores backup to Docker
- Verifies migration
- Starts all services

**Use when:** Migrating from host PostgreSQL to Docker

---

### 5. `vps-health-check.sh`

**System health verification**

```bash
# On VPS
bash scripts/vps-health-check.sh
```

**What it checks:**
- Node.js installation
- npm installation
- PM2 installation (if applicable)
- PostgreSQL installation
- Nginx installation
- SSH configuration
- Firewall status
- Project directory
- Disk space
- Memory usage

**Use when:** Verifying VPS configuration

---

### 6. `post-setup.sh`

**Post-installation configuration**

```bash
# On VPS
bash scripts/post-setup.sh
```

**What it does:**
- Generates SSH keys for GitHub Actions
- Creates environment file template
- Provides next steps instructions

**Use when:** After initial VPS setup (non-Docker)

---

## 🚀 Quick Start Workflows

### First Time Setup (Docker)

```bash
# Option 1: Complete automated setup
scp scripts/setup-complete.sh root@95.111.253.111:/tmp/
ssh root@95.111.253.111 "bash /tmp/setup-complete.sh"

# Option 2: Step by step
scp scripts/setup-vps-docker.sh root@95.111.253.111:/tmp/
ssh root@95.111.253.111 "bash /tmp/setup-vps-docker.sh"
ssh root@95.111.253.111
cd /var/www/software-hub
bash scripts/configure-env.sh
make deploy
```

### Update Environment Variables

```bash
ssh root@95.111.253.111
cd /var/www/software-hub
bash scripts/configure-env.sh
make restart
```

### Migrate Database to Docker

```bash
ssh root@95.111.253.111
cd /var/www/software-hub
bash scripts/migrate-db-to-docker.sh software_hub software_hub_user
```

### Health Check

```bash
ssh root@95.111.253.111
bash scripts/vps-health-check.sh
```

---

## 📝 Script Comparison

| Script | Docker | Interactive | Time | Complexity |
|--------|--------|-------------|------|------------|
| `setup-complete.sh` | ✓ | Minimal | ~5 min | Low |
| `setup-vps-docker.sh` | ✓ | Some | ~3 min | Low |
| `configure-env.sh` | - | Yes | ~2 min | Low |
| `migrate-db-to-docker.sh` | ✓ | Yes | ~5 min | Medium |
| `vps-health-check.sh` | - | No | ~1 min | Low |
| `post-setup.sh` | - | Some | ~2 min | Low |

---

## 🔍 Troubleshooting

### Script Permission Denied

```bash
chmod +x scripts/*.sh
```

### Script Not Found

```bash
# Make sure you're in project directory
cd /var/www/software-hub

# Check if scripts exist
ls -la scripts/
```

### Docker Not Installed

```bash
# Run Docker setup first
bash scripts/setup-vps-docker.sh
```

### Environment Variables Not Set

```bash
# Run configuration script
bash scripts/configure-env.sh

# Or manually create
cp .env.production.template .env.production
nano .env.production
```

---

## 📚 Documentation

- **Docker Setup**: [../docs/DOCKER_SETUP_GUIDE.md](../docs/DOCKER_SETUP_GUIDE.md)
- **Docker Deployment**: [../docs/DOCKER_DEPLOYMENT.md](../docs/DOCKER_DEPLOYMENT.md)
- **Quick Reference**: [../docs/DOCKER_QUICK_REFERENCE.md](../docs/DOCKER_QUICK_REFERENCE.md)

---

## 🔐 Security Notes

1. **Credentials**: Scripts generate secure random passwords
2. **Permissions**: `.env.production` is set to 600 (owner read/write only)
3. **Backups**: Existing configurations are backed up before overwriting
4. **Credentials File**: Temporary credentials files are created with 600 permissions

**Always:**
- Save generated passwords securely
- Delete credential files after saving
- Don't commit `.env.production` to git
- Use strong passwords for production

---

## 💡 Tips

1. **Use `setup-complete.sh` for first-time setup** - It handles everything
2. **Run `configure-env.sh` when updating config** - Interactive and safe
3. **Use `vps-health-check.sh` regularly** - Catch issues early
4. **Backup before migration** - `migrate-db-to-docker.sh` creates backups
5. **Check logs if scripts fail** - Most scripts provide detailed output

---

**Need help?** Check the documentation or run scripts with `-h` flag (if supported)
