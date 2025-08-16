import React from 'react';
import { Row, Col, Card, Statistic, List, Avatar, Spin } from 'antd';
import { UserOutlined, CalendarOutlined, FolderOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { mockDashboardService } from '../api/services/mockApiService';
import AntAdminLayout from '../components/layout/AntAdminLayout';

const Dashboard = () => {
  // Fetch dashboard statistics
  const { data: statsResponse, isLoading, error } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => mockDashboardService.getStats(),
    retry: 2,
  });

  const stats = statsResponse?.data;

  if (isLoading) {
    return (
      <AntAdminLayout>
        <div className="flex justify-center items-center py-8">
          <Spin size="large" />
        </div>
      </AntAdminLayout>
    );
  }

  if (error) {
    return (
      <AntAdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu: {error.message}</p>
        </div>
      </AntAdminLayout>
    );
  }

  return (
    <AntAdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600">Tổng quan về hệ thống</p>
      </div>
      
      <Row gutter={16} className="mb-6">
        <Col span={6}>
          <Card>
            <Statistic
              title="Người dùng"
              value={stats?.totalUsers || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1b4664' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sự kiện"
              value={stats?.totalEvents || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1b4664' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Danh mục"
              value={stats?.totalCategories || 0}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#1b4664' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đăng ký"
              value={stats?.totalRegistrations || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#1b4664' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={16}>
        <Col span={12}>
          <Card title="Sự kiện gần đây" size="small">
            <List
              itemLayout="horizontal"
              dataSource={stats?.recentEvents || []}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                    title={item.event_name}
                    description={`${item.event_date} · ${item.location}`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Người dùng mới" size="small">
            <List
              itemLayout="horizontal"
              dataSource={stats?.recentUsers || []}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={item.name}
                    description={item.email}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </AntAdminLayout>
  );
};

export default Dashboard;