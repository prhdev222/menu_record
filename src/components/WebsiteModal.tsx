'use client';

import { useEffect, useState } from 'react';
import type { Website } from '@/lib/types';

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Partial<Website>;
  onSubmit: (data: Omit<Website, 'id' | 'createdAt' | 'updatedAt'>) => void;
};

export default function WebsiteModal({ open, onClose, initial, onSubmit }: Props) {
  const [name, setName] = useState(initial?.name ?? '');
  const [url, setUrl] = useState(initial?.url ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [features, setFeatures] = useState((initial?.features ?? []).join('\n'));
  const [targetGroup, setTargetGroup] = useState(initial?.targetGroup ?? '');
  const [color, setColor] = useState<Website['color']>(initial?.color ?? 'blue');

  useEffect(() => {
    setName(initial?.name ?? '');
    setUrl(initial?.url ?? '');
    setDescription(initial?.description ?? '');
    setFeatures((initial?.features ?? []).join('\n'));
    setTargetGroup(initial?.targetGroup ?? '');
    setColor(initial?.color ?? 'blue');
  }, [initial, open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name,
      url,
      description,
      features: features.split('\n').map(s => s.trim()).filter(Boolean),
      targetGroup,
      color,
    };
    onSubmit(payload);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-xl p-6">
        <h3 className="text-xl font-bold mb-4">{initial?.id ? 'แก้ไขเว็บไซต์' : 'เพิ่มเว็บไซต์ใหม่'}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">ชื่อเว็บไซต์</label>
            <input value={name} onChange={e => setName(e.target.value)} required className="w-full border-2 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">URL</label>
            <input type="url" value={url} onChange={e => setUrl(e.target.value)} required className="w-full border-2 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">คำอธิบาย</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} required className="w-full border-2 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">คุณสมบัติ (บรรทัดละ 1 รายการ)</label>
            <textarea value={features} onChange={e => setFeatures(e.target.value)} className="w-full border-2 rounded-lg px-3 py-2 h-28" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">กลุ่มเป้าหมาย</label>
            <input value={targetGroup} onChange={e => setTargetGroup(e.target.value)} required className="w-full border-2 rounded-lg px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">สี</label>
            <select value={color} onChange={e => setColor(e.target.value as Website['color'])} className="w-full border-2 rounded-lg px-3 py-2">
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="red">Red</option>
              <option value="orange">Orange</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">ยกเลิก</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary-500 text-white font-semibold">บันทึก</button>
          </div>
        </form>
      </div>
    </div>
  );
}


