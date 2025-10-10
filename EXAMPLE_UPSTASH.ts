// lib/store-upstash.ts - ตัวอย่างการใช้ Upstash Redis (เร็วกว่า Vercel KV)
// 
// Setup:
// 1. สมัคร https://upstash.com/ (ฟรี)
// 2. สร้าง Redis Database
// 3. คัดลอก REST URL และ TOKEN
// 4. เพิ่มใน .env.local:
//    UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
//    UPSTASH_REDIS_REST_TOKEN=your-token
// 5. npm install @upstash/redis

import { Redis } from '@upstash/redis';
import type { Website } from '@/lib/types';

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// In-memory cache with TTL
let memoryCache: Website[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

function isCacheValid(): boolean {
  return memoryCache !== null && Date.now() - cacheTimestamp < CACHE_TTL;
}

function clearCache(): void {
  memoryCache = null;
  cacheTimestamp = 0;
}

// ⚡ ข้อดีของ Upstash:
// - Latency ต่ำกว่า Vercel KV (< 5ms)
// - Global replicas (เร็วทั่วโลก)
// - Free tier: 10,000 commands/day
// - Built-in caching
// - REST API (ไม่ต้อง connection pool)

export const storeUpstash = {
  async getAll(): Promise<Website[]> {
    // Return cached data if valid
    if (isCacheValid()) {
      console.log('[Upstash] Cache hit ⚡');
      return memoryCache!;
    }

    try {
      console.time('[Upstash] Get all websites');
      
      // Get from Upstash Redis
      const websites = await redis.get<Website[]>('websites');
      
      console.timeEnd('[Upstash] Get all websites');
      
      // Update cache
      const result = websites || [];
      memoryCache = result;
      cacheTimestamp = Date.now();
      
      return result;
    } catch (error) {
      console.error('[Upstash] Error:', error);
      throw error;
    }
  },

  async setAll(websites: Website[]): Promise<void> {
    try {
      console.time('[Upstash] Set all websites');
      
      // Write to Upstash Redis
      await redis.set('websites', websites);
      
      console.timeEnd('[Upstash] Set all websites');
      
      // Update cache immediately
      memoryCache = websites;
      cacheTimestamp = Date.now();
    } catch (error) {
      console.error('[Upstash] Set Error:', error);
      throw error;
    }
  },

  // 🔥 Advanced: ใช้ Redis Hash สำหรับ individual items (เร็วกว่า array)
  async getById(id: string): Promise<Website | null> {
    try {
      const website = await redis.hget<Website>('websites:hash', id);
      return website;
    } catch (error) {
      console.error('[Upstash] Get by ID Error:', error);
      return null;
    }
  },

  async setById(id: string, website: Website): Promise<void> {
    try {
      // Save to hash
      await redis.hset('websites:hash', { [id]: website });
      
      // Also add to sorted set for listing (sorted by createdAt)
      const score = new Date(website.createdAt).getTime();
      await redis.zadd('websites:list', { score, member: id });
      
      // Clear cache
      clearCache();
    } catch (error) {
      console.error('[Upstash] Set by ID Error:', error);
      throw error;
    }
  },

  async deleteById(id: string): Promise<void> {
    try {
      // Remove from hash
      await redis.hdel('websites:hash', id);
      
      // Remove from sorted set
      await redis.zrem('websites:list', id);
      
      // Clear cache
      clearCache();
    } catch (error) {
      console.error('[Upstash] Delete Error:', error);
      throw error;
    }
  },

  // 🚀 Get all with pagination (สำหรับข้อมูลเยอะ)
  async getAllPaginated(page: number = 1, pageSize: number = 10): Promise<{
    websites: Website[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      // Get IDs from sorted set (newest first)
      const start = (page - 1) * pageSize;
      const end = start + pageSize - 1;
      
      const ids = await redis.zrange<string[]>('websites:list', start, end, { rev: true });
      const total = await redis.zcard('websites:list');
      
      // Get websites by IDs
      const websites = await Promise.all(
        ids.map((id: string) => this.getById(id))
      );
      
      return {
        websites: websites.filter((w: Website | null) => w !== null) as Website[],
        total,
        hasMore: start + pageSize < total,
      };
    } catch (error) {
      console.error('[Upstash] Pagination Error:', error);
      return { websites: [], total: 0, hasMore: false };
    }
  },

  // Manual cache invalidation
  invalidateCache(): void {
    clearCache();
  },
};

// การเปรียบเทียบ Performance:
//
// Vercel KV:
// - Get: ~50-100ms
// - Set: ~50-100ms
//
// Upstash Redis:
// - Get: ~5-15ms ⚡
// - Set: ~5-15ms ⚡
//
// Upstash + Memory Cache:
// - Get (cached): <1ms 🚀
// - Get (not cached): ~5-15ms ⚡
// - Set: ~5-15ms ⚡

// วิธีใช้งาน:
//
// // app/api/websites/route.ts
// import { storeUpstash } from '@/lib/store-upstash';
//
// export async function GET() {
//   const websites = await storeUpstash.getAll();
//   return NextResponse.json(websites);
// }
//
// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   const websites = await storeUpstash.getAll();
//   const newWebsite = { id: uuidv4(), ...body, ... };
//   websites.push(newWebsite);
//   await storeUpstash.setAll(websites);
//   return NextResponse.json(newWebsite);
// }

