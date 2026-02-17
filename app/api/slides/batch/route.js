import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Slide from '@/models/Slide';
import { batchProcessFiles } from '@/utils/imageUpload';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('images');
    const altTexts = JSON.parse(formData.get('altTexts') || '[]');

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No images provided' },
        { status: 400 }
      );
    }

    // Process all images
    const processedImages = await batchProcessFiles(files, {
      width: 1920,
      height: 1080,
      quality: 80,
    });

    await connectDB();

    // Create slides in database
    const createdSlides = [];
    const errors = [];

    for (let i = 0; i < processedImages.length; i++) {
      const result = processedImages[i];
      
      if (result.success) {
        const slide = await Slide.create({
          image: result.url,
          imageInfo: {
            filename: result.filename,
            size: result.size,
            originalSize: result.originalSize,
            dimensions: result.dimensions,
          },
          alt: altTexts[i] || `Slide ${i + 1}`,
          order: i,
          isActive: true,
        });
        createdSlides.push(slide);
      } else {
        errors.push({
          file: result.originalName,
          error: result.error,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: createdSlides,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully created ${createdSlides.length} slides`,
    });
  } catch (error) {
    console.error('Error in batch operation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process batch images' },
      { status: 500 }
    );
  }
}