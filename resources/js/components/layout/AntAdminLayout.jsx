import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, theme, Badge } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  SearchOutlined,
  DashboardOutlined,
  CalendarOutlined,
  FolderOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const { Header, Sider, Content } = Layout;

const AntAdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/events',
      icon: <CalendarOutlined />,
      label: <Link to="/events">Sự kiện</Link>,
    },
    {
      key: '/categories',
      icon: <FolderOutlined />,
      label: <Link to="/categories">Danh mục</Link>,
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: <Link to="/users">Người dùng</Link>,
    },
    {
      key: '/settings',
      icon: <SettingOutlined />,
      label: <Link to="/settings">Cài đặt</Link>,
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: 'Profile',
      icon: <UserOutlined />,
    },
    {
      key: 'logout',
      label: 'Đăng xuất',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        theme="light"
        width={250}
      >
        <div className="demo-logo-vertical">
          <div className="p-4">
            <div className="flex items-center gap-2">
              <div className="bg-primary w-8 h-8 rounded-full flex items-center justify-center">
                <CalendarOutlined style={{ color: 'white' }} />
              </div>
              {!collapsed && (
                <span className="text-xl font-bold text-secondary">LSTS Events</span>
              )}
            </div>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
        />
      </Sider>
      
      <Layout>
        <Header
          style={{
            padding: 0,
            background: colorBgContainer,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
            }}
          />
          
          <div className="flex items-center gap-4 mr-4">
            <div className="hidden md:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <SearchOutlined className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            <Badge count={5}>
              <BellOutlined className="text-xl cursor-pointer" />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar 
                  style={{ 
                    backgroundColor: '#1890ff', 
                    color: 'white'
                  }} 
                  icon={<UserOutlined />} 
                />
                {user && (
                  <span className="hidden md:block text-sm font-medium">
                    {user.name || user.email}
                  </span>
                )}
              </div>
            </Dropdown>
          </div>
        </Header>
        
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 'calc(100vh - 112px)',
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AntAdminLayout;