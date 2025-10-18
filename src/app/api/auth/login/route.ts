import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';

export async function POST(request: NextRequest) {
  try {
    console.log('🟢 Login API called');
    const { username, password } = await request.json();
    console.log('📡 Login attempt:', { username, passwordLength: password?.length });

    // ดึง credentials จาก environment variables (บังคับต้องตั้ง!)
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const JWT_SECRET = process.env.JWT_SECRET;

    console.log('🔍 Environment Variables:');
    console.log('ADMIN_USERNAME:', ADMIN_USERNAME ? `'${ADMIN_USERNAME}'` : '❌ NOT SET');
    console.log('ADMIN_PASSWORD:', ADMIN_PASSWORD ? `'${ADMIN_PASSWORD}'` : '❌ NOT SET');
    console.log('JWT_SECRET:', JWT_SECRET ? '✅ SET' : '❌ NOT SET');

    // ตรวจสอบว่าตั้ง Environment Variables หรือยัง
    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
      console.error('🚨 [Security] Missing required environment variables!');
      console.error('ADMIN_USERNAME:', ADMIN_USERNAME ? '✅' : '❌ NOT SET');
      console.error('ADMIN_PASSWORD:', ADMIN_PASSWORD ? '✅' : '❌ NOT SET');
      console.error('JWT_SECRET:', JWT_SECRET ? '✅' : '❌ NOT SET');
      return NextResponse.json(
        { success: false, message: 'เซิร์ฟเวอร์ไม่ได้ตั้งค่าที่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ' },
        { status: 500 }
      );
    }

    console.log('🔍 Comparing credentials:');
    console.log('Username match:', username === ADMIN_USERNAME);
    console.log('Password match:', password === ADMIN_PASSWORD);

    // ตรวจสอบ credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      console.log('✅ Credentials match, creating token...');
      // สร้าง JWT token
      const secret = new TextEncoder().encode(JWT_SECRET);

      const token = await new SignJWT({ username, role: 'admin' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // token หมดอายุใน 24 ชั่วโมง
        .sign(secret);

      console.log('✅ Token created successfully');
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
      console.log('❌ Credentials do not match');
      return NextResponse.json(
        { success: false, message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('❌ [Auth] Login error:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาด' },
      { status: 500 }
    );
  }
}

