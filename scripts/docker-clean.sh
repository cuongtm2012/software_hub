#!/bin/bash

# SoftwareHub Docker Cleanup Script
# This script cleans up Docker containers, images, and volumes

set -e

echo "🧹 SoftwareHub Docker Cleanup..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[CLEANUP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to ask for confirmation
confirm() {
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        return 1
    fi
}

# Stop all containers
stop_containers() {
    print_status "Stopping all SoftwareHub containers..."
    
    # Try both docker-compose and docker compose
    docker-compose down 2>/dev/null || docker compose down 2>/dev/null || true
    docker-compose -f docker-compose.yml -f docker-compose.dev.yml down 2>/dev/null || true
    
    print_success "All containers stopped"
}

# Remove containers
remove_containers() {
    print_warning "This will remove all SoftwareHub containers."
    if confirm; then
        print_status "Removing containers..."
        
        # Remove specific containers
        containers=("softwarehub-main" "softwarehub-email" "softwarehub-chat" "softwarehub-notification" "softwarehub-worker" "softwarehub-postgres" "softwarehub-redis" "softwarehub-mongo")
        
        for container in "${containers[@]}"; do
            if docker ps -a --format "table {{.Names}}" | grep -q "^$container$"; then
                docker rm -f "$container" 2>/dev/null || true
                print_status "Removed container: $container"
            fi
        done
        
        print_success "Containers removed"
    else
        print_status "Skipping container removal"
    fi
}

# Remove images
remove_images() {
    print_warning "This will remove all SoftwareHub Docker images."
    if confirm; then
        print_status "Removing images..."
        
        # Remove specific images
        images=("softwarehub-app" "softwarehub-email" "softwarehub-chat" "softwarehub-notification" "softwarehub-worker")
        
        for image in "${images[@]}"; do
            if docker images --format "table {{.Repository}}" | grep -q "^$image$"; then
                docker rmi -f "$image:latest" 2>/dev/null || true
                print_status "Removed image: $image:latest"
            fi
        done
        
        print_success "Images removed"
    else
        print_status "Skipping image removal"
    fi
}

# Remove volumes
remove_volumes() {
    print_warning "This will remove all data volumes (INCLUDING DATABASE DATA)."
    print_error "This action is IRREVERSIBLE and will delete all your data!"
    if confirm; then
        print_status "Removing volumes..."
        
        # Remove specific volumes
        volumes=("postgres_data" "redis_data" "mongo_data")
        
        for volume in "${volumes[@]}"; do
            if docker volume ls --format "table {{.Name}}" | grep -q "softwarehub.*$volume\|.*$volume"; then
                docker volume rm "$(docker volume ls -q | grep "$volume")" 2>/dev/null || true
                print_status "Removed volume: $volume"
            fi
        done
        
        print_success "Volumes removed"
    else
        print_status "Skipping volume removal"
    fi
}

# Clean system
clean_system() {
    print_status "Cleaning Docker system..."
    
    # Remove unused networks
    docker network prune -f
    
    # Remove dangling images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    print_success "System cleaned"
}

# Show cleanup options
show_menu() {
    echo ""
    echo "🧹 SoftwareHub Docker Cleanup Options:"
    echo ""
    echo "1) Stop containers only"
    echo "2) Stop and remove containers"
    echo "3) Stop, remove containers and images"
    echo "4) Full cleanup (containers, images, and volumes - DESTROYS DATA)"
    echo "5) System cleanup (remove unused Docker resources)"
    echo "6) Exit"
    echo ""
    read -p "Choose an option (1-6): " choice
    
    case $choice in
        1)
            stop_containers
            ;;
        2)
            stop_containers
            remove_containers
            ;;
        3)
            stop_containers
            remove_containers
            remove_images
            ;;
        4)
            stop_containers
            remove_containers
            remove_images
            remove_volumes
            ;;
        5)
            clean_system
            ;;
        6)
            print_status "Exiting..."
            exit 0
            ;;
        *)
            print_error "Invalid option. Please choose 1-6."
            show_menu
            ;;
    esac
}

# Show summary
show_summary() {
    print_success "🎉 Cleanup completed!"
    echo ""
    echo "📊 Current Docker status:"
    echo ""
    echo "🐳 Running containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(softwarehub|NAMES)" || echo "No SoftwareHub containers running"
    echo ""
    echo "💾 Available images:"
    docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep -E "(softwarehub|REPOSITORY)" || echo "No SoftwareHub images found"
    echo ""
    echo "📁 Available volumes:"
    docker volume ls --format "table {{.Name}}\t{{.Driver}}" | grep -E "(data|NAME)" || echo "No data volumes found"
}

# Main execution
main() {
    show_menu
    show_summary
}

# Execute main function
main "$@"