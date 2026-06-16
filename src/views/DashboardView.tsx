import React, { useState, useMemo } from 'react';
import { 
  Car, Key, MapPin, Clock, AlertTriangle, CheckCircle, Search, 
  Printer, Save, RefreshCw, Info, Bookmark, HelpCircle, Check, Sparkles,
  Truck, Star, User, UserCheck, Fuel, Wrench, Lock, Flag, Coins, HardDrive, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Vehicle, DashboardStats } from '../types';

interface DashboardViewProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  setSelectedVehicle: (v: Vehicle | null) => void;
  stats: DashboardStats;
  handleUpdateVehicle: (updated: Vehicle) => Promise<boolean>;
  handleDeleteVehicle: (vin: string) => Promise<boolean>;
}

export default function DashboardView({
  vehicles,
  selectedVehicle,
  setSelectedVehicle,
  stats,
  handleUpdateVehicle,
}: DashboardViewProps) {
  const [query, setQuery] = useState('');
  const [editedVehicle, setEditedVehicle] = useState<Vehicle | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  // Sync editedVehicle when selectedVehicle updates
  React.useEffect(() => {
    if (selectedVehicle) {
      setEditedVehicle({ ...selectedVehicle });
      setSaveStatus('idle');
    } else {
      setEditedVehicle(null);
    }
  }, [selectedVehicle]);

  // Handle value changes locally
  const handleLocalChange = (field: keyof Vehicle, value: string) => {
    if (!editedVehicle) return;
    const updated = { ...editedVehicle, [field]: value };
    
    // Auto calculate operative state flag
    if (field === 'estado' || field === 'informe' || field === 'otroInforme') {
      const descText = [updated.estado, updated.informe, updated.otroInforme].join(" ").toLowerCase();
      if (["a reparar", "reparar", "rayad", "aboll", "golpe", "faltante", "novedad"].some(str => descText.includes(str))) {
        updated.opState = "NOVEDAD";
      } else if (["revisar", "unidad reparada"].some(str => descText.includes(str))) {
        updated.opState = "REVISAR";
      } else {
        updated.opState = "OK";
      }
    }
    setEditedVehicle(updated);
  };

  const handleQuickSave = async () => {
    if (!editedVehicle) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const success = await handleUpdateVehicle(editedVehicle);
      if (success) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('error');
      }
    } catch {
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Instant filtering based on VIN, Interno, model or patent license
  const filteredVehicles = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    
    return vehicles.filter(v => 
      v.interno.toLowerCase().includes(q) || 
      v.vin.toLowerCase().includes(q) ||
      v.vehiculo.toLowerCase().includes(q) ||
      v.dominio?.toLowerCase().includes(q)
    );
  }, [vehicles, query]);

  // Quick select recommendations
  const quickSuggestions = useMemo(() => {
    return vehicles.slice(0, 5);
  }, [vehicles]);

  const handleSelect = (v: Vehicle) => {
    setSelectedVehicle(v);
    setQuery(''); // Clear search so focus goes purely to technical sheet
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="h-full flex flex-col gap-6 font-sans text-slate-700 overflow-y-auto pb-20 pr-1.5 scrollbar-thin">
      
      {/* SECCIÓN NO-PRINT: PANEL DE BUSQUEDA PREMIUM */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm no-print relative overflow-hidden">
        {/* Subtle accent bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-700" />
        
        <div className="max-w-2xl mx-auto text-center py-1">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
            <span className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              CONSULTATORIO DIRECTO POR VIN / INTERNO
            </span>
            <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-widest bg-emerald-50 border border-emerald-150 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-3xs animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              GOOGLE SHEETS VINCULADO
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mt-1 mb-1.5 tracking-tight">
            ¿Qué unidad desea revisar hoy?
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5 leading-normal">
            Ingrese el número de <b>Interno</b> o los dígitos de su <b>VIN / Chasis</b> para cargar instantáneamente toda la fila de datos desde Google Sheets.
          </p>

          <div className="relative max-w-md mx-auto">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <Search size={18} className="stroke-[2.5] text-indigo-500" />
            </span>
            <input
              type="text"
              placeholder="Escriba Interno o VIN (ej: 47062)..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                // Auto matching for fast loading
                const exactMatch = vehicles.find(v => 
                  v.interno === e.target.value || 
                  v.vin.toUpperCase() === e.target.value.trim().toUpperCase()
                );
                if (exactMatch) {
                  setSelectedVehicle(exactMatch);
                }
              }}
              className="w-full bg-slate-50 text-slate-900 text-sm pl-11 pr-4 py-3 rounded-xl border border-slate-250 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:bg-white transition-all shadow-xs font-bold text-center uppercase tracking-wider"
            />
            
            {/* Intelligent search suggestions */}
            <AnimatePresence>
              {query.trim() && filteredVehicles.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="absolute left-0 right-0 mt-2 bg-white border border-slate-250 rounded-xl shadow-lg z-50 overflow-hidden divide-y divide-slate-100 max-h-56 overflow-y-auto text-left"
                >
                  {filteredVehicles.map(v => (
                    <button
                      key={v.vin}
                      onClick={() => handleSelect(v)}
                      className="w-full p-3 hover:bg-indigo-50/50 flex items-center justify-between text-xs transition-colors cursor-pointer text-left font-sans"
                    >
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-semibold text-slate-400">#</span>
                          <span className="font-mono font-black text-slate-900 text-sm">{v.interno}</span>
                          <span className="text-[10px] text-slate-450 font-semibold font-mono">({v.vin})</span>
                        </div>
                        <div className="text-slate-600 font-semibold mt-0.5">{v.vehiculo}</div>
                      </div>
                      <div className="flex items-end flex-col gap-1">
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Box {v.boxUbicacion || 'S/D'}</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                          v.opState === 'OK' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {v.estado || 'OK'}
                        </span>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
              {query.trim() && filteredVehicles.length === 0 && (
                <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl p-4 shadow-md z-50 text-xs text-slate-400">
                  Ninguna unidad coincide con tu búsqueda.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Suggested Quick Cards */}
        {!selectedVehicle && (
          <div className="pt-4 mt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono flex items-center gap-1">
              🔍 Unidades de ejemplo:
            </span>
            {quickSuggestions.map(v => (
              <button
                key={v.vin}
                onClick={() => handleSelect(v)}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700 text-slate-600 font-bold rounded-lg border border-slate-200 text-[11px] transition-colors cursor-pointer"
              >
                No. <span className="font-mono text-indigo-600 font-extrabold">{v.interno}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN CENTRAL: FICHA REPRODUCTORA EXTREMADAMENTE VISUAL Y ATRACTIVA */}
      <div className="flex-1 max-w-4xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {editedVehicle ? (
            <motion.div
              key={editedVehicle.vin}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.2 }}
              className="bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden print-content"
              id="printable-ficha-autosol"
            >
              {/* CABECERA DE MARCA PREMIUM */}
              <div className="bg-[#0b1329] text-white p-6 flex flex-col md:flex-row items-center justify-between gap-4 select-none border-b border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white font-black text-2xl border border-white/10 shadow-inner">
                    {editedVehicle.interno ? editedVehicle.interno.slice(-2) : 'VW'}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
                        INTERNO {editedVehicle.interno || '—'}
                      </h3>
                      <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black font-mono px-2.5 py-0.5 rounded-full uppercase tracking-widest">
                        VIN: {editedVehicle.vin}
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200/70 font-semibold tracking-wide uppercase mt-1">
                      Ficha de Control de Entrega PDI • Concesionario Oficial Autosol
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 no-print">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-[10px] font-black text-indigo-300 uppercase tracking-widest block">Experiencia 5 Estrellas</span>
                    <span className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 block uppercase">
                      {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </span>
                  </div>
                  
                  <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

                  <div className="flex items-center gap-2">
                    <button 
                      onClick={triggerPrint}
                      className="px-4 py-2 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs shrink-0"
                      title="Imprimir Ficha"
                    >
                      <Printer size={15} className="text-indigo-600 stroke-[2.5]" />
                      <span>Imprimir</span>
                    </button>
                    <button 
                      onClick={() => {
                        setSelectedVehicle(null);
                        setQuery('');
                      }}
                      className="px-3 py-2 text-xs font-bold text-slate-350 hover:text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors cursor-pointer border border-slate-800 shrink-0"
                      title="Cerrar Ficha"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </div>

              {/* CONTENIDO PRINCIPAL: BENTO GRID CON CUADROS ELEGANTES, COLORES Y LETRAS PREMIUM */}
              <div className="p-6 md:p-8 bg-slate-50 grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-850">
                
                {/* 1. IDENTIFICACIÓN DE LA UNIDAD */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3.5">
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Car size={16} className="stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest font-mono">DATOS DE LA UNIDAD</span>
                    </div>

                    <div className="space-y-3.5">
                      {/* MODELO */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">MODELO Y VERSIÓN</span>
                        <span className="text-sm font-black text-slate-900 tracking-tight block mt-0.5 leading-snug">
                          {editedVehicle.vehiculo}
                        </span>
                      </div>

                      {/* COLOR Y DOMINIO */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">COLOR</span>
                          <span className="text-xs font-extrabold text-slate-800 block mt-0.5">
                            {editedVehicle.color || '—'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">DOMINIO</span>
                          <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-md inline-block mt-0.5 uppercase">
                            {editedVehicle.dominio || 'S/D'}
                          </span>
                        </div>
                      </div>

                      {/* MOTOR */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Nº MOTOR / ID DE OPERACIÓN</span>
                        <span className="text-xs font-mono font-extrabold text-slate-700 block mt-0.5">
                          {editedVehicle.codRadio ? `MOT-${editedVehicle.codRadio}` : '0 (No especificado)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* INGRESO RECEPCION */}
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-black text-slate-450 uppercase tracking-widest block font-mono">F. DE RECEPCIÓN</span>
                      <span className="text-xs font-extrabold text-slate-800 font-mono mt-0.5 block">
                        {editedVehicle.recepcion || 'S/D'}
                      </span>
                    </div>
                    <Truck size={22} className="text-slate-400 stroke-[1.8] opacity-80" />
                  </div>
                </div>

                {/* 2. UBICACIÓN Y LOGÍSTICA DE ACCESOS */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3.5">
                      <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                        <Key size={16} className="stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-amber-600 tracking-widest font-mono">UBICACIÓN Y LOGÍSTICA</span>
                    </div>

                    <div className="space-y-4">
                      {/* BOX FÍSICO */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">BOX FÍSICO EN PLAYA</span>
                        <div className="mt-1.5 bg-amber-400 border border-amber-500 text-slate-950 font-black text-center text-sm py-2 rounded-xl tracking-wider uppercase shadow-3xs">
                          {editedVehicle.boxUbicacion || 'SIN ASIGNAR'}
                        </div>
                      </div>

                      {/* SECTOR */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">PLAYA / SUCURSAL</span>
                        <div className="mt-1 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl font-bold text-xs text-slate-700 flex items-center gap-2 font-mono">
                          <MapPin size={14} className="text-indigo-500" />
                          <span>Casa Central - Jujuy</span>
                        </div>
                      </div>

                      {/* COD LLAVE */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">CASILLERO LLAVE</span>
                        <div className="mt-1 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl text-xs font-black text-slate-800 flex items-center justify-between font-mono">
                          <span>{editedVehicle.llave || '—'}</span>
                          <span className="text-[9px] font-sans font-extrabold bg-slate-200 text-slate-500 px-2 py-0.5 rounded uppercase">Casillero</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* DESTINO TERMINAL */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">DESTINO SUCURSAL / TERMINAL</span>
                    <span className="text-xs font-extrabold text-slate-800 mt-1 block">
                      {editedVehicle.destinoTerminal === 'AUTOSOL CLAS' ? 'AUTOSOL CASA CENTRAL' : editedVehicle.destinoTerminal || 'Casa Central'}
                    </span>
                  </div>
                </div>

                {/* 3. DIAGNÓSTICO PDI Y ESTADOS CLAVE */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-sm transition-shadow">
                  <div>
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3.5">
                      <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                        <CheckCircle size={16} className="stroke-[2.5]" />
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-600 uppercase tracking-widest font-mono">DIAGNÓSTICO Y CONTROLES</span>
                    </div>

                    <div className="space-y-3.5">
                      {/* ESTADO PDI */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">ESTADO GENERAL DE LA UNIDAD</span>
                        <div className={`mt-1.5 px-3 py-2.5 rounded-xl font-black text-xs border flex items-center justify-between tracking-wide uppercase ${
                          editedVehicle.estado?.toUpperCase().includes('OK') || editedVehicle.opState === 'OK'
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-800'
                            : 'bg-rose-50 border-rose-100 text-rose-850 animate-pulse'
                        }`}>
                          <span className="font-mono">
                            {editedVehicle.estado ? editedVehicle.estado : editedVehicle.opState === 'OK' ? 'ESTADO CONFORME (OK)' : 'EN REVISIÓN / NOVEDADES'}
                          </span>
                          <div className={`w-2 h-2 rounded-full ${editedVehicle.estado?.toUpperCase().includes('OK') || editedVehicle.opState === 'OK' ? 'bg-emerald-500' : 'bg-red-500 animate-ping'}`} />
                        </div>
                      </div>

                      {/* COMBUSTIBLE */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">NIVEL DE COMBUSTIBLE</span>
                        <div className={`mt-1 bg-slate-50 border border-slate-100 px-3 py-2 rounded-xl font-bold text-xs flex items-center justify-between ${
                          editedVehicle.combustible === '✔' 
                            ? 'text-emerald-700 bg-emerald-50/40 border-emerald-100' 
                            : 'text-red-700 bg-rose-50/40 border-rose-100'
                        }`}>
                          <div className="flex items-center gap-2">
                            <Fuel size={14} className={editedVehicle.combustible === '✔' ? 'text-emerald-500' : 'text-red-500'} />
                            <span>{editedVehicle.combustible === '✔' ? 'COMB. CARGADO' : 'SIN NAFTA / REVISAR'}</span>
                          </div>
                          <span className="font-mono font-black">{editedVehicle.combustible === '✔' ? 'OK (✔)' : 'VACÍO (✘)'}</span>
                        </div>
                      </div>

                      {/* CONTROL REALIZADO */}
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">REGISTRO DE PLANILLA</span>
                        <div className="mt-1 bg-slate-50 border border-slate-200 px-3 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 flex justify-between items-center font-mono">
                          <span>CONTROL DE FARDO TÉCNICO</span>
                          <span className="bg-emerald-120 text-emerald-800 px-2.5 py-0.5 rounded text-[10px] uppercase font-bold">
                            {editedVehicle.controlRealizado || 'REALIZADO'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ASESOR COMERCIAL */}
                  <div className="mt-4 pt-4 border-t border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">ASESOR DE CLIENTE (VENDEDOR)</span>
                    <span className="text-xs font-black text-indigo-700 mt-1 block">
                      {editedVehicle.vendedor || 'GENERAL AUTOSOL'}
                    </span>
                  </div>
                </div>

                {/* 4. SECCIÓN COMERCIAL, FACTURA Y VW CREDIT */}
                <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3.5">
                    <div className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">
                      <Coins size={16} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest font-mono">INFORMACIÓN COMERCIAL</span>
                  </div>

                  <div className="space-y-4">
                    {/* FACTURACIÓN */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">ESTADO DE FACTURA</span>
                      <div className={`mt-1.5 px-3 py-2.5 rounded-xl font-bold text-xs border flex items-center justify-between ${
                        editedVehicle.facturado?.toLowerCase().includes('si') 
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                          : 'bg-rose-50 border-rose-100 text-rose-800'
                      }`}>
                        <span>{editedVehicle.facturado?.toLowerCase().includes('si') ? 'UNIDAD FACTURADA SUCURSAL' : 'PENDIENTE COMERCIAL'}</span>
                        <span className="font-mono font-black">{editedVehicle.facturado?.toLowerCase().includes('si') ? 'SÍ' : 'NO'}</span>
                      </div>
                    </div>

                    {/* CONTROL DEL FARDO */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">CONTROL DE PAGO (FARDO)</span>
                      <div className="mt-1 bg-slate-50 border border-slate-100 px-3.5 py-2.5 rounded-xl font-black text-sm text-slate-800 flex items-center justify-between font-mono">
                        <span>ESTADO DE CUENTA</span>
                        <span className={`px-2.5 py-0.5 rounded text-xs select-none ${
                          editedVehicle.pago?.toLowerCase().includes('ok') || editedVehicle.pago === 'OK'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {editedVehicle.pago || 'PENDIENTE'}
                        </span>
                      </div>
                    </div>

                    {/* CREDIT ENLACE */}
                    <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3 flex items-center justify-between text-indigo-950">
                      <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-indigo-900 font-mono">
                        <Lock size={12} className="text-indigo-600" />
                        <span>VW CREDIT FINANCING</span>
                      </div>
                      <span className="text-[10px] font-mono font-black text-indigo-750 bg-indigo-120 px-2 py-0.5 rounded leading-none select-none">
                        {editedVehicle.facturado?.toLowerCase().includes('si') ? 'APROBADO' : 'PENDIENTE'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. FECHAS Y ENTREGAS PROGRAMADAS */}
                <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3.5">
                    <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
                      <Clock size={16} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-widest font-mono">FECHAS Y PROGRAMACIÓN</span>
                  </div>

                  <div className="space-y-4">
                    {/* FECHA PRE-ENTREGADO */}
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                      <span className="text-[9px] font-black text-slate-400 block tracking-widest uppercase font-mono">F. DE PRE-ENTREGA PROGRAMADA</span>
                      <div className="font-extrabold text-slate-800 font-mono mt-1 text-sm block">
                        {editedVehicle.preEntregado || 'No programado.'}
                      </div>
                    </div>

                    {/* FECHA EXHIBICION */}
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                      <span className="text-[9px] font-black text-slate-400 block tracking-widest uppercase font-mono">PLAYA DE EXHIBICIÓN-FECHA</span>
                      <div className="font-bold text-slate-700 font-mono mt-1 text-xs block">
                        {editedVehicle.exhibicion || 'S/D (No Exhibida)'}
                      </div>
                    </div>

                    {/* ÚLTIMO DESTINO */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">ÚLTIMO DESTINO DESEADO</span>
                      <div className="mt-1 flex items-center justify-between text-xs font-bold text-slate-750">
                        <span className="font-mono text-slate-600">{editedVehicle.destinoActual || 'P.D.I. Central'}</span>
                        <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-mono text-[10px] uppercase font-bold">
                          {editedVehicle.pago ? 'CONFORME' : 'EN ESPERA'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. ORDEN DE TALLER & NOVEDADES COMPLETO */}
                <div className="bg-white border border-slate-205 rounded-2xl p-5 shadow-xs space-y-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-3.5">
                    <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                      <AlertTriangle size={16} className="stroke-[2.5]" />
                    </div>
                    <span className="text-[11px] font-extrabold text-rose-600 uppercase tracking-widest font-mono">HISTORIAL DE NOVEDADES</span>
                  </div>

                  <div className="space-y-3">
                    {/* ORDEN DE TALLER */}
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl font-mono text-xs">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <span>ORDEN ADJUNTA (PDI)</span>
                        <span className="text-rose-600 font-extrabold">{editedVehicle.ordenes || 'OR-PENDIENTE'}</span>
                      </div>
                    </div>

                    {/* DETALLES DE CORRECCIONES */}
                    <div className="bg-rose-50/20 border border-rose-100/50 p-3.5 rounded-xl">
                      <span className="text-[9px] font-black text-rose-700 block tracking-widest uppercase font-mono">INSPECCIÓN LOGÍSTICA (RAYAS/GOLPES)</span>
                      <p className="mt-1.5 text-xs text-rose-950 font-bold leading-normal whitespace-pre-wrap min-h-[46px]">
                        {editedVehicle.informe || 'Sin registro de golpes, abolladuras o rayas cargadas.'}
                      </p>
                    </div>

                    {/* OTROS DETALLES */}
                    <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                      <span className="text-[9px] font-black text-slate-450 block tracking-widest uppercase font-mono">LAVADO / TRATAMIENTO</span>
                      <p className="mt-1 text-[11px] text-slate-600 font-semibold italic min-h-[22px]">
                        {editedVehicle.otroInforme || 'Presenta lavado conforme en Box de Entrega.'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              {/* PIE DE ACCIONES NO-PRINT */}
              <div className="p-5 bg-slate-150 border-t border-slate-200/80 no-print flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-mono tracking-tight flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Sincronizado con Google Sheets Maestro
                </span>

                <div className="text-[11px] text-slate-500 font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-xs">
                  Ficha de Visualización Directa
                </div>
              </div>

              {/* Status notifications */}
              <AnimatePresence>
                {saveStatus === 'success' && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="fixed bottom-5 right-5 z-50 bg-emerald-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2"
                  >
                    <CheckCircle size={15} />
                    Fila guardada en Google Sheets con éxito.
                  </motion.div>
                )}
                {saveStatus === 'error' && (
                  <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 20, opacity: 0 }}
                    className="fixed bottom-5 right-5 z-50 bg-rose-600 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2"
                  >
                    <AlertTriangle size={15} />
                    Error al sincronizar con Google Sheets. Controle su API.
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white border border-slate-200 border-dashed rounded-2xl p-12 text-center"
            >
              <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-500">
                <Search size={22} className="stroke-[2.5]" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Ingrese VIN o Interno</h3>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                Utilice el consultorio de arriba de forma super directa. Solo inserte la unidad a buscar para traer todos sus datos y permitir la impresión de la ficha técnica.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
}
