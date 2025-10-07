'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (username === 'admin' && password === 'admin123') {
      localStorage.setItem('adminLoggedIn', 'true');
      router.replace('/admin/dashboard');
    } else {
      setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
  }

  return (
    <div>
      <Navbar />
      <div className="mx-auto max-w-md px-4 pt-24">
        <h1 className="text-2xl font-bold mb-6">เข้าสู่ระบบผู้ดูแล</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Username</label>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full border-2 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border-2 rounded-lg px-3 py-2" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold">เข้าสู่ระบบ</button>
        </form>
      </div>
    </div>
  );
}


