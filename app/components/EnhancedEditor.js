// components/EnhancedEditor.js
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';
import { MyCustomUploadAdapterPlugin } from './ckeditor/uploadAdapter';

const EnhancedEditor = ({ initialData, onChange, onImageUpload }) => {
  const editorConfiguration = {
    toolbar: {
      items: [
        'heading', '|',
        'bold', 'italic', 'underline', 'strikethrough', '|',
        'alignment', '|',
        'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', '|',
        'link', '|',
        'bulletedList', 'numberedList', 'outdent', 'indent', '|',
        'imageUpload', 'insertTable', 'mediaEmbed', 'blockQuote', '|',
        'undo', 'redo', '|',
        'sourceEditing'
      ]
    },
    image: {
      toolbar: [
        'imageTextAlternative', 
        'imageStyle:inline',
        'imageStyle:block', 
        'imageStyle:side',
        '|',
        'toggleImageCaption',
        'imageResize'
      ],
      styles: [
        'full', 
        'side', 
        'alignLeft', 
        'alignCenter', 
        'alignRight'
      ],
      resizeOptions: [
        {
          name: 'resizeImage:original',
          label: 'Original',
          value: null
        },
        {
          name: 'resizeImage:50',
          label: '50%',
          value: '50'
        },
        {
          name: 'resizeImage:75',
          label: '75%',
          value: '75'
        }
      ]
    },
    table: {
      contentToolbar: [
        'tableColumn', 
        'tableRow', 
        'mergeTableCells',
        'tableCellProperties',
        'tableProperties'
      ]
    },
    fontFamily: {
      options: [
        'default',
        'Arial, Helvetica, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Lucida Sans Unicode, Lucida Grande, sans-serif',
        'Tahoma, Geneva, sans-serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif'
      ]
    },
    fontSize: {
      options: [
        9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 36, 48
      ]
    },
    // Allow custom attributes for images
    htmlSupport: {
      allow: [
        {
          name: /^.*$/,
          attributes: true,
          classes: true,
          styles: true
        }
      ]
    },
    placeholder: 'Start writing your content...',
    extraPlugins: [MyCustomUploadAdapterPlugin],
  };

  return (
    <div className="enhanced-editor-wrapper">
      <CKEditor
        editor={ClassicEditor}
        config={editorConfiguration}
        data={initialData}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
        onReady={(editor) => {
          console.log('Editor is ready to use!');
        }}
      />
    </div>
  );
};

export default EnhancedEditor;