# Qwen Code - Project Development Notes

## Project Overview
This document contains notes and instructions for the Laravel + React + Vite project development.

## Setup Steps Completed

### 1. Environment Preparation
- Installed Laravel Installer
- Created Laravel project with Jetstream, Livewire, and Teams

### 2. Backend Configuration (Laravel)
- Configured database (MySQL)
- Installed required packages:
  - laravel/sanctum
  - spatie/laravel-permission
  - intervention/image
  - @vitejs/plugin-react (for frontend)
- Configured Sanctum for API authentication
- Configured Vite for frontend integration
- Configured CORS settings

### 3. Database Models & Relationships
Created models:
- Category
- Event
- EventMedia
- CategoryUser (Pivot)

### 4. API Resources & Controllers
- Created CategoryResource
- Created CategoryController
- Configured API routes

### 5. Frontend Setup (React + Vite)
- Created component structure:
  - components/
  - contexts/
  - hooks/
  - pages/
  - routes/
  - api/
- Installed React libraries:
  - @tanstack/react-query
  - react-router-dom
  - axios
  - react-icons
  - @headlessui/react
  - @heroicons/react
  - framer-motion
  - react-hook-form
  - @hookform/resolvers
  - yup
  - react-toastify
  - react-dnd
  - react-dnd-html5-backend

### 6. Integration
- Configured Laravel to serve React SPA
- Set up routing for SPA
- Created main entry point for React app

## Running the Application

### Prerequisites
- PHP 8.1+
- Node.js 18+
- Composer
- MySQL 8.0+

### Setup Instructions

1. **Clone the repository** (if applicable)

2. **Install PHP dependencies**
   ```bash
   composer install
   ```

3. **Install Node dependencies**
   ```bash
   npm install
   ```

4. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update database configuration in `.env`
   - Run `php artisan key:generate`

5. **Run database migrations and seeders**
   ```bash
   php artisan migrate --seed
   ```

6. **Start Laravel development server**
   ```bash
   php artisan serve
   ```

7. **Start Vite development server** (in a separate terminal)
   ```bash
   npm run dev
   ```

8. **Access the application**
   Open your browser and navigate to `http://localhost:8000`

## Development Workflow

### Backend (Laravel)
- Models: `app/Models/`
- Controllers: `app/Http/Controllers/`
- Resources: `app/Http/Resources/`
- Routes: `routes/api.php` (API) and `routes/web.php` (SPA)
- Migrations: `database/migrations/`
- Seeders: `database/seeders/`

### Frontend (React)
- Main entry point: `resources/js/app.jsx`
- Components: `resources/js/components/`
- Pages: `resources/js/pages/`
- Routes: `resources/js/routes/`
- Contexts: `resources/js/contexts/`
- API services: `resources/js/api/`

## Building for Production

1. **Build React assets**
   ```bash
   npm run build
   ```

2. **Optimize Laravel application**
   ```bash
   php artisan optimize
   ```

## Troubleshooting

### Common Issues
1. **Vite HMR errors**: Ensure Vite server is running (`npm run dev`)
2. **Database connection errors**: Check `.env` database configuration
3. **Missing dependencies**: Run `composer install` and `npm install`

### Development Tips
- Use `php artisan tinker` for quick testing
- Use Laravel Telescope for debugging (if installed)
- Use React DevTools browser extension for React component debugging
