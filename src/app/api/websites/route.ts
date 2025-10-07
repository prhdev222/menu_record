import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type { Website } from '@/lib/types';
import { store } from '@/lib/store';

export async function GET() {
  const websites = await store.getAll();
  return NextResponse.json(websites);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const websites = await store.getAll();

    const newWebsite: Website = {
      id: uuidv4(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    websites.push(newWebsite);
    await store.setAll(websites);

    return NextResponse.json(newWebsite, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create website' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const websites = await store.getAll();
    const index = websites.findIndex(w => w.id === id);

    if (index === -1) {
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    websites[index] = { ...websites[index], ...updates, updatedAt: new Date().toISOString() };
    await store.setAll(websites);

    return NextResponse.json(websites[index]);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update website' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const websites = await store.getAll();
    const filtered = websites.filter(w => w.id !== id);
    await store.setAll(filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
  }
}


