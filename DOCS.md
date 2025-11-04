# Rentify - Rental Property Management System

## Overview

Rentify is a comprehensive web application designed to streamline rental property management for property owners and landlords. It provides an intuitive interface for managing properties, tenants, rentals, and payments, with a focus on ease of use and comprehensive tracking.

## Problem Statement

Managing rental properties can be complex and time-consuming. Property owners often struggle with:

- Tracking multiple properties and their occupancy status
- Managing tenant information and rental agreements
- Recording and tracking rental payments
- Calculating outstanding balances and revenue
- Maintaining records of property assignments and tenant history

Rentify addresses these challenges by providing a centralized platform that automates and simplifies these processes, allowing property owners to focus on their business rather than administrative tasks.

## Features

### Core Functionality

- **User Authentication**: Secure login and registration with role-based access
- **Property Management**: CRUD operations for rental properties with detailed information
- **Tenant Management**: Comprehensive tenant profiles with contact and financial information
- **Rental Tracking**: Assign tenants to properties with rental agreements
- **Payment Processing**: Record and track rental payments with detailed history
- **Dashboard Analytics**: Overview of properties, revenue, and tenant statistics
- **Dark Mode Support**: User preference for light/dark theme switching

### Key Features

1. **Dashboard**
   - Portfolio overview with key metrics
   - Recent payment activity
   - Quick actions for common tasks

2. **Properties**
   - Add, edit, and delete properties
   - Track availability and occupancy
   - Detailed property information (bedrooms, bathrooms, pricing)

3. **Tenants**
   - Manage tenant profiles
   - Assign/unassign properties
   - Track outstanding balances

4. **Payments**
   - Record rental payments
   - Payment history and tracking
   - Balance calculations

5. **User Management**
   - Role-based access (admin, tenant)
   - User profiles and preferences

## Technology Stack

### Backend
- **Laravel 12**: PHP framework for robust API development
- **Laravel Sanctum**: API authentication for secure token-based access
- **PostgreSQL**: Relational database for data persistence
- **Eloquent ORM**: Object-relational mapping for database interactions

### Frontend
- **React 19**: Modern JavaScript library for building user interfaces
- **React Router**: Client-side routing for single-page application navigation
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Headless UI**: Unstyled UI components for accessibility
- **Axios**: HTTP client for API communication

### Build Tools
- **Vite**: Fast build tool and development server
- **Laravel Vite Plugin**: Integration between Laravel and Vite
- **Composer**: PHP dependency management
- **npm**: JavaScript package management

## Architecture

### Backend Structure

```
app/
├── Http/Controllers/
│   ├── AuthController.php      # Authentication endpoints
│   ├── PropertyController.php  # Property CRUD operations
│   ├── TenantController.php    # Tenant management
│   ├── PaymentController.php   # Payment processing
│   ├── RentalController.php    # Rental agreements
│   └── UserController.php      # User management
├── Models/
│   ├── User.php               # User model with Sanctum tokens
│   ├── Property.php           # Property model with soft deletes
│   ├── Tenant.php             # Tenant model
│   ├── Rental.php             # Rental agreement model
│   └── Payment.php            # Payment model
database/
├── migrations/                # Database schema definitions
└── seeders/                   # Sample data seeding
```

### Frontend Structure

```
resources/js/
├── components/
│   ├── auth/Login.jsx          # Authentication component
│   ├── dashboard/Dashboard.jsx # Main dashboard
│   ├── properties/             # Property-related components
│   │   ├── PropertyList.jsx
│   │   ├── PropertyForm.jsx
│   │   ├── PropertyDetail.jsx
│   │   └── TenantAssignmentModal.jsx
│   ├── tenants/                # Tenant management components
│   ├── payments/               # Payment components
│   └── users/                  # User management components
├── context/
│   └── AuthContext.jsx         # Authentication state management
├── hooks/
│   └── useDarkMode.js          # Dark mode toggle hook
└── MainApp.jsx                 # Main application component with routing
```

## API Documentation

### Authentication Endpoints

