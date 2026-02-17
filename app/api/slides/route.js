import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Slide from '@/models/Slide';
import { saveUploadedFile, deleteFile } from '@/utils/imageUpload';

// ============================================
// GET - Fetch all slides or single slide
// ============================================
export async function GET(request) {
  console.log('\n');
  console.log('='.repeat(80));
  console.log('📥 GET REQUEST RECEIVED');
  console.log('='.repeat(80));
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('Fetching slides...');
    console.log('ID:', id || 'all slides');

    // Connect to database
    await connectDB();
    console.log('✅ Database connected');

    if (id) {
      // Fetch single slide
      const slide = await Slide.findById(id);
      
      if (!slide) {
        console.log('❌ Slide not found:', id);
        return NextResponse.json(
          { success: false, error: 'Slide not found' },
          { status: 404 }
        );
      }
      
      console.log('✅ Slide found:', slide._id);
      return NextResponse.json({ success: true, data: slide });
    }

    // Fetch all slides
    const slides = await Slide.find().sort({ order: 1 });
    console.log(`✅ Found ${slides.length} slides`);
    
    return NextResponse.json({ success: true, data: slides });
    
  } catch (error) {
    console.error('❌ Error fetching slides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch slides' },
      { status: 500 }
    );
  }
}

// ============================================
// POST - Create new slide with image upload
// ============================================
export async function POST(request) {
  console.log('\n');
  console.log('='.repeat(80));
  console.log('📥 POST REQUEST RECEIVED - CREATE SLIDE');
  console.log('='.repeat(80));
  
  try {
    // Get content type
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    // Handle FormData (file upload)
    if (contentType.includes('multipart/form-data')) {
      console.log('📦 Processing FormData upload...');
      
      // Parse form data
      const formData = await request.formData();
      console.log('FormData received');
      
      // Log all form data entries
      console.log('\n📋 FORM DATA ENTRIES:');
      const formDataObj = {};
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  🔵 ${key}: [FILE]`);
          console.log(`     - name: ${value.name}`);
          console.log(`     - size: ${value.size} bytes (${(value.size / 1024).toFixed(2)} KB)`);
          console.log(`     - type: ${value.type}`);
          formDataObj[key] = `[FILE: ${value.name}, ${(value.size / 1024).toFixed(2)}KB]`;
        } else {
          console.log(`  🟢 ${key}: ${value}`);
          formDataObj[key] = value;
        }
      }
      
      console.log('\n📦 FormData as object:', JSON.stringify(formDataObj, null, 2));

      // Get form fields
      const imageFile = formData.get('image');
      const alt = formData.get('alt');
      const title = formData.get('title') || '';
      const description = formData.get('description') || '';
      const order = parseInt(formData.get('order')) || 0;
      const isActive = formData.get('isActive') === 'true';

      // Validate required fields
      if (!imageFile) {
        return NextResponse.json(
          { success: false, error: 'Image file is required' },
          { status: 400 }
        );
      }

      if (!alt) {
        return NextResponse.json(
          { success: false, error: 'Alt text is required' },
          { status: 400 }
        );
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Invalid file type',
            details: `Allowed: ${allowedTypes.join(', ')}`
          },
          { status: 400 }
        );
      }

      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024;
      if (imageFile.size > maxSize) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'File too large',
            details: `Max size: ${maxSize / 1024 / 1024}MB`
          },
          { status: 400 }
        );
      }

      // Process and save image
      console.log('\n🖼️ Processing image...');
      let uploadedImage;
      try {
        uploadedImage = await saveUploadedFile(imageFile, {
          width: 1920,
          height: 1080,
          quality: 80,
        });
        console.log('✅ Image processed:', uploadedImage);
      } catch (uploadError) {
        console.error('Image processing error:', uploadError);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to process image',
            details: uploadError.message 
          },
          { status: 500 }
        );
      }

      // Connect to database
      console.log('\n📦 Connecting to database...');
      await connectDB();
      console.log('✅ Database connected');

      // Create slide
      console.log('\n📋 Creating slide with data:');
      const slideData = {
        image: uploadedImage.url,
        imageInfo: {
          filename: uploadedImage.filename,
          size: uploadedImage.size,
          originalSize: uploadedImage.originalSize,
          dimensions: uploadedImage.dimensions,
        },
        alt: String(alt).trim(),
        title: String(title).trim(),
        description: String(description).trim(),
        order: Number(order),
        isActive: Boolean(isActive),
      };
      
      console.log(JSON.stringify(slideData, null, 2));
      
      const slide = await Slide.create(slideData);
      console.log('✅ Slide created with ID:', slide._id);

      return NextResponse.json({ 
        success: true, 
        data: slide,
        message: 'Slide created successfully' 
      });
    }
    
    // Handle JSON data (if you still need it)
    else if (contentType.includes('application/json')) {
      console.log('📦 Processing JSON upload...');
      
      // Parse JSON
      const body = await request.json();
      console.log('JSON body:', JSON.stringify(body, null, 2));

      const { image, alt, title, description, order, isActive } = body;

      // Validate required fields
      if (!image || !alt) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Image URL and alt text are required' 
          },
          { status: 400 }
        );
      }

      // Connect to database
      await connectDB();

      // Create slide
      const slide = await Slide.create({
        image: String(image).trim(),
        alt: String(alt).trim(),
        title: title ? String(title).trim() : '',
        description: description ? String(description).trim() : '',
        order: Number(order) || 0,
        isActive: isActive === true || isActive === 'true',
      });

      return NextResponse.json({ 
        success: true, 
        data: slide,
        message: 'Slide created successfully' 
      });
    }
    
    // Unsupported content type
    else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unsupported content type',
          details: `Expected multipart/form-data or application/json, got ${contentType}`
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('\n❌ Error in POST request:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create slide',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// ============================================
// PUT - Update slide
// ============================================
export async function PUT(request) {
  console.log('\n');
  console.log('='.repeat(80));
  console.log('📥 PUT REQUEST RECEIVED - UPDATE SLIDE');
  console.log('='.repeat(80));
  
  try {
    const contentType = request.headers.get('content-type') || '';
    console.log('Content-Type:', contentType);

    // Handle FormData (file upload)
    if (contentType.includes('multipart/form-data')) {
      console.log('📦 Processing FormData update...');
      
      // Parse form data
      const formData = await request.formData();
      
      // Log all form data entries
      console.log('\n📋 FORM DATA ENTRIES:');
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(`  🔵 ${key}: [FILE] ${value.name} (${(value.size / 1024).toFixed(2)} KB)`);
        } else {
          console.log(`  🟢 ${key}: ${value}`);
        }
      }

      // Get form fields
      const id = formData.get('id');
      const imageFile = formData.get('image');
      const alt = formData.get('alt');
      const title = formData.get('title') || '';
      const description = formData.get('description') || '';
      const order = parseInt(formData.get('order')) || 0;
      const isActive = formData.get('isActive') === 'true';

      // Validate required fields
      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Slide ID is required' },
          { status: 400 }
        );
      }

      if (!alt) {
        return NextResponse.json(
          { success: false, error: 'Alt text is required' },
          { status: 400 }
        );
      }

      // Connect to database
      console.log('\n📦 Connecting to database...');
      await connectDB();
      console.log('✅ Database connected');

      // Find existing slide
      const existingSlide = await Slide.findById(id);
      if (!existingSlide) {
        return NextResponse.json(
          { success: false, error: 'Slide not found' },
          { status: 404 }
        );
      }
      console.log('✅ Found existing slide:', existingSlide._id);

      // Prepare update data
      const updateData = {
        alt: String(alt).trim(),
        title: String(title).trim(),
        description: String(description).trim(),
        order: Number(order),
        isActive: Boolean(isActive),
      };

      // Handle image upload if new image provided
      if (imageFile && imageFile.size > 0) {
        console.log('\n🖼️ Processing new image...');
        
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(imageFile.type)) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'Invalid file type',
              details: `Allowed: ${allowedTypes.join(', ')}`
            },
            { status: 400 }
          );
        }

        // Validate file size
        const maxSize = 10 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          return NextResponse.json(
            { 
              success: false, 
              error: 'File too large',
              details: `Max size: ${maxSize / 1024 / 1024}MB`
            },
            { status: 400 }
          );
        }

        // Process and save new image
        try {
          const uploadedImage = await saveUploadedFile(imageFile, {
            width: 1920,
            height: 1080,
            quality: 80,
          });
          
          updateData.image = uploadedImage.url;
          updateData.imageInfo = {
            filename: uploadedImage.filename,
            size: uploadedImage.size,
            originalSize: uploadedImage.originalSize,
            dimensions: uploadedImage.dimensions,
          };

          // Delete old image file
          await deleteFile(existingSlide.image);
          console.log('✅ Old image deleted');
          
        } catch (uploadError) {
          console.error('Image processing error:', uploadError);
          return NextResponse.json(
            { 
              success: false, 
              error: 'Failed to process image',
              details: uploadError.message 
            },
            { status: 500 }
          );
        }
      }

      // Update slide
      console.log('\n📋 Updating slide with data:');
      console.log(JSON.stringify(updateData, null, 2));
      
      const updatedSlide = await Slide.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      console.log('✅ Slide updated successfully');

      return NextResponse.json({ 
        success: true, 
        data: updatedSlide,
        message: 'Slide updated successfully' 
      });
    }
    
    // Handle JSON data
    else if (contentType.includes('application/json')) {
      console.log('📦 Processing JSON update...');
      
      const body = await request.json();
      console.log('JSON body:', JSON.stringify(body, null, 2));

      const { id, image, alt, title, description, order, isActive } = body;

      if (!id) {
        return NextResponse.json(
          { success: false, error: 'Slide ID is required' },
          { status: 400 }
        );
      }

      await connectDB();

      const existingSlide = await Slide.findById(id);
      if (!existingSlide) {
        return NextResponse.json(
          { success: false, error: 'Slide not found' },
          { status: 404 }
        );
      }

      const updateData = {
        alt: alt || existingSlide.alt,
        title: title || existingSlide.title,
        description: description || existingSlide.description,
        order: Number(order) || existingSlide.order,
        isActive: isActive !== undefined ? isActive : existingSlide.isActive,
      };

      if (image && image !== existingSlide.image) {
        updateData.image = String(image).trim();
      }

      const updatedSlide = await Slide.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );

      return NextResponse.json({ 
        success: true, 
        data: updatedSlide,
        message: 'Slide updated successfully' 
      });
    }
    
    else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unsupported content type',
          details: `Expected multipart/form-data or application/json, got ${contentType}`
        },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('\n❌ Error in PUT request:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update slide',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// ============================================
// DELETE - Delete slide
// ============================================
export async function DELETE(request) {
  console.log('\n');
  console.log('='.repeat(80));
  console.log('📥 DELETE REQUEST RECEIVED');
  console.log('='.repeat(80));
  
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    console.log('Slide ID to delete:', id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Slide ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    console.log('\n📦 Connecting to database...');
    await connectDB();
    console.log('✅ Database connected');

    // Find slide
    const slide = await Slide.findById(id);
    if (!slide) {
      console.log('❌ Slide not found:', id);
      return NextResponse.json(
        { success: false, error: 'Slide not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found slide:', slide._id);
    console.log('Image path:', slide.image);

    // Delete image file
    if (slide.image) {
      console.log('\n🗑️ Deleting image file...');
      await deleteFile(slide.image);
      console.log('✅ Image file deleted');
    }

    // Delete from database
    await Slide.findByIdAndDelete(id);
    console.log('✅ Slide deleted from database');

    return NextResponse.json({ 
      success: true, 
      message: 'Slide deleted successfully' 
    });

  } catch (error) {
    console.error('\n❌ Error in DELETE request:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete slide',
        details: error.message 
      },
      { status: 500 }
    );
  }
}