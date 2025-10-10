import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // ดึง credentials จาก environment variables
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

    // ตรวจสอบ credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      // สร้าง JWT token
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'default-secret-change-this-in-production'
      );

      const token = await new SignJWT({ username, role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // token หมดอายุใน 24 ชั่วโมง
        .sign(secret);

      // ส่ง token กลับไปให้ client
      return NextResponse.json(
        { success: true, token },
        {
          status: 200,
          headers: {
            'Set-Cookie': `admin_token=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`,
          },
        }
      );
    } else {
      // Login ไม่สำเร็จ
      return NextResponse.json(
        { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('[Auth] Login error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

