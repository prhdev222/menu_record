import { Redis } from '@upstash/redis';

// In-memory fallback storage for development/when Redis is not available
const memoryStorage = new Map<string, any>();

// Simple in-memory Redis-like client
class MemoryRedis {
  async get<T>(key: string): Promise<T | null> {
    return memoryStorage.get(key) || null;
  }

  async set(key: string, value: any): Promise<void> {
    memoryStorage.set(key, value);
    console.log(`[MemoryRedis] ✅ Stored ${key} with ${JSON.stringify(value).length} bytes`);
  }

  async del(key: string): Promise<void> {
    memoryStorage.delete(key);
    console.log(`[MemoryRedis] ✅ Deleted ${key}`);
  }
}

// Lazy initialize Redis client
let _kv: Redis | MemoryRedis | null = null;

function getKvClient(): Redis | MemoryRedis {
  if (!_kv) {
    const url = process.env.KV_REST_API_URL?.trim();
    const token = process.env.KV_REST_API_TOKEN?.trim();

    if (!url || !token) {
      console.warn('⚠️ Missing Upstash Redis credentials! Using in-memory storage.');
      console.warn('⚠️ Data will be lost on server restart. To persist data, add KV_REST_API_URL and KV_REST_API_TOKEN to your environment variables.');
      _kv = new MemoryRedis();
    } else {
      console.log('🔴 Using Upstash Redis:', url);
      _kv = new Redis({ url, token });
    }
  }

  return _kv;
}

// Export a Proxy that lazily initializes the Redis client
export const kv = new Proxy({} as Redis | MemoryRedis, {
  get(_target, prop) {
    const client = getKvClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});


