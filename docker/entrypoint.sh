#!/bin/sh
set -e

# Railway provides PORT — default to 8080 if not set
PORT=${PORT:-8080}

# Inject the port into the nginx config
sed -i "s/PORT_PLACEHOLDER/$PORT/" /etc/nginx/http.d/default.conf

# Cache Laravel config/routes for production
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations — non-fatal so the container starts even on DB hiccup
php artisan migrate --force 2>&1 || echo "[entrypoint] WARNING: migrate failed, continuing startup"

# Create storage symlink if not already done
php artisan storage:link 2>/dev/null || true

# Start supervisord (manages nginx + php-fpm + queue worker)
exec /usr/bin/supervisord -c /etc/supervisord.conf
