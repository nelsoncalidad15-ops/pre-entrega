import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, DashboardStats } from '../types';
import VehicleDetail from '../components/VehicleDetail';

interface FollowupViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (v: Vehicle | null) => void;
  stats: DashboardStats;
  handleUpdateVehicle: (updated: Vehicle) => Promise<boolean>;
  handleDeleteVehicle: (vin: string) => Promise<boolean>;
}

export default function FollowupView({
  vehicles,
  selectedVehicle,
  setSelectedVehicle,
  stats,
  handleUpdateVehicle,
  handleDeleteVehicle,
}: FollowupViewProps) {
  const filteredVehicles = vehicles.filter(v => v.opState !== 'OK');

  return (
    <div className="h-full overflow-y-auto pr-2 pb-6 space-y-6">
      {/* Follow-up units view header banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-850">Unidades Bajo Control Técnico</h3>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">Listado crítico de vehículos con novedades, golpes o faltas mecánicas reportadas. Revisar antes de pre-entrega.</p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-rose-100 bg-rose-50 text-xs font-bold text-rose-700 font-mono tracking-wider">
            ALERTAS CRÍTICAS DETECTADAS: {stats.novedad + stats.revisar} UNIDADES
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  <th className="px-5 py-4">Interno</th>
                  <th className="px-5 py-4">VIN</th>
                  <th className="px-5 py-4">Vehículo</th>
                  <th className="px-5 py-4">Estado</th>
                  <th className="px-5 py-4">Detalle de Novedad o Informe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans text-xs">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-400 font-medium font-sans">
                      No hay unidades con alarmas de seguimiento o reparaciones activas. ¡Stock excelente!
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map(v => (
                    <tr 
                      key={v.vin} 
                      onClick={() => setSelectedVehicle(v)}
                      className={`cursor-pointer transition-colors hover:bg-indigo-50/20 ${
                        selectedVehicle?.vin === v.vin ? 'bg-indigo-50/50' : ''
                      }`}
                    >
                      <td className="px-5 py-4 font-mono font-bold text-slate-800">{v.interno}</td>
                      <td className="px-5 py-4 font-mono text-slate-500">{v.vin}</td>
                      <td className="px-5 py-4 text-slate-700 font-semibold">{v.vehiculo}</td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full text-[10px] ${
                          v.opState === 'NOVEDAD' 
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {v.estado}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-500 italic max-w-sm truncate">{v.informe || v.otroInforme || 'Pendiente de diagnóstico'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Slide-Over Side Sheet Drawer */}
      <AnimatePresence>
        {selectedVehicle && (
          <>
            {/* Soft Backdrop overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVehicle(null)}
              className="fixed inset-0 bg-slate-900 z-40 backdrop-blur-xs cursor-pointer"
            />
            
            {/* Sliding Panel */}
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-md sm:max-w-lg bg-white border-l border-slate-200 shadow-2xl z-50 overflow-hidden flex flex-col"
            >
              <VehicleDetail 
                vehicle={selectedVehicle}
                onClose={() => setSelectedVehicle(null)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
