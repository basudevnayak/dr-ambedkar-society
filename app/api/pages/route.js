import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Page from '@/models/Page';

// GET - Fetch all pages
export async function GET(request) {
  try {
    await dbConnect();
    const pages = await Page.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST - Create new page
export async function POST(request) {
  try {
    await dbConnect();
    const body = await request.json();
    const page = await Page.create(body);
    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update page (if needed)
export async function PUT(request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

// DELETE - Delete page (if needed)
export async function DELETE(request) {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}