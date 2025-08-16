import React, { useState, useEffect } from 'react';
import { Tree, Table, Button, Space, Card, Input, message, Modal, Image, Tag, Tooltip, Upload, Progress } from 'antd';
import { 
  FolderOutlined, 
  FileOutlined, 
  SearchOutlined, 
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EyeOutlined,
  FolderOpenOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AntAdminLayout from '../components/layout/AntAdminLayout';
import { FileManager } from '@cubone/react-file-manager';
import '@cubone/react-file-manager/dist/style.css';

const { DirectoryTree } = Tree;
const { Search } = Input;

const FileExplorer = () => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [currentPath, setCurrentPath] = useState('/');
  const queryClient = useQueryClient();

  // Mock files for Cubone FileManager
  const [files, setFiles] = useState([
    {
      id: '1',
      name: 'uploads',
      isDirectory: true,
      path: '/uploads',
      parentPath: '/',
      size: 0,
      updatedAt: '2024-12-15T10:30:00Z'
    },
    {
      id: '2', 
      name: 'documents',
      isDirectory: true,
      path: '/documents',
      parentPath: '/',
      size: 0,
      updatedAt: '2024-12-14T15:20:00Z'
    },
    {
      id: '3',
      name: 'events',
      isDirectory: true,
      path: '/uploads/events',
      parentPath: '/uploads',
      size: 0,
      updatedAt: '2024-12-13T09:15:00Z'
    },
    {
      id: '4',
      name: 'media',
      isDirectory: true,
      path: '/uploads/media',
      parentPath: '/uploads',
      size: 0,
      updatedAt: '2024-12-12T08:45:00Z'
    },
    {
      id: '5',
      name: 'event-banner.jpg',
      isDirectory: false,
      path: '/uploads/events/event-banner.jpg',
      parentPath: '/uploads/events',
      size: 245760,
      updatedAt: '2024-12-15T10:30:00Z',
      thumbnailUrl: '/storage/uploads/events/event-banner.jpg',
      url: '/storage/uploads/events/event-banner.jpg'
    },
    {
      id: '6',
      name: 'presentation.pdf',
      isDirectory: false,
      path: '/uploads/documents/presentation.pdf',
      parentPath: '/uploads/documents',
      size: 1048576,
      updatedAt: '2024-12-14T15:20:00Z',
      url: '/storage/uploads/documents/presentation.pdf'
    },
    {
      id: '7',
      name: 'intro-video.mp4',
      isDirectory: false,
      path: '/uploads/media/intro-video.mp4',
      parentPath: '/uploads/media',
      size: 15728640,
      updatedAt: '2024-12-13T09:15:00Z',
      url: '/storage/uploads/media/intro-video.mp4'
    }
  ]);

  // Handle file actions
  const handleFileOpen = (file) => {
    if (file.isDirectory) {
      setCurrentPath(file.path);
    } else {
      window.open(file.url, '_blank');
    }
  };

  const handleFileDelete = (file) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc muốn xóa "${file.name}"?`,
      onOk: () => {
        setFiles(prev => prev.filter(f => f.id !== file.id));
        message.success('Đã xóa file thành công');
      }
    });
  };

  const handleFileRename = (file, newName) => {
    setFiles(prev => prev.map(f => 
      f.id === file.id ? { ...f, name: newName } : f
    ));
    message.success('Đã đổi tên thành công');
  };

  const handleFileSelect = (selectedFiles) => {
    setSelectedFiles(selectedFiles);
  };

  const handleSelectForEvent = () => {
    if (selectedFiles.length === 0) {
      message.warning('Vui lòng chọn ít nhất một file');
      return;
    }
    
    // Store selected files in localStorage or context for Events modal
    localStorage.setItem('selectedServerFiles', JSON.stringify(selectedFiles));
    message.success(`Đã chọn ${selectedFiles.length} file(s) cho sự kiện`);
  };

  // Filter files by current path
  const currentFiles = files.filter(file => 
    file.parentPath === currentPath || (currentPath === '/' && !file.parentPath)
  );

  return (
    <AntAdminLayout>
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">File Explorer</h1>
            <p className="text-gray-600">Quản lý cấu trúc thư mục và file trên server</p>
          </div>
          <Space>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => {
                message.info('Đã làm mới danh sách file');
              }}
            >
              Làm mới
            </Button>
            {selectedFiles.length > 0 && (
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleSelectForEvent}
              >
                Chọn {selectedFiles.length} file(s) cho Event
              </Button>
            )}
          </Space>
        </div>
      </div>

      <Card className="min-h-[600px]">
        <FileManager
          files={currentFiles}
          onFileOpen={handleFileOpen}
          onFileDelete={handleFileDelete}
          onFileRename={handleFileRename}
          onSelectionChange={handleFileSelect}
          height={600}
          layout="list"
          permissions={{
            canDelete: true,
            canRename: true,
            canUpload: true,
            canCreateFolder: true
          }}
          toolbar={{
            showSearch: true,
            showUpload: true,
            showCreateFolder: true,
            showViewToggle: true
          }}
        />
      </Card>
    </AntAdminLayout>
  );
};

export default FileExplorer;