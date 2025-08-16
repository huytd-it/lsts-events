import { createBrowserRouter, Navigate } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Events from '../pages/Events';
import Users from '../pages/Users';
import FileExplorer from '../pages/FileExplorer';
import Login from '../pages/Login';
import TailwindTest from '../pages/TailwindTest';
import ProtectedRoute from '../components/ProtectedRoute';

// Production mode - with authentication
const router = createBrowserRouter([
  { 
    path: "/", 
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>
  },
  { 
    path: "/categories", 
    element: <ProtectedRoute><Categories /></ProtectedRoute>
  },
  { 
    path: "/events", 
    element: <ProtectedRoute><Events /></ProtectedRoute>
  },
  { 
    path: "/users", 
    element: <ProtectedRoute><Users /></ProtectedRoute>
  },
  { 
    path: "/files", 
    element: <ProtectedRoute><FileExplorer /></ProtectedRoute>
  },
  { 
    path: "/login", 
    element: <Login /> 
  },
  { 
    path: "/tailwind-test", 
    element: <ProtectedRoute><TailwindTest /></ProtectedRoute>
  },
  // Redirect unknown routes to home
  {
    path: "*",
    element: <Navigate to="/" replace />
  }
]);

export default router;