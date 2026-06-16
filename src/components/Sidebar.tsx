import React from 'react';
import { ViewType } from '../types';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  FileSpreadsheet, 
  BarChart3,
  Car
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  title: string;
  subtitle: string;
}

export default function Sidebar({ currentView, onViewChange, title, subtitle }: SidebarProps) {
  // Simplificamos los items del menú para que sean directos e inequívocos
  const menuItems = [
    { id: 'inicio' as ViewType, label: 'Control de Internos', icon: LayoutDashboard },
    { id: 'stock' as ViewType, label: 'Gráficos y Estadísticas', icon: BarChart3 },
    { id: 'seguimiento' as ViewType, label: 'Novedades Técnicas', icon: AlertTriangle },
  ];

  return (
    <aside className="w-60 bg-slate-50 border-r border-slate-200/80 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-100 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center text-white font-extrabold text-xs tracking-tight shadow-sm">
            AS
          </div>
          <div>
            <h1 className="font-sans font-bold leading-none text-slate-800 tracking-tight text-sm">
              {title}
            </h1>
            <p className="text-[9px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider font-semibold">
              {subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group cursor-pointer ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold border-l-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100 border-l-2 border-transparent'
              }`}
            >
              <Icon 
                size={16} 
                className={`shrink-0 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-500'
                }`}
              />
              <span className="text-xs font-semibold">
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer Info */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between text-[10px] text-slate-400 font-sans px-1">
          <span className="flex items-center gap-1.5 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Google Sheets
          </span>
          <span className="text-[9px] font-mono opacity-80">v3.0</span>
        </div>
      </div>
    </aside>
  );
}
