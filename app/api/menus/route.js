import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Menu from '@/models/Menu';

// GET all menus
export async function GET(request) {
  try {
    await dbConnect();
    
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get('parentId');
    const type = searchParams.get('type');
    
    let query = {};
    
    if (parentId === 'null') {
      query.parentId = null;
    } else if (parentId) {
      query.parentId = parentId;
    }
    
    if (type) {
      query.menuType = type;
    }
    
    const menus = await Menu.find(query)
      .sort({ order: 1 })
      .populate('children')
      .lean();
    
    return NextResponse.json({ 
      success: true, 
      data: menus 
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST create new menu
export async function POST(request) {
  try {
    await dbConnect();
    
    const body = await request.json();
    
    // Validate required fields
    if (!body.label) {
      return NextResponse.json(
        { success: false, error: 'Label is required' },
        { status: 400 }
      );
    }
    
    const menu = await Menu.create(body);
    
    // If parentId exists, add this menu to parent's children
    if (body.parentId) {
      await Menu.findByIdAndUpdate(
        body.parentId,
        { $push: { children: menu._id } }
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      data: menu 
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}