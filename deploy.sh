#!/bin/bash

# Remote Server Configuration
SERVER="root@187.127.141.134"
REMOTE_DIR="/var/www/localmarket"

echo "📤 Uploading your local website and admin panel changes to the server..."
# Upload website changes (ignoring node_modules and builds)
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' -e ssh ./website/ $SERVER:$REMOTE_DIR/website/
# Upload admin panel changes
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' -e ssh ./Admin/admin-panel/ $SERVER:$REMOTE_DIR/Admin/admin-panel/
echo "✅ Upload complete!"

echo "🚀 Connecting to server $SERVER to build..."

# Connect via SSH and run deployment commands remotely
ssh $SERVER << 'EOF'
  set -e

  echo "📂 Navigating to $REMOTE_DIR..."
  cd /var/www/localmarket

  # Optional: Pull latest code from GitHub/GitLab
  # echo "📥 Pulling latest code..."
  # git pull origin main

  echo "==================================="
  echo "🌐 Deploying Next.js Website..."
  echo "==================================="
  cd website
  echo "📦 Installing website dependencies..."
  npm install
  echo "🏗️ Building website..."
  npm run build
  echo "🔄 Restarting PM2 process for website..."
  pm2 restart website || pm2 start npm --name "website" -- run start

  echo "==================================="
  echo "🛠️ Deploying Admin Panel..."
  echo "==================================="
  cd ../Admin/admin-panel
  echo "📦 Installing admin dependencies..."
  npm install
  echo "🏗️ Building admin panel..."
  npm run build
  echo "🔄 Restarting PM2 process for admin panel..."
  pm2 restart lokalmakarketadmin || pm2 start npm --name "lokalmakarketadmin" -- run start

  echo "==================================="
  echo "✅ Remote Deployment Completed Successfully!"
  echo "==================================="
EOF

echo "🎉 Script executed successfully from your local machine!"
