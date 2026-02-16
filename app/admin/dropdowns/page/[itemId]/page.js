// app/admin/dropdowns/page/[itemId]/page.jsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import CKEditor to avoid SSR issues
const CKEditor = dynamic(
  () => import('@ckeditor/ckeditor5-react').then(mod => mod.CKEditor),
  { ssr: false }
);

const ClassicEditor = dynamic(
  () => import('@ckeditor/ckeditor5-build-classic'),
  { ssr: false }
);

export default function PageEditor({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [item, setItem] = useState(null);
  const [content, setContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');

  useEffect(() => {
    fetchPageContent();
  }, [params.itemId]);

  const fetchPageContent = async () => {
    try {
      const response = await fetch(`/api/dropdowns/items/${params.itemId}`);
      const data = await response.json();
      
      if (response.ok) {
        setItem(data.item);
        setContent(data.item.pageContent?.content || '');
        setHtmlContent(data.item.pageContent?.html || '');
      } else {
        setError('Failed to load page content');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/dropdowns/items/${params.itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          html: htmlContent
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Page content saved successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(data.error || 'Failed to save content');
      }
    } catch (error) {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setContent(data);
    setHtmlContent(data);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
          <p className="text-gray-600 dark:text-gray-400">Loading editor...</p>
        </div>
      </div>
    );
  }

  if (error && !item) {
    return (
      <div className="text-center py-12">
        <i className="fas fa-exclamation-circle text-5xl text-red-500 mb-4"></i>
        <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
          Error Loading Page
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
        <Link
          href="/admin/dropdowns"
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          <i className="fas fa-arrow-left mr-2"></i>
          Back to Dropdowns
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/dropdowns"
            className="mr-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <i className="fas fa-arrow-left text-gray-600 dark:text-gray-400"></i>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Edit Page: {item?.label}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Use the rich text editor to create and format your page content
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save mr-2"></i>
              Save Page
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-400 text-green-700 dark:text-green-400 rounded-lg flex items-center">
          <i className="fas fa-check-circle mr-2"></i>
          {success}
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>
              <i className="fas fa-file-alt mr-2"></i>
              Page: {item?.label}
            </span>
            <span>
              <i className="fas fa-hashtag mr-2"></i>
              ID: {item?.id}
            </span>
          </div>
        </div>

        <div className="p-6">
          {typeof window !== 'undefined' && (
            <CKEditor
              editor={ClassicEditor}
              data={content}
              onChange={handleEditorChange}
              config={{
                toolbar: [
                  'heading',
                  '|',
                  'bold',
                  'italic',
                  'link',
                  'bulletedList',
                  'numberedList',
                  '|',
                  'blockQuote',
                  'insertTable',
                  'mediaEmbed',
                  '|',
                  'undo',
                  'redo'
                ],
                heading: {
                  options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
                    { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
                    { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' }
                  ]
                },
                placeholder: 'Start writing your page content here...',
              }}
            />
          )}
        </div>
      </div>

      {/* Preview Section */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <i className="fas fa-eye mr-2 text-blue-600"></i>
          Preview
        </h3>
        <div className="prose dark:prose-invert max-w-none p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg min-h-[200px]">
          {htmlContent ? (
            <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No content yet. Start typing in the editor above to see preview.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}