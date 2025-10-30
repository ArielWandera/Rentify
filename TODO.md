# Rentify Enhancement TODO List

## Backend Tasks
- [x] Create database migration for tenants table (with outstanding_balance field)
- [x] Create database migration for rentals table (lease tracking)
- [x] Create database migration for payments table (balance tracking)
- [x] Update Tenant model fillable fields (user_id, phone, date_of_birth, outstanding_balance)
- [x] Update Property model: remove 'available' from fillable, add availability method based on active rentals
- [x] Create UserController for admin user management (CRUD with role updates)
- [x] Create TenantController for tenant CRUD operations with balance tracking
- [x] Update PropertyController to handle tenant assignments (assign/unassign tenants to properties)
- [x] Add API routes for users and tenants management
- [x] Run php artisan migrate to create new tables

## Frontend Tasks
- [x] Update PropertyForm: remove available checkbox, set owner_id automatically based on user role
- [x] Update PropertyCard: add "Add Tenant" button for available properties
- [x] Update Navbar for role-based navigation (admin sees Users/Tenants links)
- [x] Create admin Users page with role management
- [x] Create Tenants page with balance tracking and CRUD
- [x] Update Dashboard stats to include real tenant counts and balances
- [x] Add tenant assignment modal/form in PropertyCard/PropertyDetail
- [x] Add delete confirmation for properties

## Testing & Verification
- [x] Run php artisan migrate to create new tables
- [x] Test CRUD operations for tenants, users, properties
- [x] Verify role-based access and balance calculations
- [x] Fix any frontend/backend connectivity issues
