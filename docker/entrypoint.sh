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

# Seed only if no users exist yet
USER_COUNT=$(php artisan tinker --execute="echo App\Models\User::count();" 2>/dev/null | tail -1)
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
  php artisan db:seed --force 2>&1 || echo "[entrypoint] WARNING: seed failed, continuing startup"
fi

# Create storage symlink if not already done
php artisan storage:link 2>/dev/null || true

# Start supervisord (manages nginx + php-fpm + queue worker)
exec /usr/bin/supervisord -c /etc/supervisord.conf
