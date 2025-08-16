import React, { useState } from 'react';
import { Table, Button, Space, Tag, message, Modal, Form, Input, Avatar, Card, Row, Col, Statistic, Select, Tooltip, Image } from 'antd';
import { UserOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, PlusOutlined, TeamOutlined, CrownOutlined, SearchOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authService, categoryService } from '../api/services';
import AntAdminLayout from '../components/layout/AntAdminLayout';

const { confirm } = Modal;

const Users = () => {
  const [searchText, setSearchText] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch users
  const { 
    data: usersResponse, 
    isLoading: usersLoading, 
    error: usersError 
  } = useQuery({
    queryKey: ['users', { search: searchText }],
    queryFn: () => authService.getUsers({ search: searchText }),
    retry: 2,
  });

  // Fetch categories for assignment
  const { 
    data: categoriesResponse,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    retry: 2,
  });

  // Fetch user statistics
  const { 
    data: statsResponse 
  } = useQuery({
    queryKey: ['user-stats'],
    queryFn: () => authService.getPermissions(), // Reuse permissions endpoint for stats
    retry: 2,
  });

  const users = usersResponse?.data || [];
  const categories = categoriesResponse?.data || [];
  const stats = statsResponse?.data || {};

  // User category assignment mutation
  const assignCategoriesMutation = useMutation({
    mutationFn: ({ userEmail, categoryIds }) => 
      categoryService.assignUsers(categoryIds[0], [userEmail]), // Simplified for demo
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      message.success('Phân quyền thành công');
      setIsCategoryModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error) => {
      message.error(error.response?.data?.msg || 'Có lỗi xảy ra');
    }
  });

  const handleCategoryAssignment = (user) => {
    setSelectedUser(user);
    setIsCategoryModalOpen(true);
  };

  const handleAssignCategories = (values) => {
    assignCategoriesMutation.mutate({
      userEmail: selectedUser.email,
      categoryIds: values.category_ids || []
    });
  };

  // Render user avatar
  const renderAvatar = (user) => {
    if (user.avatar && user.avatar.trim()) {
      const avatarUrl = user.avatar.startsWith('http') 
        ? user.avatar 
        : `https://crm3.lsts.edu.vn/crm/${user.avatar.trim()}`;
      
      return (
        <Avatar 
          size={40} 
          src={
            <Image
              src={avatarUrl}
              style={{ width: 40, height: 40, objectFit: 'cover' }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+b0YzBIiCBdSfwBVhAQKZgoBMGZGFgM5CNQSLBAAOBQSZgoBMGZGFgM5CNQSLBNgYhIyMDhUFgsj4RGxhgQBhggI3BkLhyP4p2e3r6dff91tXu96OfvVX/qDV/e9t/m6nZHjQcx0hEcNJYrjQeL7H8AoG/5y8+8fqBgABgCnCiOKK2ybWyWbdW6jqBoGWBbYfz9M4qbJX1/2AqAz53w1HfcnBfRGBQsYVfK7b6sD+dOvbIqgwBIB1yPJ4xNPeRtZdcnKRq8M+zWbYm59dKHvW6y8RxcnOV7qwGgHSkyzKVQRCAJsVWNv/Kt+fxsrLhx7LSxOdtN1cLGEFAgJHR5QgAdDl+lTa+jDHY8nOl5L4sxIqgDKkMlCUAlOV4VdjGT2eFuoxb2fib3RDQh8UCRhAQYGR0OQIAXU5fpY1fw4hU+1FE/AcbY/UlTL4svE5ogHkS6jfL8as0AnOSi/5Q8XUl9JX53z8qVbZQ1cJXy23FfnMk1GqW41dpBBbKyD86vjvJvQBgbYJLPUgf2vLyGCkISdMnBBFBxWJBBAOAiOCKJOLKEKn8NzWNIwBHBOHOwSY0jCAAcESAATgiCAcOdqGZRwDgiCAcONiFhiBcLXWLAAzJNEfj49fj4Ps8AAAYZ5lN"
            />
          }
        />
      );
    } else {
      return <Avatar size={40} icon={<UserOutlined />} />;
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'user_id',
      key: 'user_id',
      width: 60,
      align: 'center',
    },
    {
      title: 'Thông tin người dùng',
      key: 'user_info',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          {renderAvatar(record)}
          <div>
            <div className="font-medium">{record.user_name}</div>
            <div className="text-sm text-gray-500">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục được phân quyền',
      key: 'categories',
      render: (_, record) => (
        <div className="space-y-1">
          {record.categories && record.categories.length > 0 ? (
            record.categories.map((category, index) => (
              <Tag key={index} color="blue">
                {category.category_name}
              </Tag>
            ))
          ) : (
            <Tag color="default">Chưa có phân quyền</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Số danh mục',
      key: 'category_count',
      render: (_, record) => (
        <Tag color={record.categories?.length > 0 ? 'green' : 'default'}>
          {record.categories?.length || 0}
        </Tag>
      ),
      width: 120,
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Tooltip title="Phân quyền danh mục">
            <Button 
              type="primary"
              size="small"
              icon={<CrownOutlined />}
              onClick={() => handleCategoryAssignment(record)}
            />
          </Tooltip>
        </Space>
      ),
      width: 100,
      align: 'center',
    },
  ];

  if (usersError) {
    return (
      <AntAdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu: {usersError.message}</p>
          <Button 
            type="primary" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
          >
            Thử lại
          </Button>
        </div>
      </AntAdminLayout>
    );
  }

  return (
    <AntAdminLayout>
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-blue-500">
            <Statistic
              title="Tổng Người Dùng"
              value={users.length}
              prefix={<TeamOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-emerald-500">
            <Statistic
              title="Có Phân Quyền"
              value={users.filter(user => user.categories?.length > 0).length}
              prefix={<CrownOutlined className="text-emerald-500" />}
              valueStyle={{ color: '#10b981', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-amber-500">
            <Statistic
              title="Chưa Phân Quyền"
              value={users.filter(user => !user.categories || user.categories.length === 0).length}
              prefix={<UserOutlined className="text-amber-500" />}
              valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
            <Statistic
              title="Danh Mục Có Sẵn"
              value={categories.length}
              prefix={<PlusOutlined className="text-purple-500" />}
              valueStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
            <p className="text-gray-600">Quản lý người dùng và phân quyền danh mục</p>
          </div>
        </div>

        {/* Search Controls */}
        <Card className="mb-4 shadow-sm border-0 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Tìm kiếm</label>
              <Input.Search
                placeholder="Tìm kiếm theo tên, email..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={setSearchText}
                className="rounded-lg"
                size="large"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Hành động</label>
              <Button 
                icon={<SearchOutlined />}
                onClick={() => queryClient.invalidateQueries({ queryKey: ['users'] })}
                className="w-full rounded-lg border-gray-300 hover:border-blue-400 hover:text-blue-500"
                size="large"
              >
                Làm mới
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      <Card>
        <Table 
          dataSource={users} 
          columns={columns} 
          rowKey="user_id"
          loading={usersLoading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} người dùng`,
          }}
          scroll={{ x: 800 }}
        />
      </Card>

      {/* Category Assignment Modal */}
      <Modal
        title={`Phân quyền danh mục cho: ${selectedUser?.user_name || ''}`}
        open={isCategoryModalOpen}
        onCancel={() => {
          setIsCategoryModalOpen(false);
          setSelectedUser(null);
        }}
        footer={null}
        destroyOnClose
        width={600}
      >
        <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
          <div className="flex items-center">
            <UserOutlined className="text-blue-500 mr-2" />
            <span>
              Email: <strong>{selectedUser?.email}</strong>
            </span>
          </div>
        </div>

        <Form
          layout="vertical"
          onFinish={handleAssignCategories}
          initialValues={{
            category_ids: selectedUser?.categories?.map(cat => cat.category_id) || []
          }}
        >
          <Form.Item
            name="category_ids"
            label="Chọn danh mục"
            tooltip="Chọn các danh mục mà người dùng có quyền truy cập"
          >
            <Select
              mode="multiple"
              placeholder="Chọn danh mục..."
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
              loading={categoriesLoading}
              options={categories.map(category => ({
                value: category.category_id,
                label: category.category_name,
              }))}
            />
          </Form.Item>

          <div className="text-center space-x-2">
            <Button 
              onClick={() => {
                setIsCategoryModalOpen(false);
                setSelectedUser(null);
              }}
            >
              Hủy
            </Button>
            <Button 
              type="primary" 
              htmlType="submit"
              loading={assignCategoriesMutation.isPending}
            >
              Lưu Phân Quyền
            </Button>
          </div>
        </Form>
      </Modal>
    </AntAdminLayout>
  );
};

export default Users;