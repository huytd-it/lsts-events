import { createBrowserRouter } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Events from '../pages/Events';
import Login from '../pages/Login';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Dashboard />,
    loader: () => {
      if (!localStorage.getItem('authToken')) {
        return { redirect: '/login' };
      }
      return null;
    }
  },
  { path: "/categories", element: <Categories /> },
  { path: "/events", element: <Events /> },
  { path: "/login", element: <Login /> }
]);

export default router;