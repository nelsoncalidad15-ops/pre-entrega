import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle: string;
  icon: LucideIcon;
  iconColor: string;
  bgColor: string;
}

export default function StatCard({ title, value, subtitle, icon: Icon, iconColor, bgColor }: StatCardProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between mb-2">
        <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-8 h-8 rounded-lg ${bgColor || 'bg-slate-100'} flex items-center justify-center text-slate-700`}>
          <Icon size={16} className={iconColor} />
        </div>
      </div>
      
      <div>
        <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
          {value}
        </h3>
        <p className="text-[11px] text-slate-400 mt-1">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
