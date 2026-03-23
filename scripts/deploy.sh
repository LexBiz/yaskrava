#!/bin/bash
# ─── YASKRAVA-EU DEPLOY ───────────────────────────────────────────────────────
# Usage: ./scripts/deploy.sh "commit message"
# Commits all changes, pushes to GitHub, then builds & restarts on server.

set -e

SERVER="root@77.42.34.44"
REMOTE_DIR="/var/www/yaskrava-eu"
SSH_OPTS="-o ConnectTimeout=20 -i ~/.ssh/id_ed25519"

MSG="${1:-deploy}"

echo "▶ 1/3  Committing & pushing to GitHub..."
cd "$(dirname "$0")/.."
git add -A
git commit -m "$MSG" 2>/dev/null || echo "  (nothing to commit)"
git push origin main

echo "▶ 2/3  Building on server (this takes ~30-40s)..."
ssh $SSH_OPTS $SERVER "
  set -e
  cd $REMOTE_DIR
  git fetch origin main
  git reset --hard origin/main
  npm run build 2>&1 | tail -20
"

echo "▶ 3/3  Restarting pm2..."
ssh $SSH_OPTS $SERVER "pm2 restart yaskrava-eu && echo '✓ yaskrava-eu restarted'"

echo ""
echo "✅ Deploy complete → https://yaskrava.eu"