#### POST /api/login
Authenticate user and return access token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "admin"
  },
  "token": "api-token-here"
}
```

#### POST /api/register
Register new user account.

#### GET /api/user
Get authenticated user information (requires auth).

#### POST /api/logout
Logout user and revoke token (requires auth).

### Property Endpoints

#### GET /api/properties
List all properties for authenticated user.

#### POST /api/properties
Create new property.

**Request Body:**
```json
{
  "name": "Downtown Apartment",
  "description": "Modern 2BR apartment",
  "address": "123 Main St",
  "price_per_month": 1500,
  "bedrooms": 2,
  "bathrooms": 1
}
```

#### GET /api/properties/{id}
Get specific property details.

#### PUT /api/properties/{id}
Update property information.

#### DELETE /api/properties/{id}
Delete property (soft delete).

### Tenant Endpoints

#### GET /api/tenants
List all tenants.

#### POST /api/tenants
Create new tenant.

#### POST /api/tenants/{tenant}/assign-property
Assign tenant to property.

#### POST /api/tenants/{tenant}/unassign-property/{rental}
Unassign tenant from property.

#### GET /api/tenants/{tenant}/balance
Get tenant's outstanding balance.

### Payment Endpoints

#### GET /api/payments
List all payments.

#### POST /api/payments
Record new payment.

#### POST /api/rentals/{rental}/payments
Record payment for specific rental.

### Rental Endpoints

#### GET /api/rentals
List all rental agreements.

#### POST /api/rentals
Create new rental agreement.

## Code Snippets

### Authentication Controller (Backend)

```php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('api-token')->plainTextToken;

        return response()->json(['user' => $user, 'token' => $token]);
    }
}
```

### User Model (Backend)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'profile_photo',
        'darkmode',
    ];

    public function tenant()
    {
        return $this->hasOne(Tenant::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class, 'owner_id');
    }
}
```

### Property Model (Backend)

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Property extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'address',
        'price_per_month',
        'bedrooms',
        'bathrooms',
        'owner_id'
    ];

    public function owner()
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function rentals()
    {
        return $this->hasMany(Rental::class);
    }

    public function isAvailable()
    {
        return !$this->rentals()->where('status', 'active')->exists();
    }
}
```

### Dashboard Component (Frontend)

```jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { HomeIcon, CheckCircleIcon, CurrencyDollarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    properties: 0,
    available: 0,
    revenue: 0,
    tenants: 0,
    totalBalance: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const propertiesRes = await fetch('/api/properties', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        });
        const properties = await propertiesRes.json();

        // Additional API calls for tenants and payments...
        // Stats calculation logic...
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome back, {user?.name}! Here's your portfolio overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat cards... */}
      </div>

      {/* Recent Activity */}
      {/* Action Buttons */}
    </div>
  );
}
```

### Login Component (Frontend)

```jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
            Sign in to Rentify
          </h2>
        </div>
        {error && (
          <p className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded">
            {error}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>
          <button type="submit" className="w-full btn-primary py-2">Sign in</button>
        </form>
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          Demo: admin@rentify.pro / password
        </p>
      </div>
    </div>
  );
}
```

## Screenshots

Screenshots should be placed in the `docs/screenshots/` directory. Suggested screenshots to include:

### 1. Login Page
- File: `docs/screenshots/login.png`
- Description: The login screen with demo credentials visible

### 2. Dashboard Overview
- File: `docs/screenshots/dashboard.png`
- Description: Main dashboard showing stats and recent activity

### 3. Properties List
- File: `docs/screenshots/properties-list.png`
- Description: List view of all properties with availability status

### 4. Property Detail
- File: `docs/screenshots/property-detail.png`
- Description: Detailed view of a single property with tenant assignment

### 5. Tenant Management
- File: `docs/screenshots/tenants.png`
- Description: List of tenants with outstanding balances

### 6. Payment History
- File: `docs/screenshots/payments.png`
- Description: Payment records and history

### 7. Dark Mode
- File: `docs/screenshots/dark-mode.png`
- Description: Application in dark mode theme

## Setup and Installation

For detailed setup instructions, see [SETUP.md](./SETUP.md).

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support or questions, please open an issue in the GitHub repository.
