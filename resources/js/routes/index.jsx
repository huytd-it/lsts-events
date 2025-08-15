import { createBrowserRouter, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ui/ProtectedRoute';

import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Events from '../pages/Events';
import Login from '../pages/Login';
import TailwindTest from '../pages/TailwindTest';

const router = createBrowserRouter([
  { 
    path: "/", 
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/categories", 
    element: (
      <ProtectedRoute>
        <Categories />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/events", 
    element: (
      <ProtectedRoute>
        <Events />
      </ProtectedRoute>
    ) 
  },
  { 
    path: "/login", 
    element: <Login /> 
  },
  { 
    path: "/tailwind-test", 
    element: <TailwindTest /> 
  },
  // Redirect unknown routes to home
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

export default router;