import React, { useState, useEffect, useCallback } from 'react';
import { Upload, File, Trash2, AlertCircle, CheckCircle, Package } from 'lucide-react';

interface SourceCodeInfo {
  fileName: string;
  originalName: string;
  fileSize: number;
  uploadDate: string;
  description: string;
  version: string;
}

interface Product {
  _id: string;
  title: string;
  hasSourceCode: boolean;
  sourceCode?: SourceCodeInfo;
}

interface AdminSourceCodeManagerProps {
  productId: string;
  onUpdate?: () => void;
}

const AdminSourceCodeManager: React.FC<AdminSourceCodeManagerProps> = ({ 
  productId, 
  onUpdate 
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Form data
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [version, setVersion] = useState('1.0');

  const fetchProductSourceCode = useCallback(async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/products/${productId}/source-code`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setProduct(data.data.product);
        
        if (data.data.sourceCode) {
          setDescription(data.data.sourceCode.description || '');
          setVersion(data.data.sourceCode.version || '1.0');
        }
      } else {
        setError('Failed to fetch product information');
      }
    } catch (error) {
      console.error('Error fetching product source code:', error);
      setError('Error loading product information');
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchProductSourceCode();
  }, [fetchProductSourceCode]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    
    if (file) {
      // Validate file type
      if (!file.name.toLowerCase().endsWith('.zip')) {
        setError('Please select a ZIP file');
        return;
      }
      
      // Validate file size (50MB limit)
      if (file.size > 50 * 1024 * 1024) {
        setError('File size must be less than 50MB');
        return;
      }
      
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file to upload');
      return;
    }

    try {
      setIsUploading(true);
      setError('');
      setSuccess('');
      
      const formData = new FormData();
      formData.append('sourceCode', selectedFile);
      formData.append('description', description);
      formData.append('version', version);

      const token = localStorage.getItem('token');
      const url = product?.hasSourceCode 
        ? `${import.meta.env.VITE_API_BASE_URL}/admin/products/${productId}/source-code`
        : `${import.meta.env.VITE_API_BASE_URL}/admin/products/${productId}/source-code`;
      
      const method = product?.hasSourceCode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setProduct(data.data.product);
        setSelectedFile(null);
        setSuccess('Source code uploaded successfully!');
        
        // Reset file input
        const fileInput = document.getElementById('sourceCodeFile') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
        
        if (onUpdate) onUpdate();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload source code');
      }
    } catch (error) {
      console.error('Error uploading source code:', error);
      setError('Error uploading file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete the source code? This action cannot be undone.')) {
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/admin/products/${productId}/source-code`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        await fetchProductSourceCode();
        setSuccess('Source code deleted successfully');
        if (onUpdate) onUpdate();
      } else {
        setError('Failed to delete source code');
      }
    } catch (error) {
      console.error('Error deleting source code:', error);
      setError('Error deleting source code');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Package className="w-5 h-5 mr-2" />
          Source Code Management
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Upload and manage source code files for: <strong>{product?.title}</strong>
        </p>
      </div>

      <div className="p-6">
        {/* Alert Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Current Source Code Status */}
        {product?.hasSourceCode && product.sourceCode ? (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2 flex items-center">
              <File className="w-4 h-4 mr-2" />
              Current Source Code
            </h4>
            <div className="space-y-2 text-sm">
              <div><strong>File:</strong> {product.sourceCode.originalName}</div>
              <div><strong>Size:</strong> {formatFileSize(product.sourceCode.fileSize)}</div>
              <div><strong>Version:</strong> {product.sourceCode.version}</div>
              <div><strong>Upload Date:</strong> {new Date(product.sourceCode.uploadDate).toLocaleDateString()}</div>
              {product.sourceCode.description && (
                <div><strong>Description:</strong> {product.sourceCode.description}</div>
              )}
            </div>
            <button
              onClick={handleDelete}
              className="mt-3 inline-flex items-center px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </button>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <p className="text-gray-600 text-center">
              No source code uploaded yet. Upload a ZIP file to automatically send to customers after purchase.
            </p>
          </div>
        )}

        {/* Upload Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Source Code File (ZIP)
            </label>
            <div className="relative">
              <input
                id="sourceCodeFile"
                type="file"
                accept=".zip"
                onChange={handleFileSelect}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {selectedFile && (
              <p className="mt-1 text-sm text-gray-600">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Version
            </label>
            <input
              type="text"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g., 1.0, 2.1, etc."
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the source code, features, or installation notes..."
              rows={3}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                {product?.hasSourceCode ? 'Update Source Code' : 'Upload Source Code'}
              </>
            )}
          </button>
        </div>

        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> The uploaded source code will be automatically sent to customers via email after successful payment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSourceCodeManager;
