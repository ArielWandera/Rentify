# Rentify – Production Checklist

## Critical (must fix before launch)

- [x] **RentalController authorization** — `index()` and `destroy()` have no role/ownership checks. Any authenticated user can view and delete all rentals.
- [x] **JSON exception handler** — API returns HTML on errors. Add a custom exception handler in `bootstrap/app.php` so all errors return JSON.
- [ ] **Set `APP_DEBUG=false`** in production `.env` — stack traces are currently exposed to clients.

## High Priority (fix before real users)

- [ ] **Queue batch reminders** — `ReminderController::sendAll()` sends emails synchronously. Move to a queued job to avoid request timeouts with many tenants. Jobs table already exists.
- [ ] **RentalController owner isolation** — owners can currently see rentals they don't own.
- [ ] **Frontend error boundaries** — add React error boundaries so a component crash doesn't take down the whole page.

## Production Configuration

- [ ] **Pesapal live setup** — register production domain IPN URL in Pesapal dashboard, set `PESAPAL_SANDBOX=false`, update `PESAPAL_IPN_ID` and credentials in production `.env`.
- [ ] **Image storage** — local disk uploads disappear on server redeploy. Configure S3 or Cloudflare R2 (`AWS_*` keys in `.env`).
- [ ] **Scheduler** — add to server cron: `* * * * * cd /path/to/app && php artisan schedule:run >> /dev/null 2>&1`
- [ ] **Queue worker** — run on server: `php artisan queue:work database --daemon` (use Supervisor to keep it alive).
- [ ] **CORS** — configure `config/cors.php` if frontend is on a different domain than the API.

## Nice to Have

- [ ] Error tracking (Sentry) — `composer require sentry/sentry-laravel`
- [ ] Tests for PesapalController, ReportController, ReminderController
- [ ] Rate limiting on authenticated API endpoints
- [ ] Input validation Form Request classes (replace inline validation)

## Pre-Deploy Steps

```bash
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
composer install --optimize-autoloader --no-dev
```
