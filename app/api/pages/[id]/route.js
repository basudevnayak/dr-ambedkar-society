import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Page from '@/models/Page';

// GET single page
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const page = await Page.findById(params.id).lean();
    if (!page) {
      return NextResponse.json({ success: false, error: 'Page not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT update page
export async function PUT(request, { params }) {
  try {
    await dbConnect();
    const body = await request.json();
    const page = await Page.findByIdAndUpdate(params.id, body, { new: true });
    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE page
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    await Page.findByIdAndDelete(params.id);
    return NextResponse.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}