import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Slide from '@/models/Slide';

export async function POST(request) {
  try {
    await connectDB();
    
    const { slides } = await request.json();

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { success: false, error: 'Invalid slides data' },
        { status: 400 }
      );
    }

    // Update order for each slide
    for (const slide of slides) {
      await Slide.findByIdAndUpdate(slide.id, { order: slide.order });
    }

    return NextResponse.json({
      success: true,
      message: 'Slides reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering slides:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reorder slides' },
      { status: 500 }
    );
  }
}