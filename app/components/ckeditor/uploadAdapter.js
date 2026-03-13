// components/ckeditor/uploadAdapter.js
import axios from 'axios';

// Custom upload adapter for handling image uploads to your server
class MyUploadAdapter {
  constructor(loader) {
    this.loader = loader;
  }

  async upload() {
    const data = new FormData();
    
    try {
      const file = await this.loader.file;
      data.append('image', file);
      
      // Replace with your actual API endpoint
      const response = await axios.post('/api/upload/image', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Handle successful upload
      return {
        default: response.data.url, // Main image URL
        // Optional: Add responsive image variants
        'data-id': response.data.id,
        'data-caption': response.data.caption || '',
      };
    } catch (error) {
      throw new Error('Upload failed');
    }
  }

  abort() {
    // Handle abort if needed
  }
}

// Plugin to integrate the upload adapter
export function MyCustomUploadAdapterPlugin(editor) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader) => {
    return new MyUploadAdapter(loader);
  };
}