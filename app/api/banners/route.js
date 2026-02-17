import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Banner from '@/models/Banner';
import { saveImage, deleteImage } from '@/utils/fileUpload';

// GET - Fetch all banners or single banner
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const banner = await Banner.findById(id);
      
      if (!banner) {
        return NextResponse.json(
          { success: false, error: 'Banner not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ success: true, data: banner });
    }

    const banners = await Banner.find().sort({ order: 1 });
    
    return NextResponse.json({ success: true, data: banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch banners' },
      { status: 500 }
    );
  }
}

// POST - Create new banner
export async function POST(request) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    
    // Get form data
    const title = formData.get('title');
    const description = formData.get('description');
    const buttonText = formData.get('buttonText');
    const link = formData.get('link');
    const alt = formData.get('alt');
    const icon = formData.get('icon');
    const gradientLight = formData.get('gradientLight');
    const buttonColorLight = formData.get('buttonColorLight');
    const gradientDark = formData.get('gradientDark');
    const buttonColorDark = formData.get('buttonColorDark');
    const order = parseInt(formData.get('order')) || 0;
    const isActive = formData.get('isActive') === 'true';
    
    // Validate required fields
    if (!title || !description || !buttonText || !link || !alt || !icon) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Handle image upload
    const imageFile = formData.get('image');
    if (!imageFile) {
      return NextResponse.json(
        { success: false, error: 'Image is required' },
        { status: 400 }
      );
    }

    // Save image
    let imagePath;
    try {
      imagePath = await saveImage(imageFile);
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Create banner in database
    const banner = await Banner.create({
      title,
      description,
      buttonText,
      link,
      image: imagePath,
      alt,
      icon,
      gradientLight: gradientLight || 'from-blue-800 to-blue-600',
      buttonColorLight: buttonColorLight || 'text-blue-700',
      gradientDark: gradientDark || 'from-blue-900 to-blue-700',
      buttonColorDark: buttonColorDark || 'text-blue-300',
      order,
      isActive
    });

    return NextResponse.json({ 
      success: true, 
      data: banner,
      message: 'Banner created successfully' 
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create banner' },
      { status: 500 }
    );
  }
}

// PUT - Update banner
export async function PUT(request) {
  try {
    await connectDB();
    
    const formData = await request.formData();
    const id = formData.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    // Check if banner exists
    const existingBanner = await Banner.findById(id);
    if (!existingBanner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Get form data
    const title = formData.get('title');
    const description = formData.get('description');
    const buttonText = formData.get('buttonText');
    const link = formData.get('link');
    const alt = formData.get('alt');
    const icon = formData.get('icon');
    const gradientLight = formData.get('gradientLight');
    const buttonColorLight = formData.get('buttonColorLight');
    const gradientDark = formData.get('gradientDark');
    const buttonColorDark = formData.get('buttonColorDark');
    const order = parseInt(formData.get('order')) || 0;
    const isActive = formData.get('isActive') === 'true';
    
    // Handle image upload if new image provided
    const imageFile = formData.get('image');
    let imagePath = existingBanner.image;
    
    if (imageFile && imageFile.size > 0) {
      try {
        // Save new image
        imagePath = await saveImage(imageFile);
        
        // Delete old image
        await deleteImage(existingBanner.image);
      } catch (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
    }

    // Update banner
    const updatedBanner = await Banner.findByIdAndUpdate(
      id,
      {
        title: title || existingBanner.title,
        description: description || existingBanner.description,
        buttonText: buttonText || existingBanner.buttonText,
        link: link || existingBanner.link,
        image: imagePath,
        alt: alt || existingBanner.alt,
        icon: icon || existingBanner.icon,
        gradientLight: gradientLight || existingBanner.gradientLight,
        buttonColorLight: buttonColorLight || existingBanner.buttonColorLight,
        gradientDark: gradientDark || existingBanner.gradientDark,
        buttonColorDark: buttonColorDark || existingBanner.buttonColorDark,
        order: order || existingBanner.order,
        isActive: isActive !== undefined ? isActive : existingBanner.isActive,
      },
      { new: true }
    );

    return NextResponse.json({ 
      success: true, 
      data: updatedBanner,
      message: 'Banner updated successfully' 
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update banner' },
      { status: 500 }
    );
  }
}

// DELETE - Delete banner
export async function DELETE(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Banner ID is required' },
        { status: 400 }
      );
    }

    // Check if banner exists
    const banner = await Banner.findById(id);
    if (!banner) {
      return NextResponse.json(
        { success: false, error: 'Banner not found' },
        { status: 404 }
      );
    }

    // Delete image file
    await deleteImage(banner.image);

    // Delete from database
    await Banner.findByIdAndDelete(id);

    return NextResponse.json({ 
      success: true, 
      message: 'Banner deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete banner' },
      { status: 500 }
    );
  }
}