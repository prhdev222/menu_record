"use client";
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import WebsiteCard from '@/components/WebsiteCard';
import Footer from '@/components/Footer';
import type { Website } from '@/lib/types';

export default function Home() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/websites');
        if (!res.ok) {
          setWebsites([]);
          return;
        }
        const data = await res.json();
        setWebsites(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div>
      <Navbar />
      <Hero />
      <main className="mx-auto max-w-6xl px-4 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <p className="col-span-full text-center text-gray-500">กำลังโหลด...</p>
        ) : websites.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">ยังไม่มีรายการเว็บไซต์</p>
        ) : (
          websites.map((w) => (
            <WebsiteCard key={w.id} {...w} />
          ))
        )}
      </main>
      <Footer />
    </div>
  );
}
