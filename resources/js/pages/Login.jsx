import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Checkbox, message, Spin } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/layout/AuthLayout';

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login, isAuthenticated, loading: authLoading } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      await login({
        email: values.email,
        password: values.password
      });
      
      // Redirect to dashboard on successful login
      navigate('/', { replace: true });
    } catch (error) {
      // Error already handled in AuthContext
      console.error('Login failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <AuthLayout title="Đăng Nhập">
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        size="large"
        className="space-y-4"
      >
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Vui lòng nhập email!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="name@company.com"
            autoComplete="email"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="Mật khẩu"
          rules={[
            { required: true, message: 'Vui lòng nhập mật khẩu!' },
            { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </Form.Item>

        <div className="flex items-center justify-between">
          <Form.Item name="remember" valuePropName="checked" className="mb-0">
            <Checkbox>Ghi nhớ đăng nhập</Checkbox>
          </Form.Item>
          <a href="#" className="text-sm text-primary-600 hover:text-primary-500">
            Quên mật khẩu?
          </a>
        </div>

        <Form.Item className="mb-0">
          <Button
            type="primary"
            htmlType="submit"
            className="w-full"
            loading={loading}
            size="large"
          >
            Đăng Nhập
          </Button>
        </Form.Item>
      </Form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Chưa có tài khoản?{' '}
          <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
            Đăng ký ngay
          </a>
        </p>
      </div>
    </AuthLayout>
  );
}