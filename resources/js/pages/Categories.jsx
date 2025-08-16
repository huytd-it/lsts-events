import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, Switch, Spin, TreeSelect, Select, Tag, Card, Row, Col, Statistic, Tooltip, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UserOutlined, BranchesOutlined, ArrowUpOutlined, ApartmentOutlined, EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService, authService } from '../api/services';
import AntAdminLayout from '../components/layout/AntAdminLayout';

const { confirm } = Modal;

const Categories = () => {
  const [form] = Form.useForm();
  const [userForm] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const queryClient = useQueryClient();

  // Fetch categories tree
  const { 
    data: categoriesResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategoryTree(),
    retry: 2,
  });

  // Fetch statistics
  const { 
    data: statsResponse 
  } = useQuery({
    queryKey: ['category-stats'],
    queryFn: () => categoryService.getStatistics(),
    retry: 2,
  });

  // Fetch users for assignment
  const { 
    data: usersResponse 
  } = useQuery({
    queryKey: ['users'],
    queryFn: () => authService.getUsers(),
    retry: 2,
  });

  const categories = categoriesResponse?.data || [];
  const stats = statsResponse?.data || {};
  const users = usersResponse?.data || [];

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-stats'] });
      message.success(data.msg || 'Tạo danh mục thành công');
      setIsModalOpen(false);
      setParentCategory(null);
      form.resetFields();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || error.message || 'Có lỗi xảy ra';
      message.error(errorMessage);
    }
  });

  // Update category mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-stats'] });
      message.success(data.msg || 'Cập nhật danh mục thành công');
      setIsModalOpen(false);
      setEditingCategory(null);
      setParentCategory(null);
      form.resetFields();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || error.message || 'Có lỗi xảy ra';
      message.error(errorMessage);
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: categoryService.delete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-stats'] });
      message.success(data.msg || 'Xóa danh mục thành công');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || error.message || 'Có lỗi xảy ra';
      message.error(errorMessage);
    }
  });

  // Move category mutation
  const moveMutation = useMutation({
    mutationFn: ({ categoryId, parentId }) => categoryService.moveCategory(categoryId, parentId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success(data.msg || 'Di chuyển danh mục thành công');
    },
    onError: (error) => {
      message.error(error.response?.data?.msg || 'Có lỗi xảy ra');
    }
  });

  // Assign users mutation
  const assignUsersMutation = useMutation({
    mutationFn: ({ categoryId, userEmails }) => categoryService.assignUsers(categoryId, userEmails),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category-stats'] });
      message.success(data.msg || 'Phân quyền người dùng thành công');
      setIsUserModalOpen(false);
      userForm.resetFields();
    },
    onError: (error) => {
      message.error(error.response?.data?.msg || 'Có lỗi xảy ra');
    }
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setParentCategory(null);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleAddSubCategory = (parent) => {
    setEditingCategory(null);
    setParentCategory(parent);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
    setParentCategory(null);
    setIsModalOpen(true);
    form.setFieldsValue({
      category_name: record.category_name,
      category_description: record.category_description,
      is_public: record.is_public === 1
    });
  };

  const handleDelete = (record) => {
    confirm({
      title: 'Xác nhận xóa danh mục',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa danh mục "${record.category_name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        deleteMutation.mutate(record.category_id);
      },
    });
  };

  const handleSubmit = async (values) => {
    const formData = {
      category_name: values.category_name,
      category_description: values.category_description || '',
      is_public: values.is_public ? 1 : 0
    };

    // Add parent_id if creating subcategory
    if (parentCategory) {
      formData.parent_id = parentCategory.category_id;
    }

    if (editingCategory) {
      updateMutation.mutate({ 
        id: editingCategory.category_id, 
        data: formData 
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleManageUsers = (category) => {
    setSelectedCategory(category);
    setIsUserModalOpen(true);
    // Pre-load assigned users if available
    if (category.assigned_users) {
      userForm.setFieldsValue({
        user_emails: category.assigned_users.map(user => user.email)
      });
    }
  };

  const handleMoveCategory = (category) => {
    Modal.confirm({
      title: `Di chuyển "${category.category_name}"`,
      content: (
        <div>
          <p>Chọn danh mục cha mới:</p>
          <TreeSelect
            id="move-parent-select"
            style={{ width: '100%' }}
            placeholder="Chọn danh mục cha"
            allowClear
            treeData={buildTreeSelectData(categories, category.category_id)}
          />
        </div>
      ),
      onOk: () => {
        const selectElement = document.getElementById('move-parent-select');
        const newParentId = selectElement?.value || null;
        moveMutation.mutate({
          categoryId: category.category_id,
          parentId: newParentId
        });
      }
    });
  };

  const handleUserAssignment = (values) => {
    assignUsersMutation.mutate({
      categoryId: selectedCategory.category_id,
      userEmails: values.user_emails || []
    });
  };

  // Helper function to build tree select data
  const buildTreeSelectData = (data, excludeId = null) => {
    return data
      .filter(item => item.category_id !== excludeId)
      .map(item => ({
        title: item.category_name,
        value: item.category_id,
        children: item.children ? buildTreeSelectData(item.children, excludeId) : []
      }));
  };

  // Helper function to render category hierarchy
  const renderCategoryName = (record) => {
    const level = record.level || 0;
    const indent = '  '.repeat(level);
    const prefix = level > 0 ? '└─ ' : '';
    
    return (
      <div>
        <span style={{ fontFamily: 'monospace', color: '#666' }}>
          {indent}{prefix}
        </span>
        <strong style={{ color: level === 0 ? '#1890ff' : '#666' }}>
          {record.category_name}
        </strong>
        {record.parent_name && (
          <div style={{ fontSize: '12px', color: '#999', marginLeft: (level + 1) * 16 }}>
            Parent: {record.parent_name}
          </div>
        )}
      </div>
    );
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'category_id',
      key: 'category_id',
      width: 60,
      align: 'center',
    },
    {
      title: 'Tên danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      render: (_, record) => renderCategoryName(record),
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
    },
    {
      title: 'Loại',
      dataIndex: 'is_public',
      key: 'is_public',
      render: (isPublic) => (
        isPublic ? 
        <Tag color="green" icon={<EyeOutlined />}>Công khai</Tag> :
        <Tag color="orange" icon={<EyeInvisibleOutlined />}>Riêng tư</Tag>
      ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Sự kiện',
      dataIndex: 'events_count',
      key: 'events_count',
      render: (count) => (
        <Tag color={count > 0 ? 'blue' : 'default'}>
          {count || 0}
        </Tag>
      ),
      sorter: (a, b) => (a.events_count || 0) - (b.events_count || 0),
      width: 80,
      align: 'center',
    },
    {
      title: 'Người dùng',
      dataIndex: 'category_users_count',
      key: 'users_count',
      render: (count) => (
        <Tag color={count > 0 ? 'warning' : 'default'}>
          {count || 0}
        </Tag>
      ),
      width: 100,
      align: 'center',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '-',
      width: 120,
      align: 'center',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => {
        const hasChildren = record.children && record.children.length > 0;
        const canDelete = !hasChildren && (record.events_count || 0) === 0;
        
        return (
          <Space.Compact>
            <Tooltip title="Thêm danh mục con">
              <Button 
                size="small"
                type="primary"
                ghost
                icon={<PlusOutlined />}
                onClick={() => handleAddSubCategory(record)}
              />
            </Tooltip>
            <Tooltip title="Chỉnh sửa">
              <Button 
                size="small"
                icon={<EditOutlined />}
                onClick={() => handleEdit(record)}
              />
            </Tooltip>
            <Tooltip title="Quản lý người dùng">
              <Button 
                size="small"
                icon={<UserOutlined />}
                onClick={() => handleManageUsers(record)}
              />
            </Tooltip>
            <Tooltip title="Di chuyển">
              <Button 
                size="small"
                icon={<ArrowUpOutlined />}
                onClick={() => handleMoveCategory(record)}
              />
            </Tooltip>
            <Tooltip title={canDelete ? "Xóa" : "Không thể xóa (có danh mục con hoặc sự kiện)"}>
              <Button 
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                loading={deleteMutation.isPending}
                disabled={!canDelete}
              />
            </Tooltip>
          </Space.Compact>
        );
      },
      width: 200,
      align: 'center',
    },
  ];

  if (error) {
    return (
      <AntAdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu: {error.message}</p>
          <Button 
            type="primary" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
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
              title="Tổng Danh Mục"
              value={stats.total_categories || 0}
              prefix={<ApartmentOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-emerald-500">
            <Statistic
              title="Danh Mục Công Khai"
              value={stats.public_categories || 0}
              prefix={<EyeOutlined className="text-emerald-500" />}
              valueStyle={{ color: '#10b981', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-amber-500">
            <Statistic
              title="Danh Mục Riêng Tư"
              value={stats.private_categories || 0}
              prefix={<EyeInvisibleOutlined className="text-amber-500" />}
              valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
            <Statistic
              title="Người Dùng Được Phân Quyền"
              value={stats.assigned_users || 0}
              prefix={<UserOutlined className="text-purple-500" />}
              valueStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Quản Lý Danh Mục</h1>
          <p className="text-gray-600">Quản lý cây danh mục sự kiện với cấu trúc phân cấp</p>
        </div>
        <Space>
          <Button 
            icon={<BranchesOutlined />}
            onClick={() => queryClient.invalidateQueries({ queryKey: ['categories'] })}
          >
            Làm Mới
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm Danh Mục Gốc
          </Button>
        </Space>
      </div>
      
      <Card>
        <Table 
          dataSource={categories} 
          columns={columns} 
          rowKey="category_id"
          loading={isLoading}
          pagination={{
            pageSize: 25,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} danh mục`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Category Add/Edit Modal */}
      <Modal
        title={
          parentCategory 
            ? `Thêm Danh Mục Con cho "${parentCategory.category_name}"`
            : editingCategory 
              ? 'Sửa Danh Mục' 
              : 'Thêm Danh Mục Gốc'
        }
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          setParentCategory(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={600}
      >
        {parentCategory && (
          <div className="mb-4 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <div className="flex items-center">
              <BranchesOutlined className="text-blue-500 mr-2" />
              <span>
                Tạo danh mục con thuộc: <strong>{parentCategory.category_name}</strong>
              </span>
            </div>
          </div>
        )}
        
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            name="category_name"
            label="Tên danh mục"
            rules={[
              { required: true, message: 'Vui lòng nhập tên danh mục!' },
              { min: 2, message: 'Tên danh mục phải có ít nhất 2 ký tự!' }
            ]}
          >
            <Input placeholder="Nhập tên danh mục" />
          </Form.Item>

          <Form.Item
            name="category_description"
            label="Mô tả"
          >
            <Input.TextArea 
              placeholder="Nhập mô tả danh mục (tùy chọn)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="is_public"
            valuePropName="checked"
            label="Công khai"
          >
            <Switch checkedChildren="Công khai" unCheckedChildren="Riêng tư" />
          </Form.Item>

          <Divider />

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
                  setParentCategory(null);
                  form.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={createMutation.isPending || updateMutation.isPending}
              >
                {editingCategory ? 'Cập nhật' : 'Tạo'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* User Assignment Modal */}
      <Modal
        title={`Quản lý người dùng: ${selectedCategory?.category_name || ''}`}
        open={isUserModalOpen}
        onCancel={() => {
          setIsUserModalOpen(false);
          setSelectedCategory(null);
          userForm.resetFields();
        }}
        footer={null}
        destroyOnClose
        width={700}
      >
        <div className="mb-4 p-3 bg-green-50 rounded border-l-4 border-green-400">
          <div className="flex items-center">
            <UserOutlined className="text-green-500 mr-2" />
            <span>
              Phân quyền người dùng cho danh mục: <strong>{selectedCategory?.category_name}</strong>
            </span>
          </div>
        </div>

        <Form
          form={userForm}
          layout="vertical"
          onFinish={handleUserAssignment}
          className="mt-4"
        >
          <Form.Item
            name="user_emails"
            label="Chọn người dùng"
            tooltip="Chọn những người dùng được phép truy cập danh mục này"
          >
            <Select
              mode="multiple"
              placeholder="Chọn người dùng..."
              allowClear
              showSearch
              optionFilterProp="children"
              style={{ width: '100%' }}
              options={users.map(user => ({
                value: user.email,
                label: `${user.user_name} (${user.email})`,
              }))}
            />
          </Form.Item>

          <Divider />

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button 
                onClick={() => {
                  setIsUserModalOpen(false);
                  setSelectedCategory(null);
                  userForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={assignUsersMutation.isPending}
              >
                Lưu Phân Quyền
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AntAdminLayout>
  );
};

export default Categories;