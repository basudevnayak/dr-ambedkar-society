// pages/api/upload/image.js
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable the default body parser to handle form data
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Parse the incoming form data
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB limit
      filename: (name, ext, part) => {
        // Generate unique filename
        return `${Date.now()}-${part.originalFilename}`;
      },
    });

    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ error: 'Upload failed' });
      }

      const file = files.image || files.file;
      
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      // Handle both single and array file responses
      const uploadedFile = Array.isArray(file) ? file[0] : file;

      // Generate the URL for the uploaded file
      const fileUrl = `/uploads/${path.basename(uploadedFile.filepath)}`;

      // Return success response
      res.status(200).json({
        url: fileUrl,
        id: path.basename(uploadedFile.filepath, path.extname(uploadedFile.filepath)),
        filename: uploadedFile.originalFilename,
        size: uploadedFile.size,
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
}