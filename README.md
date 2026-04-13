# Rentify

A property management SaaS for landlords and tenants, built with Laravel 12, React 19, and PostgreSQL.

## Features

- **Multi-role auth** — Admin, Owner (landlord), Tenant with role-scoped data access
- **Landlord registration** — public sign-up creates a landlord account; tenants are onboarded via invite link
- **Tenant invite system** — token-based 48h invite link, tenant sets their own password on first login
- **Google OAuth** — sign in / register with Google
- **Property management** — CRUD with image uploads, availability tracking, multi-unit support
- **Multi-unit properties** — add units (number, beds, baths, price) per property; occupancy tracked per unit
- **Tenant portal** — rental details, payment history, outstanding balance, lease download
- **Payments** — manual recording + Pesapal mobile money (MTN MoMo, Airtel Money, Visa/Mastercard)
- **Lease management** — upload and download PDF lease agreements per rental
- **PDF reports** — downloadable statements per role (admin / owner / tenant)
- **Landlord payout dashboard** — admin view of collected payments and outstanding balances per landlord
- **Email notifications** — welcome (landlord), tenant invite, payment receipt with QR stamp, password changed, password reset
- **Password security** — strength rules (min 8, uppercase, number, symbol), change password, forgot/reset flow
- **Email reminders** — manual or scheduled, queued for performance
- **Audit log** — all key actions logged and viewable by admin
- **Error tracking** — Sentry integration

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Laravel 12, PHP 8.2+ |
| Frontend | React 19, Vite, Tailwind CSS v4 |
| Database | PostgreSQL |
| Auth | Laravel Sanctum (token-based) + Laravel Socialite (Google OAuth) |
| Payments | Pesapal v3 API |
| Email | Gmail SMTP via Laravel Mail (queued) |
| PDF | barryvdh/laravel-dompdf |
| QR codes | bacon/bacon-qr-code |
| Storage | Laravel Storage (local / S3-compatible) |
| Error tracking | Sentry |

## Roles

| Role | Access |
|---|---|
| `admin` | Full system — all users, properties, tenants, payments, audit log, payout report |
| `owner` | Own properties and their tenants / payments / reports only |
| `tenant` | Tenant portal — own rental, payment history, pay via Pesapal, download lease |

Public registration creates an `owner` (landlord) account. Tenants are added by landlords and receive an invite email to set their password.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@rentify.pro` | `Password1!` |
| Landlord | `john.kamau@rentify.com` | `Password1!` |
| Tenant (arrears) | `david.ochieng@gmail.com` | `Password1!` |
| Tenant (paid up) | `grace.atim@gmail.com` | `Password1!` |

The login page shows a quick-login panel in demo mode. Set `VITE_SHOW_DEMO_HINT=false` in production to hide it.

---

## Quick Start (Docker)

Docker is the recommended way to run Rentify locally. It starts the full stack — PHP, Nginx, PostgreSQL, queue worker, and scheduler — with a single command.

**Requirements:** [Docker Desktop](https://www.docker.com/products/docker-desktop/)

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env — set DB_PASSWORD, mail credentials, Pesapal keys

# 2. Build and start all services
docker compose up --build

# 3. First-time setup (run once)
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate --seed
docker compose exec app php artisan storage:link
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `APP_URL` | Full URL of the app (used in emails and OAuth callbacks) |
| `DB_*` | PostgreSQL connection |
| `MAIL_*` | SMTP credentials |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `PESAPAL_CONSUMER_KEY` | Pesapal API key |
| `PESAPAL_CONSUMER_SECRET` | Pesapal API secret |
| `PESAPAL_SANDBOX` | `true` for sandbox, `false` for live |
| `PESAPAL_IPN_ID` | Registered IPN ID from Pesapal dashboard |
| `ADMIN_EMAIL` | Seeded admin email (default: `admin@rentify.pro`) |
| `ADMIN_PASSWORD` | Seeded admin password (default: `ChangeMe123!`) |
| `ADMIN_NAME` | Seeded admin display name (default: `Admin`) |
| `VITE_SHOW_DEMO_HINT` | Show demo login panel — set `false` in production |
| `SENTRY_LARAVEL_DSN` | Sentry DSN for error tracking |

---

## API Reference

All routes are prefixed `/api/`. Protected routes require `Authorization: Bearer {token}`.
Rate limits: 10 req/min on auth endpoints, 60 req/min on all others.

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/login` | Get token |
| POST | `/register` | Create landlord account |
| POST | `/logout` | Revoke current token |
| POST | `/forgot-password` | Send password reset email |
| POST | `/reset-password` | Reset password with token |
| GET | `/user` | Get authenticated user |
| PUT | `/user/password` | Change password (authenticated) |
| GET | `/invite/{token}` | Validate invite token |
| POST | `/invite/{token}` | Accept invite and set password |

### Properties & Units
| Method | Route | Roles |
|---|---|---|
| GET | `/properties` | All (scoped by role) |
| POST | `/properties` | Admin, Owner |
| PUT | `/properties/{id}` | Admin, Owner (own) |
| DELETE | `/properties/{id}` | Admin, Owner (own) |
| GET | `/properties/{id}/units` | All |
| POST | `/properties/{id}/units` | Admin, Owner (own) |
| PUT | `/units/{id}` | Admin, Owner (own) |
| DELETE | `/units/{id}` | Admin, Owner (own, unoccupied only) |

### Tenants
| Method | Route | Roles |
|---|---|---|
| GET | `/tenants` | Admin, Owner (scoped) |
| GET | `/tenants/me` | Tenant |
| POST | `/tenants` | Admin, Owner |
| POST | `/tenants/{id}/assign-property` | Admin, Owner |
| POST | `/tenants/{id}/unassign-property/{rental}` | Admin, Owner |

### Rentals & Leases
| Method | Route | Roles |
|---|---|---|
| GET | `/rentals` | All (scoped by role) |
| POST | `/rentals/{id}/lease` | Admin, Owner — upload PDF |
| GET | `/rentals/{id}/lease` | Admin, Owner, Tenant (own) |
| POST | `/rentals/{id}/terminate` | Admin, Owner |

### Payments
| Method | Route | Description |
|---|---|---|
| GET | `/payments` | List (scoped by role) |
| POST | `/rentals/{id}/payments` | Record manual payment |
| POST | `/payments/pesapal/initiate` | Start Pesapal payment |
| GET | `/payments/pesapal/status/{trackingId}` | Check payment status |
| GET | `/payments/pesapal/ipn` | IPN webhook (public) |

### Reports
| Method | Route | Role |
|---|---|---|
| GET | `/reports/admin` | Admin — full system PDF |
| GET | `/reports/owner` | Owner — own portfolio PDF |
| GET | `/reports/tenant` | Tenant — rental statement PDF |
| GET | `/reports/landlord-payouts` | Admin — payout summary (JSON) |

### Reminders
| Method | Route | Roles |
|---|---|---|
| POST | `/reminders/send-all` | Admin, Owner |
| POST | `/reminders/tenant/{id}` | Admin, Owner |

---

## Running Tests

```bash
php artisan test
```

74 tests covering auth, registration, invite flow, password change/reset, properties, tenants, payments, leases, rentals, reminders, termination, and audit logs.
