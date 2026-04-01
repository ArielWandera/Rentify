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

# Run migrations automatically on every deploy
php artisan migrate --force

# Create storage symlink if not already done
php artisan storage:link 2>/dev/null || true

# Start supervisord (manages nginx + php-fpm + queue worker)
exec /usr/bin/supervisord -c /etc/supervisord.conf
