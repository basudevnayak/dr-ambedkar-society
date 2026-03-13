// components/PageBuilder.js
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from '../../styles/PageBuilder.module.css';

// Dynamically import CKEditor to avoid SSR issues
const EnhancedEditor = dynamic(() => import('./EnhancedEditor'), {
  ssr: false,
  loading: () => <div className={styles.editorLoading}>Loading editor...</div>
});

const PageBuilder = () => {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState({
    id: null,
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featuredImage: null,
    template: 'default',
    status: 'draft',
    metaData: {},
    createdAt: null,
    updatedAt: null
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ type: '', message: '' });
  const [selectedPageId, setSelectedPageId] = useState(null);

  // Load pages from localStorage (replace with API calls)
  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      setIsLoading(true);
      // Replace with your actual API call
      const savedPages = localStorage.getItem('cms_pages');
      if (savedPages) {
        setPages(JSON.parse(savedPages));
      }
    } catch (error) {
      showNotification('error', 'Failed to load pages');
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification({ type: '', message: '' }), 3000);
  };

  // Save page to backend
  const savePage = async () => {
    if (!currentPage.title) {
      showNotification('error', 'Page title is required');
      return;
    }

    setIsLoading(true);
    try {
      // Auto-generate slug from title
      const slug = currentPage.slug || currentPage.title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      const pageData = {
        ...currentPage,
        slug,
        updatedAt: new Date().toISOString()
      };

      if (!currentPage.id) {
        // Create new page
        const newPage = {
          ...pageData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString()
        };
        
        // Replace with your POST API call
        // const response = await axios.post('/api/pages', newPage);
        
        setPages(prev => [...prev, newPage]);
        setCurrentPage(newPage);
        showNotification('success', 'Page created successfully');
      } else {
        // Update existing page
        // Replace with your PUT API call
        // const response = await axios.put(`/api/pages/${currentPage.id}`, pageData);
        
        setPages(prev => prev.map(p => 
          p.id === currentPage.id ? pageData : p
        ));
        showNotification('success', 'Page updated successfully');
      }

      // Save to localStorage as fallback
      localStorage.setItem('cms_pages', JSON.stringify(pages));
    } catch (error) {
      showNotification('error', 'Failed to save page');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle image upload for featured image
  const handleFeaturedImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Replace with your upload API
      // const response = await axios.post('/api/upload/featured', formData);
      
      // Simulate upload
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentPage(prev => ({
          ...prev,
          featuredImage: reader.result
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showNotification('error', 'Failed to upload featured image');
    }
  };

  // Delete page
  const deletePage = async (pageId) => {
    if (!confirm('Are you sure you want to delete this page?')) return;

    try {
      setIsLoading(true);
      // Replace with your DELETE API call
      // await axios.delete(`/api/pages/${pageId}`);
      
      setPages(prev => prev.filter(p => p.id !== pageId));
      
      if (currentPage.id === pageId) {
        setCurrentPage({
          id: null,
          title: '',
          slug: '',
          content: '',
          excerpt: '',
          featuredImage: null,
          template: 'default',
          status: 'draft',
          metaData: {},
          createdAt: null,
          updatedAt: null
        });
      }
      
      showNotification('success', 'Page deleted successfully');
      localStorage.setItem('cms_pages', JSON.stringify(pages.filter(p => p.id !== pageId)));
    } catch (error) {
      showNotification('error', 'Failed to delete page');
    } finally {
      setIsLoading(false);
    }
  };

  // Template selector component
  const TemplateSelector = ({ selected, onChange }) => (
    <div className={styles.templateSelector}>
      <label>Page Template</label>
      <select value={selected} onChange={onChange}>
        <option value="default">Default Template</option>
        <option value="full-width">Full Width</option>
        <option value="landing">Landing Page</option>
        <option value="blog">Blog Post</option>
        <option value="contact">Contact Page</option>
      </select>
    </div>
  );

  return (
    <div className={styles.container}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        <h3>Pages</h3>
        <button 
          onClick={() => {
            setCurrentPage(prev => ({
              ...prev,
              id: null,
              title: '',
              content: ''
            }));
          }}
          className={styles.newPageButton}
        >
          + New Page
        </button>

        <div className={styles.pageList}>
          {pages.map(page => (
            <div
              key={page.id}
              className={`${styles.pageItem} ${currentPage.id === page.id ? styles.active : ''}`}
            >
              <div
                className={styles.pageItemContent}
                onClick={() => setCurrentPage(page)}
              >
                <span className={styles.pageTitle}>{page.title}</span>
                <span className={`${styles.pageStatus} ${styles[page.status]}`}>
                  {page.status}
                </span>
              </div>
              <button
                onClick={() => deletePage(page.id)}
                className={styles.deleteButton}
                disabled={isLoading}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Editor Area */}
      <div className={styles.editorArea}>
        {notification.message && (
          <div className={`${styles.notification} ${styles[notification.type]}`}>
            {notification.message}
          </div>
        )}

        <div className={styles.editorHeader}>
          <div className={styles.titleSection}>
            <input
              type="text"
              placeholder="Enter page title..."
              value={currentPage.title}
              onChange={(e) => setCurrentPage(prev => ({
                ...prev,
                title: e.target.value,
                slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              }))}
              className={styles.titleInput}
            />
            <div className={styles.slugField}>
              <span>Slug: /</span>
              <input
                type="text"
                value={currentPage.slug}
                onChange={(e) => setCurrentPage(prev => ({
                  ...prev,
                  slug: e.target.value
                }))}
                placeholder="url-slug"
              />
            </div>
          </div>

          <div className={styles.actionButtons}>
            <select
              value={currentPage.status}
              onChange={(e) => setCurrentPage(prev => ({
                ...prev,
                status: e.target.value
              }))}
              className={styles.statusSelect}
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="private">Private</option>
            </select>

            <button
              onClick={savePage}
              disabled={isLoading}
              className={styles.saveButton}
            >
              {isLoading ? 'Saving...' : 'Save Page'}
            </button>
          </div>
        </div>

        {/* Featured Image Upload */}
        <div className={styles.featuredImageSection}>
          <label>Featured Image</label>
          {currentPage.featuredImage ? (
            <div className={styles.featuredImagePreview}>
              <img src={currentPage.featuredImage} alt="Featured" />
              <button
                onClick={() => setCurrentPage(prev => ({ ...prev, featuredImage: null }))}
                className={styles.removeImage}
              >
                Remove
              </button>
            </div>
          ) : (
            <div className={styles.imageUploadBox}>
              <input
                type="file"
                accept="image/*"
                onChange={handleFeaturedImageUpload}
                id="featured-image"
              />
              <label htmlFor="featured-image">Upload Featured Image</label>
            </div>
          )}
        </div>

        {/* Page Excerpt */}
        <div className={styles.excerptSection}>
          <label>Excerpt</label>
          <textarea
            value={currentPage.excerpt || ''}
            onChange={(e) => setCurrentPage(prev => ({
              ...prev,
              excerpt: e.target.value
            }))}
            placeholder="Brief description of the page..."
            rows={3}
          />
        </div>

        {/* Template Selector */}
        <TemplateSelector
          selected={currentPage.template}
          onChange={(e) => setCurrentPage(prev => ({
            ...prev,
            template: e.target.value
          }))}
        />

        {/* Main Content Editor */}
        <div className={styles.contentEditor}>
          <label>Content</label>
          <EnhancedEditor
            initialData={currentPage.content}
            onChange={(content) => setCurrentPage(prev => ({
              ...prev,
              content
            }))}
          />
        </div>

        {/* SEO / Meta Section */}
        <div className={styles.metaSection}>
          <details>
            <summary>SEO & Meta Data</summary>
            <div className={styles.metaFields}>
              <label>
                Meta Title
                <input
                  type="text"
                  value={currentPage.metaData?.title || ''}
                  onChange={(e) => setCurrentPage(prev => ({
                    ...prev,
                    metaData: { ...prev.metaData, title: e.target.value }
                  }))}
                />
              </label>
              <label>
                Meta Description
                <textarea
                  value={currentPage.metaData?.description || ''}
                  onChange={(e) => setCurrentPage(prev => ({
                    ...prev,
                    metaData: { ...prev.metaData, description: e.target.value }
                  }))}
                  rows={2}
                />
              </label>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default PageBuilder;