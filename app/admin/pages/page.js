"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";

// Import ClassicEditor
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

// SSR safe CKEditor import
const CKEditor = dynamic(
  async () => {
    const mod = await import("@ckeditor/ckeditor5-react");
    return mod.CKEditor;
  },
  { ssr: false }
);

// ===== Custom Upload Adapter with Progress =====
class MyUploadAdapter {
  constructor(loader, onProgress) {
    this.loader = loader;
    this.onProgress = onProgress;
  }

  upload() {
    return this.loader.file.then((file) => {
      return new Promise((resolve, reject) => {
        const data = new FormData();
        data.append("file", file);

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          if (this.onProgress) {
            this.onProgress(progress);
          }
          if (progress >= 100) {
            clearInterval(interval);
          }
        }, 100);

        // Simulate API call (replace with actual fetch)
        setTimeout(() => {
          clearInterval(interval);
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              default: e.target.result, // For demo - use actual URL in production
            });
          };
          reader.readAsDataURL(file);
        }, 1000);

        // Actual fetch implementation (commented for demo)
        /*
        fetch("/api/upload", {
          method: "POST",
          body: data,
        })
          .then((res) => res.json())
          .then((res) => {
            clearInterval(interval);
            resolve({
              default: res.url,
            });
          })
          .catch((error) => {
            clearInterval(interval);
            reject(error);
          });
        */
      });
    });
  }

  abort() {}
}

// ===== Upload Adapter Plugin =====
function MyUploadAdapterPlugin(onProgress) {
  return function(editor) {
    editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
      return new MyUploadAdapter(loader, onProgress);
    };
  };
}

