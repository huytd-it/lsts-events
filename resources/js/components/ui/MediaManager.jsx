import React, { useState, useCallback } from 'react';
import { Upload, Table, Button, Space, Switch, Input, message, Image, Tag, Tooltip, Modal, Tabs } from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  EyeInvisibleOutlined,
  DragOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  MenuOutlined,
  CloudServerOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const { TextArea } = Input;

// File type detection
const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'jfif'];
const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'];

const getFileType = (fileName) => {
  const extension = fileName.split('.').pop().toLowerCase();
  if (imageExtensions.includes(extension)) return 'image';
  if (videoExtensions.includes(extension)) return 'video';
  if (documentExtensions.includes(extension)) return 'document';
  return 'unknown';
};

const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image': return <FileImageOutlined style={{ color: '#52c41a' }} />;
    case 'video': return <VideoCameraOutlined style={{ color: '#1890ff' }} />;
    case 'document': return <FileTextOutlined style={{ color: '#faad14' }} />;
    default: return <FileTextOutlined style={{ color: '#d9d9d9' }} />;
  }
};

// Sortable Row Component
const SortableRow = ({ children, ...props }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  });

  const style = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    ...(isDragging ? { position: 'relative', zIndex: 9999 } : {}),
  };

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes}>
      {React.Children.map(children, (child) => {
        if (child.key === 'sort') {
          return React.cloneElement(child, {
            children: (
              <MenuOutlined
                {...listeners}
                style={{
                  touchAction: 'none',
                  cursor: 'move',
                }}
              />
            ),
          });
        }
        return child;
      })}
    </tr>
  );
};

