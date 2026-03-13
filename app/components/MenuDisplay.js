'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const MenuDisplay = ({ location = 'header', className = '' }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState({});

  useEffect(() => {
    fetchMenu();
  }, [location]);

  const fetchMenu = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/public/menu?location=${location}`);
      if (!response.ok) {
        throw new Error('Failed to fetch menu');
      }
      const data = await response.json();
      setMenuItems(data);
    } catch (error) {
      console.error('Error fetching menu:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems[item.id];

    return (
      <div key={item.id} className="relative">
        <div className={`flex items-center ${level > 0 ? 'ml-4' : ''}`}>
          {hasChildren ? (
            <button
              onClick={() => toggleExpand(item.id)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs`}></i>
            </button>
          ) : (
            <span className="w-8"></span>
          )}
          
          {item.link ? (
            <Link
              href={item.link}
              target={item.target || '_self'}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                level === 0 ? 'font-medium' : 'text-sm'
              }`}
            >
              {item.icon && <i className={`fas ${item.icon} text-gray-500`}></i>}
              <span>{item.label}</span>
            </Link>
          ) : (
            <span className={`flex items-center gap-2 px-3 py-2 ${
              level === 0 ? 'font-medium' : 'text-sm'
            }`}>
              {item.icon && <i className={`fas ${item.icon} text-gray-500`}></i>}
              {item.label}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
            {item.children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-500">
        <i className="fas fa-spinner fa-spin"></i>
        <span>Loading menu...</span>
      </div>
    );
  }

  return (
    <nav className={className}>
      {menuItems.map(item => renderMenuItem(item))}
    </nav>
  );
};

export default MenuDisplay;