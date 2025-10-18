'use client';

import { ExternalLink, Target, Sparkles } from 'lucide-react';
import type { Website } from '@/lib/types';

interface WebsiteCardProps extends Website {}

const colorClasses = {
  blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
  green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
  purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
  red: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
  orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700',
};

export default function WebsiteCard({
  name,
  url,
  description,
  features,
  targetGroup,
  color
}: WebsiteCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
      <div className={`bg-gradient-to-r ${colorClasses[color]} p-6 text-white`}>
        <h3 className="text-2xl font-bold mb-2">{name}</h3>
        <p className="text-white/90">{description}</p>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            คุณสมบัติ
          </h4>
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-gray-600">
                <span className="text-green-500 mt-1">✓</span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mb-6">
          <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <Target className="w-5 h-5" />
            กลุ่มเป้าหมาย
          </h4>
          <p className="text-gray-600">{targetGroup}</p>
        </div>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`
            w-full flex items-center justify-center gap-2
            bg-gradient-to-r ${colorClasses[color]}
            text-white font-semibold py-3 px-6 rounded-lg
            transition-all duration-300
          `}
        >
          เข้าใช้งาน
          <ExternalLink className="w-5 h-5" />
        </a>
      </div>
    </div>
  );
}






