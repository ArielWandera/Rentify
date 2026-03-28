# ── Stage 1: build React frontend ────────────────────────────────────────────
FROM node:22-alpine AS frontend

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY vite.config.js ./
COPY resources/ resources/
COPY public/ public/

RUN npm run build

# ── Stage 2: production PHP image ────────────────────────────────────────────
FROM php:8.2-fpm-alpine AS app

# System deps
RUN apk add --no-cache \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    supervisor

# PHP extensions
RUN docker-php-ext-install \
    pdo \
    pdo_pgsql \
    gd \
    zip \
    opcache \
    pcntl

# Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Install PHP dependencies (no dev)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts --no-interaction

# Copy application source
COPY . .

# Copy compiled frontend assets from stage 1
COPY --from=frontend /app/public/build public/build

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Run post-install scripts now that full source is present
RUN composer run-script post-autoload-dump --no-interaction 2>/dev/null || true

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/supervisord.conf /etc/supervisord.conf

EXPOSE 9000

CMD ["php-fpm"]
