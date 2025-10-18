'use client';

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import WebsiteModal from '@/components/WebsiteModal';
import type { Website } from '@/lib/types';
import { store } from '@/lib/store';

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
    try {
      console.log('🟢 handleCreate called with:', data);
      const response = await fetch('/api/websites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log('📡 Create API response status:', response.status);
      const responseData = await response.json();
      console.log('📡 Create API response data:', responseData);

      if (!response.ok) {
        console.error('❌ Create failed:', responseData);
        alert(`เกิดข้อผิดพลาดในการสร้าง: ${responseData.error || 'ไม่ทราบสาเหตุ'}`);
        throw new Error('Create failed');
      }

      console.log('✅ Create successful, refreshing data...');
      // Refresh data
      await refresh();
      console.log('✅ Data refreshed, closing modal...');
      // Close modal after successful operation
      setOpen(false);
    } catch (error) {
      console.error('❌ Create error:', error);
      throw error; // Re-throw to let modal handle error
    }
  }

  async function handleUpdate(data: Partial<Website> & { id: string }) {
    try {
      console.log('🟢 handleUpdate called with:', data);
      const response = await fetch('/api/websites', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      console.log('📡 Update API response status:', response.status);
      const responseData = await response.json();
      console.log('📡 Update API response data:', responseData);

      if (!response.ok) {
        console.error('❌ Update failed:', responseData);
        alert(`เกิดข้อผิดพลาดในการอัปเดต: ${responseData.error || 'ไม่ทราบสาเหตุ'}`);
        throw new Error('Update failed');
      }

      console.log('✅ Update successful, refreshing data...');
      // Refresh data
      await refresh();
      console.log('✅ Data refreshed, clearing editing state...');

      // Clear editing state after successful update
      setEditing(null);
    } catch (error) {
      console.error('❌ Update error:', error);
      throw error; // Re-throw to let modal handle error
    }
  }

  async function handleDelete(id: string) {
    try {
      const response = await fetch(`/api/websites?id=${id}`, { method: 'DELETE' });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete failed:', errorData);
        alert(`เกิดข้อผิดพลาดในการลบ: ${errorData.error || 'ไม่ทราบสาเหตุ'}`);
        return;
      }

      await refresh();
    } catch (error) {
      console.error('Delete error:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  }

  async function logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/';
    }
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 pt-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-3">
            <button onClick={() => setOpen(true)} className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold">เพิ่มเว็บไซต์ใหม่</button>
            <button onClick={logout} className="px-4 py-2 rounded-lg border hover:bg-gray-100">ออกจากระบบ</button>
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
      <WebsiteModal
        open={!!editing}
        onClose={() => setEditing(null)}
        initial={editing ?? undefined}
        onSubmit={async (data) => {
          if (editing?.id) {
            await handleUpdate({ id: editing.id, ...data });
          } else {
            throw new Error('No editing ID found');
          }
        }}
      />
    </ProtectedRoute>
  );
}


