'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SlideAdmin() {
  const [slides, setSlides] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({
    alt: '',
    title: '',
    description: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const response = await fetch('/api/slides');
      const data = await response.json();
      if (data.success) {
        setSlides(data.data);
      }
    } catch (error) {
      console.error('Error fetching slides:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File too large. Max size: 10MB');
        e.target.value = '';
        return;
      }

      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Allowed: JPEG, PNG, WEBP, GIF');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setUploadProgress(0);

    const form = new FormData();
    const fileInput = document.getElementById('slideImage');
    
    if (fileInput?.files?.[0]) {
      form.append('image', fileInput.files[0]);
    } else if (!editingSlide) {
      alert('Please select an image');
      setIsLoading(false);
      return;
    }
    
    form.append('alt', formData.alt);
    form.append('title', formData.title);
    form.append('description', formData.description);
    form.append('order', formData.order);
    form.append('isActive', formData.isActive);

    if (editingSlide) {
      form.append('id', editingSlide._id);
    }

    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    try {
      const response = await fetch('/api/slides', {
        method: editingSlide ? 'PUT' : 'POST',
        body: form,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await response.json();
      
      if (data.success) {
        await fetchSlides();
        resetForm();
        alert(editingSlide ? 'Slide updated successfully!' : 'Slide created successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      alert('Failed to save slide');
    } finally {
      setIsLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      const response = await fetch(`/api/slides?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchSlides();
        alert('Slide deleted successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting slide:', error);
      alert('Failed to delete slide');
    }
  };

  const handleEdit = (slide) => {
    setEditingSlide(slide);
    setFormData({
      alt: slide.alt,
      title: slide.title || '',
      description: slide.description || '',
      order: slide.order,
      isActive: slide.isActive,
    });
    setPreviewImage(slide.image);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      alt: '',
      title: '',
      description: '',
      order: 0,
      isActive: true,
    });
    setPreviewImage(null);
    setEditingSlide(null);
    setShowForm(false);
    const fileInput = document.getElementById('slideImage');
    if (fileInput) fileInput.value = '';
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Slide Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showForm ? 'Cancel' : 'Create New Slide'}
          </button>
        </div>

        {/* Slide Form */}
        {showForm && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingSlide ? 'Edit Slide' : 'Create New Slide'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Slide Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-start space-x-4">
                  <div className="flex-1">
                    <input
                      id="slideImage"
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                      onChange={handleImageChange}
                      className="w-full p-2 border rounded-lg"
                      required={!editingSlide}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Max size: 10MB. Allowed: JPEG, PNG, WEBP, GIF
                    </p>
                    <p className="text-sm text-gray-500">
                      Images will be automatically resized to 1920x1080 and optimized
                    </p>
                  </div>
                  {previewImage && (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden flex-shrink-0 border">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Upload Progress */}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              )}

              {/* Form Fields */}
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Alt Text <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.alt}
                  onChange={(e) => setFormData({...formData, alt: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Describe the image for accessibility"
                  required
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Slide title"
                />
              </div>

              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Slide description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value) || 0})}
                    className="w-full p-2 border rounded-lg"
                    min="0"
                  />
                </div>

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <span className="font-medium text-gray-700">Active</span>
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Uploading...' : editingSlide ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Slides Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl">
              <p className="text-gray-500">No slides found. Create your first slide!</p>
            </div>
          ) : (
            slides.map((slide) => (
              <div
                key={slide._id}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="relative h-48 bg-gray-100">
                  <Image
                    src={slide.image}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {!slide.isActive && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs">
                      Inactive
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {slide.title || 'Untitled'}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                    {slide.alt}
                  </p>
                  
                  {/* Image Info */}
                  {slide.imageInfo && (
                    <div className="text-xs text-gray-500 mb-3 space-y-1 bg-gray-50 p-2 rounded">
                      <p>Size: {formatFileSize(slide.imageInfo.size)}</p>
                      {slide.imageInfo.originalSize && (
                        <p>Original: {formatFileSize(slide.imageInfo.originalSize)}</p>
                      )}
                      {slide.imageInfo.dimensions && (
                        <p>
                          Dimensions: {slide.imageInfo.dimensions.width} x {slide.imageInfo.dimensions.height}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-gray-500">
                      Order: {slide.order}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(slide)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(slide._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}