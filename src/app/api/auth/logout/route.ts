import { NextResponse } from 'next/server';

export async function POST() {
  // ลบ cookie
  return NextResponse.json(
    { success: true },
    {
      status: 200,
      headers: {
        'Set-Cookie': 'admin_token=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
      },
    }
  );
}

