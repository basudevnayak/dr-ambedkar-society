'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const MenuManagement = () => {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedMenus, setExpandedMenus] = useState({});
  const [formData, setFormData] = useState({
    label: '',
    path: '',
    icon: '',
    menuType: 'single',
    parentId: null,
    order: 0,
    isActive: true,
    target: '_self',
    permissions: []
  });

  // Fetch menus from API
  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menus?parentId=null');
      const data = await response.json();
      
      if (data.success) {
        // Build hierarchical structure
        const menuTree = await buildMenuTree(data.data);
        setMenus(menuTree);
      }
    } catch (error) {
      console.error('Error fetching menus:', error);
    } finally {
      setLoading(false);
    }
  };

  const buildMenuTree = async (parentMenus) => {
    const tree = [];
    
    for (const menu of parentMenus) {
      if (menu.children && menu.children.length > 0) {
        const children = await fetchChildren(menu._id);
        tree.push({
          ...menu,
          children
        });
      } else {
        tree.push(menu);
      }
    }
    
    return tree.sort((a, b) => a.order - b.order);
  };

  const fetchChildren = async (parentId) => {
    try {
      const response = await fetch(`/api/menus?parentId=${parentId}`);
      const data = await response.json();
      
      if (data.success) {
        const children = [];
        for (const child of data.data) {
          const grandchildren = await fetchChildren(child._id);
          children.push({
            ...child,
            children: grandchildren
          });
        }
        return children.sort((a, b) => a.order - b.order);
      }
      return [];
    } catch (error) {
      console.error('Error fetching children:', error);
      return [];
    }
  };

  const toggleExpand = (id) => {
    setExpandedMenus(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddMenu = (parentId = null) => {
    setSelectedMenu(null);
    setFormData({
      label: '',
      path: '',
      icon: '',
      menuType: 'single',
      parentId: parentId,
      order: 0,
      isActive: true,
      target: '_self',
      permissions: []
    });
    setShowForm(true);
  };

  const handleEditMenu = (menu) => {
    setSelectedMenu(menu);
    setFormData({
      label: menu.label,
      path: menu.path || '',
      icon: menu.icon || '',
      menuType: menu.menuType || 'single',
      parentId: menu.parentId,
      order: menu.order || 0,
      isActive: menu.isActive,
      target: menu.target || '_self',
      permissions: menu.permissions || []
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = selectedMenu 
        ? `/api/menus/${selectedMenu._id}` 
        : '/api/menus';
      
      const method = selectedMenu ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setShowForm(false);
        fetchMenus(); // Refresh the menu tree
      }
    } catch (error) {
      console.error('Error saving menu:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this menu? All child menus will also be deleted.')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/menus/${id}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchMenus(); // Refresh the menu tree
      }
    } catch (error) {
      console.error('Error deleting menu:', error);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;
    
    // Reorder menus logic here
    // You can implement drag-and-drop reordering
  };

  const renderMenuItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item._id];
    
    return (
      <Draggable key={item._id} draggableId={item._id} index={item.order}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            className={`mb-2 ${snapshot.isDragging ? 'opacity-50' : ''}`}
          >
            <div 
              className={`flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow group`}
              style={{ marginLeft: `${level * 30}px` }}
            >
              <div {...provided.dragHandleProps} className="cursor-move text-gray-400 hover:text-gray-600">
                <i className="fas fa-grip-vertical"></i>
              </div>
              
              {hasChildren && (
                <button
                  onClick={() => toggleExpand(item._id)}
                  className="w-6 h-6 flex items-center justify-center text-gray-500 hover:text-gray-700"
                >
                  <i className={`fas fa-chevron-${isExpanded ? 'down' : 'right'} text-xs`}></i>
                </button>
              )}
              
              {!hasChildren && <div className="w-6"></div>}
              
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                {item.icon ? (
                  <i className={`fas fa-${item.icon} text-blue-600 dark:text-blue-400`}></i>
                ) : (
                  <i className={`fas fa-${
                    item.menuType === 'dropdown' ? 'caret-down' :
                    item.menuType === 'mega' ? 'th-large' :
                    'file'
                  } text-blue-600 dark:text-blue-400`}></i>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 dark:text-white">
                    {item.label}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    item.menuType === 'single' ? 'bg-green-100 text-green-700' :
                    item.menuType === 'dropdown' ? 'bg-purple-100 text-purple-700' :
                    'bg-orange-100 text-orange-700'
                  }`}>
                    {item.menuType}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    item.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {item.path && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Path: {item.path} | Target: {item.target}
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleAddMenu(item._id)}
                  className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded"
                  title="Add Child Menu"
                >
                  <i className="fas fa-plus-circle"></i>
                </button>
                <button
                  onClick={() => handleEditMenu(item)}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                  title="Edit Menu"
                >
                  <i className="fas fa-edit"></i>
                </button>
                <button
                  onClick={() => handleDelete(item._id)}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded"
                  title="Delete Menu"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
            
            {hasChildren && isExpanded && (
              <div className="mt-2">
                <Droppable droppableId={item._id} type="CHILD">
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                      {item.children.map((child) => renderMenuItem(child, level + 1))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Menu Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Create and manage single, dropdown, and mega menus with paths
        </p>
      </div>

      {/* Search and Add Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search menus..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <button
          onClick={() => handleAddMenu()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
        >
          <i className="fas fa-plus"></i>
          <span>Add Menu</span>
        </button>
      </div>

      {/* Menus List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading menus...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="root" type="MENU">
            {(provided) => (
              <div 
                ref={provided.innerRef} 
                {...provided.droppableProps}
                className="space-y-2"
              >
                {menus.length > 0 ? (
                  menus.map((menu) => renderMenuItem(menu))
                ) : (
                  <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                    <i className="fas fa-bars text-4xl text-gray-400 mb-3"></i>
                    <p className="text-gray-600 dark:text-gray-400">No menus created yet</p>
                    <button
                      onClick={() => handleAddMenu()}
                      className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg inline-flex items-center gap-2"
                    >
                      <i className="fas fa-plus"></i>
                      <span>Create First Menu</span>
                    </button>
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Menu Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedMenu ? 'Edit Menu' : 'Add New Menu'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Label *
                    </label>
                    <input
                      type="text"
                      value={formData.label}
                      onChange={(e) => setFormData({...formData, label: e.target.value})}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Products"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Path
                    </label>
                    <input
                      type="text"
                      value={formData.path}
                      onChange={(e) => setFormData({...formData, path: e.target.value})}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., /products"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon
                    </label>
                    <select
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">No Icon</option>
                      <option value="home">Home</option>
                      <option value="shopping-cart">Cart</option>
                      <option value="user">User</option>
                      <option value="cog">Settings</option>
                      <option value="chart-bar">Dashboard</option>
                      <option value="folder">Folder</option>
                      <option value="file">File</option>
                      <option value="envelope">Messages</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Menu Type
                    </label>
                    <select
                      value={formData.menuType}
                      onChange={(e) => setFormData({...formData, menuType: e.target.value})}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="single">Single Menu</option>
                      <option value="dropdown">Dropdown Menu</option>
                      <option value="mega">Mega Menu</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Target
                    </label>
                    <select
                      value={formData.target}
                      onChange={(e) => setFormData({...formData, target: e.target.value})}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                      <option value="_self">Same Window</option>
                      <option value="_blank">New Window</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({...formData, order: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      min="0"
                    />
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                        Active
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    {selectedMenu ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;