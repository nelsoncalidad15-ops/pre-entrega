import React from 'react';
import { History } from 'lucide-react';

export default function HistoryView() {
  return (
    <div className="h-full overflow-y-auto pr-2 pb-6 space-y-6">
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-base font-bold text-slate-800">Unidades Entregadas a Clientes</h3>
        <p className="text-xs text-slate-500 mt-1 font-sans">Sincronizado después del fardo de pre-entrega técnica y firma final con el menú maestro.</p>
        
        <div className="mt-8 border border-dashed border-slate-250 bg-slate-50 rounded-xl p-8 text-center max-w-md mx-auto">
          <History size={32} className="text-slate-400 mx-auto mb-3" />
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest leading-relaxed">Registro Histórico Desactivado</h4>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed font-sans">
            Las unidades ya entregadas se almacenan automáticamente en la hoja secundaria de tu planilla <b>"ENTR.json"</b>. 
            Activa la API de Google Sheets en la pestaña correspondiente para descargar el histórico aquí automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
