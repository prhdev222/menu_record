// scripts/postgres-seed.ts - สร้าง Table และข้อมูลเริ่มต้นสำหรับ Postgres
//
// วิธีใช้:
// 1. ตรวจสอบว่ามี environment variables แล้ว (POSTGRES_URL)
// 2. รัน: npx tsx scripts/postgres-seed.ts

import { sql } from '@vercel/postgres';

async function seed() {
  try {
    console.log('🌱 Starting Postgres seed...\n');

    // 1. สร้าง UUID extension
    console.log('📦 Creating UUID extension...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    console.log('✅ UUID extension ready\n');

    // 2. ลบ table เก่า (ถ้ามี)
    console.log('🗑️  Dropping old table...');
    await sql`DROP TABLE IF EXISTS websites CASCADE`;
    console.log('✅ Old table dropped\n');

    // 3. สร้าง table ใหม่
    console.log('🏗️  Creating websites table...');
    await sql`
      CREATE TABLE websites (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        url VARCHAR(500) NOT NULL,
        description TEXT,
        features TEXT[],
        target_group VARCHAR(255),
        color VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('✅ Table created\n');

    // 4. สร้าง indexes
    console.log('📊 Creating indexes...');
    await sql`CREATE INDEX idx_websites_created_at ON websites(created_at DESC)`;
    await sql`CREATE INDEX idx_websites_color ON websites(color)`;
    await sql`CREATE INDEX idx_websites_name ON websites(name)`;
    console.log('✅ Indexes created\n');

    // 5. เพิ่มข้อมูลเริ่มต้น
    console.log('📝 Inserting sample data...');
    
    await sql`
      INSERT INTO websites (name, url, description, features, target_group, color)
      VALUES (
        'ระบบบันทึกข้อมูลสุขภาพ',
        'https://patient-monitoring-app.vercel.app/',
        'บันทึกค่าความดันโลหิตและน้ำตาลในเลือด เพื่อติดตามสุขภาพอย่างต่อเนื่อง',
        ARRAY[
          'บันทึกความดันโลหิต (Systolic/Diastolic)',
          'บันทึกระดับน้ำตาลในเลือด',
          'ดูประวัติและกราฟแสดงผล',
          'ส่งออกข้อมูลเป็น PDF'
        ],
        'พระสงฆ์และผู้ป่วยโรคเรื้อรัง',
        'blue'
      )
    `;

    await sql`
      INSERT INTO websites (name, url, description, features, target_group, color)
      VALUES (
        'ระบบบันทึกกิจกรรมเพื่อสุขภาพ',
        'https://monk-activity.vercel.app/',
        'บันทึกกิจกรรมประจำวัน คำนวณแคลอรี่ และติดตามการเลิกบุหรี่',
        ARRAY[
          'บันทึกกิจกรรมประจำวัน (เดิน, วิ่ง, ปฏิบัติธรรม)',
          'คำนวณแคลอรี่ที่เผาผลาญ',
          'ติดตามการเลิกบุหรี่และเงินที่ประหยัดได้',
          'สถิติกิจกรรมรายวัน/รายสัปดาห์/รายเดือน'
        ],
        'พระสงฆ์ที่ต้องการดูแลสุขภาพ',
        'green'
      )
    `;

    await sql`
      INSERT INTO websites (name, url, description, features, target_group, color)
      VALUES (
        'ระบบติดตามอาการเบื้องต้น',
        'https://symptom-tracker.vercel.app/',
        'บันทึกอาการป่วยและรับคำแนะนำเบื้องต้น',
        ARRAY[
          'บันทึกอาการป่วยประจำวัน',
          'ประเมินความรุนแรงของอาการ',
          'คำแนะนำการดูแลเบื้องต้น',
          'แจ้งเตือนเมื่ออาการผิดปกติ'
        ],
        'ผู้ป่วยทั่วไปและครอบครัว',
        'purple'
      )
    `;

    console.log('✅ Sample data inserted\n');

    // 6. ตรวจสอบข้อมูล
    console.log('🔍 Verifying data...');
    const { rows } = await sql`SELECT COUNT(*) as count FROM websites`;
    console.log(`✅ Total websites: ${rows[0].count}\n`);

    // 7. แสดงข้อมูลทั้งหมด
    console.log('📋 All websites:');
    const { rows: websites } = await sql`
      SELECT id, name, color, created_at 
      FROM websites 
      ORDER BY created_at ASC
    `;
    
    websites.forEach((site, index) => {
      console.log(`   ${index + 1}. ${site.name} (${site.color})`);
      console.log(`      ID: ${site.id}`);
      console.log(`      Created: ${site.created_at}`);
    });

    console.log('\n✅ Seed completed successfully! 🎉');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();

