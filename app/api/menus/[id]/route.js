import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Menu from '@/models/Menu';

// GET single menu
export async function GET(request, { params }) {
  try {
    await dbConnect();
    
    const menu = await Menu.findById(params.id)
      .populate('children')
      .lean();
    
    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: menu 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// PUT update menu
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    const menu = await Menu.findByIdAndUpdate(
      params.id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: menu 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// DELETE menu
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    
    const menu = await Menu.findById(params.id);
    
    if (!menu) {
      return NextResponse.json(
        { success: false, error: 'Menu not found' },
        { status: 404 }
      );
    }
    
    // Remove from parent's children array
    if (menu.parentId) {
      await Menu.findByIdAndUpdate(
        menu.parentId,
        { $pull: { children: menu._id } }
      );
    }
    
    // Delete all children recursively
    await Menu.deleteMany({ parentId: menu._id });
    
    // Delete the menu itself
    await menu.deleteOne();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Menu deleted successfully' 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}