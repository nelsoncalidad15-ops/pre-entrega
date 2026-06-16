import React from 'react';

interface DistributionViewProps {
  topFamilies: [string, number][];
  topLocations: [string, number][];
}

export default function DistributionView({ topFamilies, topLocations }: DistributionViewProps) {
  return (
    <div className="h-full overflow-y-auto pr-2 pb-6 space-y-6">
      {/* Detailed distribution distribution charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-2">Resumen por Modelo</h3>
          <p className="text-xs text-slate-500 mb-6">Cantidad de stock distribuido por familias Volkswagen.</p>
          <div className="space-y-4">
            {topFamilies.map(([label, count]) => {
              const max = Math.max(...topFamilies.map(x => x[1]), 1);
              const percent = (count / max) * 100;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">{label}</span>
                    <span className="font-mono text-indigo-600 font-bold">{count} unidades</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/60">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-2">Resumen por Ubicación</h3>
          <p className="text-xs text-slate-500 mb-6 font-sans">Ocupación estimada física de los boxes del predio Jujuy.</p>
          <div className="space-y-4">
            {topLocations.map(([label, count]) => {
              const max = Math.max(...topLocations.map(x => x[1]), 1);
              const percent = (count / max) * 100;
              return (
                <div key={label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-600">{label || 'POR ASIGNAR'}</span>
                    <span className="font-mono text-sky-600 font-bold">{count} unidades</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200/60">
                    <div className="h-full bg-sky-500 rounded-full" style={{ width: `${percent}%` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
