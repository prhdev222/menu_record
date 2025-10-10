// lib/store-postgres.ts - ตัวอย่างการใช้ Vercel Postgres
//
// Setup:
// 1. ไปที่ Vercel Dashboard > Storage > Create Database > Postgres
// 2. Connect to Project
// 3. Environment variables จะถูกเพิ่มอัตโนมัติ:
//    POSTGRES_URL, POSTGRES_PRISMA_URL, POSTGRES_URL_NON_POOLING
// 4. npm install @vercel/postgres
// 5. Run seed: npx tsx scripts/postgres-seed.ts

import { sql } from '@vercel/postgres';
import type { Website } from '@/lib/types';

// 🚀 ข้อดีของ Postgres:
// - เหมาะกับข้อมูลเยอะ (พัน-หมื่น records)
// - รองรับ complex queries (JOIN, WHERE, ORDER BY)
// - มี indexing (เร็วมาก)
// - ACID compliance (ความปลอดภัยสูง)
// - Full-text search ได้
// - Pagination ง่าย

export const storePostgres = {
  // ✅ Get all websites
  async getAll(): Promise<Website[]> {
    try {
      console.time('[Postgres] Get all websites');
      
      const { rows } = await sql<Website>`
        SELECT 
          id,
          name,
          url,
          description,
          features,
          target_group as "targetGroup",
          color,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM websites
        ORDER BY created_at DESC
      `;
      
      console.timeEnd('[Postgres] Get all websites');
      return rows;
    } catch (error) {
      console.error('[Postgres] Get all error:', error);
      throw error;
    }
  },

  // ✅ Get by ID
  async getById(id: string): Promise<Website | null> {
    try {
      const { rows } = await sql<Website>`
        SELECT 
          id,
          name,
          url,
          description,
          features,
          target_group as "targetGroup",
          color,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM websites
        WHERE id = ${id}
      `;
      
      return rows[0] || null;
    } catch (error) {
      console.error('[Postgres] Get by ID error:', error);
      return null;
    }
  },

  // ✅ Create new website
  async create(data: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>): Promise<Website> {
    try {
      console.time('[Postgres] Create website');
      
      const { rows } = await sql<Website>`
        INSERT INTO websites (
          name, 
          url, 
          description, 
          features, 
          target_group, 
          color
        )
        VALUES (
          ${data.name},
          ${data.url},
          ${data.description},
          ${data.features},
          ${data.targetGroup},
          ${data.color}
        )
        RETURNING 
          id,
          name,
          url,
          description,
          features,
          target_group as "targetGroup",
          color,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      
      console.timeEnd('[Postgres] Create website');
      return rows[0];
    } catch (error) {
      console.error('[Postgres] Create error:', error);
      throw error;
    }
  },

  // ✅ Update website
  async update(id: string, data: Partial<Website>): Promise<Website | null> {
    try {
      console.time('[Postgres] Update website');
      
      const updates: string[] = [];
      const values: any[] = [];
      
      if (data.name !== undefined) {
        updates.push(`name = $${values.length + 1}`);
        values.push(data.name);
      }
      if (data.url !== undefined) {
        updates.push(`url = $${values.length + 1}`);
        values.push(data.url);
      }
      if (data.description !== undefined) {
        updates.push(`description = $${values.length + 1}`);
        values.push(data.description);
      }
      if (data.features !== undefined) {
        updates.push(`features = $${values.length + 1}`);
        values.push(data.features);
      }
      if (data.targetGroup !== undefined) {
        updates.push(`target_group = $${values.length + 1}`);
        values.push(data.targetGroup);
      }
      if (data.color !== undefined) {
        updates.push(`color = $${values.length + 1}`);
        values.push(data.color);
      }
      
      if (updates.length === 0) {
        return this.getById(id);
      }
      
      updates.push('updated_at = CURRENT_TIMESTAMP');
      
      const { rows } = await sql<Website>`
        UPDATE websites
        SET ${sql.raw(updates.join(', '))}
        WHERE id = ${id}
        RETURNING 
          id,
          name,
          url,
          description,
          features,
          target_group as "targetGroup",
          color,
          created_at as "createdAt",
          updated_at as "updatedAt"
      `;
      
      console.timeEnd('[Postgres] Update website');
      return rows[0] || null;
    } catch (error) {
      console.error('[Postgres] Update error:', error);
      throw error;
    }
  },

  // ✅ Delete website
  async delete(id: string): Promise<boolean> {
    try {
      console.time('[Postgres] Delete website');
      
      const { rowCount } = await sql`
        DELETE FROM websites WHERE id = ${id}
      `;
      
      console.timeEnd('[Postgres] Delete website');
      return (rowCount || 0) > 0;
    } catch (error) {
      console.error('[Postgres] Delete error:', error);
      return false;
    }
  },

  // 🔥 Advanced: Pagination
  async getPaginated(page: number = 1, pageSize: number = 10): Promise<{
    websites: Website[];
    total: number;
    totalPages: number;
    currentPage: number;
    hasMore: boolean;
  }> {
    try {
      const offset = (page - 1) * pageSize;
      
      // Get total count
      const { rows: countRows } = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM websites
      `;
      const total = countRows[0]?.count || 0;
      
      // Get paginated data
      const { rows } = await sql<Website>`
        SELECT 
          id,
          name,
          url,
          description,
          features,
          target_group as "targetGroup",
          color,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM websites
        ORDER BY created_at DESC
        LIMIT ${pageSize}
        OFFSET ${offset}
      `;
      
      const totalPages = Math.ceil(total / pageSize);
      
      return {
        websites: rows,
        total,
        totalPages,
        currentPage: page,
        hasMore: page < totalPages,
      };
    } catch (error) {
      console.error('[Postgres] Pagination error:', error);
      return {
        websites: [],
        total: 0,
        totalPages: 0,
        currentPage: page,
        hasMore: false,
      };
    }
  },

  // 🔍 Advanced: Search
  async search(query: string): Promise<Website[]> {
    try {
      const searchPattern = `%${query}%`;
      
      const { rows } = await sql<Website>`
        SELECT 
          id,
          name,
          url,
          description,
          features,
          target_group as "targetGroup",
          color,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM websites
        WHERE 
          name ILIKE ${searchPattern}
          OR description ILIKE ${searchPattern}
          OR target_group ILIKE ${searchPattern}
        ORDER BY created_at DESC
      `;
      
      return rows;
    } catch (error) {
      console.error('[Postgres] Search error:', error);
      return [];
    }
  },

  // 🎨 Advanced: Filter by color
  async getByColor(color: Website['color']): Promise<Website[]> {
    try {
      const { rows } = await sql<Website>`
        SELECT 
          id,
          name,
          url,
          description,
          features,
          target_group as "targetGroup",
          color,
          created_at as "createdAt",
          updated_at as "updatedAt"
        FROM websites
        WHERE color = ${color}
        ORDER BY created_at DESC
      `;
      
      return rows;
    } catch (error) {
      console.error('[Postgres] Filter by color error:', error);
      return [];
    }
  },

  // 📊 Advanced: Get statistics
  async getStats(): Promise<{
    total: number;
    byColor: Record<string, number>;
  }> {
    try {
      const { rows: totalRows } = await sql<{ count: number }>`
        SELECT COUNT(*) as count FROM websites
      `;
      
      const { rows: colorRows } = await sql<{ color: string; count: number }>`
        SELECT color, COUNT(*) as count
        FROM websites
        GROUP BY color
        ORDER BY count DESC
      `;
      
      const byColor: Record<string, number> = {};
      colorRows.forEach((row) => {
        byColor[row.color] = row.count;
      });
      
      return {
        total: totalRows[0]?.count || 0,
        byColor,
      };
    } catch (error) {
      console.error('[Postgres] Stats error:', error);
      return { total: 0, byColor: {} };
    }
  },
};

