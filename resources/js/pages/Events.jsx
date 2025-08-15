import React, { useState } from 'react';
import { Table, Button, Space, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import AntAdminLayout from '../components/layout/AntAdminLayout';

const Events = () => {
  const [events] = useState([
    { 
      id: 1, 
      title: 'Hội Thảo Công Nghệ 2023', 
      date: '15/10/2023', 
      location: 'Hà Nội',
      category: 'Hội Thảo',
      attendees: 120
    },
    { 
      id: 2, 
      title: 'Triển Lãm Nghệ Thuật Đương Đại', 
      date: '22/11/2023', 
      location: 'Hồ Chí Minh',
      category: 'Triển Lãm',
      attendees: 85
    },
    { 
      id: 3, 
      title: 'Buổi Biểu Diễn Nhạc Cổ Điển', 
      date: '05/12/2023', 
      location: 'Đà Nẵng',
      category: 'Buổi Biểu Diễn',
      attendees: 200
    },
  ]);

  const columns = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: 'Danh mục',
      dataIndex: 'category',
      key: 'category',
      render: (category) => (
        <Tag color="processing">{category}</Tag>
      ),
    },
    {
      title: 'Người tham dự',
      dataIndex: 'attendees',
      key: 'attendees',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" icon={<EditOutlined />}>Sửa</Button>
          <Button type="link" danger icon={<DeleteOutlined />}>Xóa</Button>
        </Space>
      ),
    },
  ];

  return (
    <AntAdminLayout>
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sự Kiện</h1>
          <p className="text-gray-600">Quản lý sự kiện</p>
        </div>
        <Button type="primary" icon={<PlusOutlined />}>
          Thêm Sự Kiện
        </Button>
      </div>
      
      <Table 
        dataSource={events} 
        columns={columns} 
        rowKey="id"
        pagination={{
          pageSize: 10,
        }}
      />
    </AntAdminLayout>
  );
};

export default Events;