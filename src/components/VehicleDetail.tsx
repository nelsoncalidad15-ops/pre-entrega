import React from 'react';
import { Vehicle } from '../types';
import { 
  X, Check, AlertCircle, Shield, Calendar, CreditCard, Radio, 
  MapPin, Key, FileText, ArrowRightLeft, Fuel, Activity, Sparkles, CheckCircle, HelpCircle, AlertTriangle
} from 'lucide-react';

interface VehicleDetailProps {
  vehicle: Vehicle | null;
  onClose?: () => void;
}

export default function VehicleDetail({ vehicle, onClose }: VehicleDetailProps) {
  if (!vehicle) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-200 mb-4">
          <FileText size={20} />
        </div>
        <h3 className="text-sm font-bold text-slate-700">Detalle Inmediato</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Selección de unidad para ver su ficha técnica de control de Google Sheets.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 overflow-hidden h-full flex flex-col shrink-0">
      {/* Title Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-white">
            Ficha de la Unidad
            <span className="text-[10px] uppercase px-2 py-0.5 rounded bg-white/15 border border-white/20 text-indigo-250 font-mono tracking-wider font-semibold">
              Solo Lectura
            </span>
          </h3>
          <p className="text-[10px] text-indigo-200 font-mono mt-0.5">VIN: {vehicle.vin}</p>
        </div>
        
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Main Details Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* Core Vehicle Header Info */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">MODELO DE VEHÍCULO</span>
          <div className="text-base font-black text-slate-850 mt-1 select-all">{vehicle.vehiculo}</div>
          <div className="text-[11px] text-slate-500 mt-2 flex flex-wrap gap-x-3 gap-y-1.5 items-center">
            <span>Color: <b className="text-slate-700">{vehicle.color || 'Sin dato'}</b></span>
            <span className="text-slate-300">•</span>
            <span>Interno: <b className="text-slate-700 font-mono select-all font-black bg-slate-200/50 px-1.5 py-0.5 rounded">{vehicle.interno}</b></span>
            <span className="text-slate-300">•</span>
            <span>Placa: <b className="text-slate-700 font-mono select-all bg-slate-200/50 px-1.5 py-0.5 rounded">{vehicle.dominio || 'S/D'}</b></span>
          </div>
        </div>

        {/* Real-time parameters block */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <Activity size={12} className="text-indigo-600" />
            Parámetros del Fardo / Logística
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            {/* Box Location */}
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Box Físico</span>
              <span className="font-mono text-xs font-extrabold text-slate-800 mt-1 block">
                {vehicle.boxUbicacion || '— (S/D)'}
              </span>
            </div>

            {/* Llave status */}
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Casillero Llave</span>
              <span className="font-mono text-xs font-extrabold text-slate-800 mt-1 block">
                {vehicle.llave || '— (Sin dato)'}
              </span>
            </div>

            {/* Combustible Status */}
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Combustible</span>
              <span className={`text-xs font-bold mt-1 block ${vehicle.combustible === '✔' ? 'text-emerald-700' : 'text-slate-500'}`}>
                {vehicle.combustible === '✔' ? 'CARGADO (✔)' : 'VACÍO (✘)'}
              </span>
            </div>

            {/* Estado Técnico */}
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150 col-span-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Estado Técnico</span>
              <span className={`text-xs font-black mt-1 block uppercase ${
                vehicle.estado === 'OK' ? 'text-emerald-700' : 'text-rose-700'
              }`}>
                {vehicle.estado || 'OK'}
              </span>
            </div>
          </div>
        </div>

        {/* Mechanical Report / Notes */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <AlertCircle size={12} className="text-indigo-650" />
            Novedades y Observaciones de Hoja BOX
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono block">Informe Técnico Principal</span>
            <p className="mt-1.5 text-xs text-slate-700 font-semibold leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
              {vehicle.informe || 'Sin detalles reportados en Google Sheets.'}
            </p>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider font-mono block">Herrero / Lavados</span>
            <p className="mt-1.5 text-xs text-slate-700 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
              {vehicle.otroInforme || 'Sin comentarios adicionales.'}
            </p>
          </div>
        </div>

        {/* Administration / Core Logistics */}
        <div className="space-y-4">
          <div className="text-xs font-bold text-slate-800 uppercase tracking-wider font-sans border-b border-slate-200 pb-1 flex items-center gap-1.5">
            <Shield size={12} className="text-indigo-650" />
            Administración y Facturación
          </div>

          <div className="grid grid-cols-2 gap-3 pb-4">
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Facturado</span>
              <span className="text-xs font-bold mt-1 block">
                {vehicle.facturado || 'No'}
              </span>
            </div>

            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Control Fardo / Pago</span>
              <span className="text-xs font-bold mt-1 block">
                {vehicle.pago || '—'}
              </span>
            </div>

            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Fecha Recepción</span>
              <span className="text-xs font-bold mt-1 block">
                {vehicle.recepcion || 'S/D'}
              </span>
            </div>

            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-150">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono block">Código Radio ID</span>
              <span className="text-xs font-mono font-bold mt-1 block">
                {vehicle.codRadio || '—'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info read only status label */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
        <span className="text-[10px] text-slate-400 font-mono tracking-wider uppercase font-semibold">
          Actualizado bidireccionalmente con Google Sheets
        </span>
      </div>
    </div>
  );
}
