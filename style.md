# Cấu hình Tailwind CSS cho Dự án LSTS Events

Dựa trên file CSS được cung cấp, đây là cấu hình Tailwind CSS tối ưu cho dự án Laravel + React + Vite:

## 1. tailwind.config.js

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./resources/**/*.blade.php",
    "./resources/**/*.js",
    "./resources/**/*.vue",
    "./src/**/*.{html,js}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      // ===== COLORS =====
      colors: {
        primary: {
          50: '#f0fdff',
          100: '#e0f7ff',
          200: '#c1f0ff',
          300: '#a3e9ff',
          400: '#84e1ff',
          500: '#66d9ff',
          600: '#47d1ff',
          700: '#29c9ff',
          800: '#0ac1ff',
          900: '#00b8f2',
          DEFAULT: '#9eefe1'
        },
        secondary: '#1b4664',
        accent: '#FF00E1',
        violet: '#2A004F',
        gray: {
          50: '#f8f9fa',
          100: '#f1f3f4',
          200: '#e8eaed',
          300: '#dadce0',
          400: '#bdc1c6',
          500: '#9aa0a6',
          600: '#80868b',
          700: '#5f6368',
          800: '#3c4043',
          900: '#202124',
        }
      },
      
      // ===== SPACING =====
      spacing: {
        '1': '0.25rem',
        '2': '0.5rem',
        '3': '0.75rem',
        '4': '1rem',
        '6': '1.5rem',
        '8': '2rem',
        '12': '3rem',
      },
      
      // ===== BORDER RADIUS =====
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
        'xl': '1rem',
        'full': '9999px',
      },
      
      // ===== TYPOGRAPHY =====
      fontFamily: {
        primary: ['Quicksand', 'sans-serif'],
        display: ['Rowdies', 'cursive'],
      },
      
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1' }],
        'sm': ['0.875rem', { lineHeight: '1.25' }],
        'base': ['1rem', { lineHeight: '1.5' }],
        'lg': ['1.125rem', { lineHeight: '1.75' }],
        'xl': ['1.25rem', { lineHeight: '1.75' }],
        '2xl': ['1.5rem', { lineHeight: '2' }],
        '3xl': ['1.875rem', { lineHeight: '2.25' }],
        '4xl': ['2.25rem', { lineHeight: '2.5' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      
      lineHeight: {
        'none': '1',
        'tight': '1.25',
        'snug': '1.375',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },
      
      // ===== SHADOWS =====
      boxShadow: {
        'sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      },
      
      // ===== TRANSITIONS =====
      transitionProperty: {
        'DEFAULT': 'background-color, border-color, color, fill, stroke, opacity, box-shadow, transform',
      },
      
      transitionDuration: {
        'fast': '150ms',
        'base': '200ms',
        'slow': '300ms',
      },
      
      transitionTimingFunction: {
        'DEFAULT': 'ease-in-out',
      },
      
      // ===== Z-INDEX =====
      zIndex: {
        'dropdown': '100',
        'sticky': '200',
        'overlay': '300',
        'modal': '400',
        'max': '9999',
      },
      
      // ===== BACKGROUNDS =====
      backgroundImage: {
        'gradient-main': 'linear-gradient(135deg, rgba(158, 239, 225, 0.8) 0%, rgba(255, 255, 255, 0.9) 100%)',
        'castle-glow': 'radial-gradient(circle, rgba(158, 239, 225, 0.2) 0%, transparent 70%)',
      },
      
      // ===== KEYFRAMES =====
      keyframes: {
        'skeleton-loading': {
          '0%': { 'background-position': '200% 0' },
          '100%': { 'background-position': '-200% 0' }
        },
        'spin': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        },
        'slide-down': {
          'from': { transform: 'translateY(-100%)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' }
        },
        'fade-in-up': {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' }
        },
        'gradient-flow': {
          '0%': { 'background-position': '200% 50%' },
          '100%': { 'background-position': '0% 50%' }
        }
      },
      
      // ===== ANIMATION =====
      animation: {
        'skeleton-loading': 'skeleton-loading 1.5s infinite',
        'spin': 'spin 1s linear infinite',
        'slide-down': 'slide-down 0.3s ease',
        'fade-in-up': 'fade-in-up 0.3s ease-out',
        'gradient-flow': 'gradient-flow 5s ease infinite'
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar')({ nocompatible: true }),
  ],
}
```

## 2. postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  }
}
```

## 3. Cài đặt Tailwind CSS qua npm

```bash
npm install -D tailwindcss postcss autoprefixer @tailwindcss/forms @tailwindcss/typography tailwind-scrollbar
npx tailwindcss init -p
```

## 4. resources/css/app.css

```css
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';

/* Custom styles that extend Tailwind */
@layer components {
  .btn {
    @apply inline-flex items-center justify-center gap-2 px-3 py-2 font-medium rounded-full transition-fast;
  }
  
  .btn-primary {
    @apply bg-primary-500 text-secondary border border-transparent;
  }
  
  .btn-primary:hover {
    @apply bg-primary-400;
  }
  
  .card {
    @apply bg-white rounded-xl shadow-md overflow-hidden;
  }
  
  .slide-image-container {
    @apply relative overflow-hidden cursor-pointer transition-fast;
  }
  
  .slide-image-container:hover {
    @apply -translate-y-1 shadow-lg;
  }
  
  .slide-image {
    @apply h-full w-full object-cover rounded-lg transition-fast;
  }
  
  .slide-image-container:hover .slide-image {
    @apply scale-105;
  }
  
  .event-thumbnail {
    @apply transition-opacity transition-transform;
  }
  
  .event-thumbnail.loading {
    @apply opacity-0 scale-95;
  }
  
  .event-thumbnail.fade-in-loaded {
    @apply opacity-100 scale-100 animate-fade-in-up;
  }
  
  .skeleton {
    @apply bg-gray-200 rounded animate-skeleton-loading;
  }
  
  .timeline-line {
    @apply h-1.5 rounded bg-gradient-to-r from-secondary via-primary to-accent to-secondary animate-gradient-flow;
  }
  
  .nav-btn {
    @apply bg-white text-secondary border-2 border-primary rounded-full cursor-pointer font-semibold transition-fast flex items-center gap-2.5 shadow-sm;
  }
  
  .nav-btn:hover:not(:disabled) {
    @apply bg-primary text-secondary transform -translate-y-1 shadow-lg border-secondary;
  }
  
  .nav-btn:disabled {
    @apply opacity-40 cursor-not-allowed transform-none;
  }
  
  .back-btn {
    @apply bg-primary text-secondary border-secondary font-bold;
  }
  
  .back-btn:hover {
    @apply bg-white text-secondary border-primary;
  }
}
```

## 5. Cấu hình Vite để sử dụng Tailwind CSS

Đảm bảo `vite.config.js` đã được cấu hình đúng:

```javascript
import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/css/app.css',
                'resources/js/app.jsx',
            ],
            refresh: true,
        }),
        react(),
    ],
});
```

## 6. Triển khai Tailwind trong ứng dụng React

Tạo một component layout cơ bản sử dụng các class Tailwind:

```jsx
// resources/js/components/layout/Layout.jsx
import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="font-primary text-gray-800 min-h-screen bg-gradient-main bg-cover bg-fixed">
      <div className="relative">
        {/* Logo */}
        <div className="logo-main absolute top-0 left-4 z-max animate-logo-float">
          <img src="/assets/images/logo.png" alt="LSTS Events" />
        </div>
        
        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="py-12 text-center text-gray-600">
          <p>© {new Date().getFullYear()} LSTS Events Management System</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;
```

## 7. Triển khai component sử dụng Tailwind

```jsx
// resources/js/components/category/CategoryTree.jsx
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/services/categoryService';

export default function CategoryTree() {
  const { data: categories, isLoading } = useQuery({
    queryKey: ['public-categories'],
    queryFn: api.getPublicCategories
  });

  if (isLoading) return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 bg-gray-200 rounded animate-skeleton-loading" />
      ))}
    </div>
  );

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="space-y-2">
        {categories?.map(category => (
          <CategoryNode 
            key={category.id} 
            category={category} 
            depth={0} 
          />
        ))}
      </div>
    </DndProvider>
  );
}

function CategoryNode({ category, depth }) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  return (
    <div className="group">
      <div className="flex items-center gap-2 py-1">
        <div className="pl-4" style={{ paddingLeft: `${depth * 1.5}rem` }}>
          {category.children?.length > 0 && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-400 hover:text-gray-600"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{category.name}</span>
            <span className="text-xs bg-primary-100 text-primary-800 px-2 py-0.5 rounded">
              {category.events_count} events
            </span>
          </div>
        </div>
      </div>
      
      {isExpanded && category.children?.length > 0 && (
        <div className="ml-4 border-l-2 border-gray-200 pl-4">
          {category.children.map(child => (
            <CategoryNode 
              key={child.id} 
              category={child} 
              depth={depth + 1} 
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

## 8. Triển khai hiệu ứng skeleton loading

```jsx
// resources/js/components/ui/Skeleton.jsx
import React from 'react';

const Skeleton = ({ className = '', ...props }) => {
  return (
    <div 
      className={`skeleton bg-gray-200 rounded ${className}`} 
      {...props}
    />
  );
};

// Sử dụng trong component
const EventCardSkeleton = () => {
  return (
    <div className="card overflow-hidden">
      <div className="relative">
        <Skeleton className="w-full h-48" />
        <div className="absolute top-2 right-2 z-10">
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>
      <div className="p-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-1/2 mb-4" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
};
```

## 9. Cấu hình theme cho dark mode (tùy chọn)

Nếu muốn hỗ trợ dark mode, thêm vào `tailwind.config.js`:

```javascript
module.exports = {
  darkMode: 'class',
  // ... các cấu hình khác
  theme: {
    extend: {
      // ... các cấu hình khác
      colors: {
        // ... các màu khác
        dark: {
          50: '#202124',
          100: '#2d2d2d',
          200: '#3a3a3a',
          300: '#4a4a4a',
          800: '#e0e0e0',
          900: '#f0f0f0',
        }
      }
    }
  }
}
```

Và thêm vào CSS:

```css
@media (prefers-color-scheme: dark) {
  .dark {
    @apply bg-dark-50 text-dark-900;
  }
  
  .dark .skeleton {
    @apply bg-dark-200;
  }
  
  .dark .event-card {
    @apply bg-dark-100;
  }
}
```

## 10. Cấu hình cho hiệu ứng hoạt hình

Để sử dụng các hiệu ứng hoạt hình đã định nghĩa trong keyframes:

```jsx
// resources/js/components/ui/SlideShow.jsx
import React, { useState, useEffect } from 'react';

const SlideShow = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        prevIndex === slides.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);
    
    return () => clearInterval(timer);
  }, [slides.length]);
  
  return (
    <div className="relative h-96 overflow-hidden rounded-xl">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentIndex ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <img 
            src={slide.image} 
            alt={slide.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <div className="absolute bottom-8 left-8 text-white max-w-xl">
            <h2 className="text-3xl font-display mb-2">{slide.title}</h2>
            <p className="text-lg">{slide.description}</p>
          </div>
        </div>
      ))}
      
      <div className="slide-indicators absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-white w-4 h-4 transform scale-120' 
                : 'bg-white/50'
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
};
```

Cấu hình Tailwind này sẽ giúp bạn tận dụng tối đa các style có sẵn trong dự án, đồng thời giữ cho code sạch sẽ, dễ bảo trì và mở rộng. Các class Tailwind được cấu hình dựa trên các biến CSS từ hệ thống hiện tại, đảm bảo tính nhất quán về thiết kế.
