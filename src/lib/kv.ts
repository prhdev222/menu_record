import { Redis } from '@upstash/redis';

// สร้าง Redis client จาก Upstash
// ใช้ environment variables ที่ตั้งใน Vercel
export const kv = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Log เพื่อยืนยันว่าเชื่อมต่อแล้ว (เฉพาะ development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔴 Using Upstash Redis:', process.env.KV_REST_API_URL);
}


