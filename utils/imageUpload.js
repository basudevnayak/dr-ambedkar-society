import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

// Configuration
const UPLOAD_CONFIG = {
  width: 1920,
  height: 1080,
  quality: 80,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  outputFormat: 'webp',
};

// Ensure upload directory exists
export async function ensureUploadDir() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'slides');
  try {
    await fs.access(uploadDir);
  } catch {
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('Created upload directory:', uploadDir);
  }
  return uploadDir;
}

// Validate file
function validateFile(file) {
  if (!UPLOAD_CONFIG.allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${UPLOAD_CONFIG.allowedTypes.join(', ')}`);
  }

  if (file.size > UPLOAD_CONFIG.maxFileSize) {
    throw new Error(`File too large. Max size: ${UPLOAD_CONFIG.maxFileSize / 1024 / 1024}MB`);
  }
}

// Process and optimize image
export async function processImage(buffer, options = {}) {
  const {
    width = UPLOAD_CONFIG.width,
    height = UPLOAD_CONFIG.height,
    quality = UPLOAD_CONFIG.quality,
    fit = 'cover',
  } = options;

  try {
    // Get original dimensions for logging
    const metadata = await sharp(buffer).metadata();
    console.log('Original:', {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: `${(buffer.length / 1024).toFixed(2)}KB`
    });

    // Process image
    const processedBuffer = await sharp(buffer)
      .resize(width, height, {
        fit: fit,
        position: 'center',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality })
      .toBuffer();

    // Get processed dimensions
    const processedMetadata = await sharp(processedBuffer).metadata();
    console.log('Processed:', {
      width: processedMetadata.width,
      height: processedMetadata.height,
      format: processedMetadata.format,
      size: `${(processedBuffer.length / 1024).toFixed(2)}KB`,
      reduction: `${((1 - processedBuffer.length / buffer.length) * 100).toFixed(1)}% smaller`
    });

    return processedBuffer;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
}

// Save uploaded file
export async function saveUploadedFile(file, options = {}) {
  try {
    // Validate file
    validateFile(file);

    // Ensure upload directory exists
    const uploadDir = await ensureUploadDir();

    // Read file buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Process image
    const processedBuffer = await processImage(buffer, options);

    // Generate unique filename
    const filename = `${uuidv4()}.${UPLOAD_CONFIG.outputFormat}`;
    const filepath = path.join(uploadDir, filename);

    // Save processed image
    await fs.writeFile(filepath, processedBuffer);
    console.log('File saved:', filepath);

    // Return file info
    return {
      url: `/uploads/slides/${filename}`,
      filename: filename,
      size: processedBuffer.length,
      originalSize: buffer.length,
      dimensions: {
        width: options.width || UPLOAD_CONFIG.width,
        height: options.height || UPLOAD_CONFIG.height,
      },
    };
  } catch (error) {
    console.error('Error saving file:', error);
    throw error;
  }
}

// Delete file
export async function deleteFile(fileUrl) {
  try {
    if (!fileUrl) return;

    const filename = path.basename(fileUrl);
    const filepath = path.join(process.cwd(), 'public', 'uploads', 'slides', filename);

    try {
      await fs.access(filepath);
      await fs.unlink(filepath);
      console.log('File deleted:', filepath);
    } catch {
      console.log('File not found:', filepath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
}

// Batch process multiple files
export async function batchProcessFiles(files, options = {}) {
  const results = [];

  for (const file of files) {
    try {
      const result = await saveUploadedFile(file, options);
      results.push({
        success: true,
        ...result,
        originalName: file.name,
      });
    } catch (error) {
      results.push({
        success: false,
        originalName: file.name,
        error: error.message,
      });
    }
  }

  return results;
}