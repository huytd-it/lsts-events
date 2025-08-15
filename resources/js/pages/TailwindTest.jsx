import React from 'react';
import { Link } from 'react-router-dom';

export default function TailwindTest() {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tailwind CSS Test</h1>
          <p className="text-gray-600">Kiểm tra các class Tailwind CSS đã được cấu hình đúng</p>
        </div>
        
        {/* Colors Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Màu sắc</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-primary text-secondary p-3 rounded text-center">Primary Color</div>
            <div className="bg-secondary text-white p-3 rounded text-center">Secondary Color</div>
          </div>
        </div>
        
        {/* Typography Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Typography</h2>
          <div className="space-y-2">
            <p className="text-xs">Text size xs</p>
            <p className="text-sm">Text size sm</p>
            <p className="text-base">Text size base</p>
            <p className="text-lg">Text size lg</p>
            <p className="text-xl">Text size xl</p>
            <p className="text-2xl">Text size 2xl</p>
          </div>
        </div>
        
        {/* Buttons Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Buttons</h2>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-primary text-secondary rounded">Primary Button</button>
            <button className="px-4 py-2 bg-secondary text-white rounded">Secondary Button</button>
          </div>
        </div>
        
        {/* Cards Test */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Cards</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Card Example</h3>
                <p className="text-gray-600">This is a sample card.</p>
              </div>
            </div>
            <div className="bg-primary rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg font-medium text-secondary mb-2">Card with Primary Background</h3>
                <p className="text-secondary">This card uses primary color as background.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link to="/" className="px-4 py-2 bg-secondary text-white rounded">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}