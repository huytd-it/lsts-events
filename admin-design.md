# Hướng dẫn Xây dựng Layout Admin với Ant-Design

## 1. Chuẩn bị Môi trường

### 1.1. Yêu cầu Hệ thống
- Node.js 18.x trở lên
- npm 9.x trở lên hoặc yarn 1.22.x trở lên
- Máy tính có ít nhất 8GB RAM để xử lý build
- Kiến thức cơ bản về React và TypeScript

### 1.2. Tạo Dự án React mới
1. Sử dụng Create React App hoặc Vite để tạo dự án mới
   - Nên chọn Vite vì tốc độ build nhanh hơn
   - Chọn template React + TypeScript
2. Xóa các file mẫu không cần thiết trong dự án mới
3. Cấu hình ESLint và Prettier cho code consistency

## 2. Cài đặt Thư viện Cần thiết

### 2.1. Cài đặt Ant Design và các phụ thuộc
```bash
npm install antd @ant-design/icons @ant-design/plots
npm install @umijs/route-utils @ant-design/pro-components
```

### 2.2. Cài đặt Thư viện Hỗ trợ
```bash
npm install react-router-dom@6
npm install @tanstack/react-query@5
npm install axios
npm install react-helmet-async
npm install @reduxjs/toolkit react-redux
npm install dayjs
npm install xlsx
npm install react-dnd react-dnd-html5-backend
npm install react-quill
npm install @types/node @types/react @types/react-dom
```

### 2.3. Cài đặt Thư viện UI khác
```bash
npm install react-icons
npm install @headlessui/react
npm install framer-motion
npm install react-toastify
```

## 3. Cấu hình Ant Design

### 3.1. Cấu hình Theme
1. Tạo file `tailwind.config.js` với cấu hình theme phù hợp với hệ thống:
   - Màu chính: `#9eefe1` (primary)
   - Màu phụ: `#1b4664` (secondary)
   - Màu accent: `#FF00E1`
   - Font chữ: Quicksand (body), Rowdies (display)

2. Cấu hình biến CSS trong `src/index.css`:
   ```css
   :root {
     --primary-color: #9eefe1;
     --secondary-color: #1b4664;
     --accent-color: #FF00E1;
     --violet-color: #2A004F;
     /* Các biến khác */
   }
   ```

3. Cấu hình theme Ant Design trong `config/theme.config.js`:
   - Thiết lập token primary color
   - Điều chỉnh border radius
   - Cấu hình shadow
   - Thiết lập typography

### 3.2. Cấu hình Plugin và Babel
1. Cài đặt và cấu hình `babel-plugin-import` để chỉ import các component cần thiết
2. Cấu hình `vite.config.js` để hỗ trợ Ant Design:
   - Thêm plugin cho less
   - Cấu hình CSS variables
   - Thiết lập alias

3. Cấu hình `tsconfig.json` để hỗ trợ các đường dẫn tuyệt đối:
   ```json
   {
     "compilerOptions": {
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"]
       }
     }
   }
   ```

## 4. Thiết lập Layout Admin Cơ bản

### 4.1. Cấu trúc Thư mục
1. Tạo thư mục `src/layouts` để chứa các layout chính
2. Tạo các layout chính:
   - `BasicLayout`: Layout cơ bản cho admin
   - `UserLayout`: Layout cho trang login
   - `BlankLayout`: Layout trống cho các trang đặc biệt

3. Tạo thư mục `src/components` với các subfolder:
   - `layout/`: Header, Sidebar, Footer
   - `ui/`: Button, Card, Table, Form components
   - `events/`: Event-specific components
   - `categories/`: Category-specific components

### 4.2. Cấu hình Router
1. Tạo file `src/routes` để quản lý tất cả route
2. Phân chia route thành:
   - Public routes (login, forgot password)
   - Protected routes (dashboard, events, categories)
   - System routes (404, maintenance)

3. Cấu hình route với các đặc điểm:
   - Authentication guard
   - Role-based access control
   - Lazy loading cho performance

### 4.3. Cấu hình State Management
1. Thiết lập Redux store với:
   - User slice (quản lý thông tin người dùng)
   - Auth slice (quản lý authentication)
   - UI slice (quản lý state UI)

2. Cấu hình Redux Persist để lưu trạng thái đăng nhập
3. Thiết lập middleware cho API calls

## 5. Thiết kế Giao diện Admin

### 5.1. Header Component
1. Cấu hình Header với:
   - Logo trường Lawrence S.Ting School
   - Search bar tích hợp
   - User profile dropdown
   - Theme toggle button
   - Notification bell

2. Thiết lập responsive cho Header:
   - Mobile menu button
   - Responsive navigation items
   - Mobile-friendly user menu

### 5.2. Sidebar Navigation
1. Cấu hình Sidebar với:
   - Tree-based navigation cho categories
   - Active state highlighting
   - Collapsible sections
   - Icon cho từng menu item

2. Cấu hình dynamic menu:
   - Load menu items dựa trên user permissions
   - Highlight current route
   - Support for nested routes

