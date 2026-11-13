#!/usr/bin/env bash
set -euo pipefail

DEV="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$(cd "$DEV/.." && pwd)/站点代码"

if [ ! -d "$SITE" ]; then
  echo "找不到站点代码目录：$SITE" >&2
  exit 1
fi

if [ ! -f "$DEV/package.json" ]; then
  echo "开发目录不完整：$DEV" >&2
  exit 1
fi

rsync -a --delete \
  --exclude '.git/' \
  --exclude 'node_modules/' \
  --exclude 'dist/' \
  --exclude '.astro/' \
  --exclude '.新学力.qoder.site' \
  --exclude '.DS_Store' \
  --exclude '*.log' \
  --exclude '.env' \
  --exclude '.env.*' \
  "$DEV/" "$SITE/"

cd "$SITE"
npm run build

echo "同步并构建完成。下一步：在 Qoder Sites 发布 站点代码/dist。"
