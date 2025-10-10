import { Redis } from '@upstash/redis';

// Lazy initialize Redis client
let _kv: Redis | null = null;

function getKvClient(): Redis {
  if (!_kv) {
    const url = process.env.KV_REST_API_URL;
    const token = process.env.KV_REST_API_TOKEN;

    if (!url || !token) {
      throw new Error(
        'Missing Upstash Redis credentials!\n' +
        'Please set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.\n' +
        'For local development, create a .env.local file with these values.'
      );
    }

    _kv = new Redis({ url, token });

    // Log เพื่อยืนยันว่าเชื่อมต่อแล้ว (เฉพาะ development)
    if (process.env.NODE_ENV === 'development') {
      console.log('🔴 Using Upstash Redis:', url);
    }
  }

  return _kv;
}

// Export a Proxy that lazily initializes the Redis client
export const kv = new Proxy({} as Redis, {
  get(_target, prop) {
    const client = getKvClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});


