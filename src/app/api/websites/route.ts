import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import type { Website } from '@/lib/types';
import { store } from '@/lib/store';
import { revalidatePath, revalidateTag } from 'next/cache';

// Enable caching for GET requests (10 seconds for faster updates)
export const revalidate = 10;

export async function GET() {
  const websites = await store.getAll();
  return NextResponse.json(websites, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🟢 POST /api/websites called');
    const body = await request.json();
    console.log('📡 Request body:', body);

    const websites = await store.getAll();
    console.log('📡 Current websites count:', websites.length);

    const newWebsite: Website = {
      id: uuidv4(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log('🔵 Creating new website:', newWebsite);
    websites.push(newWebsite);
    await store.setAll(websites);
    console.log('✅ Website saved to store');

    // Revalidate the home page and all related pages
    revalidatePath('/');
    revalidatePath('/', 'page');
    revalidateTag('websites');
    console.log('✅ Cache revalidated');

    return NextResponse.json(newWebsite, { status: 201 });
  } catch (error) {
    console.error('❌ POST /api/websites error:', error);
    return NextResponse.json({ error: 'Failed to create website: ' + (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🟢 PUT /api/websites called');
    const body = await request.json();
    console.log('📡 Request body:', body);
    const { id, ...updates } = body;

    const websites = await store.getAll();
    console.log('📡 Current websites count:', websites.length);
    const index = websites.findIndex(w => w.id === id);

    if (index === -1) {
      console.error('❌ Website not found with id:', id);
      return NextResponse.json({ error: 'Website not found' }, { status: 404 });
    }

    console.log('🔵 Updating website at index:', index);
    websites[index] = { ...websites[index], ...updates, updatedAt: new Date().toISOString() };
    await store.setAll(websites);
    console.log('✅ Website updated in store');

    // Revalidate the home page and all related pages
    revalidatePath('/');
    revalidatePath('/', 'page');
    revalidateTag('websites');
    console.log('✅ Cache revalidated');

    return NextResponse.json(websites[index]);
  } catch (error) {
    console.error('❌ PUT /api/websites error:', error);
    return NextResponse.json({ error: 'Failed to update website: ' + (error as Error).message }, { status: 500 });
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

    // Revalidate the home page and all related pages
    revalidatePath('/');
    revalidatePath('/', 'page');
    revalidateTag('websites');

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete website' }, { status: 500 });
  }
}


