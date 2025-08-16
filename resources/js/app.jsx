import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import router from './routes/index.jsx';
import { QueryProvider } from './contexts/QueryContext';
import { AuthProvider } from './contexts/AuthContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('app')).render(
  <React.StrictMode>
    <ConfigProvider>
      <AuthProvider>
        <QueryProvider>
          <RouterProvider router={router} />
        </QueryProvider>
      </AuthProvider>
    </ConfigProvider>
  </React.StrictMode>
);