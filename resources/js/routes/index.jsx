import { createBrowserRouter } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import Categories from '../pages/Categories';
import Events from '../pages/Events';
import Login from '../pages/Login';
import TailwindTest from '../pages/TailwindTest';

const router = createBrowserRouter([
  { path: "/", element: <Dashboard /> },
  { path: "/categories", element: <Categories /> },
  { path: "/events", element: <Events /> },
  { path: "/login", element: <Login /> },
  { path: "/tailwind-test", element: <TailwindTest /> }
]);

export default router;