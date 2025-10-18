import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function GET(request: NextRequest) {
  try {
    // ดึง token จาก cookie
    const token = request.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    // ใช้ค่า default ถ้าไม่มี JWT_SECRET
    const JWT_SECRET = process.env.JWT_SECRET || '93b285e7fcc69465f7e4ec25ddcf730fb6a70200b94772d51edfd145d3f33834';

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