export default function EditorPage() {
  const [data, setData] = useState(
    "<h2>Welcome to Your Editor 🚀</h2><p>Start typing your content or drag & drop images...</p>" +
    "<p>Try dragging an image into the editor, then click on it to resize using the handles!</p>"
  );
  const [savedVersions, setSavedVersions] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState("edit");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("Untitled Document");
  const [darkMode, setDarkMode] = useState(false);
  const [featuredImage, setFeaturedImage] = useState(null);
  const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
  const [slug, setSlug] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [postStatus, setPostStatus] = useState("draft");
  const [publishedAt, setPublishedAt] = useState("");
  const [author, setAuthor] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [isSticky, setIsSticky] = useState(false);
  const [password, setPassword] = useState("");
  const editorRef = useRef(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("editorVersions");
    if (saved) {
      setSavedVersions(JSON.parse(saved));
    }
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (title && title !== "Untitled Document") {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .replace(/\s+/g, '-');
      setSlug(generatedSlug);
    }
  }, [title]);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate save delay
    await new Promise((res) => setTimeout(res, 800));

    const postData = {
      id: Date.now(),
      title: title,
      slug: slug,
      content: data,
      excerpt: excerpt,
      featuredImage: featuredImagePreview,
      category: selectedCategory,
      tags: tags,
      seo: {
        title: seoTitle,
        description: seoDescription,
        keywords: seoKeywords
      },
      status: postStatus,
      author: author,
      publishedAt: publishedAt || new Date().toLocaleString(),
      allowComments: allowComments,
      isSticky: isSticky,
      password: password,
      timestamp: new Date().toLocaleString(),
    };

    const newVersion = {
      id: Date.now(),
      title: title,
      content: data,
      timestamp: new Date().toLocaleString(),
      postData: postData
    };

    const updatedVersions = [newVersion, ...savedVersions].slice(0, 10);
    setSavedVersions(updatedVersions);
    localStorage.setItem("editorVersions", JSON.stringify(updatedVersions));

    setIsSaving(false);
  };

  const loadVersion = (version) => {
    setTitle(version.title);
    setData(version.content);
    if (version.postData) {
      setSlug(version.postData.slug || "");
      setExcerpt(version.postData.excerpt || "");
      setSelectedCategory(version.postData.category || "");
      setTags(version.postData.tags || []);
      setSeoTitle(version.postData.seo?.title || "");
      setSeoDescription(version.postData.seo?.description || "");
      setSeoKeywords(version.postData.seo?.keywords || "");
      setPostStatus(version.postData.status || "draft");
      setAuthor(version.postData.author || "");
      setPublishedAt(version.postData.publishedAt || "");
      setAllowComments(version.postData.allowComments !== false);
      setIsSticky(version.postData.isSticky || false);
      setPassword(version.postData.password || "");
      setFeaturedImagePreview(version.postData.featuredImage || null);
    }
  };

  const deleteVersion = (id) => {
    const updated = savedVersions.filter(v => v.id !== id);
    setSavedVersions(updated);
    localStorage.setItem("editorVersions", JSON.stringify(updated));
  };

  const exportContent = () => {
    const postData = {
      title,
      slug,
      content: data,
      excerpt,
      featuredImage: featuredImagePreview,
      category: selectedCategory,
      tags,
      seo: { title: seoTitle, description: seoDescription, keywords: seoKeywords },
      status: postStatus,
      author,
      publishedAt,
      allowComments,
      isSticky,
    };
    
    const blob = new Blob([JSON.stringify(postData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slug || title.replace(/\s+/g, "_")}.json`;
    a.click();
  };

  const clearContent = () => {
    if (confirm("Are you sure you want to clear all content?")) {
      setData("");
      setTitle("Untitled Document");
      setSlug("");
      setExcerpt("");
      setFeaturedImage(null);
      setFeaturedImagePreview(null);
      setSelectedCategory("");
      setTags([]);
      setSeoTitle("");
      setSeoDescription("");
      setSeoKeywords("");
      setAuthor("");
      setPassword("");
    }
  };

  const handleUploadProgress = (progress) => {
    setUploadProgress(progress);
    setIsUploading(progress < 100);
    if (progress === 100) {
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    }
  };

  const handleFeaturedImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFeaturedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeaturedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFeaturedImage = () => {
    setFeaturedImage(null);
    setFeaturedImagePreview(null);
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Sample categories
  const categoryOptions = [
    "Technology",
    "Lifestyle",
    "Travel",
    "Food",
    "Health",
    "Business",
    "Education",
    "Entertainment",
    "Sports",
    "News"
  ];

  return (
    <div style={darkMode ? styles.darkPage : styles.page}>
      {/* Top Navigation Bar */}
      <div style={darkMode ? styles.darkNavbar : styles.navbar}>
        <div style={styles.navLeft}>
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            style={styles.iconButton}
            title="Toggle Sidebar"
          >
            ☰
          </button>
          <select 
            value={postStatus}
            onChange={(e) => setPostStatus(e.target.value)}
            style={darkMode ? styles.darkSelect : styles.select}
          >
            <option value="draft">📝 Draft</option>
            <option value="published">🚀 Published</option>
            <option value="scheduled">⏰ Scheduled</option>
            <option value="private">🔒 Private</option>
            <option value="pending">⏳ Pending Review</option>
          </select>
        </div>

        <div style={styles.navRight}>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={styles.iconButton}
            title="Toggle Dark Mode"
          >
            {darkMode ? "☀️" : "🌙"}
          </button>
          <button
            onClick={() => setShowPreview(!showPreview)}
            style={styles.iconButton}
            title="Toggle Preview"
          >
            👁️
          </button>
          <button onClick={exportContent} style={styles.navButton}>
            Export
          </button>
          <button onClick={clearContent} style={styles.navButton}>
            Clear
          </button>
          <button onClick={handleSave} style={styles.saveButton}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div style={styles.progressContainer}>
          <div style={{ ...styles.progressBar, width: `${uploadProgress}%` }}>
            {uploadProgress}%
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div style={styles.mainContainer}>
        {/* Sidebar - Saved Versions */}
        {showSidebar && (
          <div style={darkMode ? styles.darkSidebar : styles.sidebar}>
            <h3 style={styles.sidebarTitle}>📚 Saved Versions</h3>
            {savedVersions.length === 0 ? (
              <p style={styles.emptyMessage}>No saved versions yet</p>
            ) : (
              <div style={styles.versionList}>
                {savedVersions.map((version) => (
                  <div key={version.id} style={styles.versionCard}>
                    <div style={styles.versionInfo}>
                      <strong>{version.title}</strong>
                      <small>{version.timestamp}</small>
                      {version.postData?.status && (
                        <span style={styles.statusBadge(version.postData.status)}>
                          {version.postData.status}
                        </span>
                      )}
                    </div>
                    <div style={styles.versionActions}>
                      <button
                        onClick={() => loadVersion(version)}
                        style={styles.versionButton}
                        title="Load"
                      >
                        📂
                      </button>
                      <button
                        onClick={() => deleteVersion(version.id)}
                        style={styles.versionButton}
                        title="Delete"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Editor Area */}
        <div style={styles.editorContainer}>
          {/* Tabs */}
          <div style={styles.tabBar}>
            <button
              style={activeTab === 'edit' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('edit')}
            >
              ✏️ Content
            </button>
            <button
              style={activeTab === 'post' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('post')}
            >
              📄 Post Settings
            </button>
            <button
              style={activeTab === 'seo' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('seo')}
            >
              🔍 SEO
            </button>
            <button
              style={activeTab === 'images' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('images')}
            >
              🖼️ Media
            </button>
            <button
              style={activeTab === 'settings' ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab('settings')}
            >
              ⚙️ Advanced
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'edit' && (
            <div style={styles.editTab}>
              {/* Title Input */}
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={darkMode ? styles.darkTitleEditor : styles.titleEditor}
                placeholder="Enter post title..."
              />
              
              {/* Slug Input */}
              <div style={styles.slugContainer}>
                <span style={styles.slugPrefix}>🔗 slug:</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  style={darkMode ? styles.darkSlugInput : styles.slugInput}
                  placeholder="post-url-slug"
                />
              </div>

              {/* Editor */}
              <div style={styles.editorWrapper}>
                <CKEditor
                  editor={ClassicEditor}
                  data={data}
                  config={{
                    placeholder: "Write your post content here...",
                    extraPlugins: [MyUploadAdapterPlugin(handleUploadProgress)],
                    toolbar: {
                      items: [
                        "heading",
                        "|",
                        "bold",
                        "italic",
                        "underline",
                        "strikethrough",
                        "|",
                        "link",
                        "bulletedList",
                        "numberedList",
                        "|",
                        "alignment",
                        "outdent",
                        "indent",
                        "|",
                        "imageUpload",
                        "mediaEmbed",
                        "blockQuote",
                        "insertTable",
                        "|",
                        "fontSize",
                        "fontColor",
                        "fontBackgroundColor",
                        "|",
                        "undo",
                        "redo",
                        "|",
                        "sourceEditing"
                      ],
                      shouldNotGroupWhenFull: true
                    },
                    image: {
                      resizeOptions: [
                        {
                          name: 'resizeImage:original',
                          value: null,
                          icon: 'original'
                        },
                        {
                          name: 'resizeImage:25',
                          value: '25',
                          icon: 'small'
                        },
                        {
                          name: 'resizeImage:50',
                          value: '50',
                          icon: 'medium'
                        },
                        {
                          name: 'resizeImage:75',
                          value: '75',
                          icon: 'large'
                        }
                      ],
                      toolbar: [
                        'imageStyle:inline',
                        'imageStyle:block',
                        'imageStyle:side',
                        '|',
                        'toggleImageCaption',
                        'imageTextAlternative',
                        '|',
                        'linkImage',
                        '|',
                        'resizeImage'
                      ],
                      styles: [
                        'alignLeft',
                        'alignCenter',
                        'alignRight'
                      ]
                    },
                    table: {
                      contentToolbar: [
                        'tableColumn',
                        'tableRow',
                        'mergeTableCells',
                        'tableProperties',
                        'tableCellProperties'
                      ]
                    },
                    resizeImages: true
                  }}
                  onReady={(editor) => {
                    editorRef.current = editor;
                  }}
                  onChange={(_, editor) => {
                    setData(editor.getData());
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === 'post' && (
            <div style={styles.postTab}>
              <h3>📄 Post Settings</h3>
              
              {/* Featured Image */}
              <div style={styles.settingSection}>
                <h4>Featured Image</h4>
                {featuredImagePreview ? (
                  <div style={styles.featuredImageContainer}>
                    <img 
                      src={featuredImagePreview} 
                      alt="Featured" 
                      style={styles.featuredImage}
                    />
                    <button 
                      onClick={removeFeaturedImage}
                      style={styles.removeImageButton}
                    >
                      ✕ Remove
                    </button>
                  </div>
                ) : (
                  <div style={styles.imageUploadArea}>
                    <input
                      type="file"
                      id="featuredImage"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      onClick={() => document.getElementById('featuredImage').click()}
                      style={styles.uploadButton}
                    >
                      📤 Upload Featured Image
                    </button>
                  </div>
                )}
              </div>

              {/* Excerpt */}
              <div style={styles.settingSection}>
                <h4>Excerpt</h4>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  style={darkMode ? styles.darkTextarea : styles.textarea}
                  placeholder="Write a short excerpt for your post..."
                  rows={4}
                />
              </div>

              {/* Category */}
              <div style={styles.settingSection}>
                <h4>Category</h4>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={darkMode ? styles.darkSelect : styles.select}
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div style={styles.settingSection}>
                <h4>Tags</h4>
                <div style={styles.tagsContainer}>
                  {tags.map(tag => (
                    <span key={tag} style={styles.tag}>
                      {tag}
                      <button 
                        onClick={() => removeTag(tag)}
                        style={styles.removeTag}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleAddTag}
                    placeholder="Add tags (press Enter)"
                    style={darkMode ? styles.darkTagInput : styles.tagInput}
                  />
                </div>
              </div>

              {/* Author */}
              <div style={styles.settingSection}>
                <h4>Author</h4>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  style={darkMode ? styles.darkInput : styles.input}
                  placeholder="Author name"
                />
              </div>

              {/* Publish Date */}
              <div style={styles.settingSection}>
                <h4>Publish Date</h4>
                <input
                  type="datetime-local"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  style={darkMode ? styles.darkInput : styles.input}
                />
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div style={styles.seoTab}>
              <h3>🔍 SEO Settings</h3>
              
              {/* SEO Title */}
              <div style={styles.settingSection}>
                <h4>SEO Title</h4>
                <input
                  type="text"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  style={darkMode ? styles.darkInput : styles.input}
                  placeholder="Enter SEO title (leave empty to use post title)"
                />
                <small style={styles.helperText}>
                  Recommended length: 50-60 characters
                </small>
              </div>

              {/* Meta Description */}
              <div style={styles.settingSection}>
                <h4>Meta Description</h4>
                <textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  style={darkMode ? styles.darkTextarea : styles.textarea}
                  placeholder="Enter meta description"
                  rows={3}
                />
                <small style={styles.helperText}>
                  Recommended length: 150-160 characters
                </small>
              </div>

              {/* Keywords */}
              <div style={styles.settingSection}>
                <h4>Meta Keywords</h4>
                <input
                  type="text"
                  value={seoKeywords}
                  onChange={(e) => setSeoKeywords(e.target.value)}
                  style={darkMode ? styles.darkInput : styles.input}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>

              {/* SEO Preview */}
              <div style={styles.seoPreview}>
                <h4>Search Preview</h4>
                <div style={styles.googlePreview}>
                  <div style={styles.previewUrl}>{slug || 'example.com'}</div>
                  <div style={styles.previewTitle}>
                    {seoTitle || title || 'Post Title'}
                  </div>
                  <div style={styles.previewDescription}>
                    {seoDescription || excerpt || 'Post description will appear here...'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'images' && (
            <div style={styles.imagesTab}>
              <h3>🖼️ Media Gallery</h3>
              <p>Upload images or drag and drop directly into the editor</p>
              <p><strong>Pro tip:</strong> After uploading, click on an image to see resize handles appear at the corners!</p>
              <div style={styles.imageGrid}>
                {/* Sample image placeholders */}
                <div style={styles.imageCard}>
                  <div style={styles.imagePlaceholder}>🏞️</div>
                  <span>Sample 1</span>
                </div>
                <div style={styles.imageCard}>
                  <div style={styles.imagePlaceholder}>🌅</div>
                  <span>Sample 2</span>
                </div>
                <div style={styles.imageCard}>
                  <div style={styles.imagePlaceholder}>🌄</div>
                  <span>Sample 3</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div style={styles.settingsTab}>
              <h3>⚙️ Advanced Settings</h3>
              
              {/* Post Options */}
              <div style={styles.settingSection}>
                <h4>Post Options</h4>
                <div style={styles.checkboxGroup}>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={allowComments}
                      onChange={(e) => setAllowComments(e.target.checked)}
                    />
                    Allow Comments
                  </label>
                  <label style={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isSticky}
                      onChange={(e) => setIsSticky(e.target.checked)}
                    />
                    Make this post sticky (featured)
                  </label>
                </div>
              </div>

              {/* Password Protection */}
              <div style={styles.settingSection}>
                <h4>Password Protection</h4>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={darkMode ? styles.darkInput : styles.input}
                  placeholder="Leave empty for no password"
                />
                <small style={styles.helperText}>
                  Set a password to make this post private
                </small>
              </div>

              {/* Editor Settings */}
              <div style={styles.settingSection}>
                <h4>Editor Settings</h4>
                <div style={styles.settingItem}>
                  <label>
                    <input type="checkbox" defaultChecked /> Auto-save
                  </label>
                </div>
                <div style={styles.settingItem}>
                  <label>
                    <input type="checkbox" defaultChecked /> Spell check
                  </label>
                </div>
                <div style={styles.settingItem}>
                  <label>
                    <input type="checkbox" defaultChecked /> Image resize handles
                  </label>
                </div>
                <div style={styles.settingItem}>
                  <label>Default image size: </label>
                  <select style={styles.select}>
                    <option>Small (25%)</option>
                    <option selected>Medium (50%)</option>
                    <option>Large (75%)</option>
                    <option>Original (100%)</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview Panel */}
        {showPreview && (
          <div style={darkMode ? styles.darkPreview : styles.preview}>
            <h3 style={styles.previewTitle}>📱 Live Preview</h3>
            <div style={styles.previewContent}>
              {/* Featured Image Preview */}
              {featuredImagePreview && (
                <img 
                  src={featuredImagePreview} 
                  alt="Featured" 
                  style={styles.previewFeaturedImage}
                />
              )}
              
              {/* Title */}
              <div style={styles.previewHeader}>
                <h2>{title || "Untitled Post"}</h2>
                <div style={styles.previewMeta}>
                  {author && <span>By {author}</span>}
                  {publishedAt && <span> • {new Date(publishedAt).toLocaleDateString()}</span>}
                  {selectedCategory && <span> • {selectedCategory}</span>}
                </div>
              </div>

              {/* Tags */}
              {tags.length > 0 && (
                <div style={styles.previewTags}>
                  {tags.map(tag => (
                    <span key={tag} style={styles.previewTag}>#{tag}</span>
                  ))}
                </div>
              )}

              {/* Content */}
              <div
                dangerouslySetInnerHTML={{ __html: data }}
                style={styles.previewHtml}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ===== Styles =====
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  darkPage: {
    minHeight: "100vh",
    background: "#1a1a1a",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  navbar: {
    background: "white",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  },
  darkNavbar: {
    background: "#2d2d2d",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
    color: "white",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    flex: 1,
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  titleInput: {
    padding: "8px 12px",
    border: "2px solid #e0e0e0",
    borderRadius: "6px",
    fontSize: "16px",
    width: "300px",
    transition: "border-color 0.3s",
  },
  darkTitleInput: {
    padding: "8px 12px",
    border: "2px solid #404040",
    borderRadius: "6px",
    fontSize: "16px",
    width: "300px",
    background: "#3d3d3d",
    color: "white",
    transition: "border-color 0.3s",
  },
  titleEditor: {
    width: "100%",
    padding: "15px",
    fontSize: "24px",
    fontWeight: "bold",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    marginBottom: "10px",
    outline: "none",
  },
  darkTitleEditor: {
    width: "100%",
    padding: "15px",
    fontSize: "24px",
    fontWeight: "bold",
    border: "2px solid #404040",
    borderRadius: "8px",
    marginBottom: "10px",
    background: "#3d3d3d",
    color: "white",
    outline: "none",
  },
  slugContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "20px",
    padding: "0 15px",
  },
  slugPrefix: {
    color: "#666",
    fontSize: "14px",
  },
  slugInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #e0e0e0",
    borderRadius: "4px",
    fontSize: "14px",
  },
  darkSlugInput: {
    flex: 1,
    padding: "8px 12px",
    border: "1px solid #404040",
    borderRadius: "4px",
    fontSize: "14px",
    background: "#3d3d3d",
    color: "white",
  },
  iconButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "6px",
    transition: "background 0.3s",
  },
  navButton: {
    padding: "8px 16px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    background: "#f8f9fa",
    cursor: "pointer",
    fontSize: "14px",
    transition: "all 0.3s",
  },
  saveButton: {
    padding: "8px 20px",
    border: "none",
    borderRadius: "6px",
    background: "#28a745",
    color: "white",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "bold",
    transition: "background 0.3s",
  },
  progressContainer: {
    height: "4px",
    background: "#e0e0e0",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    background: "#28a745",
    transition: "width 0.3s",
    textAlign: "center",
    fontSize: "10px",
    lineHeight: "4px",
    color: "white",
  },
  mainContainer: {
    display: "flex",
    height: "calc(100vh - 70px)",
    padding: "20px",
    gap: "20px",
  },
  sidebar: {
    width: "280px",
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflowY: "auto",
  },
  darkSidebar: {
    width: "280px",
    background: "#2d2d2d",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    overflowY: "auto",
    color: "white",
  },
  sidebarTitle: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    fontWeight: "600",
    color: "#333",
  },
  emptyMessage: {
    color: "#999",
    fontStyle: "italic",
    textAlign: "center",
  },
  versionList: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  versionCard: {
    padding: "12px",
    background: "#f8f9fa",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    transition: "transform 0.3s",
  },
  versionInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  statusBadge: (status) => ({
    fontSize: "10px",
    padding: "2px 6px",
    borderRadius: "10px",
    background: status === 'published' ? '#28a745' : 
                status === 'draft' ? '#ffc107' : 
                status === 'scheduled' ? '#17a2b8' : 
                status === 'private' ? '#dc3545' : '#6c757d',
    color: "white",
    display: "inline-block",
    width: "fit-content",
  }),
  versionActions: {
    display: "flex",
    gap: "8px",
  },
  versionButton: {
    background: "none",
    border: "none",
    fontSize: "18px",
    cursor: "pointer",
    padding: "4px",
    borderRadius: "4px",
  },
  editorContainer: {
    flex: 1,
    background: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
  tabBar: {
    display: "flex",
    padding: "10px 20px 0",
    background: "#f8f9fa",
    borderBottom: "1px solid #e0e0e0",
    flexWrap: "wrap",
  },
  tab: {
    padding: "10px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#666",
    borderBottom: "2px solid transparent",
    transition: "all 0.3s",
  },
  activeTab: {
    padding: "10px 20px",
    border: "none",
    background: "none",
    cursor: "pointer",
    fontSize: "14px",
    color: "#667eea",
    borderBottom: "2px solid #667eea",
    fontWeight: "bold",
  },
  editTab: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
  },
  editorWrapper: {
    flex: 1,
    minHeight: "400px",
  },
  postTab: {
    padding: "20px",
    overflowY: "auto",
  },
  seoTab: {
    padding: "20px",
    overflowY: "auto",
  },
  imagesTab: {
    padding: "20px",
    textAlign: "center",
    overflowY: "auto",
  },
  settingsTab: {
    padding: "20px",
    overflowY: "auto",
  },
  settingSection: {
    marginBottom: "30px",
    padding: "20px",
    background: "#f8f9fa",
    borderRadius: "8px",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    marginTop: "5px",
  },
  darkInput: {
    width: "100%",
    padding: "10px",
    border: "1px solid #404040",
    borderRadius: "4px",
    fontSize: "14px",
    marginTop: "5px",
    background: "#3d3d3d",
    color: "white",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    marginTop: "5px",
    resize: "vertical",
  },
  darkTextarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #404040",
    borderRadius: "4px",
    fontSize: "14px",
    marginTop: "5px",
    background: "#3d3d3d",
    color: "white",
    resize: "vertical",
  },
  select: {
    width: "100%",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    marginTop: "5px",
  },
  darkSelect: {
    width: "100%",
    padding: "10px",
    border: "1px solid #404040",
    borderRadius: "4px",
    fontSize: "14px",
    marginTop: "5px",
    background: "#3d3d3d",
    color: "white",
  },
  checkboxGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
  },
  helperText: {
    display: "block",
    marginTop: "5px",
    fontSize: "12px",
    color: "#666",
  },
  featuredImageContainer: {
    position: "relative",
    marginTop: "10px",
  },
  featuredImage: {
    width: "100%",
    maxHeight: "200px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  removeImageButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "#dc3545",
    color: "white",
    border: "none",
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "12px",
  },
  imageUploadArea: {
    marginTop: "10px",
  },
  uploadButton: {
    padding: "12px 24px",
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  tagsContainer: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "10px",
  },
  tag: {
    background: "#667eea",
    color: "white",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    display: "inline-flex",
    alignItems: "center",
    gap: "4px",
  },
  removeTag: {
    background: "none",
    border: "none",
    color: "white",
    cursor: "pointer",
    fontSize: "12px",
    padding: "0 2px",
  },
  tagInput: {
    flex: 1,
    minWidth: "120px",
    padding: "6px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "12px",
  },
  darkTagInput: {
    flex: 1,
    minWidth: "120px",
    padding: "6px",
    border: "1px solid #404040",
    borderRadius: "4px",
    fontSize: "12px",
    background: "#3d3d3d",
    color: "white",
  },
  seoPreview: {
    marginTop: "20px",
    padding: "15px",
    background: "#f0f0f0",
    borderRadius: "8px",
  },
  googlePreview: {
    background: "white",
    padding: "15px",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  },
  previewUrl: {
    color: "#006621",
    fontSize: "14px",
    marginBottom: "4px",
  },
  previewTitle: {
    color: "#1a0dab",
    fontSize: "18px",
    fontWeight: "400",
    marginBottom: "4px",
    cursor: "pointer",
  },
  previewDescription: {
    color: "#545454",
    fontSize: "13px",
  },
  imageGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
    gap: "15px",
    marginTop: "20px",
  },
  imageCard: {
    padding: "15px",
    background: "#f8f9fa",
    borderRadius: "8px",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.3s",
  },
  imagePlaceholder: {
    fontSize: "40px",
    marginBottom: "10px",
  },
  settingItem: {
    margin: "15px 0",
  },
  preview: {
    width: "320px",
    background: "white",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    overflowY: "auto",
  },
  darkPreview: {
    width: "320px",
    background: "#2d2d2d",
    borderRadius: "12px",
    padding: "20px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    overflowY: "auto",
    color: "white",
  },
  previewTitle: {
    margin: "0 0 15px 0",
    fontSize: "16px",
    fontWeight: "600",
  },
  previewContent: {
    background: "#f9f9f9",
    padding: "15px",
    borderRadius: "8px",
    minHeight: "200px",
  },
  previewFeaturedImage: {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    borderRadius: "4px",
    marginBottom: "15px",
  },
  previewHeader: {
    borderBottom: "1px solid #ddd",
    marginBottom: "15px",
    paddingBottom: "10px",
  },
  previewMeta: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
  },
  previewTags: {
    display: "flex",
    flexWrap: "wrap",
    gap: "5px",
    marginBottom: "15px",
  },
  previewTag: {
    fontSize: "11px",
    color: "#667eea",
    background: "#e8eaf6",
    padding: "2px 8px",
    borderRadius: "12px",
  },
  previewHtml: {
    lineHeight: "1.6",
    color: "#333",
  },
};

// Add global styles for CKEditor
const globalStyles = `
  .ck-editor__editable {
    min-height: 400px !important;
    max-height: 600px !important;
  }
  
  .ck-content img {
    max-width: 100%;
    height: auto;
    transition: all 0.2s ease;
  }
  
  .ck-content figure.image {
    position: relative;
  }
  
  .ck-content figure.image.selected {
    outline: 2px solid #667eea;
  }
  
  .ck .ck-image-resize-handle {
    border: 2px solid #667eea;
    background: white;
    width: 10px;
    height: 10px;
  }
  
  .ck-content {
    font-family: inherit;
  }
  
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 10px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
`;

// Add global styles to document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = globalStyles;
  document.head.appendChild(style);
}