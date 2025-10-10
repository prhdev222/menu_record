// ตัวอย่างการเพิ่ม Performance Monitoring และ Error Handling
// สำหรับรองรับ High Traffic

// ============================================
// 1. Enhanced Store with Monitoring
// ============================================

// lib/store-monitored.ts
import { kv as vercelKv } from '@vercel/kv';
import type { Website } from '@/lib/types';

// Performance metrics
interface Metrics {
  cacheHits: number;
  cacheMisses: number;
  redisErrors: number;
  avgResponseTime: number;
  lastReset: number;
}

let metrics: Metrics = {
  cacheHits: 0,
  cacheMisses: 0,
  redisErrors: 0,
  avgResponseTime: 0,
  lastReset: Date.now(),
};

// In-memory cache
let memoryCache: Website[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 60 * 1000; // 60 seconds

function isCacheValid(): boolean {
  return memoryCache !== null && Date.now() - cacheTimestamp < CACHE_TTL;
}

// Reset metrics every hour
function maybeResetMetrics() {
  const hourInMs = 60 * 60 * 1000;
  if (Date.now() - metrics.lastReset > hourInMs) {
    console.log('[Metrics] Hourly stats:', {
      cacheHitRate: `${((metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100).toFixed(2)}%`,
      totalRequests: metrics.cacheHits + metrics.cacheMisses,
      errors: metrics.redisErrors,
      avgResponseTime: `${metrics.avgResponseTime.toFixed(2)}ms`,
    });
    
    metrics = {
      cacheHits: 0,
      cacheMisses: 0,
      redisErrors: 0,
      avgResponseTime: 0,
      lastReset: Date.now(),
    };
  }
}

export const storeMonitored = {
  async getAll(): Promise<Website[]> {
    const start = Date.now();
    maybeResetMetrics();
    
    try {
      // Check cache first
      if (isCacheValid()) {
        metrics.cacheHits++;
        const duration = Date.now() - start;
        console.log(`[Store] ✅ Cache HIT (${duration}ms)`);
        return memoryCache!;
      }
      
      // Cache miss - fetch from Redis
      metrics.cacheMisses++;
      console.log('[Store] ⚠️ Cache MISS - Fetching from Redis...');
      
      const websites = (await vercelKv.get<Website[]>('websites')) || [];
      
      // Update cache
      memoryCache = websites;
      cacheTimestamp = Date.now();
      
      const duration = Date.now() - start;
      metrics.avgResponseTime = 
        (metrics.avgResponseTime * (metrics.cacheMisses - 1) + duration) / metrics.cacheMisses;
      
      console.log(`[Store] ✅ Redis fetch completed (${duration}ms)`);
      return websites;
      
    } catch (error) {
      metrics.redisErrors++;
      console.error('[Store] ❌ Error:', error);
      
      // Fallback to stale cache if available
      if (memoryCache) {
        console.warn('[Store] ⚠️ Using stale cache due to error');
        return memoryCache;
      }
      
      throw error;
    }
  },

  async setAll(websites: Website[]): Promise<void> {
    const start = Date.now();
    
    try {
      await vercelKv.set('websites', websites);
      
      // Update cache immediately
      memoryCache = websites;
      cacheTimestamp = Date.now();
      
      const duration = Date.now() - start;
      console.log(`[Store] ✅ Data updated (${duration}ms)`);
    } catch (error) {
      metrics.redisErrors++;
      console.error('[Store] ❌ Set error:', error);
      throw error;
    }
  },

  // Get current metrics
  getMetrics(): Metrics {
    return { ...metrics };
  },

  // Clear cache manually (useful after updates)
  invalidateCache(): void {
    memoryCache = null;
    cacheTimestamp = 0;
    console.log('[Store] 🗑️ Cache invalidated');
  },
};

// ============================================
// 2. API Route with Rate Limiting
// ============================================

// app/api/websites/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storeMonitored } from '@/lib/store-monitored';

// Simple in-memory rate limiter
const rateLimiter = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 60; // 60 requests
const RATE_WINDOW = 60 * 1000; // per minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimiter.get(ip);
  
  if (!record || now > record.resetTime) {
    rateLimiter.set(ip, { count: 1, resetTime: now + RATE_WINDOW });
    return true;
  }
  
  if (record.count >= RATE_LIMIT) {
    return false;
  }
  
  record.count++;
  return true;
}

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const start = Date.now();
  
  // Get client IP
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
  
  // Check rate limit
  if (!checkRateLimit(ip)) {
    console.warn(`[API] ⚠️ Rate limit exceeded for IP: ${ip}`);
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { 
        status: 429,
        headers: { 'Retry-After': '60' },
      }
    );
  }
  
  try {
    const websites = await storeMonitored.getAll();
    const duration = Date.now() - start;
    
    console.log(`[API] ✅ GET /api/websites (${duration}ms) - IP: ${ip}`);
    
    return NextResponse.json(websites, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error) {
    const duration = Date.now() - start;
    console.error(`[API] ❌ GET error (${duration}ms):`, error);
    
    return NextResponse.json(
      { error: 'Failed to fetch websites' },
      { status: 500 }
    );
  }
}

