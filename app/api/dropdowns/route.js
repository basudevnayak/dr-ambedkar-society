// app/api/dropdowns/route.js
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DropdownMenu from '@/models/DropdownMenu';
import jwt from 'jsonwebtoken';

export async function GET() {
  try {
    await connectDB();
    const dropdowns = await DropdownMenu.find({ isActive: true })
      .sort({ order: 1 });
    return NextResponse.json({ dropdowns }, { status: 200 });
  } catch (error) {
    console.error('Error fetching dropdowns:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dropdowns' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'admin') {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await connectDB();
    const data = await request.json();
    
    const dropdown = await DropdownMenu.create(data);
    return NextResponse.json({ dropdown }, { status: 201 });
  } catch (error) {
    console.error('Error creating dropdown:', error);
    return NextResponse.json(
      { error: 'Failed to create dropdown' },
      { status: 500 }
    );
  }
}