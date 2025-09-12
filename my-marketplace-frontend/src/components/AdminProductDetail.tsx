// Example usage in admin dashboard

import React from 'react';
import AdminSourceCodeManager from '../shared/components/AdminSourceCodeManager';

interface AdminProductDetailProps {
  productId: string;
}

const AdminProductDetail: React.FC<AdminProductDetailProps> = ({ productId }) => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Product Management</h1>
      
      {/* Other product management sections... */}
      
      {/* Source Code Management Section */}
      <AdminSourceCodeManager 
        productId={productId}
        onUpdate={() => {
          // Optional: refresh product data or show notification
          console.log('Source code updated!');
        }}
      />
      
      {/* Other sections... */}
    </div>
  );
};

export default AdminProductDetail;