// ============================================
// 3. Performance Dashboard Component
// ============================================

// app/admin/dashboard/performance/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Activity, TrendingUp, AlertCircle, Clock } from 'lucide-react';

interface PerformanceMetrics {
  cacheHitRate: number;
  totalRequests: number;
  errors: number;
  avgResponseTime: number;
}

export default function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  async function fetchMetrics() {
    try {
      const res = await fetch('/api/metrics');
      const data = await res.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="p-8">Loading metrics...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Cache Hit Rate */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Cache Hit Rate</h3>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {metrics?.cacheHitRate.toFixed(1)}%
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {metrics?.cacheHitRate > 90 ? '🟢 Excellent' : 
             metrics?.cacheHitRate > 70 ? '🟡 Good' : '🔴 Poor'}
          </p>
        </div>

        {/* Total Requests */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Total Requests</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {metrics?.totalRequests.toLocaleString()}
          </p>
          <p className="text-sm text-gray-500 mt-2">Last hour</p>
        </div>

        {/* Errors */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Errors</h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {metrics?.errors}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {metrics?.errors === 0 ? '🟢 All good!' : '🔴 Check logs'}
          </p>
        </div>

        {/* Avg Response Time */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">Avg Response</h3>
            <Clock className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {metrics?.avgResponseTime.toFixed(0)}ms
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {metrics?.avgResponseTime < 50 ? '🟢 Fast' :
             metrics?.avgResponseTime < 200 ? '🟡 Good' : '🔴 Slow'}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">
          📊 Recommendations
        </h3>
        <ul className="space-y-2 text-blue-800">
          {metrics?.cacheHitRate < 70 && (
            <li>• Consider increasing cache TTL for better hit rate</li>
          )}
          {metrics?.avgResponseTime > 200 && (
            <li>• Consider upgrading to Upstash Redis for faster responses</li>
          )}
          {metrics?.errors > 10 && (
            <li>• Check Redis connection and error logs</li>
          )}
          {metrics?.totalRequests > 5000 && (
            <li>• Consider using ISR (Static Generation) for better scalability</li>
          )}
        </ul>
      </div>
    </div>
  );
}

// ============================================
// 4. Metrics API Endpoint
// ============================================

// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { storeMonitored } from '@/lib/store-monitored';

export async function GET() {
  const metrics = storeMonitored.getMetrics();
  
  const cacheHitRate = metrics.cacheHits + metrics.cacheMisses > 0
    ? (metrics.cacheHits / (metrics.cacheHits + metrics.cacheMisses)) * 100
    : 0;
  
  return NextResponse.json({
    cacheHitRate,
    totalRequests: metrics.cacheHits + metrics.cacheMisses,
    errors: metrics.redisErrors,
    avgResponseTime: metrics.avgResponseTime,
  });
}

// ============================================
// 5. Error Boundary Component
// ============================================

// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Send to error tracking service
    // e.g., Sentry, LogRocket, etc.
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              เกิดข้อผิดพลาด
            </h1>
            <p className="text-gray-600 mb-8">
              ขออภัย เกิดข้อผิดพลาดในการโหลดข้อมูล
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
            >
              โหลดหน้าใหม่
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================
// 6. Loading Skeleton Component
// ============================================

// components/WebsiteCardSkeleton.tsx
export function WebsiteCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
      <div className="bg-gray-300 h-32"></div>
      <div className="p-6 space-y-4">
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
        <div className="h-10 bg-gray-300 rounded w-full mt-6"></div>
      </div>
    </div>
  );
}

// ============================================
// สรุปการใช้งาน
// ============================================

/*
1. แทนที่ store ด้วย storeMonitored ใน route.ts
2. เพิ่ม ErrorBoundary ใน layout.tsx
3. เพิ่ม Loading Skeleton สำหรับ UX ที่ดีขึ้น
4. เปิดดู Performance Dashboard ที่ /admin/dashboard/performance
5. Monitor metrics และปรับปรุงตามคำแนะนำ

ผลลัพธ์:
- ✅ ติดตามประสิทธิภาพได้ real-time
- ✅ รองรับ high traffic ได้ดีขึ้น
- ✅ Error handling ที่ดีขึ้น
- ✅ Better user experience
*/


