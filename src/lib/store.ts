import { kv } from '@/lib/kv';
import type { Website } from '@/lib/types';

// In-memory cache with TTL
let memoryCache: Website[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

// Fallback seed data
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

// Check if cache is still valid
function isCacheValid(): boolean {
  return memoryCache !== null && Date.now() - cacheTimestamp < CACHE_TTL;
}

// Clear cache
function clearCache(): void {
  memoryCache = null;
  cacheTimestamp = 0;
}

export const store = {
  async getAll(): Promise<Website[]> {
    // Return cached data if valid
    if (isCacheValid()) {
      return memoryCache!;
    }

    try {
      // Try to get from Upstash Redis
      const websites = (await kv.get<Website[]>('websites')) || [];
      
      // Update cache
      memoryCache = websites;
      cacheTimestamp = Date.now();
      
      console.log(`[Store] ✅ Fetched ${websites.length} websites from Upstash Redis`);
      return websites;
    } catch (error) {
      console.error('[Store] ❌ Redis Error:', error);
      // Return fallback data if Redis fails
      return getFallbackSeed();
    }
  },

  async setAll(websites: Website[]): Promise<void> {
    try {
      // Write to Upstash Redis
      await kv.set('websites', websites);
      
      // Update cache immediately
      memoryCache = websites;
      cacheTimestamp = Date.now();
      
      console.log(`[Store] ✅ Updated ${websites.length} websites in Upstash Redis`);
    } catch (error) {
      console.error('[Store] ❌ Redis Set Error:', error);
      throw error;
    }
  },

  // Manual cache invalidation
  invalidateCache(): void {
    clearCache();
  },
};




