import React, { useState } from 'react';
import { Vehicle } from '../types';
import { Search, SlidersHorizontal, Key, BookOpen, AlertTriangle, CheckCircle, HelpCircle, ArrowUpDown } from 'lucide-react';

interface VehicleTableProps {
  vehicles: Vehicle[];
  onSelectVehicle: (v: Vehicle) => void;
  selectedVin?: string;
  onUpdateVehicle: (v: Vehicle) => void;
}

export default function VehicleTable({ vehicles, onSelectVehicle, selectedVin, onUpdateVehicle }: VehicleTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFamily, setSelectedFamily] = useState('');
  const [selectedUbicacion, setSelectedUbicacion] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [selectedPago, setSelectedPago] = useState('');
  const [selectedFacturado, setSelectedFacturado] = useState('');
  
  const [sortField, setSortField] = useState<keyof Vehicle>('interno');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [visibleCount, setVisibleCount] = useState(30);

  // Derive unique values for filters
  const families = Array.from(new Set(vehicles.map(v => {
    const name = v.vehiculo.split(' ')[0].toUpperCase();
    return ['AMAROK', 'NIVUS', 'POLO', 'T-CROSS', 'TERA', 'TAOS', 'GOL', 'VOYAGE', 'UP!', 'VIRTUS'].includes(name) ? name : 'OTROS';
  }))).sort();
  
  const ubicaciones = Array.from(new Set(vehicles.map(v => v.ubicacion).filter(Boolean))).sort();
  const estados = Array.from(new Set(vehicles.map(v => v.estado).filter(Boolean))).sort();

  const handleSort = (field: keyof Vehicle) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchSearch = 
      v.interno.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehiculo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.ubicacion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.dominio.toLowerCase().includes(searchQuery.toLowerCase());

    const modelName = v.vehiculo.split(' ')[0].toUpperCase();
    const derivedFamily = ['AMAROK', 'NIVUS', 'POLO', 'T-CROSS', 'TERA', 'TAOS', 'GOL', 'VOYAGE', 'UP!', 'VIRTUS'].includes(modelName) ? modelName : 'OTROS';
    const matchFamily = !selectedFamily || derivedFamily === selectedFamily;

    const matchUbicacion = !selectedUbicacion || v.ubicacion === selectedUbicacion;
    const matchEstado = !selectedEstado || v.estado === selectedEstado;
    const matchPago = !selectedPago || (selectedPago === 'PAGADO' ? v.pago.toUpperCase() === 'OK' : v.pago.toUpperCase().includes('NO'));
    const matchFacturado = !selectedFacturado || (selectedFacturado === 'FACTURADO' ? v.facturado.toLowerCase().includes('si') : v.facturado.toLowerCase().includes('no'));

    return matchSearch && matchFamily && matchUbicacion && matchEstado && matchPago && matchFacturado;
  });

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    let aVal = a[sortField] || '';
    let bVal = b[sortField] || '';
    
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const getOpStateBadge = (v: Vehicle) => {
    switch (v.opState) {
      case 'OK':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle size={10} />
            OK
          </span>
        );
      case 'NOVEDAD':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertTriangle size={10} />
            Novedad
          </span>
        );
      case 'REVISAR':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-850 border border-amber-200">
            <HelpCircle size={10} />
            Revisar
          </span>
        );
    }
  };

  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-4">
      {/* Search and Filters Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3.5 shadow-sm">
        {/* Row 1: Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Buscar unidad por Interno, VIN, Modelo, Color, Dominio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 text-slate-800 text-sm pl-11 pr-4 py-2.5 rounded-lg border border-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
            />
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 transition-all cursor-pointer ${
                showFilters 
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <SlidersHorizontal size={14} />
              <span>Filtros {showFilters ? '▲' : '▼'}</span>
            </button>

            <button 
              onClick={() => {
                setSearchQuery('');
                setSelectedFamily('');
                setSelectedUbicacion('');
                setSelectedEstado('');
                setSelectedPago('');
                setSelectedFacturado('');
              }}
              className="px-4 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-950 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
            >
              Borrar
            </button>
          </div>
        </div>

        {/* Row 2: Selected Filters */}
        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-2 text-slate-600 border-t border-slate-100 animate-fade-in">
            {/* Family Filter */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Modelo</span>
              <select
                value={selectedFamily}
                onChange={(e) => setSelectedFamily(e.target.value)}
                className="bg-white text-slate-800 text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-505 transition-colors cursor-pointer"
              >
                <option value="">Todos</option>
                {families.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>

            {/* Location Filter */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Ubicación</span>
              <select
                value={selectedUbicacion}
                onChange={(e) => setSelectedUbicacion(e.target.value)}
                className="bg-white text-slate-800 text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-505 transition-colors cursor-pointer"
              >
                <option value="">Todas</option>
                {ubicaciones.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            {/* OpState Filter */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Estado PDI</span>
              <select
                value={selectedEstado}
                onChange={(e) => setSelectedEstado(e.target.value)}
                className="bg-white text-slate-800 text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-505 transition-colors cursor-pointer"
              >
                <option value="">Cualquiera</option>
                {estados.map(st => (
                  <option key={st} value={st}>{st}</option>
                ))}
              </select>
            </div>

            {/* Payment Filter */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Estado Pago</span>
              <select
                value={selectedPago}
                onChange={(e) => setSelectedPago(e.target.value)}
                className="bg-white text-slate-800 text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-505 transition-colors cursor-pointer"
              >
                <option value="">Cualquiera</option>
                <option value="PAGADO font-semibold text-emerald-600">Solo Pagados (OK)</option>
                <option value="NO_PAGADO text-rose-600">Solo No Pagados</option>
              </select>
            </div>

            {/* Facturado Filter */}
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">Facturación</span>
              <select
                value={selectedFacturado}
                onChange={(e) => setSelectedFacturado(e.target.value)}
                className="bg-white text-slate-800 text-xs py-2 px-3 rounded-lg border border-slate-200 focus:outline-none focus:border-indigo-505 transition-colors cursor-pointer"
              >
                <option value="">Cualquiera</option>
                <option value="FACTURADO">Solo Facturados</option>
                <option value="NO_FACTURADO">Solo No Facturados</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Table Element */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th onClick={() => handleSort('interno')} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-800 select-none">
                  <div className="flex items-center gap-1.5">
                    Interno
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th onClick={() => handleSort('vin')} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-800 select-none">
                  <div className="flex items-center gap-1.5">
                    VIN
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th onClick={() => handleSort('vehiculo')} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-800 select-none">
                  <div className="flex items-center gap-1.5">
                    Vehículo / Modelo
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
                  Box / Ubic.
                </th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center select-none">
                  Llaves
                </th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest text-center select-none">
                  Manual
                </th>
                <th onClick={() => handleSort('opState')} className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest cursor-pointer hover:text-slate-800 select-none">
                  <div className="flex items-center gap-1.5">
                    Estado
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="px-5 py-3 text-[11px] font-bold text-slate-500 uppercase tracking-widest select-none">
                  Pagaré
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedVehicles.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-slate-400 font-sans text-sm">
                    No se encontraron unidades con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                sortedVehicles.slice(0, visibleCount).map((v) => {
                  const isSelected = selectedVin === v.vin;
                  const isNoPago = v.pago.toUpperCase().includes('NO');
                  const isSiFact = v.facturado.toLowerCase().includes('si') || v.facturado === '1';

                  return (
                    <tr
                      key={v.vin}
                      onClick={() => onSelectVehicle(v)}
                      className={`cursor-pointer transition-colors hover:bg-slate-50/50 ${
                        isSelected ? 'bg-indigo-50/50 hover:bg-indigo-50/50 border-l-4 border-indigo-600' : ''
                      }`}
                    >
                      {/* Interno */}
                      <td className="px-5 py-3.5 text-sm font-bold text-slate-800 font-mono">
                        {v.interno}
                      </td>
                      
                      {/* VIN */}
                      <td className="px-5 py-3.5 text-xs text-slate-500 font-mono">
                        {v.vin}
                      </td>

                      {/* Vehiculo & Color */}
                      <td className="px-5 py-3.5">
                        <div className="text-xs font-semibold text-slate-800 tracking-tight break-words max-w-[200px] sm:max-w-xs">{v.vehiculo}</div>
                        <div className="text-[10px] text-slate-400 font-sans mt-0.5">{v.color || '—'}</div>
                      </td>

                      {/* Box Location */}
                      <td className="px-5 py-3.5 text-xs text-slate-600">
                        {v.boxUbicacion ? (
                          <span className="px-2 py-1 rounded bg-indigo-50/50 text-indigo-700 font-mono border border-indigo-100">
                            {v.boxUbicacion}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Llave */}
                      <td className="px-5 py-3.5 text-xs text-slate-500 text-center">
                        <span className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded ${
                          v.llave ? 'bg-slate-100 text-slate-800 font-bold border border-slate-200' : 'text-slate-400'
                        }`}>
                          <Key size={11} className="text-indigo-600 shrink-0" />
                          {v.llave || '✘'}
                        </span>
                      </td>

                      {/* Manual */}
                      <td className="px-5 py-3.5 text-xs text-slate-500 text-center">
                        <span className={`inline-flex items-center gap-1 font-mono text-xs px-2 py-0.5 rounded ${
                          v.manual ? 'bg-slate-100 text-slate-800 font-bold border border-slate-200' : 'text-slate-400'
                        }`}>
                          <BookOpen size={11} className="text-indigo-600 shrink-0" />
                          {v.manual || '✘'}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="px-5 py-3.5">
                        {getOpStateBadge(v)}
                      </td>

                      {/* Pago */}
                      <td className="px-5 py-3.5 text-xs">
                        <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isNoPago 
                            ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {v.pago}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Load More Button */}
        {sortedVehicles.length > visibleCount && (
          <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
            <button
              onClick={() => setVisibleCount(visibleCount + 30)}
              className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-250 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-all shadow-sm"
            >
              Mostrar 30 unidades más ({sortedVehicles.length - visibleCount} ocultos)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
