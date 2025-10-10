// app/page.tsx - ตัวอย่างการใช้ ISR แทน Client-side Fetching
// ⚡ วิธีนี้จะทำให้หน้าเว็บเร็วขึ้นมาก!

import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WebsiteCard from '@/components/WebsiteCard';
import Footer from '@/components/Footer';
import { store } from '@/lib/store';

// ⭐ Revalidate ทุก 5 นาที (300 วินาที)
// หมายความว่าข้อมูลจะอัพเดทอัตโนมัติทุก 5 นาที
export const revalidate = 300;

// 🚀 Server Component - Fetch ข้อมูลที่ Server-side
export default async function HomePage() {
  // ดึงข้อมูลจาก store (จะ cache ตาม TTL ใน store.ts)
  const websites = await store.getAll();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Websites Grid */}
      <section className="flex-grow py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              ระบบสุขภาพของเรา
            </h2>
            <p className="text-xl text-gray-600">
              เลือกระบบที่เหมาะกับคุณ
            </p>
          </div>

          {/* Grid of Website Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {websites.map((website) => (
              <WebsiteCard key={website.id} {...website} />
            ))}
          </div>

          {/* Empty State */}
          {websites.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 text-lg">
                ยังไม่มีเว็บไซต์ในระบบ
              </p>
            </div>
          )}
        </div>
      </section>
      
      <Footer />
    </div>
  );
}

// ข้อดีของวิธีนี้:
// ✅ หน้าเว็บโหลดเร็วมาก (Static HTML)
// ✅ SEO ดีขึ้น (Search engines เห็นข้อมูล)
// ✅ ลด Client-side JavaScript
// ✅ ลดการใช้ KV API calls
// ✅ User ได้เห็นข้อมูลเร็วขึ้น

// การทำงาน:
// 1. ครั้งแรก: Generate static HTML
// 2. User เข้าหน้านี้: ส่ง cached HTML ทันที (⚡ เร็วมาก)
// 3. ทุก 5 นาที: Regenerate HTML ใหม่ (background)
// 4. ถ้ามีการเปลี่ยนข้อมูล: ข้อมูลใหม่จะปรากฏภายใน 5 นาที

