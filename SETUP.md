# Rentify Project Setup and Changes

## How to Run the Project

Your project is already set up and running. The backend (Laravel) is serving on `http://localhost:8000`, and the frontend (React) is built and integrated.

### Current Status
- **Backend**: Running on port 8000
- **Frontend**: Built and served via Laravel
- **Database**: Migrated and seeded with sample data

### To Access the Application
1. Open your browser and go to `http://localhost:8000`
2. Login with admin credentials: `admin@rentify.pro` / `password`

### If You Need to Restart or Develop Further

#### Prerequisites
- PHP 8.2+
- Composer
- Node.js and npm
- PostgreSQL (or your configured database)

#### Setup Steps (if starting fresh)
1. Clone the repository
2. Copy `.env.example` to `.env` and configure your database settings
3. Run `composer install`
4. Run `php artisan key:generate`
5. Run `php artisan migrate`
6. Run `php artisan db:seed --class=AdminSeeder` (seeds admin user)
7. Run `npm install`
8. Run `npm run build` (for production) or `npm run dev` (for development)
9. Run `php artisan serve --host=0.0.0.0 --port=8000`

#### Development Mode
Use the built-in dev script: `composer run dev` (runs server, queue, logs, and Vite concurrently)

## Changes Made to Fix and Set Up the Project

### 1. Fixed Vite Configuration
- **File**: `vite.config.js`
- **Change**: Updated the input file from `resources/js/app.js` to `resources/js/app.jsx` to match the React entry point
- **Reason**: The project uses React with JSX, but Vite was configured for a JS file

### 2. Added Soft Deletes to Properties Table
- **File**: `database/migrations/2025_10_28_125649_add_soft_deletes_to_properties_table.php` (new migration)
- **Change**: Added `softDeletes()` to the properties table schema
- **Reason**: The Property model uses SoftDeletes trait, but the migration was missing the `deleted_at` column

### 3. Added Laravel Sanctum to User Model
- **File**: `app/Models/User.php`
- **Change**: Added `use Laravel\Sanctum\HasApiTokens;` trait and included `HasApiTokens` in the class
- **Reason**: The AuthController was calling `createToken()` method which requires the HasApiTokens trait for Sanctum authentication

### 4. Database Setup
- **Migrations**: All migrations run successfully
- **Seeders**: AdminSeeder run to create admin user (admin@rentify.pro / password)
- **Sample Data**: Created 3 sample properties owned by the admin user

### 4. Frontend Build
- **Command**: `npm run build`
- **Result**: Successfully built React frontend into `public/build/`

### 5. Backend Configuration
- **Routes**: API routes configured for auth and properties
- **Controllers**: AuthController and PropertyController ready
- **Models**: User and Property models with relationships

## Project Structure
- **Backend**: Laravel 12 with Sanctum for API auth
- **Frontend**: React 19 with React Router, Tailwind CSS, Headless UI
- **Database**: PostgreSQL with migrations for users, properties, etc.
- **Build Tool**: Vite with Laravel plugin

## API Endpoints
- `POST /api/login` - User login
- `POST /api/register` - User registration
- `GET /api/user` - Get authenticated user (requires auth)
- `GET /api/properties` - List properties (requires auth)
- `POST /api/properties` - Create property (requires auth)
- `GET /api/properties/{id}` - Show property (requires auth)
- `PUT /api/properties/{id}` - Update property (requires auth)
- `DELETE /api/properties/{id}` - Delete property (requires auth)

## Notes
- The project uses Laravel Sanctum for API authentication
- Frontend makes API calls to `/api/*` which are proxied to `http://localhost:8000`
- Dark mode support is implemented
- Properties have soft deletes enabled

If you encounter any issues, check the terminal outputs or let me know!
