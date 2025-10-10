import { kv } from '../src/lib/kv';
import { v4 as uuidv4 } from 'uuid';

const initialWebsites = [
  {
    id: uuidv4(),
    name: 'ระบบบันทึกข้อมูลสุขภาพ',
    url: 'https://patient-monitoring-app.vercel.app/',
    description: 'บันทึกค่าความดันโลหิตและน้ำตาลในเลือด เพื่อติดตามสุขภาพอย่างต่อเนื่อง',
    features: [
      'บันทึกความดันโลหิต (Systolic/Diastolic)',
      'บันทึกระดับน้ำตาลในเลือด',
      'ดูประวัติและกราฟแสดงผล',
      'ส่งออกข้อมูลเป็น PDF'
    ],
    targetGroup: 'พระสงฆ์และผู้ป่วยโรคเรื้อรัง',
    color: 'blue' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'ระบบบันทึกกิจกรรมเพื่อสุขภาพ',
    url: 'https://monk-activity.vercel.app/',
    description: 'บันทึกกิจกรรมประจำวัน คำนวณแคลอรี่ และติดตามการเลิกบุหรี่',
    features: [
      'บันทึกกิจกรรมประจำวัน (เดิน, วิ่ง, ปฏิบัติธรรม)',
      'คำนวณแคลอรี่ที่เผาผลาญ',
      'ติดตามการเลิกบุหรี่และเงินที่ประหยัดได้',
      'สถิติกิจกรรมรายวัน/รายสัปดาห์/รายเดือน'
    ],
    targetGroup: 'พระสงฆ์ที่ต้องการดูแลสุขภาพ',
    color: 'green' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

async function seed() {
  try {
    console.log('🌱 Starting seed...');
    console.log('🔴 Using Upstash Redis');
    
    await kv.set('websites', initialWebsites);
    
    console.log('✅ Seed completed successfully!');
    console.log(`📊 Added ${initialWebsites.length} websites to Upstash Redis`);
    
    // Verify data
    const check = await kv.get('websites');
    console.log(`🔍 Verification: ${Array.isArray(check) ? check.length : 0} websites stored`);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();




