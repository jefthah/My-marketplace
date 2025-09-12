import React, { useState } from 'react';
import { Upload, Package, Image, Video } from 'lucide-react';

interface AddProductFormProps {
  onSubmit: (formData: FormData) => void;
  isLoading?: boolean;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    benefit1: '',
    benefit2: '',
    benefit3: '',
    videoUrl: '',
    googleDriveUrl: '', // Replace file upload with Google Drive URL
    sourceCodeDescription: '',
    sourceCodeVersion: '1.0'
  });

  const [selectedImages, setSelectedImages] = useState<File[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 2) {
      alert('Maximum 2 images allowed');
      return;
    }
    setSelectedImages(files);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = new FormData();
    
    // Add text fields (exclude googleDriveUrl to handle separately)
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== 'googleDriveUrl') {
        submitData.append(key, value);
      }
    });

    // Add images
    selectedImages.forEach(image => {
      submitData.append('images', image);
    });

    // Add source code Google Drive URL
    if (formData.googleDriveUrl && formData.googleDriveUrl.trim()) {
      submitData.append('googleDriveUrl', formData.googleDriveUrl.trim());
    }

    onSubmit(submitData);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Product</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Modern Portfolio Website"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price (IDR)*
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., 150000"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category*
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            <option value="website">Website Template</option>
            <option value="logo">Logo Design</option>
            <option value="branding">Branding Package</option>
            <option value="ui-kit">UI Kit</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description*
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of your product..."
          />
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefit 1*
            </label>
            <input
              type="text"
              name="benefit1"
              value={formData.benefit1}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Responsive Design"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefit 2*
            </label>
            <input
              type="text"
              name="benefit2"
              value={formData.benefit2}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Easy to Customize"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Benefit 3*
            </label>
            <input
              type="text"
              name="benefit3"
              value={formData.benefit3}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., SEO Friendly"
            />
          </div>
        </div>

        {/* Media Uploads */}
        <div className="space-y-6 border-t pt-6">
          <h3 className="text-lg font-semibold text-gray-800">Media & Files</h3>
          
          {/* Product Images */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center">
              <Image className="w-4 h-4 mr-2" />
              Product Images* (Max 2 images)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {selectedImages.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                Selected: {selectedImages.map(f => f.name).join(', ')}
              </div>
            )}
          </div>

          {/* Video URL */}
          <div>
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center">
              <Video className="w-4 h-4 mr-2" />
              Video URL (Optional)
            </label>
            <input
              type="url"
              name="videoUrl"
              value={formData.videoUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://www.youtube.com/watch?v=..."
            />
          </div>

          {/* Source Code Google Drive Link */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <label className="flex text-sm font-medium text-gray-700 mb-2 items-center">
              <Package className="w-4 h-4 mr-2" />
              Source Code Google Drive Link
            </label>
            <input
              type="url"
              name="googleDriveUrl"
              value={formData.googleDriveUrl}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="https://drive.google.com/file/d/1abc.../view?usp=sharing"
            />
            <div className="mt-2 text-xs text-gray-600">
              💡 Tip: Make sure the Google Drive file is set to "Anyone with the link can view/download"
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Version
                </label>
                <input
                  type="text"
                  name="sourceCodeVersion"
                  value={formData.sourceCodeVersion}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="1.0"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  name="sourceCodeDescription"
                  value={formData.sourceCodeDescription}
                  onChange={handleInputChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Complete source code with docs"
                />
              </div>
            </div>
            
            <div className="mt-2 text-xs text-blue-700">
              💡 This ZIP file will be automatically sent to customers after successful payment
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 border-t pt-6">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Create Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProductForm;
