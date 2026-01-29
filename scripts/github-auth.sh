#!/bin/bash

# GitHub Authentication Helper Script
# This script helps you configure GitHub authentication for the Software Hub project

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== GitHub Authentication Helper ===${NC}"
echo ""

# Check current Git configuration
echo -e "${BLUE}📋 Current Git Configuration:${NC}"
echo "User Name: $(git config user.name || echo 'Not set')"
echo "User Email: $(git config user.email || echo 'Not set')"
echo "Remote URL: $(git remote get-url origin 2>/dev/null || echo 'Not set')"
echo ""

# Check credential helper
CRED_HELPER=$(git config --get credential.helper 2>/dev/null || echo "none")
echo "Credential Helper: $CRED_HELPER"
echo ""

# Menu
echo -e "${YELLOW}Choose authentication method:${NC}"
echo "1) Setup Personal Access Token (PAT) - Recommended"
echo "2) Setup SSH Key"
echo "3) Install GitHub CLI (gh)"
echo "4) Check current authentication status"
echo "5) Clear saved credentials"
echo "6) Exit"
echo ""

read -p "Enter your choice (1-6): " choice

case $choice in
  1)
    echo ""
    echo -e "${GREEN}=== Setup Personal Access Token ===${NC}"
    echo ""
    echo "Steps to create a Personal Access Token:"
    echo "1. Visit: https://github.com/settings/tokens"
    echo "2. Click 'Generate new token (classic)'"
    echo "3. Name: 'software_hub_dev'"
    echo "4. Select scopes: repo, workflow, write:packages"
    echo "5. Click 'Generate token'"
    echo "6. Copy the token (shown only once!)"
    echo ""
    
    # Configure credential helper
    echo "Configuring credential helper..."
    git config --global credential.helper osxkeychain
    echo -e "${GREEN}✓ Credential helper configured${NC}"
    echo ""
    
    echo "Next time you push, Git will ask for:"
    echo "  Username: cuongtm2012"
    echo "  Password: <paste your token here>"
    echo ""
    echo "macOS will save it to Keychain automatically."
    echo ""
    
    read -p "Do you want to test push now? (y/n): " test_push
    if [[ $test_push =~ ^[Yy]$ ]]; then
      echo ""
      echo "Testing connection..."
      git push origin main --dry-run
    fi
    ;;
    
  2)
    echo ""
    echo -e "${GREEN}=== Setup SSH Key ===${NC}"
    echo ""
    
    # Check if SSH key exists
    if [ -f ~/.ssh/id_ed25519.pub ]; then
      echo -e "${YELLOW}SSH key already exists!${NC}"
      echo ""
      echo "Your public key:"
      cat ~/.ssh/id_ed25519.pub
      echo ""
      echo "Copy the above key and add it to GitHub:"
      echo "https://github.com/settings/keys"
    else
      echo "Generating new SSH key..."
      ssh-keygen -t ed25519 -C "cuongtm2012@gmail.com" -f ~/.ssh/id_ed25519
      
      echo ""
      echo "Starting SSH agent..."
      eval "$(ssh-agent -s)"
      
      echo "Adding SSH key to agent..."
      ssh-add ~/.ssh/id_ed25519
      
      echo ""
      echo -e "${GREEN}✓ SSH key generated${NC}"
      echo ""
      echo "Your public key:"
      cat ~/.ssh/id_ed25519.pub
      echo ""
      echo "Copy the above key and add it to GitHub:"
      echo "https://github.com/settings/keys"
    fi
    
    echo ""
    read -p "After adding key to GitHub, press Enter to test connection..."
    
    echo "Testing SSH connection..."
    ssh -T git@github.com || true
    
    echo ""
    read -p "Do you want to change remote URL to SSH? (y/n): " change_url
    if [[ $change_url =~ ^[Yy]$ ]]; then
      git remote set-url origin git@github.com:cuongtm2012/software_hub.git
      echo -e "${GREEN}✓ Remote URL changed to SSH${NC}"
      echo "New URL: $(git remote get-url origin)"
    fi
    ;;
    
  3)
    echo ""
    echo -e "${GREEN}=== Install GitHub CLI ===${NC}"
    echo ""
    
    # Check if gh is installed
    if command -v gh &> /dev/null; then
      echo -e "${GREEN}✓ GitHub CLI is already installed${NC}"
      gh --version
    else
      echo "Installing GitHub CLI..."
      if command -v brew &> /dev/null; then
        brew install gh
      else
        echo -e "${RED}Homebrew not found!${NC}"
        echo "Please install from: https://cli.github.com/"
        exit 1
      fi
    fi
    
    echo ""
    echo "Authenticating with GitHub..."
    gh auth login
    
    echo ""
    echo "Checking authentication status..."
    gh auth status
    ;;
    
  4)
    echo ""
    echo -e "${GREEN}=== Authentication Status ===${NC}"
    echo ""
    
    # Check Git config
    echo -e "${BLUE}Git Configuration:${NC}"
    echo "User: $(git config user.name) <$(git config user.email)>"
    echo "Remote: $(git remote get-url origin)"
    echo "Credential Helper: $(git config --get credential.helper || echo 'Not configured')"
    echo ""
    
    # Check SSH
    echo -e "${BLUE}SSH Keys:${NC}"
    if [ -f ~/.ssh/id_ed25519.pub ]; then
      echo "✓ SSH key exists"
      echo "Testing connection..."
      ssh -T git@github.com 2>&1 | grep -q "successfully authenticated" && echo "✓ SSH authentication working" || echo "✗ SSH authentication failed"
    else
      echo "✗ No SSH key found"
    fi
    echo ""
    
    # Check GitHub CLI
    echo -e "${BLUE}GitHub CLI:${NC}"
    if command -v gh &> /dev/null; then
      echo "✓ GitHub CLI installed"
      gh auth status 2>&1 | head -5
    else
      echo "✗ GitHub CLI not installed"
    fi
    echo ""
    
    # Test connection
    echo -e "${BLUE}Testing connection:${NC}"
    git ls-remote origin HEAD &> /dev/null && echo "✓ Can connect to repository" || echo "✗ Cannot connect to repository"
    ;;
    
  5)
    echo ""
    echo -e "${YELLOW}=== Clear Saved Credentials ===${NC}"
    echo ""
    echo "This will remove saved GitHub credentials from macOS Keychain."
    read -p "Are you sure? (y/n): " confirm
    
    if [[ $confirm =~ ^[Yy]$ ]]; then
      echo "Clearing credentials..."
      printf "protocol=https\nhost=github.com\n" | git credential-osxkeychain erase
      echo -e "${GREEN}✓ Credentials cleared${NC}"
      echo "You'll need to enter your token again on next push."
    fi
    ;;
    
  6)
    echo "Goodbye!"
    exit 0
    ;;
    
  *)
    echo -e "${RED}Invalid choice${NC}"
    exit 1
    ;;
esac

echo ""
echo -e "${GREEN}=== Done! ===${NC}"
echo ""
echo "For more information, see: docs/GITHUB_AUTHENTICATION.md"
