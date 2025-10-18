import { Suspense } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WebsiteCard from '@/components/WebsiteCard';
import Footer from '@/components/Footer';
import { store } from '@/lib/store';

// Static generation - no dynamic server usage
export const dynamic = 'force-static';

// Loading component
function WebsiteGridSkeleton() {
  return (
    <div className="col-span-full text-center text-gray-500">
      <div className="animate-pulse">กำลังโหลด...</div>
    </div>
  );
}

// Server Component for fetching data
async function WebsiteGrid() {
  const websites = await store.getAll();
  
  if (websites.length === 0) {
    return (
      <p className="col-span-full text-center text-gray-500">ยังไม่มีรายการเว็บไซต์</p>
    );
  }

  return (
    <>
      {websites.map((w) => (
        <WebsiteCard key={w.id} {...w} />
      ))}
    </>
  );
}

// Main page - Server Component with Suspense
export default function Home() {
  return (
    <div>
      <Navbar />
      <Hero />
      <main className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<WebsiteGridSkeleton />}>
          <WebsiteGrid />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
