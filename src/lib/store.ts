import { kv as vercelKv } from '@vercel/kv';
import type { Website } from '@/lib/types';

// In-memory fallback for local/dev when KV is not configured
let memoryStore: Website[] | null = null;

function getFallbackSeed(): Website[] {
  const now = new Date().toISOString();
  return [
    {
      id: 'sample-1',
      name: 'ระบบบันทึกข้อมูลสุขภาพ',
      url: 'https://patient-monitoring-app.vercel.app/',
      description: 'บันทึกค่าความดันโลหิตและน้ำตาลในเลือด เพื่อติดตามสุขภาพอย่างต่อเนื่อง',
      features: [
        'บันทึกความดันโลหิต (Systolic/Diastolic)',
        'บันทึกระดับน้ำตาลในเลือด',
        'ดูประวัติและกราฟแสดงผล',
        'ส่งออกข้อมูลเป็น PDF',
      ],
      targetGroup: 'พระสงฆ์และผู้ป่วยโรคเรื้อรัง',
      color: 'blue',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'sample-2',
      name: 'ระบบบันทึกกิจกรรมเพื่อสุขภาพ',
      url: 'https://monk-activity.vercel.app/',
      description: 'บันทึกกิจกรรมประจำวัน คำนวณแคลอรี่ และติดตามการเลิกบุหรี่',
      features: [
        'บันทึกกิจกรรมประจำวัน (เดิน, วิ่ง, ปฏิบัติธรรม)',
        'คำนวณแคลอรี่ที่เผาผลาญ',
        'ติดตามการเลิกบุหรี่และเงินที่ประหยัดได้',
        'สถิติกิจกรรมรายวัน/รายสัปดาห์/รายเดือน',
      ],
      targetGroup: 'พระสงฆ์ที่ต้องการดูแลสุขภาพ',
      color: 'green',
      createdAt: now,
      updatedAt: now,
    },
  ];
}

async function useKvAvailable(): Promise<boolean> {
  try {
    // Try a harmless read to detect connectivity
    await vercelKv.get('kv-health-check-ignore');
    return true;
  } catch {
    return false;
  }
}

export const store = {
  async getAll(): Promise<Website[]> {
    if (await useKvAvailable()) {
      const websites = (await vercelKv.get<Website[]>('websites')) || [];
      return websites;
    }
    if (!memoryStore) memoryStore = getFallbackSeed();
    return memoryStore;
  },

  async setAll(websites: Website[]): Promise<void> {
    if (await useKvAvailable()) {
      await vercelKv.set('websites', websites);
      return;
    }
    memoryStore = websites;
  },
};


