"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
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

export default function EditorPage() {
  const [data, setData] = useState(
      "<h2>Welcome to Your Editor 🚀</h2><p>Start typing your content or drag & drop images...</p>"
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
  const editorRef = useRef(null);

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("editorVersions");
    if (saved) {
      setSavedVersions(JSON.parse(saved));
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);

    // Simulate save delay
    await new Promise((res) => setTimeout(res, 800));

    const newVersion = {
      id: Date.now(),
      title: title,
      content: data,
      timestamp: new Date().toLocaleString(),
    };

    const updatedVersions = [newVersion, ...savedVersions].slice(0, 10);
    setSavedVersions(updatedVersions);
    localStorage.setItem("editorVersions", JSON.stringify(updatedVersions));

    setIsSaving(false);
  };

  const loadVersion = (version) => {
    setTitle(version.title);
    setData(version.content);
  };

  const deleteVersion = (id) => {
    const updated = savedVersions.filter(v => v.id !== id);
    setSavedVersions(updated);
    localStorage.setItem("editorVersions", JSON.stringify(updated));
  };

  const exportContent = () => {
    const blob = new Blob([data], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "_")}.html`;
    a.click();
  };

  const clearContent = () => {
    if (confirm("Are you sure you want to clear all content?")) {
      setData("");
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
            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={darkMode ? styles.darkTitleInput : styles.titleInput}
                placeholder="Document Title"
            />
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
              <div style={{...styles.progressBar, width: `${uploadProgress}%`}}>
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
                ✏️ Edit
              </button>
              <button
                  style={activeTab === 'images' ? styles.activeTab : styles.tab}
                  onClick={() => setActiveTab('images')}
              >
                🖼️ Images
              </button>
              <button
                  style={activeTab === 'settings' ? styles.activeTab : styles.tab}
                  onClick={() => setActiveTab('settings')}
              >
                ⚙️ Settings
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'edit' && (
                <div style={styles.editorWrapper}>
                  <CKEditor
                      editor={ClassicEditor}
                      data={data}
                      config={{
                        placeholder: "Write something amazing...",
                        toolbar: [
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
                        image: {
                          toolbar: [
                            'imageStyle:inline',
                            'imageStyle:block',
                            'imageStyle:side',
                            '|',
                            'toggleImageCaption',
                            'imageTextAlternative',
                            '|',
                            'linkImage'
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
                        }
                      }}
                      onReady={(editor) => {
                        editorRef.current = editor;
                        editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
                            new MyUploadAdapter(loader, handleUploadProgress);
                      }}
                      onChange={(_, editor) => {
                        setData(editor.getData());
                      }}
                  />
                </div>
            )}

            {activeTab === 'images' && (
                <div style={styles.imagesTab}>
                  <h3>Image Gallery</h3>
                  <p>Drag and drop images here or use the upload button in the editor</p>
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
                  <h3>Editor Settings</h3>
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
                      <input type="checkbox" /> Word count
                    </label>
                  </div>
                  <div style={styles.settingItem}>
                    <label>Font Size: </label>
                    <select style={styles.select}>
                      <option>Small</option>
                      <option selected>Medium</option>
                      <option>Large</option>
                    </select>
                  </div>
                </div>
            )}
          </div>

          {/* Preview Panel */}
          {showPreview && (
              <div style={darkMode ? styles.darkPreview : styles.preview}>
                <h3 style={styles.previewTitle}>📱 Live Preview</h3>
                <div style={styles.previewContent}>
                  <div style={styles.previewHeader}>
                    <h2>{title}</h2>
                  </div>
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
  },
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
  editorWrapper: {
    flex: 1,
    padding: "20px",
    overflowY: "auto",
  },
  imagesTab: {
    padding: "20px",
    textAlign: "center",
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
  settingsTab: {
    padding: "20px",
  },
  settingItem: {
    margin: "15px 0",
  },
  select: {
    padding: "5px 10px",
    borderRadius: "4px",
    border: "1px solid #ddd",
    marginLeft: "10px",
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
  previewHeader: {
    borderBottom: "1px solid #ddd",
    marginBottom: "15px",
    paddingBottom: "10px",
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