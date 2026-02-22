#!/bin/bash

# Configuration
PRIVATE_REPO_URL="https://github.com/joe-ging/macbase-pro-private.git"
BACKUP_DIR="../macbase-pro-backup"
PROJECT_DIR=$(pwd)

echo "🛡️ Starting Pro Logic Backup..."

# 1. Ensure backup directory exists and is initialized
if [ ! -d "$BACKUP_DIR" ]; then
    echo "📁 Creating backup directory at $BACKUP_DIR..."
    mkdir -p "$BACKUP_DIR"
    cd "$BACKUP_DIR"
    git init
    git remote add origin "$PRIVATE_REPO_URL"
    cd "$PROJECT_DIR"
fi

# 2. Sync Pro folders to the backup directory
echo "🔄 Syncing folders..."
mkdir -p "$BACKUP_DIR/frontend/src/pro"
mkdir -p "$BACKUP_DIR/backend/pro"

cp -rv frontend/src/pro/* "$BACKUP_DIR/frontend/src/pro/" 2>/dev/null || echo "No frontend pro files yet"
cp -rv backend/pro/* "$BACKUP_DIR/backend/pro/" 2>/dev/null || echo "No backend pro files yet"

# 3. Push to Private Repository
cd "$BACKUP_DIR"
git add .
git commit -m "Backup Pro logic: $(date)"
git push -u origin main || git push -u origin master

cd "$PROJECT_DIR"
echo "✅ Pro logic successfully backed up to private repo!"
