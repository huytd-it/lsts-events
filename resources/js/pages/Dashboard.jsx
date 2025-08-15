import React from 'react';
import { Row, Col, Card, Statistic, List, Avatar } from 'antd';
import { UserOutlined, CalendarOutlined, FolderOutlined, CheckCircleOutlined } from '@ant-design/icons';
import AntAdminLayout from '../components/layout/AntAdminLayout';

const Dashboard = () => {
  const eventsData = [
    {
      title: 'Hội thảo công nghệ 2023',
      description: '15 Oct 2023 · Hà Nội',
    },
    {
      title: 'Triển lãm nghệ thuật đương đại',
      description: '22 Nov 2023 · Hồ Chí Minh',
    },
    {
      title: 'Buổi biểu diễn nhạc cổ điển',
      description: '05 Dec 2023 · Đà Nẵng',
    },
  ];

  const usersData = [
    {
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com',
    },
    {
      name: 'Trần Thị B',
      email: 'tranthib@example.com',
    },
    {
      name: 'Lê Văn C',
      email: 'levanc@example.com',
    },
  ];

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
              value={120}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1b4664' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Sự kiện"
              value={42}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#1b4664' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Danh mục"
              value={8}
              prefix={<FolderOutlined />}
              valueStyle={{ color: '#1b4664' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Đăng ký"
              value={256}
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
              dataSource={eventsData}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${index}`} />}
                    title={item.title}
                    description={item.description}
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
              dataSource={usersData}
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