// 📝 Database Schema (ต้องสร้างก่อน):
// 
// CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
// 
// CREATE TABLE websites (
//   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
//   name VARCHAR(255) NOT NULL,
//   url VARCHAR(500) NOT NULL,
//   description TEXT,
//   features TEXT[],
//   target_group VARCHAR(255),
//   color VARCHAR(50),
//   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );
// 
// CREATE INDEX idx_websites_created_at ON websites(created_at DESC);
// CREATE INDEX idx_websites_color ON websites(color);
// CREATE INDEX idx_websites_name ON websites(name);

// การใช้งาน:
//
// // app/api/websites/route.ts
// import { storePostgres } from '@/lib/store-postgres';
//
// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const page = parseInt(searchParams.get('page') || '1');
//   const pageSize = parseInt(searchParams.get('pageSize') || '10');
//   const search = searchParams.get('search');
//   
//   if (search) {
//     const websites = await storePostgres.search(search);
//     return NextResponse.json(websites);
//   }
//   
//   const result = await storePostgres.getPaginated(page, pageSize);
//   return NextResponse.json(result);
// }
//
// export async function POST(request: NextRequest) {
//   const body = await request.json();
//   const website = await storePostgres.create(body);
//   return NextResponse.json(website);
// }
//
// export async function PUT(request: NextRequest) {
//   const { id, ...updates } = await request.json();
//   const website = await storePostgres.update(id, updates);
//   return NextResponse.json(website);
// }
//
// export async function DELETE(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const id = searchParams.get('id')!;
//   await storePostgres.delete(id);
//   return NextResponse.json({ success: true });
// }

