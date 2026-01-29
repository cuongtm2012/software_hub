# GitHub Authentication Guide

Hướng dẫn cấu hình xác thực GitHub cho dự án Software Hub.

## ✅ Đã Cấu Hình

Thông tin Git user đã được cấu hình:
- **Name**: Tran Manh Cuong
- **Email**: cuongtm2012@gmail.com
- **Repository**: https://github.com/cuongtm2012/software_hub.git

## 🔐 Các Phương Thức Xác Thực

### 1. Personal Access Token (PAT) - Khuyến Nghị

GitHub đã ngưng hỗ trợ xác thực bằng password. Bạn cần sử dụng Personal Access Token.

#### Tạo Personal Access Token

1. Truy cập: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Đặt tên token: `software_hub_dev`
4. Chọn scopes:
   - ✅ `repo` (Full control of private repositories)
   - ✅ `workflow` (Update GitHub Action workflows)
   - ✅ `write:packages` (Upload packages)
   - ✅ `delete:packages` (Delete packages)
5. Click **"Generate token"**
6. **Copy token ngay** (chỉ hiển thị 1 lần!)

#### Sử dụng Token

**Cách 1: Lưu vào macOS Keychain (Tự động)**

```bash
# Khi push lần đầu, Git sẽ hỏi username và password
git push origin main

# Username: cuongtm2012
# Password: <paste your token here>

# macOS sẽ tự động lưu vào Keychain
```

**Cách 2: Cấu hình Git Credential Helper**

```bash
# Sử dụng macOS Keychain
git config --global credential.helper osxkeychain

# Hoặc cache trong 1 giờ
git config --global credential.helper 'cache --timeout=3600'
```

**Cách 3: Lưu trong URL (Không khuyến nghị - không an toàn)**

```bash
git remote set-url origin https://cuongtm2012:<YOUR_TOKEN>@github.com/cuongtm2012/software_hub.git
```

### 2. SSH Key - Phương Pháp An Toàn Nhất

#### Tạo SSH Key

```bash
# Tạo SSH key mới
ssh-keygen -t ed25519 -C "cuongtm2012@gmail.com"

# Nhấn Enter để lưu vào vị trí mặc định: ~/.ssh/id_ed25519
# Nhập passphrase (tùy chọn)

# Start SSH agent
eval "$(ssh-agent -s)"

# Thêm SSH key vào agent
ssh-add ~/.ssh/id_ed25519

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

#### Thêm SSH Key vào GitHub

1. Copy nội dung file `~/.ssh/id_ed25519.pub`
2. Truy cập: https://github.com/settings/keys
3. Click **"New SSH key"**
4. Title: `MacBook Pro - Software Hub`
5. Paste public key vào ô "Key"
6. Click **"Add SSH key"**

#### Đổi Remote URL sang SSH

```bash
# Kiểm tra remote hiện tại
git remote -v

# Đổi sang SSH
git remote set-url origin git@github.com:cuongtm2012/software_hub.git

# Test kết nối
ssh -T git@github.com
```

### 3. GitHub CLI (gh) - Dễ Nhất

#### Cài đặt GitHub CLI

```bash
# macOS với Homebrew
brew install gh

# Hoặc download từ: https://cli.github.com/
```

#### Xác thực

```bash
# Login
gh auth login

# Chọn:
# - GitHub.com
# - HTTPS
# - Login with a web browser
# - Copy one-time code và paste vào browser

# Kiểm tra
gh auth status
```

#### Sử dụng

```bash
# Push code
git push origin main

# Tạo pull request
gh pr create

# Xem issues
gh issue list

# Clone repo
gh repo clone cuongtm2012/software_hub
```

## 🔧 Cấu Hình Hiện Tại

### Git Config

```bash
# Xem tất cả cấu hình
git config --list --show-origin

# Xem user config
git config user.name
git config user.email

# Xem remote
git remote -v
```

### Credential Helper

macOS đã tự động cấu hình `osxkeychain`:

```bash
git config --global credential.helper osxkeychain
```

## 📝 Workflow Khuyến Nghị

### Làm Việc Hàng Ngày

```bash
# 1. Pull code mới nhất
git pull origin main

# 2. Tạo branch mới cho feature
git checkout -b feature/new-feature

# 3. Làm việc và commit
git add .
git commit -m "feat: add new feature"

# 4. Push lên GitHub
git push origin feature/new-feature

# 5. Tạo Pull Request (nếu dùng gh CLI)
gh pr create --title "Add new feature" --body "Description"

# 6. Merge về main (sau khi review)
git checkout main
git pull origin main
git merge feature/new-feature
git push origin main
```

### Commit Message Convention

Sử dụng Conventional Commits:

```bash
# Features
git commit -m "feat: add user authentication"

# Bug fixes
git commit -m "fix: resolve login issue"

# Documentation
git commit -m "docs: update README"

# Refactoring
git commit -m "refactor: improve database queries"

# Performance
git commit -m "perf: optimize image loading"

# Tests
git commit -m "test: add unit tests for auth"

# Chores
git commit -m "chore: update dependencies"
```

## 🔒 Bảo Mật

### Không Commit Sensitive Data

File `.gitignore` đã được cấu hình để bỏ qua:

```
.env
.env.local
.env.production
*.key
*.pem
node_modules/
```

### Kiểm Tra Trước Khi Commit

```bash
# Xem những gì sẽ được commit
git status

# Xem diff
git diff

# Xem staged changes
git diff --staged

# Kiểm tra .env không bị commit
git ls-files | grep .env
```

### Xóa File Nhạy Cảm Đã Commit Nhầm

```bash
# Xóa file khỏi Git nhưng giữ lại local
git rm --cached .env

# Commit
git commit -m "chore: remove .env from git"

# Push
git push origin main
```

## 🚀 Tips & Tricks

### Aliases Hữu Ích

```bash
# Thêm vào ~/.gitconfig hoặc chạy:
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

### Undo Commits

```bash
# Undo commit cuối (giữ changes)
git reset --soft HEAD~1

# Undo commit cuối (xóa changes)
git reset --hard HEAD~1

# Amend commit cuối
git commit --amend -m "new message"
```

### Stash Changes

```bash
# Lưu changes tạm thời
git stash

# Xem stash list
git stash list

# Apply stash
git stash apply

# Apply và xóa stash
git stash pop
```

## 📚 Tài Liệu Tham Khảo

- [GitHub Docs - Authentication](https://docs.github.com/en/authentication)
- [GitHub CLI Manual](https://cli.github.com/manual/)
- [Git Documentation](https://git-scm.com/doc)
- [Conventional Commits](https://www.conventionalcommits.org/)

## ❓ Troubleshooting

### Lỗi: "Authentication failed"

```bash
# Xóa credentials cũ
git credential-osxkeychain erase
host=github.com
protocol=https

# Push lại và nhập token mới
git push origin main
```

### Lỗi: "Permission denied (publickey)"

```bash
# Kiểm tra SSH key
ssh -T git@github.com

# Thêm SSH key vào agent
ssh-add ~/.ssh/id_ed25519

# Kiểm tra SSH config
cat ~/.ssh/config
```

### Lỗi: "Repository not found"

```bash
# Kiểm tra remote URL
git remote -v

# Sửa remote URL
git remote set-url origin https://github.com/cuongtm2012/software_hub.git
```

## 📞 Support

Nếu gặp vấn đề, liên hệ:
- GitHub Support: https://support.github.com/
- Email: cuongtm2012@gmail.com
