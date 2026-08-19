#!/bin/bash
DIR="$(cd "$(dirname "$0")" && pwd)"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$DIR/backups/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"

# --- MySQL/MariaDB ---
mysqldump -h dam2.colexio-karbo.com -P 3333 -u dam2 -pKa3b0134679 proyecto_hfranz > "$BACKUP_DIR/mysql_backup.sql"

# --- MongoDB ---
mongodump --uri="mongodb://admin:Ka3b0134679@dam2.colexio-karbo.com:57017/hfranz?authSource=admin" --out="$BACKUP_DIR/mongo"

echo "Backup completado en $BACKUP_DIR"