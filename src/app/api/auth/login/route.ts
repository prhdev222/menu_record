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

    // ใช้ค่า default ถ้าไม่มี environment variables
    const finalUsername = ADMIN_USERNAME || 'admin';
    const finalPassword = ADMIN_PASSWORD || 'prh1234';
    const finalJwtSecret = JWT_SECRET || '93b285e7fcc69465f7e4ec25ddcf730fb6a70200b94772d51edfd145d3f33834';
    
    console.log('🔍 Using credentials:');
    console.log('Username:', finalUsername);
    console.log('Password:', finalPassword ? '✅ SET' : '❌ NOT SET');
    console.log('JWT_SECRET:', finalJwtSecret ? '✅ SET' : '❌ NOT SET');

    console.log('🔍 Comparing credentials:');
    console.log('Username match:', username === finalUsername);
    console.log('Password match:', password === finalPassword);

    // ตรวจสอบ credentials
    if (username === finalUsername && password === finalPassword) {
      console.log('✅ Credentials match, creating token...');
      // สร้าง JWT token
      const secret = new TextEncoder().encode(finalJwtSecret);

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

