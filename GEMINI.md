## Project Overview
This project is a web application built with Laravel (PHP) as the backend and React (JavaScript) as the frontend, utilizing Vite for asset compilation. It incorporates Laravel Jetstream with Sanctum for API authentication and Spatie/laravel-permission for role and permission management. The frontend leverages Ant Design for its UI components and React Query for data fetching and state management. The application follows a Single Page Application (SPA) architecture, where Laravel serves the initial React application, and React handles client-side routing.

## Building and Running:

### Prerequisites
*   PHP 8.2+
*   Node.js 18+
*   Composer
*   MySQL 8.0+

### Setup Instructions
1.  **Clone the repository.**
2.  **Install PHP dependencies:**
    ```bash
    composer install
    ```
3.  **Install Node dependencies:**
    ```bash
    npm install
    ```
    *Note: You might encounter a peer dependency conflict with `tailwind-scrollbar` and `tailwindcss`. If `npm install` fails, try `npm install --legacy-peer-deps`. A long-term solution would involve upgrading `tailwindcss` to `4.x` or finding a compatible `tailwind-scrollbar` version.*
4.  **Configure environment:**
    *   Copy `.env.example` to `.env`.
    *   Update database configuration in `.env`.
    *   Run `php artisan key:generate`.
5.  **Run database migrations and seeders:**
    ```bash
    php artisan migrate --seed
    ```

### Starting the Application
Open two separate terminal windows:
1.  **Start Laravel development server:**
    ```bash
    php artisan serve
    ```
2.  **Start Vite development server:**
    ```bash
    npm run dev
    ```
    Alternatively, you can run both using the `composer dev` script:
    ```bash
    composer dev
    ```

### Access the application
Open your browser and navigate to `http://localhost:8000`. You will be redirected to the login page.
*   **Login Credentials:**
    *   Email: `admin@lsts.edu.vn`
    *   Password: `admin123`

## Development Conventions:

### Backend (Laravel)
*   Models: `app/Models/`
*   Controllers: `app/Http/Controllers/` (API controllers under `app/Http/Controllers/Api/`)
*   Requests (Form Validation): `app/Http/Requests/`
*   Resources (API Transformations): `app/Http/Resources/`
*   Routes: `routes/api.php` (API endpoints) and `routes/web.php` (SPA routing)
*   Migrations: `database/migrations/`
*   Seeders: `database/seeders/`
*   Authentication: Laravel Fortify and Sanctum are used for API authentication. Jetstream is configured for Inertia stack.
*   Authorization: Spatie/laravel-permission is used for roles and permissions.

### Frontend (React)
*   Main entry point: `resources/js/app.jsx`
*   Components: `resources/js/components/` (e.g., `layout`, `ui`, `ProtectedRoute`)
*   Pages: `resources/js/pages/` (e.g., `Dashboard`, `Categories`, `Events`, `Login`)
*   Routes: `resources/js/routes/index.jsx` (uses `react-router-dom` with `ProtectedRoute` for authentication guarding)
*   Contexts: `resources/js/contexts/` (e.g., `AuthContext`, `QueryContext`)
*   API services: `resources/js/api/` (uses `axios` with interceptors for token and CSRF handling; includes mock API services for development)
*   Styling: Tailwind CSS (configured in `tailwind.config.js`) and Ant Design.
*   State Management/Data Fetching: React Query and Redux Toolkit.

## Building for Production:

1.  **Build React assets:**
    ```bash
    npm run build
    ```
2.  **Optimize Laravel application:**
    ```bash
    php artisan optimize
    ```