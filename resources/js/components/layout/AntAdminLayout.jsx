import React, { useState } from 'react';
import { Layout, Menu, Button, Avatar, Dropdown, Space, Badge, theme } from 'antd';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  BellOutlined,
  SearchOutlined,
  DashboardOutlined,
  CalendarOutlined,
  FolderOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AntAdminLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
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
              <div className="bg-blue-600 w-8 h-8 rounded-full"></div>
              {!collapsed && (
                <span className="text-xl font-bold text-blue-600">LSTS Admin</span>
              )}
            </div>
          </div>
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          theme="light"
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
                  className="py-2 px-4 pr-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <SearchOutlined className="absolute right-3 top-2.5 text-gray-400" />
              </div>
            </div>
            
            <Badge count={5}>
              <BellOutlined className="text-xl" />
            </Badge>
            
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar 
                style={{ 
                  backgroundColor: '#1890ff', 
                  cursor: 'pointer'
                }} 
                icon={<UserOutlined />} 
              />
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