const MediaManager = ({ 
  fileList = [], 
  onChange, 
  onUpload,
  maxFiles = 50,
  maxImageFiles = 12,
  maxVideoFiles = 12,
  accept = "image/*,video/*,.pdf,.doc,.docx"
}) => {
  const [draggedIndex, setDraggedIndex] = useState(-1);
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [serverFiles, setServerFiles] = useState([]);
  const [selectedServerFiles, setSelectedServerFiles] = useState([]);
  const [pendingFiles, setPendingFiles] = useState([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Validate file limits
  const validateFileLimits = (newFileList) => {
    const imageCounts = newFileList.filter(file => getFileType(file.name || file.file_name) === 'image').length;
    const videoCounts = newFileList.filter(file => getFileType(file.name || file.file_name) === 'video').length;

    if (imageCounts > maxImageFiles) {
      message.error(`Tối đa ${maxImageFiles} hình ảnh được phép`);
      return false;
    }
    if (videoCounts > maxVideoFiles) {
      message.error(`Tối đa ${maxVideoFiles} video được phép`);
      return false;
    }
    return true;
  };

  // Handle single file addition
  const handleSingleFileAdd = (file) => {
    const newFile = {
      uid: file.uid,
      name: file.name,
      file_name: file.name,
      size: file.size,
      type: file.type,
      file_path: '', // Will be set after upload
      is_show: 1,
      order: fileList.length,
      originFileObj: file
    };

    const newFileList = [...fileList, newFile];
    
    if (!validateFileLimits(newFileList)) {
      return;
    }

    if (onChange) {
      onChange(newFileList);
    }

    if (onUpload) {
      onUpload(file);
    }

    message.success(`Đã thêm ${file.name}`);
  };

  // Handle multiple files addition
  const handleMultipleFileAdd = (files) => {
    const processedFiles = files.map((file, index) => ({
      uid: file.uid || `upload-${Date.now()}-${index}`,
      name: file.name,
      file_name: file.name,
      size: file.size,
      type: file.type,
      file_path: '', // Will be set after upload
      is_show: 1,
      order: fileList.length + index,
      originFileObj: file
    }));

    const newFileList = [...fileList, ...processedFiles];
    
    if (!validateFileLimits(newFileList)) {
      return;
    }

    if (onChange) {
      onChange(newFileList);
    }

    // Call onUpload for each file if provided
    if (onUpload) {
      processedFiles.forEach(file => onUpload(file.originFileObj));
    }

    message.success(`Đã thêm ${processedFiles.length} file(s)`);
  };

  // Handle file removal
  const handleRemove = (file) => {
    const newFileList = fileList.filter(item => item.uid !== file.uid);
    if (onChange) {
      onChange(newFileList);
    }
  };

  // Handle visibility toggle
  const handleVisibilityChange = (file, isVisible) => {
    const newFileList = fileList.map(item => 
      item.uid === file.uid 
        ? { ...item, is_show: isVisible ? 1 : 0 }
        : item
    );
    
    if (!validateFileLimits(newFileList.filter(item => item.is_show === 1))) {
      return;
    }

    if (onChange) {
      onChange(newFileList);
    }
  };

  // Handle name change
  const handleNameChange = (file, newName) => {
    const newFileList = fileList.map(item => 
      item.uid === file.uid 
        ? { ...item, media_name: newName }
        : item
    );
    if (onChange) {
      onChange(newFileList);
    }
  };

  // Handle drag end
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = fileList.findIndex(item => item.uid === active.id);
      const newIndex = fileList.findIndex(item => item.uid === over.id);
      
      const newFileList = arrayMove(fileList, oldIndex, newIndex).map((item, index) => ({
        ...item,
        order: index
      }));
      
      if (onChange) {
        onChange(newFileList);
      }
    }
  };

  // Table columns
  const columns = [
    {
      key: 'sort',
      width: 40,
      align: 'center',
    },
    {
      title: 'Xem trước',
      dataIndex: 'file_path',
      key: 'preview',
      width: 100,
      align: 'center',
      render: (filePath, record) => {
        const fileType = getFileType(record.name || record.file_name);
        const src = filePath || (record.originFileObj ? URL.createObjectURL(record.originFileObj) : '');
        
        if (fileType === 'image' && src) {
          return (
            <Image
              width={60}
              height={40}
              src={src}
              style={{ objectFit: 'cover', borderRadius: 4 }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RUG8A+b0YzBIiCBdSfwBVhAQKZgoBMGZGFgM5CNQSLBAAOBQSZgoBMGZGFgM5CNQSLBNgYhIyMDhUFgsj4RGxhgQBhggI3BkLhyP4p2e3r6dff91tXu96OfvVX/qDV/e9t/m6nZHjQcx0hEcNJYrjQeL7H8AoG/5y8+8fqBgABgCnCiOKK2ybWyWbdW6jqBoGWBbYfz9M4qbJX1/2AqAz53w1HfcnBfRGBQsYVfK7b6sD+dOvbIqgwBIB1yPJ4xNPeRtZdcnKRq8M+zWbYm59dKHvW6y8RxcnOV7qwGgHSkyzKVQRCAJsVWNv/Kt+fxsrLhx7LSxOdtN1cLGEFAgJHR5QgAdDl+lTa+jDHY8nOl5L4sxIqgDKkMlCUAlOV4VdjGT2eFuoxb2fib3RDQh8UCRhAQYGR0OQIAXU5fpY1fw4hU+1FE/AcbY/UlTL4svE5ogHkS6jfL8as0AnOSi/5Q8XUl9JX53z8qVbZQ1cJXy23FfnMk1GqW41dpBBbKyD86vjvJvQBgbYJLPUgf2vLyGCkISdMnBBFBxWJBBAOAiOCKJOLKEKn8NzWNIwBHBOHOwSY0jCAAcESAATgiCAcOdqGZRwDgiCAcONiFhiBcLXWLAAzJNEfj49fj4Ps8AAAYZ5lN"
            />
          );
        } else {
          return (
            <div className="flex items-center justify-center w-15 h-10 bg-gray-100 rounded">
              {getFileIcon(fileType)}
            </div>
          );
        }
      }
    },
    {
      title: 'Tên file',
      dataIndex: 'media_name',
      key: 'name',
      render: (name, record) => (
        <TextArea
          value={name || record.name || record.file_name}
          onChange={(e) => handleNameChange(record, e.target.value)}
          autoSize={{ minRows: 1, maxRows: 3 }}
          placeholder="Nhập tên mô tả..."
        />
      )
    },
    {
      title: 'Loại',
      dataIndex: 'name',
      key: 'type',
      width: 80,
      align: 'center',
      render: (name, record) => {
        const fileType = getFileType(name || record.file_name);
        const colors = {
          image: 'green',
          video: 'blue', 
          document: 'orange',
          unknown: 'default'
        };
        const labels = {
          image: 'Hình',
          video: 'Video',
          document: 'Tài liệu',
          unknown: 'Khác'
        };
        return (
          <Tag color={colors[fileType]} icon={getFileIcon(fileType)}>
            {labels[fileType]}
          </Tag>
        );
      }
    },
    {
      title: 'Hiển thị',
      dataIndex: 'is_show',
      key: 'visibility',
      width: 80,
      align: 'center',
      render: (isShow, record) => (
        <Switch
          checked={isShow === 1}
          onChange={(checked) => handleVisibilityChange(record, checked)}
          checkedChildren={<EyeOutlined />}
          unCheckedChildren={<EyeInvisibleOutlined />}
        />
      )
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xóa">
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleRemove(record)}
          />
        </Tooltip>
      )
    }
  ];

  // Count visible files by type
  const visibleFiles = fileList.filter(file => file.is_show === 1);
  const visibleImages = visibleFiles.filter(file => getFileType(file.name || file.file_name) === 'image');
  const visibleVideos = visibleFiles.filter(file => getFileType(file.name || file.file_name) === 'video');

  // Handle server file selection
  const handleSelectFromServer = () => {
    // Get files from localStorage (set by FileExplorer)
    const savedFiles = localStorage.getItem('selectedServerFiles');
    let serverFilesFromStorage = [];
    
    if (savedFiles) {
      try {
        serverFilesFromStorage = JSON.parse(savedFiles);
      } catch (e) {
        console.error('Error parsing saved files:', e);
      }
    }

    // Combine with mock files
    const mockFiles = [
      {
        id: 'mock1',
        name: 'default-banner.jpg',
        path: '/uploads/events/default-banner.jpg',
        url: '/storage/uploads/events/default-banner.jpg',
        type: 'image/jpeg',
        size: 245760
      },
      {
        id: 'mock2', 
        name: 'sample-video.mp4',
        path: '/uploads/media/sample-video.mp4',
        url: '/storage/uploads/media/sample-video.mp4',
        type: 'video/mp4',
        size: 15728640
      }
    ];

    setServerFiles([...mockFiles, ...serverFilesFromStorage]);
    setIsServerModalOpen(true);
  };

  const handleAddServerFiles = () => {
    const selectedFiles = serverFiles.filter(file => selectedServerFiles.includes(file.id));
    const newFiles = selectedFiles.map(file => ({
      uid: `server-${file.id}`,
      name: file.name,
      file_name: file.name,
      file_path: file.path,
      media_name: file.name,
      is_show: 1,
      order: fileList.length,
      url: file.url,
      type: file.type,
      size: file.size
    }));

    const newFileList = [...fileList, ...newFiles];
    if (validateFileLimits(newFileList)) {
      if (onChange) {
        onChange(newFileList);
      }
      message.success(`Đã thêm ${newFiles.length} file từ server`);
      setIsServerModalOpen(false);
      setSelectedServerFiles([]);
    }
  };

  return (
    <div className="media-manager">
      <Tabs
        defaultActiveKey="upload"
        items={[
          {
            key: 'upload',
            label: 'Upload mới',
            children: (
              <Upload.Dragger
                multiple
                beforeUpload={(file, fileList) => {
                  // Process all files at once when multiple files are selected
                  if (fileList.length > 1) {
                    handleMultipleFileAdd(fileList);
                  } else {
                    handleSingleFileAdd(file);
                  }
                  return false; // Prevent auto upload
                }}
                showUploadList={false}
                accept={accept}
                style={{ marginBottom: 16 }}
              >
                <p className="ant-upload-drag-icon">
                  <UploadOutlined />
                </p>
                <p className="ant-upload-text">Kéo thả file vào đây hoặc click để chọn</p>
                <p className="ant-upload-hint">
                  Hỗ trợ hình ảnh, video và tài liệu. Tối đa {maxImageFiles} hình ảnh và {maxVideoFiles} video.
                </p>
              </Upload.Dragger>
            )
          },
          {
            key: 'server',
            label: 'Chọn từ server',
            children: (
              <div className="text-center py-8">
                <CloudServerOutlined className="text-4xl text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Chọn file có sẵn trên server</p>
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={handleSelectFromServer}
                >
                  Duyệt file server
                </Button>
              </div>
            )
          }
        ]}
      />

      {/* Statistics */}
      {fileList.length > 0 && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <Space>
            <Tag color="green">Hình ảnh: {visibleImages.length}/{maxImageFiles}</Tag>
            <Tag color="blue">Video: {visibleVideos.length}/{maxVideoFiles}</Tag>
            <Tag>Tổng cộng: {fileList.length}</Tag>
            <Tag>Hiển thị: {visibleFiles.length}</Tag>
          </Space>
        </div>
      )}

      {/* File List Table */}
      {fileList.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={fileList.map(item => item.uid)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              components={{
                body: {
                  row: SortableRow,
                },
              }}
              dataSource={fileList}
              columns={columns}
              rowKey="uid"
              pagination={false}
              size="small"
              scroll={{ x: 600 }}
            />
          </SortableContext>
        </DndContext>
      )}

      {/* Server File Selection Modal */}
      <Modal
        title="Chọn file từ server"
        open={isServerModalOpen}
        onCancel={() => {
          setIsServerModalOpen(false);
          setSelectedServerFiles([]);
        }}
        footer={[
          <Button key="cancel" onClick={() => setIsServerModalOpen(false)}>
            Hủy
          </Button>,
          <Button 
            key="select" 
            type="primary" 
            onClick={handleAddServerFiles}
            disabled={selectedServerFiles.length === 0}
          >
            Thêm {selectedServerFiles.length} file(s)
          </Button>
        ]}
        width={800}
      >
        <Table
          dataSource={serverFiles}
          rowKey="id"
          rowSelection={{
            selectedRowKeys: selectedServerFiles,
            onChange: (selectedRowKeys) => setSelectedServerFiles(selectedRowKeys),
          }}
          columns={[
            {
              title: 'Xem trước',
              dataIndex: 'url',
              key: 'preview',
              width: 80,
              render: (url, record) => {
                if (record.type.startsWith('image/')) {
                  return (
                    <Image
                      width={50}
                      height={35}
                      src={url}
                      style={{ objectFit: 'cover', borderRadius: 4 }}
                    />
                  );
                }
                return getFileIcon(getFileType(record.name));
              }
            },
            {
              title: 'Tên file',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: 'Loại',
              dataIndex: 'type',
              key: 'type',
              width: 100,
              render: (type) => {
                const fileType = getFileType(type);
                const colors = { image: 'green', video: 'blue', document: 'orange' };
                const labels = { image: 'Hình', video: 'Video', document: 'Tài liệu' };
                return <Tag color={colors[fileType] || 'default'}>{labels[fileType] || 'Khác'}</Tag>;
              }
            },
            {
              title: 'Kích thước',
              dataIndex: 'size',
              key: 'size',
              width: 100,
              render: (size) => {
                const k = 1024;
                const sizes = ['B', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(size) / Math.log(k));
                return parseFloat((size / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
              }
            }
          ]}
          pagination={{ pageSize: 8 }}
        />
      </Modal>
    </div>
  );
};

export default MediaManager;