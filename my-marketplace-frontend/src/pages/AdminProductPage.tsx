import React, { useState } from 'react';
import AddProductForm from '../components/AddProductForm';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { LogOut, User, Shield } from 'lucide-react';

const AdminProductPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { adminUser, logout } = useAdminAuth();

  const handleCreateProduct = async (formData: FormData) => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create product');
      }

      const result = await response.json();
      
      console.log('Product created successfully!', result);
      alert('Product created successfully!');
      
      // Optional: redirect or reset form
      // window.location.reload(); // Simple approach
      
    } catch (error) {
      console.error('Error creating product:', error);
      alert(error instanceof Error ? error.message : 'Failed to create product');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Admin Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Product Management System</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-gray-700">
                <User className="w-5 h-5 mr-2" />
                <span className="font-medium">{adminUser?.name || adminUser?.email}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Product Creation Form */}
        <AddProductForm 
          onSubmit={handleCreateProduct}
          isLoading={isLoading}
        />

        {/* Instructions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Instructions</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-0.5">1</span>
              <p>Fill in all required product information including title, price, and benefits</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-0.5">2</span>
              <p>Upload maximum 2 product preview images (JPG, PNG)</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-0.5">3</span>
              <p>Upload source code as ZIP file (max 50MB) - this will be automatically sent to customers after payment</p>
            </div>
            <div className="flex items-start">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-0.5">4</span>
              <p>Add optional video URL to showcase your product</p>
            </div>
            <div className="flex items-start">
              <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium mr-3 mt-0.5">✓</span>
              <p>Once created, the product will be available for purchase with automatic source code delivery</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProductPage;