### 5.3. Theme và Style
1. Cấu hình theme Ant Design:
   - Tạo custom theme với primary color #9eefe1
   - Điều chỉnh border radius cho các component
   - Thiết lập shadow depth cho các card

2. Tích hợp với CSS variables:
   - Sử dụng CSS variables cho màu sắc
   - Thiết lập gradient background
   - Cấu hình typography

3. Thêm custom styles:
   - Animation cho các transition
   - Hover effects cho buttons
   - Skeleton loading states
   - Responsive breakpoints

## 6. Triển khai Các Trang Chính

### 6.1. Dashboard
1. Cấu hình dashboard layout:
   - Grid system với responsive columns
   - Stat cards với số liệu thống kê
   - Recent events timeline
   - Category distribution chart

2. Thiết lập data visualization:
   - Sử dụng Ant Design Charts
   - Tạo custom charts cho event statistics
   - Responsive chart sizing

### 6.2. Events Management
1. Cấu hình trang danh sách sự kiện:
   - Table với các cột cần thiết
   - Custom filters (category, date range)
   - Search functionality
   - Pagination controls

2. Thiết lập form sự kiện:
   - Form layout với Ant Design Form
   - Rich text editor cho description
   - Media upload and management section
   - Category tree picker

3. Cấu hình import/export:
   - Excel import interface
   - Template download button
   - Preview pane for imported data
   - Progress tracking

### 6.3. Categories Management
1. Cấu hình category tree:
   - Tree view với expand/collapse
   - Drag and drop reordering
   - Permission management section
   - Events count display

2. Thiết lập category form:
   - Parent category selection
   - Public/private toggle
   - Description field
   - User assignment interface

## 7. Tối ưu hóa và Tích hợp

### 7.1. Media Optimization Interface
1. Cấu hình media optimization page:
   - Progress bar với statistics
   - Batch processing controls
   - File type filters
   - Processing history

2. Thiết lập media management:
   - Gallery view cho event media
   - Drag and drop reordering
   - Visibility toggle
   - Preview functionality

### 7.2. Performance Optimization
1. Cấu hình code splitting:
   - Route-based code splitting
   - Component lazy loading
   - Dynamic imports

2. Tối ưu hóa assets:
   - Image optimization pipeline
   - CSS minification
   - Bundle analysis

### 7.3. Authentication Integration
1. Cấu hình auth flow:
   - Login page với form validation
   - Token management
   - Session expiration handling
   - Protected route guards

2. Thiết lập user permissions:
   - Role-based access control
   - Permission checking utilities
   - UI element visibility control

## 8. Xây dựng và Triển khai

### 8.1. Cấu hình Build
1. Tối ưu hóa production build:
   - Tree shaking
   - CSS minification
   - Image optimization
   - Bundle splitting

2. Cấu hình environment variables:
   - API endpoints
   - Feature flags
   - Environment-specific settings

### 8.2. Testing và QA
1. Thiết lập testing pipeline:
   - Unit tests cho components
   - Integration tests cho critical flows
   - E2E tests cho user journeys

2. Chuẩn bị QA checklist:
   - Cross-browser testing
   - Responsive testing
   - Accessibility audit
   - Performance testing

### 8.3. Deployment
1. Cấu hình deployment pipeline:
   - Build script
   - Asset optimization
   - Cache configuration
   - Rollback strategy

2. Chuẩn bị post-deployment:
   - Health checks
   - Monitoring setup
   - Error tracking
   - User feedback mechanism

## 9. Hướng dẫn Sử dụng và Bảo trì

### 9.1. Tài liệu cho Developer
1. Tạo style guide:
   - Component usage guidelines
   - Color and typography system
   - UI pattern library
   - Code conventions

2. Viết tài liệu API:
   - Request/response formats
   - Error handling
   - Authentication flow
   - Rate limiting

### 9.2. Hướng dẫn cho Quản trị viên
1. Tạo user manual:
   - Step-by-step guides
   - Screenshots and videos
   - Common issues and solutions
   - Best practices

2. Chuẩn bị support system:
   - FAQ section
   - Contact information
   - Issue tracking process
   - Training materials

## 10. Lưu ý Quan trọng

1. **Tính nhất quán**: Đảm bảo tất cả các component tuân thủ style guide
2. **Accessibility**: Kiểm tra và đảm bảo WCAG 2.1 compliance
3. **Performance**: Theo dõi và tối ưu tốc độ load trang
4. **Security**: Áp dụng các best practices bảo mật cho frontend
5. **Maintenance**: Chuẩn bị kế hoạch cập nhật và bảo trì định kỳ

Hệ thống layout Admin với Ant-Design này sẽ cung cấp nền tảng vững chắc cho việc quản lý sự kiện với giao diện chuyên nghiệp, hiệu quả và dễ sử dụng, đồng thời đáp ứng được các yêu cầu đặc thù từ hệ thống quản lý sự kiện của Lawrence S.Ting School.
