import React, { useState } from 'react';
import { Table, Button, Space, Tag, message, Modal, Form, Input, DatePicker, Select, Upload, Switch, Card, Row, Col, Statistic, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ExclamationCircleOutlined, UploadOutlined, SearchOutlined, FilterOutlined, FileImageOutlined, VideoCameraOutlined, ApartmentOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { eventService, categoryService } from '../api/services';
import AntAdminLayout from '../components/layout/AntAdminLayout';
import MediaManager from '../components/ui/MediaManager';
import dayjs from 'dayjs';

const { confirm } = Modal;
const { TextArea } = Input;

const Events = () => {
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [mediaList, setMediaList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  const queryClient = useQueryClient();

  // Build query params for events
  const eventsParams = {
    ...(searchText && { search: searchText }),
    ...(selectedCategory && { category_id: selectedCategory }),
    ...(dateRange.length === 2 && {
      start_date: dateRange[0].format('YYYY-MM-DD'),
      end_date: dateRange[1].format('YYYY-MM-DD'),
    }),
    per_page: 15
  };

  // Fetch events with filters
  const {
    data: eventsResponse,
    isLoading: eventsLoading,
    error: eventsError
  } = useQuery({
    queryKey: ['events', eventsParams],
    queryFn: () => eventService.getAll(eventsParams),
    retry: 2,
  });

  // Fetch categories for dropdown
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
    retry: 2,
  });

  const events = eventsResponse?.data || [];
  const categories = categoriesResponse?.data || [];

  // Fetch event statistics
  const {
    data: statsResponse
  } = useQuery({
    queryKey: ['event-stats'],
    queryFn: () => eventService.getStatistics(),
    retry: 2,
  });

  const stats = statsResponse?.data || {};

  // File upload mutation
  const uploadMutation = useMutation({
    mutationFn: eventService.uploadFiles,
    onError: (error) => {
      const errorMessage = error.response?.data?.error || error.message || 'Upload thất bại';
      message.error(errorMessage);
    }
  });

  // Create event mutation
  const createMutation = useMutation({
    mutationFn: eventService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      message.success(data.msg || 'Tạo sự kiện thành công');
      setIsModalOpen(false);
      setEditingEvent(null);
      setMediaList([]);
      form.resetFields();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || error.message || 'Có lỗi xảy ra';
      message.error(errorMessage);
    }
  });

  // Update event mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => eventService.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      message.success(data.msg || 'Cập nhật sự kiện thành công');
      setIsModalOpen(false);
      setEditingEvent(null);
      setMediaList([]);
      form.resetFields();
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || error.message || 'Có lỗi xảy ra';
      message.error(errorMessage);
    }
  });

  // Delete event mutation
  const deleteMutation = useMutation({
    mutationFn: eventService.delete,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['event-stats'] });
      message.success(data.msg || 'Xóa sự kiện thành công');
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.msg || error.message || 'Có lỗi xảy ra';
      message.error(errorMessage);
    }
  });

  const handleCreate = () => {
    setEditingEvent(null);
    setIsModalOpen(true);
    setMediaList([]);
    form.resetFields();
  };

  const handleEdit = (record) => {
    setEditingEvent(record);
    setIsModalOpen(true);

    // Load existing media if available
    const existingMedia = record.media ? record.media.map((media, index) => ({
      uid: media.media_id || `existing-${index}`,
      name: media.file_name || media.media_name,
      file_name: media.file_name || media.media_name,
      file_path: media.file_path,
      media_name: media.media_name,
      is_show: media.is_show,
      order: media.order || index,
      media_id: media.media_id
    })) : [];

    setMediaList(existingMedia);

    form.setFieldsValue({
      event_name: record.event_name,
      event_date: dayjs(record.event_date),
      location: record.location,
      description: record.description,
      category_id: record.category_id,
      is_big_event: record.is_big_event === 1
    });
  };

  const handleDelete = (record) => {
    confirm({
      title: 'Xác nhận xóa sự kiện',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa sự kiện "${record.event_name}"?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk() {
        deleteMutation.mutate(record.event_id || record.id);
      },
    });
  };

  const handleSubmit = async (values) => {
    try {
      let mediaData = [];

      // Process media files
      if (mediaList.length > 0) {
        // Separate new files (need upload) from existing files
        const newFiles = mediaList.filter(file => file.originFileObj && !file.file_path);
        const existingFiles = mediaList.filter(file => file.file_path);

        // Upload new files if any
        if (newFiles.length > 0) {
          const files = newFiles.map(file => file.originFileObj);
          const uploadResponse = await uploadMutation.mutateAsync(files);

          if (uploadResponse.success && uploadResponse.data) {
            const uploadedFiles = uploadResponse.data.map((file, index) => {
              const originalFile = newFiles[index];
              return {
                file_path: file.file_path,
                file_name: file.file_name,
                media_name: originalFile.media_name || originalFile.name,
                is_show: originalFile.is_show,
                order: originalFile.order
              };
            });
            mediaData = [...mediaData, ...uploadedFiles];
          }
        }

        // Add existing files (for updates)
        existingFiles.forEach(file => {
          mediaData.push({
            media_id: file.media_id,
            file_path: file.file_path,
            file_name: file.file_name,
            media_name: file.media_name,
            is_show: file.is_show,
            order: file.order
          });
        });
      }

      const formData = {
        event_name: values.event_name,
        event_date: values.event_date.format('YYYY-MM-DD'),
        location: values.location,
        description: values.description,
        category_id: values.category_id,
        is_big_event: values.is_big_event ? 1 : 0,
        ...(mediaData.length > 0 && { media: mediaData })
      };

      if (editingEvent) {
        updateMutation.mutate({
          id: editingEvent.event_id || editingEvent.id,
          data: formData
        });
      } else {
        createMutation.mutate(formData);
      }
    } catch (error) {
      message.error('Có lỗi xảy ra khi xử lý media files');
    }
  };

  const columns = [
    {
      title: 'Tên sự kiện',
      dataIndex: 'event_name',
      key: 'event_name',
      sorter: (a, b) => a.event_name.localeCompare(b.event_name),
      width: 250,
    },
    {
      title: 'Ngày',
      dataIndex: 'event_date',
      key: 'event_date',
      sorter: (a, b) => new Date(a.event_date) - new Date(b.event_date),
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      width: 120,
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location',
      ellipsis: true,
      width: 150,
    },
    {
      title: 'Danh mục',
      key: 'category',
      render: (_, record) => {
        const categoryName = record.category?.category_name || 'N/A';
        return <Tag color="processing">{categoryName}</Tag>;
      },
      width: 120,
    },
    {
      title: 'Sự kiện lớn',
      dataIndex: 'is_big_event',
      key: 'is_big_event',
      render: (isBig) => (
        <Tag color={isBig ? 'red' : 'default'}>
          {isBig ? 'Lớn' : 'Nhỏ'}
        </Tag>
      ),
      width: 100,
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

  if (eventsError) {
    return (
      <AntAdminLayout>
        <div className="text-center py-8">
          <p className="text-red-500">Có lỗi xảy ra khi tải dữ liệu: {eventsError.message}</p>
          <Button
            type="primary"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['events'] })}
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
              title="Tổng Sự Kiện"
              value={stats.total_events || 0}
              prefix={<ApartmentOutlined className="text-blue-500" />}
              valueStyle={{ color: '#1677ff', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-emerald-500">
            <Statistic
              title="Sự Kiện Lớn"
              value={stats.big_events || 0}
              prefix={<ApartmentOutlined className="text-emerald-500" />}
              valueStyle={{ color: '#10b981', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-amber-500">
            <Statistic
              title="Có Hình Ảnh"
              value={stats.events_with_images || 0}
              prefix={<FileImageOutlined className="text-amber-500" />}
              valueStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-purple-500">
            <Statistic
              title="Có Video"
              value={stats.events_with_videos || 0}
              prefix={<VideoCameraOutlined className="text-purple-500" />}
              valueStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
              titleStyle={{ color: '#6b7280', fontSize: '14px' }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản Lý Sự Kiện</h1>
            <p className="text-gray-600">Quản lý sự kiện với hệ thống media tiên tiến</p>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Thêm Sự Kiện
          </Button>
        </div>

        {/* Search and Filter Controls */}
        <Card className="mb-4 shadow-sm border-0 bg-gradient-to-r from-slate-50 to-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Tìm kiếm</label>
              <Input.Search
                placeholder="Tìm kiếm sự kiện..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={setSearchText}
                className="rounded-lg"
                size="large"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Danh mục</label>
              <Select
                placeholder="Chọn danh mục"
                allowClear
                value={selectedCategory}
                onChange={setSelectedCategory}
                loading={categoriesLoading}
                className="w-full rounded-lg"
                size="large"
                options={[
                  { value: null, label: 'Tất cả danh mục' },
                  ...categories.map(cat => ({
                    value: cat.category_id,
                    label: cat.category_name
                  }))
                ]}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Khoảng thời gian</label>
              <DatePicker.RangePicker
                placeholder={['Từ ngày', 'Đến ngày']}
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                className="w-full rounded-lg"
                size="large"
                allowClear
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-600">Hành động</label>
              <Button
                icon={<FilterOutlined />}
                onClick={() => {
                  setSearchText('');
                  setSelectedCategory(null);
                  setDateRange([]);
                }}
                className="w-full rounded-lg border-gray-300 hover:border-blue-400 hover:text-blue-500"
                size="large"
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </Card>
      </div>

      <Table
        dataSource={events}
        columns={columns}
        rowKey={(record) => record.event_id || record.id}
        loading={eventsLoading}
        scroll={{ x: 1000 }}
        pagination={{
          total: eventsResponse?.total || 0,
          current: eventsResponse?.current_page || 1,
          pageSize: eventsResponse?.per_page || 15,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sự kiện`,
          onChange: (page, pageSize) => {
            // Add pagination handling here if needed
          }
        }}
      />

      <Modal
        title={editingEvent ? 'Sửa Sự Kiện' : 'Thêm Sự Kiện'}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
          setMediaList([]);
          form.resetFields();
        }}
        footer={null}
        width={1200}
        style={{ top: 20 }}
        bodyStyle={{ maxHeight: 'calc(100vh - 120px)', overflowY: 'auto' }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Event Information */}
          <div className="space-y-4">
            <Card title="Thông tin sự kiện" size="small" className="h-fit">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                className="space-y-3"
              >
                <Form.Item
                  name="event_name"
                  label={<span className="text-sm font-medium text-gray-700">Tên sự kiện</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập tên sự kiện!' },
                    { min: 5, message: 'Tên sự kiện phải có ít nhất 5 ký tự!' }
                  ]}
                  className="mb-3"
                >
                  <Input 
                    placeholder="Nhập tên sự kiện" 
                    className="rounded-lg"
                    size="large"
                  />
                </Form.Item>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Form.Item
                    name="event_date"
                    label={<span className="text-sm font-medium text-gray-700">Ngày sự kiện</span>}
                    rules={[
                      { required: true, message: 'Vui lòng chọn ngày sự kiện!' }
                    ]}
                    className="mb-3"
                  >
                    <DatePicker
                      className="w-full rounded-lg"
                      placeholder="Chọn ngày sự kiện"
                      format="DD/MM/YYYY"
                      size="large"
                      disabledDate={(current) => current && current < dayjs().startOf('day')}
                    />
                  </Form.Item>

                  <Form.Item
                    name="category_id"
                    label={<span className="text-sm font-medium text-gray-700">Danh mục</span>}
                    rules={[
                      { required: true, message: 'Vui lòng chọn danh mục!' }
                    ]}
                    className="mb-3"
                  >
                    <Select 
                      placeholder="Chọn danh mục sự kiện"
                      loading={categoriesLoading}
                      className="rounded-lg"
                      size="large"
                      options={categories.map(cat => ({
                        value: cat.category_id,
                        label: cat.category_name
                      }))}
                    />
                  </Form.Item>
                </div>

                <Form.Item
                  name="location"
                  label={<span className="text-sm font-medium text-gray-700">Địa điểm</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập địa điểm!' }
                  ]}
                  className="mb-3"
                >
                  <Input 
                    placeholder="Nhập địa điểm tổ chức" 
                    className="rounded-lg"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<span className="text-sm font-medium text-gray-700">Mô tả</span>}
                  rules={[
                    { required: true, message: 'Vui lòng nhập mô tả!' }
                  ]}
                  className="mb-3"
                >
                  <TextArea 
                    placeholder="Nhập mô tả sự kiện"
                    rows={3}
                    className="rounded-lg"
                  />
                </Form.Item>

                <Form.Item
                  name="is_big_event"
                  label={<span className="text-sm font-medium text-gray-700">Sự kiện lớn</span>}
                  valuePropName="checked"
                  className="mb-3"
                >
                  <Switch 
                    checkedChildren="Có" 
                    unCheckedChildren="Không"
                  />
                </Form.Item>

                <Form.Item className="mb-0 pt-3 border-t border-gray-100">
                  <div className="flex justify-end space-x-3">
                    <Button 
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingEvent(null);
                        setMediaList([]);
                        form.resetFields();
                      }}
                      className="rounded-lg"
                      size="large"
                    >
                      Hủy
                    </Button>
                    <Button 
                      type="primary" 
                      htmlType="submit"
                      loading={createMutation.isPending || updateMutation.isPending}
                      className="rounded-lg"
                      size="large"
                    >
                      {editingEvent ? 'Cập nhật' : 'Tạo'}
                    </Button>
                  </div>
                </Form.Item>
              </Form>
            </Card>
          </div>

          {/* Right Column - Media Management */}
          <div>
            <Card title="Quản lý Media" size="small" className="h-fit">
              <MediaManager
                fileList={mediaList}
                onChange={setMediaList}
                onUpload={(file) => {
                  message.info(`Đã thêm ${file.name}`);
                }}
                maxImageFiles={12}
                maxVideoFiles={12}
                accept="image/*,video/*,.pdf,.doc,.docx"
              />
            </Card>
          </div>
        </div>
      </Modal>
    </AntAdminLayout>
  );
};

export default Events;
