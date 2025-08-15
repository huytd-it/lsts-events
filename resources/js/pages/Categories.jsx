import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, Switch, Spin } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../api/services';
import AntAdminLayout from '../components/layout/AntAdminLayout';

const { confirm } = Modal;

const Categories = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const queryClient = useQueryClient();

  // Fetch categories
  const { 
    data: categoriesResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    retry: 2,
  });

  const categories = categoriesResponse?.data || [];

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: categoryService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Tạo danh mục thành công');
      setIsModalOpen(false);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Cập nhật danh mục thành công');
      setIsModalOpen(false);
      setEditingCategory(null);
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      message.success('Xóa danh mục thành công');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || error.message || 'Có lỗi xảy ra';
      message.error(errorMessage);
    }
  });

  const handleCreate = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingCategory(record);
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

    if (editingCategory) {
      updateMutation.mutate({ 
        id: editingCategory.category_id, 
        data: formData 
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const columns = [
    {
      title: 'Tên danh mục',
      dataIndex: 'category_name',
      key: 'category_name',
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
    },
    {
      title: 'Mô tả',
      dataIndex: 'category_description',
      key: 'category_description',
      ellipsis: true,
    },
    {
      title: 'Công khai',
      dataIndex: 'is_public',
      key: 'is_public',
      render: (isPublic) => (
        <Switch checked={isPublic === 1} disabled />
      ),
      width: 100,
    },
    {
      title: 'Số sự kiện',
      dataIndex: 'events_count',
      key: 'events_count',
      sorter: (a, b) => (a.events_count || 0) - (b.events_count || 0),
      width: 120,
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
            loading={deleteMutation.isPending}
          >
            Xóa
          </Button>
        </Space>
      ),
      width: 150,
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
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Danh Mục</h1>
          <p className="text-gray-600">Quản lý danh mục sự kiện</p>
        </div>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Thêm Danh Mục
        </Button>
      </div>
      
      <Table 
        dataSource={categories} 
        columns={columns} 
        rowKey="category_id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => 
            `${range[0]}-${range[1]} của ${total} danh mục`,
        }}
      />

      <Modal
        title={editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
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
            <Switch />
          </Form.Item>

          <Form.Item className="mb-0 text-right">
            <Space>
              <Button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingCategory(null);
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
    </AntAdminLayout>
  );
};

export default Categories;