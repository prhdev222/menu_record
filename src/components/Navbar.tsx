'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-white/70 border-b border-gray-100">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-gray-800">เพื่อการบันทึกสุขภาพพระสงฆ์</Link>
        <div className="flex items-center gap-4" />
      </div>
    </nav>
  );
}


