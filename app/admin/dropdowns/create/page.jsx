// app/admin/dropdowns/create/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateDropdownMenu() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    id: '',
    label: '',
    items: []
  });
  const [newItem, setNewItem] = useState({
    id: '',
    label: '',
    order: 1
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/dropdowns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          items: formData.items.map((item, index) => ({
            ...item,
            order: index + 1,
            id: item.id || `${formData.id}-${Date.now()}-${index}`
          }))
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/admin/dropdowns');
      } else {
        setError(data.error || 'Failed to create menu');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const addItem = () => {
    if (!newItem.label) {
      alert('Please enter item label');
      return;
    }

    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          ...newItem,
          id: `${formData.id}-${Date.now()}-${formData.items.length}`
        }
      ]
    });

    setNewItem({
      id: '',
      label: '',
      order: formData.items.length + 2
    });
  };

  const removeItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      items: updatedItems.map((item, i) => ({ ...item, order: i + 1 }))
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 flex items-center">
        <Link
          href="/admin/dropdowns"
          className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        >
          <i className="fas fa-arrow-left text-gray-600 dark:text-gray-400"></i>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          Create Dropdown Menu
        </h1>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Basic Information
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Menu ID *
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="e.g., about, focus, services"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Unique identifier for the menu (use lowercase, no spaces)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Menu Label *
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="e.g., ABOUT, OUR FOCUS AREAS"
                required
              />
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
            Menu Items
          </h2>

          {/* Existing Items */}
          {formData.items.length > 0 && (
            <div className="mb-4 space-y-2">
              {formData.items.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400 w-6">
                      {item.order}.
                    </span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {item.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="text-red-600 hover:text-red-700 p-1"
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add New Item */}
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add New Item
              </label>
              <input
                type="text"
                value={newItem.label}
                onChange={(e) => setNewItem({ ...newItem, label: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
                placeholder="Enter item label"
              />
            </div>
            <button
              type="button"
              onClick={addItem}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
            >
              <i className="fas fa-plus mr-2"></i>
              Add
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <Link
            href="/admin/dropdowns"
            className="px-4 py-2 border dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || formData.items.length === 0}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Creating...
              </>
            ) : (
              'Create Menu'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}