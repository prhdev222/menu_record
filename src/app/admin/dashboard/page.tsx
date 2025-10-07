'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import WebsiteModal from '@/components/WebsiteModal';
import type { Website } from '@/lib/types';

export default function DashboardPage() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Website | null>(null);

  async function refresh() {
    try {
      const res = await fetch('/api/websites');
      if (!res.ok) {
        setWebsites([]);
        return;
      }
      const data = await res.json();
      setWebsites(Array.isArray(data) ? data : []);
    } catch {
      setWebsites([]);
    }
  }

  useEffect(() => {
    (async () => {
      await refresh();
      setLoading(false);
    })();
  }, []);

  async function handleCreate(data: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>) {
    await fetch('/api/websites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setOpen(false);
    await refresh();
  }

  async function handleUpdate(data: Partial<Website> & { id: string }) {
    await fetch('/api/websites', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    setEditing(null);
    await refresh();
  }

  async function handleDelete(id: string) {
    await fetch(`/api/websites?id=${id}`, { method: 'DELETE' });
    await refresh();
  }

  function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = '/';
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold">เพิ่มเว็บไซต์ใหม่</button>
            <button onClick={logout} className="px-4 py-2 rounded-lg border">Logout</button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">กำลังโหลด...</p>
        ) : websites.length === 0 ? (
          <p className="text-gray-500">ยังไม่มีรายการเว็บไซต์</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-2 border">ชื่อเว็บไซต์</th>
                  <th className="text-left p-2 border">URL</th>
                  <th className="text-left p-2 border">กลุ่มเป้าหมาย</th>
                  <th className="text-left p-2 border">แก้ไข</th>
                </tr>
              </thead>
              <tbody>
                {websites.map((w) => (
                  <tr key={w.id}>
                    <td className="p-2 border">{w.name}</td>
                    <td className="p-2 border">{w.url}</td>
                    <td className="p-2 border">{w.targetGroup}</td>
                    <td className="p-2 border">
                      <div className="flex gap-2">
                        <button onClick={() => setEditing(w)} className="px-3 py-1 rounded-lg border">แก้ไข</button>
                        <button onClick={() => handleDelete(w.id)} className="px-3 py-1 rounded-lg border text-red-600">ลบ</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <WebsiteModal open={open} onClose={() => setOpen(false)} onSubmit={handleCreate} />
      <WebsiteModal open={!!editing} onClose={() => setEditing(null)} initial={editing ?? undefined} onSubmit={(data) => handleUpdate({ id: editing!.id, ...data })} />
    </ProtectedRoute>
  );
}


