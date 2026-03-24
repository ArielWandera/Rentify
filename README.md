# Rentify

A property management SaaS system for landlords and tenants, built with Laravel 12, React 19, and PostgreSQL.

## Features

- **Multi-role auth** — Admin, Owner (landlord), Tenant with role-scoped views
- **Property management** — CRUD with image uploads, availability tracking
- **Tenant portal** — view rental details, payment history, outstanding balance
- **Payments** — manual recording + Pesapal mobile money integration (MTN MoMo, Airtel Money, card)
- **PDF reports** — downloadable reports per role (admin: system overview, owner: portfolio, tenant: rental statement)
- **Email reminders** — manual trigger or monthly scheduled payment reminders via Gmail SMTP
- **Owner scoping** — owners only see their own properties and tenants

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Database | PostgreSQL (SQLite for tests) |
| Auth | Laravel Sanctum (token-based) |
| PDF | barryvdh/laravel-dompdf |
| Email | Gmail SMTP via Laravel Mail |
| Payments | Pesapal v3 API |
| Storage | Laravel Storage (local / S3-compatible) |

## Setup

### Requirements

- PHP 8.2+, Composer
- Node.js 20+, npm
- PostgreSQL

### Install

```bash
# Clone and install backend
cd laravel
composer install

# Copy and configure env
cp .env.example .env
php artisan key:generate

# Configure .env (database, mail, Pesapal — see below)

# Run migrations and seed
php artisan migrate --seed

# Link storage for image serving
php artisan storage:link

# Install and build frontend
npm install
npm run dev
```

### Environment Variables

```env
# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=rentify
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Mail (Gmail SMTP)
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your@gmail.com
MAIL_PASSWORD=your_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=your@gmail.com
MAIL_FROM_NAME=Rentify

# Pesapal (mobile money)
PESAPAL_CONSUMER_KEY=your_key
PESAPAL_CONSUMER_SECRET=your_secret
PESAPAL_IPN_ID=your_ipn_id
PESAPAL_SANDBOX=true
PESAPAL_CALLBACK_URL=http://localhost:5173/my-rental
```

## Roles

| Role | Access |
|---|---|
| `admin` | Full system access — all users, properties, tenants, payments, reports |
| `owner` | Own properties and their tenants/payments only |
| `tenant` | Tenant portal — own rental details, payment history, pay via Pesapal |

Public registration creates a `tenant` account. Admins promote users to `owner` via the Users page.

## API Routes

All routes are prefixed `/api/`. Protected routes require `Authorization: Bearer {token}`.

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
| GET | `/properties/{id}` | All |
| PUT | `/properties/{id}` | Admin, Owner (own) |
| DELETE | `/properties/{id}` | Admin, Owner (own) |

### Tenants
| Method | Route | Roles |
|---|---|---|
| GET | `/tenants` | Admin, Owner (scoped) |
| GET | `/tenants/me` | Tenant |
| POST | `/tenants/{id}/assign-property` | Admin, Owner |
| POST | `/tenants/{id}/unassign-property/{rental}` | Admin, Owner |

### Payments
| Method | Route | Description |
|---|---|---|
| GET | `/payments` | List payments |
| POST | `/payments` | Record manual payment |
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

## Pesapal Setup

1. Register at [pesapal.com](https://pesapal.com) → get sandbox credentials
2. Add credentials to `.env`
3. Register IPN URL (one-time, as admin):
   ```
   POST /api/payments/pesapal/register-ipn
   ```
4. Copy the returned `ipn_id` into `.env` as `PESAPAL_IPN_ID`
5. For production: set `PESAPAL_SANDBOX=false` and update `PESAPAL_CALLBACK_URL`

## Running Tests

```bash
cd laravel
php artisan test
```

Tests use an in-memory SQLite database and do not affect your development data.

## Scheduled Jobs

The system runs a monthly payment reminder email on the 1st of each month at 08:00. To enable this in production, add the Laravel scheduler to your server's crontab:

```cron
* * * * * cd /path-to-project && php artisan schedule:run >> /dev/null 2>&1
```
