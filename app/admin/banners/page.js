'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function BannerAdmin() {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    buttonText: '',
    link: '',
    alt: '',
    icon: 'fas fa-hands-helping',
    gradientLight: 'from-blue-800 to-blue-600',
    buttonColorLight: 'text-blue-700',
    gradientDark: 'from-blue-900 to-blue-700',
    buttonColorDark: 'text-blue-300',
    order: 0,
    isActive: true,
  });

  // Icon options
  const iconOptions = [
    { value: 'fas fa-hands-helping', label: 'Hands Helping' },
    { value: 'fas fa-heartbeat', label: 'Heartbeat' },
    { value: 'fas fa-graduation-cap', label: 'Graduation' },
    { value: 'fas fa-utensils', label: 'Food' },
    { value: 'fas fa-home', label: 'Home' },
    { value: 'fas fa-hospital', label: 'Hospital' },
    { value: 'fas fa-book', label: 'Book' },
    { value: 'fas fa-users', label: 'Users' },
  ];

  // Gradient options
  const gradientOptions = [
    { value: 'from-blue-800 to-blue-600', label: 'Blue' },
    { value: 'from-emerald-800 to-emerald-600', label: 'Emerald' },
    { value: 'from-purple-800 to-purple-600', label: 'Purple' },
    { value: 'from-red-800 to-red-600', label: 'Red' },
    { value: 'from-amber-800 to-amber-600', label: 'Amber' },
    { value: 'from-indigo-800 to-indigo-600', label: 'Indigo' },
  ];

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/banners');
      const data = await response.json();
      if (data.success) {
        setBanners(data.data);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
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

    const form = new FormData();
    const fileInput = document.getElementById('bannerImage');
    
    if (fileInput?.files?.[0]) {
      form.append('image', fileInput.files[0]);
    }
    
    // Append all form data
    Object.keys(formData).forEach(key => {
      form.append(key, formData[key].toString());
    });

    if (editingBanner) {
      form.append('id', editingBanner._id);
    }

    try {
      const response = await fetch('/api/banners', {
        method: editingBanner ? 'PUT' : 'POST',
        body: form,
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchBanners();
        resetForm();
        alert(editingBanner ? 'Banner updated successfully!' : 'Banner created successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Failed to save banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this banner?')) return;

    try {
      const response = await fetch(`/api/banners?id=${id}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchBanners();
        alert('Banner deleted successfully!');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting banner:', error);
      alert('Failed to delete banner');
    }
  };

  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      title: banner.title,
      description: banner.description,
      buttonText: banner.buttonText,
      link: banner.link,
      alt: banner.alt,
      icon: banner.icon,
      gradientLight: banner.gradientLight,
      buttonColorLight: banner.buttonColorLight,
      gradientDark: banner.gradientDark,
      buttonColorDark: banner.buttonColorDark,
      order: banner.order,
      isActive: banner.isActive,
    });
    setPreviewImage(banner.image);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      buttonText: '',
      link: '',
      alt: '',
      icon: 'fas fa-hands-helping',
      gradientLight: 'from-blue-800 to-blue-600',
      buttonColorLight: 'text-blue-700',
      gradientDark: 'from-blue-900 to-blue-700',
      buttonColorDark: 'text-blue-300',
      order: 0,
      isActive: true,
    });
    setPreviewImage(null);
    setEditingBanner(null);
    setShowForm(false);
    const fileInput = document.getElementById('bannerImage');
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banner Management
          </h1>
          <div className="space-x-4">
            <Link
              href="/"
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              View Site
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showForm ? 'Cancel' : 'Create New Banner'}
            </button>
          </div>
        </div>

        {/* Banner Form */}
        {showForm && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              {editingBanner ? 'Edit Banner' : 'Create New Banner'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Banner Image
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    id="bannerImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required={!editingBanner}
                  />
                  {previewImage && (
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={previewImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.buttonText}
                    onChange={(e) => setFormData({...formData, buttonText: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Link
                  </label>
                  <input
                    type="text"
                    value={formData.link}
                    onChange={(e) => setFormData({...formData, link: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.alt}
                    onChange={(e) => setFormData({...formData, alt: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Icon
                  </label>
                  <select
                    value={formData.icon}
                    onChange={(e) => setFormData({...formData, icon: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {iconOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Light Gradient
                  </label>
                  <select
                    value={formData.gradientLight}
                    onChange={(e) => setFormData({...formData, gradientLight: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {gradientOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Light Button Color
                  </label>
                  <input
                    type="text"
                    value={formData.buttonColorLight}
                    onChange={(e) => setFormData({...formData, buttonColorLight: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="text-blue-700"
                  />
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Dark Gradient
                  </label>
                  <select
                    value={formData.gradientDark}
                    onChange={(e) => setFormData({...formData, gradientDark: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  >
                    {gradientOptions.map(option => (
                      <option key={option.value} value={option.value.replace('800', '900').replace('600', '700')}>
                        {option.label} Dark
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300">
                    Dark Button Color
                  </label>
                  <input
                    type="text"
                    value={formData.buttonColorDark}
                    onChange={(e) => setFormData({...formData, buttonColorDark: e.target.value})}
                    className="w-full p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="text-blue-300"
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
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      Active
                    </span>
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
                  {isLoading ? 'Saving...' : editingBanner ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Banners List */}
        <div className="grid grid-cols-1 gap-6">
          {banners.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
              <p className="text-gray-500 dark:text-gray-400">
                No banners found. Create your first banner!
              </p>
            </div>
          ) : (
            banners.map((banner) => (
              <div
                key={banner._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Banner Preview */}
                  <div className="md:w-64 h-48 relative bg-gray-100 dark:bg-gray-700">
                    <Image
                      src={banner.image}
                      alt={banner.alt}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Banner Details */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                          {banner.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                          {banner.description}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(banner)}
                          className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(banner._id)}
                          className="p-2 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                        <i className={`${banner.icon} mr-1`}></i>
                        {banner.icon}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-sm">
                        Order: {banner.order}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        banner.isActive 
                          ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300'
                          : 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300'
                      }`}>
                        {banner.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                      Created: {new Date(banner.createdAt).toLocaleDateString()}
                      {banner.updatedAt !== banner.createdAt && 
                        ` • Updated: ${new Date(banner.updatedAt).toLocaleDateString()}`}
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