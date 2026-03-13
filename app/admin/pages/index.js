"use client";

import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import axios from 'axios';

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
                data.append("image", file);

                // XMLHttpRequest for progress tracking
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && this.onProgress) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        this.onProgress(Math.round(percentComplete));
                    }
                });

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const response = JSON.parse(xhr.responseText);
                        resolve({
                            default: response.url
                        });
                    } else {
                        reject('Upload failed');
                    }
                };

                xhr.onerror = () => reject('Upload failed');
                xhr.open('POST', '/api/upload', true);
                xhr.send(data);
            });
        });
    }

    abort() {
        // Handle abort if needed
    }
}

export default function EditorPage() {
    const [data, setData] = useState("");
    const [savedContents, setSavedContents] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showPreview, setShowPreview] = useState(true);
    const [activeTab, setActiveTab] = useState("edit");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [title, setTitle] = useState("Untitled Document");
    const [darkMode, setDarkMode] = useState(false);
    const [author, setAuthor] = useState("");
    const [tags, setTags] = useState("");
    const [selectedId, setSelectedId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ show: false, message: '', type: '' });
    const [searchTerm, setSearchTerm] = useState("");

    const editorRef = useRef(null);

    // Load saved data from API on mount
    useEffect(() => {
        fetchContents();
    }, []);

    // Show notification
    const showNotification = (message, type = 'success') => {
        setNotification({ show: true, message, type });
        setTimeout(() => {
            setNotification({ show: false, message: '', type: '' });
        }, 3000);
    };

    // Fetch all contents
    const fetchContents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('/api/content');
            if (response.data.success) {
                setSavedContents(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching contents:', error);
            showNotification('Failed to load contents', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Save content (Create or Update)
    const handleSave = async () => {
        if (!title.trim()) {
            showNotification('Please enter a title', 'error');
            return;
        }

        if (!data.trim()) {
            showNotification('Please enter some content', 'error');
            return;
        }

        setIsSaving(true);

        try {
            const contentData = {
                title,
                content: data,
                author: author || 'Anonymous',
                tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            let response;
            if (selectedId) {
                // Update existing
                response = await axios.put('/api/content', {
                    id: selectedId,
                    ...contentData
                });
            } else {
                // Create new
                response = await axios.post('/api/content', contentData);
            }

            if (response.data.success) {
                showNotification(selectedId ? 'Content updated successfully!' : 'Content saved successfully!');
                fetchContents(); // Refresh list
                if (!selectedId) {
                    // Reset form for new content
                    setSelectedId(response.data.data.id);
                }
            }
        } catch (error) {
            console.error('Error saving content:', error);
            showNotification(error.response?.data?.message || 'Failed to save content', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    // Load content for editing
    const loadContent = (content) => {
        setSelectedId(content.id);
        setTitle(content.title);
        setData(content.content);
        setAuthor(content.author || '');
        setTags(content.tags?.join(', ') || '');
        showNotification('Content loaded successfully!');
    };

    // Delete content
    const deleteContent = async (id) => {
        if (!confirm('Are you sure you want to delete this content?')) {
            return;
        }

        try {
            const response = await axios.delete(`/api/content?id=${id}`);

            if (response.data.success) {
                showNotification('Content deleted successfully!');
                fetchContents(); // Refresh list

                if (selectedId === id) {
                    // Clear form if deleted content was selected
                    setSelectedId(null);
                    setTitle('Untitled Document');
                    setData('');
                    setAuthor('');
                    setTags('');
                }
            }
        } catch (error) {
            console.error('Error deleting content:', error);
            showNotification(error.response?.data?.message || 'Failed to delete content', 'error');
        }
    };

    // Create new content
    const createNew = () => {
        setSelectedId(null);
        setTitle('Untitled Document');
        setData('');
        setAuthor('');
        setTags('');
        showNotification('New document created!');
    };

    // Export content
    const exportContent = () => {
        const blob = new Blob([data], { type: "text/html" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${title.replace(/\s+/g, "_")}.html`;
        a.click();
        showNotification('Content exported successfully!');
    };

    // Clear content
    const clearContent = () => {
        if (confirm("Are you sure you want to clear all content?")) {
            setData("");
            showNotification('Content cleared!');
        }
    };

    // Handle upload progress
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

    // Filter contents based on search
    const filteredContents = savedContents.filter(content =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div style={darkMode ? styles.darkPage : styles.page}>
            {/* Notification */}
            {notification.show && (
                <div style={{
                    ...styles.notification,
                    backgroundColor: notification.type === 'error' ? '#f44336' : '#4caf50'
                }}>
                    {notification.message}
                </div>
            )}

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
                    <button onClick={createNew} style={styles.navButton} title="Create New">
                        ✨ New
                    </button>
                    <button onClick={exportContent} style={styles.navButton} title="Export as HTML">
                        📥 Export
                    </button>
                    <button onClick={clearContent} style={styles.navButton} title="Clear Content">
                        🗑️ Clear
                    </button>
                    <button onClick={handleSave} style={styles.saveButton} disabled={isSaving}>
                        {isSaving ? "💾 Saving..." : selectedId ? "💾 Update" : "💾 Save"}
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
                {/* Sidebar - Saved Contents */}
                {showSidebar && (
                    <div style={darkMode ? styles.darkSidebar : styles.sidebar}>
                        <div style={styles.sidebarHeader}>
                            <h3 style={styles.sidebarTitle}>📚 Documents</h3>
                            <input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={styles.searchInput}
                            />
                        </div>

                        {loading ? (
                            <p style={styles.loadingMessage}>Loading...</p>
                        ) : filteredContents.length === 0 ? (
                            <p style={styles.emptyMessage}>
                                {searchTerm ? 'No matching documents' : 'No saved documents yet'}
                            </p>
                        ) : (
                            <div style={styles.versionList}>
                                {filteredContents.map((content) => (
                                    <div key={content.id} style={{
                                        ...styles.versionCard,
                                        backgroundColor: selectedId === content.id ? '#e3f2fd' : '#f8f9fa'
                                    }}>
                                        <div style={styles.versionInfo}>
                                            <strong>{content.title}</strong>
                                            <small>By: {content.author}</small>
                                            <small style={styles.dateText}>
                                                {new Date(content.updatedAt).toLocaleDateString()}
                                            </small>
                                            {content.tags && content.tags.length > 0 && (
                                                <div style={styles.tagContainer}>
                                                    {content.tags.map((tag, i) => (
                                                        <span key={i} style={styles.tag}>#{tag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        <div style={styles.versionActions}>
                                            <button
                                                onClick={() => loadContent(content)}
                                                style={styles.versionButton}
                                                title="Load"
                                            >
                                                📂
                                            </button>
                                            <button
                                                onClick={() => deleteContent(content.id)}
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
                            style={activeTab === 'details' ? styles.activeTab : styles.tab}
                            onClick={() => setActiveTab('details')}
                        >
                            📋 Details
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

                    {activeTab === 'details' && (
                        <div style={styles.detailsTab}>
                            <h3>Document Details</h3>
                            <div style={styles.formGroup}>
                                <label>Author:</label>
                                <input
                                    type="text"
                                    value={author}
                                    onChange={(e) => setAuthor(e.target.value)}
                                    style={styles.input}
                                    placeholder="Enter author name"
                                />
                            </div>
                            <div style={styles.formGroup}>
                                <label>Tags (comma separated):</label>
                                <input
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    style={styles.input}
                                    placeholder="tag1, tag2, tag3"
                                />
                            </div>
                            {selectedId && (
                                <div style={styles.infoBox}>
                                    <p><strong>ID:</strong> {selectedId}</p>
                                    <p><strong>Version:</strong> {
                                        savedContents.find(c => c.id === selectedId)?.version || 1
                                    }</p>
                                    <p><strong>Created:</strong> {
                                        new Date(savedContents.find(c => c.id === selectedId)?.createdAt).toLocaleString()
                                    }</p>
                                    <p><strong>Last Updated:</strong> {
                                        new Date(savedContents.find(c => c.id === selectedId)?.updatedAt).toLocaleString()
                                    }</p>
                                </div>
                            )}
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
                                    <input type="checkbox" /> Show word count
                                </label>
                            </div>
                            <div style={styles.settingItem}>
                                <label>Editor Theme: </label>
                                <select style={styles.select} value={darkMode ? 'dark' : 'light'}
                                        onChange={(e) => setDarkMode(e.target.value === 'dark')}>
                                    <option value="light">Light</option>
                                    <option value="dark">Dark</option>
                                </select>
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
                                <h2>{title || 'Untitled'}</h2>
                                <p style={styles.previewMeta}>By: {author || 'Anonymous'}</p>
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
    notification: {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 24px',
        borderRadius: '8px',
        color: 'white',
        zIndex: 1000,
        animation: 'slideIn 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
        width: "320px",
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        overflowY: "auto",
    },
    darkSidebar: {
        width: "320px",
        background: "#2d2d2d",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        overflowY: "auto",
        color: "white",
    },
    sidebarHeader: {
        marginBottom: "15px",
    },
    sidebarTitle: {
        margin: "0 0 10px 0",
        fontSize: "16px",
        fontWeight: "600",
    },
    searchInput: {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "14px",
        marginBottom: "10px",
    },
    loadingMessage: {
        textAlign: "center",
        color: "#999",
        fontStyle: "italic",
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
        borderRadius: "8px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        transition: "transform 0.3s",
        cursor: "pointer",
    },
    versionInfo: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        flex: 1,
    },
    dateText: {
        fontSize: "11px",
        color: "#999",
    },
    tagContainer: {
        display: "flex",
        flexWrap: "wrap",
        gap: "4px",
        marginTop: "4px",
    },
    tag: {
        fontSize: "10px",
        padding: "2px 6px",
        background: "#e0e0e0",
        borderRadius: "12px",
        color: "#666",
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
        transition: "background 0.3s",
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
    detailsTab: {
        padding: "20px",
    },
    formGroup: {
        marginBottom: "15px",
    },
    input: {
        width: "100%",
        padding: "8px 12px",
        border: "1px solid #ddd",
        borderRadius: "6px",
        fontSize: "14px",
        marginTop: "4px",
    },
    infoBox: {
        background: "#f8f9fa",
        padding: "15px",
        borderRadius: "8px",
        marginTop: "20px",
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
        width: "350px",
        background: "white",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
        overflowY: "auto",
    },
    darkPreview: