.PHONY: help build up down restart logs ps clean migrate backup restore db-export

# Docker Compose file
COMPOSE_FILE=docker-compose.production.yml

# Colors for output
BLUE=\033[0;34m
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Show this help message
	@echo "$(BLUE)Software Hub - Docker Management$(NC)"
	@echo ""
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'
	@echo ""

build: ## Build Docker images
	@echo "$(BLUE)Building Docker images...$(NC)"
	docker-compose -f $(COMPOSE_FILE) build --no-cache

up: ## Start all services
	@echo "$(BLUE)Starting services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) up -d
	@echo "$(GREEN)Services started!$(NC)"
	@make ps

down: ## Stop all services
	@echo "$(BLUE)Stopping services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) down
	@echo "$(GREEN)Services stopped!$(NC)"

restart: ## Restart all services
	@echo "$(BLUE)Restarting services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) restart
	@echo "$(GREEN)Services restarted!$(NC)"

logs: ## View logs (use SERVICE=app for specific service)
	@docker-compose -f $(COMPOSE_FILE) logs -f $(SERVICE)

ps: ## Show running containers
	@docker-compose -f $(COMPOSE_FILE) ps

clean: ## Remove containers, images, and volumes
	@echo "$(YELLOW)Warning: This will remove all containers, images, and volumes!$(NC)"
	@read -p "Are you sure? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f $(COMPOSE_FILE) down -v; \
		docker system prune -af; \
		echo "$(GREEN)Cleanup complete!$(NC)"; \
	fi

migrate: ## Run database migrations
	@echo "$(BLUE)Running database migrations...$(NC)"
	docker-compose -f $(COMPOSE_FILE) exec app npm run db:migrate
	@echo "$(GREEN)Migrations complete!$(NC)"

backup: ## Backup database
	@echo "$(BLUE)Creating database backup...$(NC)"
	@mkdir -p backups
	@docker-compose -f $(COMPOSE_FILE) exec -T db pg_dump -U software_hub_user software_hub > backups/backup-$$(date +%Y%m%d-%H%M%S).sql
	@echo "$(GREEN)Backup created in backups/ directory$(NC)"

restore: ## Restore database from backup (use BACKUP=filename)
	@if [ -z "$(BACKUP)" ]; then \
		echo "$(YELLOW)Usage: make restore BACKUP=backups/backup-20240125.sql$(NC)"; \
		exit 1; \
	fi
	@echo "$(BLUE)Restoring database from $(BACKUP)...$(NC)"
	@cat $(BACKUP) | docker-compose -f $(COMPOSE_FILE) exec -T db psql -U software_hub_user -d software_hub
	@echo "$(GREEN)Database restored!$(NC)"

db-export: ## Export full database dump to /database folder
	@echo "$(BLUE)Exporting database...$(NC)"
	@./scripts/export-database.sh
	@echo "$(GREEN)Database export complete! Check database/dumps/ folder$(NC)"

shell-app: ## Open shell in app container
	@docker-compose -f $(COMPOSE_FILE) exec app sh

shell-db: ## Open PostgreSQL shell
	@docker-compose -f $(COMPOSE_FILE) exec db psql -U software_hub_user -d software_hub

stats: ## Show container resource usage
	@docker stats --no-stream

health: ## Check service health
	@echo "$(BLUE)Checking service health...$(NC)"
	@curl -f http://localhost:3000/api/health && echo "$(GREEN)✓ App is healthy$(NC)" || echo "$(YELLOW)✗ App is not responding$(NC)"

deploy: ## Full deployment (build, down, up, migrate)
	@echo "$(BLUE)Starting full deployment...$(NC)"
	@make build
	@make down
	@make up
	@sleep 10
	@make migrate
	@make health
	@echo "$(GREEN)Deployment complete!$(NC)"

dev: ## Start development environment
	@echo "$(BLUE)Starting development environment...$(NC)"
	docker-compose up -d
	@echo "$(GREEN)Development environment started!$(NC)"

prod: ## Start production environment
	@echo "$(BLUE)Starting production environment...$(NC)"
	@make up

update: ## Pull latest images and restart
	@echo "$(BLUE)Updating services...$(NC)"
	docker-compose -f $(COMPOSE_FILE) pull
	@make restart
	@echo "$(GREEN)Update complete!$(NC)"
