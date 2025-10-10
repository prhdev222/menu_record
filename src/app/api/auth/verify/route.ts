import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    // ดึง token จาก cookie
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // Verify token
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'default-secret-change-this-in-production'
    );

    try {
      const { payload } = await jwtVerify(token, secret);
      return NextResponse.json({ authenticated: true, user: payload });
    } catch (error) {
      // Token ไม่ valid หรือหมดอายุ
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }
  } catch (error) {
    console.error('[Auth] Verify error:', error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

