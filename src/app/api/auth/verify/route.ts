import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    // ดึง token จาก cookie
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // ตรวจสอบว่าตั้ง JWT_SECRET หรือยัง
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('🚨 [Security] JWT_SECRET is not set!');
      return NextResponse.json({ authenticated: false }, { status: 500 });
    }

    // Verify token
    const secret = new TextEncoder().encode(JWT_SECRET);

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

