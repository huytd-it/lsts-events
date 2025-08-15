import { createBrowserRouter, redirect } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Events from '../pages/Events';
import Login from '../pages/Login';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    loader: () => {
      // Check if user is authenticated
      const token = localStorage.getItem('authToken');
      if (!token) {
        return redirect('/login');
      }
      return null;
    }
  },
  { path: "/categories", element: <Categories /> },
  { path: "/events", element: <Events /> },
  { path: "/login", element: <Login /> }
]);

export default router;