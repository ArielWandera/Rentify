# Rentify

A property management SaaS for landlords and tenants, built with Laravel 12, React 19, and PostgreSQL.

## Features

- **Multi-role auth** — Admin, Owner (landlord), Tenant with role-scoped data
- **Property management** — CRUD with image uploads and availability tracking
- **Tenant portal** — rental details, payment history, outstanding balance
- **Payments** — manual recording + Pesapal mobile money (MTN MoMo, Airtel Money, Visa/Mastercard)
- **PDF reports** — downloadable reports per role
- **Email reminders** — manual or monthly scheduled, queued for performance
- **Error tracking** — Sentry integration

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Database | PostgreSQL |
| Auth | Laravel Sanctum (token-based) |
| Payments | Pesapal v3 API |
| Email | Gmail SMTP via Laravel Mail |
| PDF | barryvdh/laravel-dompdf |
| Storage | Laravel Storage (local / S3-compatible) |
| Error tracking | Sentry |

## Roles

| Role | Access |
|---|---|
| `admin` | Full system — all users, properties, tenants, payments, reports |
| `owner` | Own properties and their tenants/payments only |
| `tenant` | Tenant portal — own rental, payment history, pay via Pesapal |

Public registration creates a `tenant` account. Admins promote users to `owner` via the Users page.

---

## Quick Start (Docker)

Docker is the recommended way to run Rentify. It starts the full stack — PHP, Nginx, PostgreSQL, queue worker, and scheduler — with a single command. No need to install PHP, Node, or PostgreSQL locally.

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env — set DB_PASSWORD, mail credentials, Pesapal keys

# 2. Build and start all services
docker compose up --build

# 3. First-time setup (run once)
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
docker compose exec app php artisan storage:link
```

The app is now running at **http://localhost:8080**.

On subsequent starts just run `docker compose up` — no need to repeat step 3.

### Services started by Docker

| Service | Role |
|---|---|
| `nginx` | Serves the app on port 8080 |
| `app` | PHP-FPM — runs Laravel |
| `postgres` | PostgreSQL database |
| `queue` | Processes queued jobs (emails, etc.) |
| `scheduler` | Runs Laravel scheduled tasks every minute |

### Useful commands

```bash
# Run tests
docker compose exec app php artisan test

# Run a migration after pulling new changes
docker compose exec app php artisan migrate

# Tail logs
docker compose logs -f app

# Open a shell inside the container
docker compose exec app sh

# Stop everything
docker compose down

# Stop and wipe the database volume
docker compose down -v
```

---

## Manual Setup (without Docker)

**Requirements:** PHP 8.2+, Composer, Node.js 22+, PostgreSQL

```bash
composer install
npm install && npm run build    # or: npm run dev

cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan storage:link
php artisan serve
```

---

## Environment Variables

Key variables to configure in `.env`:

```env
APP_DEBUG=false          # must be false in production

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=rentify
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Mail (Gmail — generate an App Password at myaccount.google.com/apppasswords)
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_16_char_app_password
MAIL_FROM_ADDRESS=your@gmail.com

# Pesapal mobile money
PESAPAL_CONSUMER_KEY=your_key
PESAPAL_CONSUMER_SECRET=your_secret
PESAPAL_IPN_ID=your_ipn_id
PESAPAL_SANDBOX=true                             # set false in production
PESAPAL_CALLBACK_URL=http://localhost:5173/my-rental

# Sentry error tracking (optional — get DSN from sentry.io)
SENTRY_LARAVEL_DSN=

# S3/R2 storage (set FILESYSTEM_DISK=s3 to activate)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET=
AWS_ENDPOINT=          # Cloudflare R2: https://<account_id>.r2.cloudflarestorage.com
```

---

## Pesapal Setup

1. Register at [pesapal.com](https://pesapal.com) and get sandbox credentials
2. Add `PESAPAL_CONSUMER_KEY` and `PESAPAL_CONSUMER_SECRET` to `.env`
3. Register the IPN URL once (as admin):
   ```
   POST /api/payments/pesapal/register-ipn
   ```
4. Copy the returned `ipn_id` into `.env` as `PESAPAL_IPN_ID`
5. For production: set `PESAPAL_SANDBOX=false`, update `PESAPAL_CALLBACK_URL` to your live domain, and register the IPN URL again

---

## Running Tests

```bash
# With Docker
docker compose exec app php artisan test

# Without Docker
php artisan test
```

Tests use an in-memory SQLite database — they do not touch your development data.

---

## Deployment (DigitalOcean)

1. Create a $6/month Droplet (Ubuntu 24.04, 1GB RAM)
2. Install Docker on the droplet:
   ```bash
   curl -fsSL https://get.docker.com | sh
   ```
3. Clone the repo and configure `.env` for production:
   ```bash
   git clone <your-repo> && cd laravel
   cp .env.example .env
   # Set APP_ENV=production, APP_DEBUG=false, production DB creds, etc.
   ```
4. Start the stack:
   ```bash
   docker compose up -d --build
   docker compose exec app php artisan key:generate
   docker compose exec app php artisan migrate --force
   docker compose exec app php artisan storage:link
   docker compose exec app php artisan config:cache
   docker compose exec app php artisan route:cache
   ```
5. Point your domain at the droplet's IP and set up SSL with Certbot

---

## API Reference

All routes are prefixed `/api/`. Protected routes require `Authorization: Bearer {token}`.
Rate limits: 10 req/min on auth endpoints, 60 req/min on all others.

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/login` | Get token |
| POST | `/register` | Create tenant account |
| GET | `/user` | Get authenticated user |

### Properties
| Method | Route | Roles |
|---|---|---|
| GET | `/properties` | All (scoped by owner) |
| POST | `/properties` | Admin, Owner |
| PUT | `/properties/{id}` | Admin, Owner (own) |
| DELETE | `/properties/{id}` | Admin, Owner (own) |

### Tenants
| Method | Route | Roles |
|---|---|---|
| GET | `/tenants` | Admin, Owner (scoped) |
| GET | `/tenants/me` | Tenant |
| POST | `/tenants` | Admin, Owner |
| POST | `/tenants/{id}/assign-property` | Admin, Owner |
| POST | `/tenants/{id}/unassign-property/{rental}` | Admin, Owner |

### Rentals
| Method | Route | Roles |
|---|---|---|
| GET | `/rentals` | All (scoped by role) |
| POST | `/rentals` | Admin, Owner |
| PUT | `/rentals/{id}` | Admin, Owner |
| DELETE | `/rentals/{id}` | Admin, Owner (own property) |

### Payments
| Method | Route | Description |
|---|---|---|
| GET | `/payments` | List payments (scoped by role) |
| POST | `/rentals/{id}/payments` | Record manual payment |
| POST | `/payments/pesapal/initiate` | Start Pesapal payment |
| GET | `/payments/pesapal/status/{trackingId}` | Check payment status |
| GET | `/payments/pesapal/ipn` | Pesapal IPN webhook (public) |

### Reports
| Method | Route | Role |
|---|---|---|
| GET | `/reports/admin` | Admin |
| GET | `/reports/owner` | Owner |
| GET | `/reports/tenant` | Tenant |

### Reminders
| Method | Route | Roles |
|---|---|---|
| POST | `/reminders/send-all` | Admin, Owner |
| POST | `/reminders/tenant/{id}` | Admin, Owner |
