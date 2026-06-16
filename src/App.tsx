import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, Layers, AlertTriangle, FileSpreadsheet, History, Search, 
  LayoutDashboard, Plus, RefreshCw, CheckCircle, HelpCircle, Key, 
  MapPin, BookOpen, LogOut, Moon, Sun, Fuel, Shield, X
} from 'lucide-react';

import { Vehicle, ViewType, DashboardStats } from './types';
import Sidebar from './components/Sidebar';
import { INITIAL_VEHICLES } from './data/initialData';

// Modular Views
import DashboardView from './views/DashboardView';
import SearchView from './views/SearchView';
import DistributionView from './views/DistributionView';
import FollowupView from './views/FollowupView';
import HistoryView from './views/HistoryView';

export default function App() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<ViewType>('inicio');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [apiKey, setApiKey] = useState('autosol_pdi_secret_token_2026');
  
  // Custom manual Add Vehicle fields
  const [showAddModal, setShowAddModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    interno: '',
    vin: '',
    vehiculo: '',
    color: '',
    recepcion: new Date().toLocaleDateString('es-AR'),
    pago: 'NO PAGADO',
    boxUbicacion: '1-C-1',
    box: '1',
    ubicacion: 'C-1',
    llave: 'A',
    estado: 'OK',
  });

  // Load inventory from our API
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/inventory');
      if (!res.ok) throw new Error('No se pudo conectar con el portal de base de datos.');
      const data = await res.json();
      setVehicles(data);
      if (data.length > 0 && !selectedVehicle) {
        setSelectedVehicle(data[0]);
      }
      setError(null);
    } catch (err: any) {
      setVehicles(INITIAL_VEHICLES);
      if (INITIAL_VEHICLES.length > 0 && !selectedVehicle) {
        setSelectedVehicle(INITIAL_VEHICLES[0]);
      }
      setError('Modo estatico: los cambios no se guardan porque GitHub Pages no ejecuta el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Load API Key config
  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/inventory/config');
      if (res.ok) {
        const data = await res.json();
        if (data.apiKey) {
          setApiKey(data.apiKey);
        }
      }
    } catch (err) {
      console.error('Error fetching API key:', err);
    }
  };

  useEffect(() => {
    fetchInventory();
    fetchConfig();
  }, []);

  // Update a single vehicle in real-time
  const handleUpdateVehicle = async (updated: Vehicle): Promise<boolean> => {
    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify(updated)
      });
      if (res.ok) {
        // Optimistically update states
        setVehicles(prev => prev.map(v => v.vin.toUpperCase() === updated.vin.toUpperCase() ? updated : v));
        setSelectedVehicle(updated);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Delete vehicle
  const handleDeleteVehicle = async (vin: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/inventory/${vin}`, {
        method: 'DELETE',
        headers: {
          'X-API-KEY': apiKey
        }
      });
      if (res.ok) {
        setVehicles(prev => prev.filter(v => v.vin.toUpperCase() !== vin.toUpperCase()));
        setSelectedVehicle(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  // Handle adding custom manual unit
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.vin || !newVehicle.interno || !newVehicle.vehiculo) {
      alert("Por favor rellene los campos obligatorios (Interno, VIN, Vehículo)");
      return;
    }

    const payload: Vehicle = {
      interno: newVehicle.interno,
      vin: newVehicle.vin.toUpperCase(),
      vehiculo: newVehicle.vehiculo,
      color: newVehicle.color,
      recepcion: newVehicle.recepcion,
      pago: newVehicle.pago,
      boxUbicacion: newVehicle.boxUbicacion,
      box: newVehicle.box,
      ubicacion: newVehicle.ubicacion,
      armadoPor: '',
      codRadio: '',
      llave: newVehicle.llave,
      combustible: '✘',
      estado: newVehicle.estado,
      informe: 'Ingresado manualmente por el portal',
      otroInforme: '',
      accesorios: '',
      exhibicion: '',
      preEntregado: '',
      viajes: '',
      manual: '',
      check: '',
      destinoActual: 'LAS LOMAS',
      destinoTerminal: 'Casa Central - Jujuy',
      facturado: 'No',
      venta: '',
      vendedor: '',
      dominio: '',
      ordenes: '',
      controlRealizado: 'NO',
      opState: newVehicle.estado === 'OK' ? 'OK' : newVehicle.estado === 'A REPARAR' ? 'NOVEDAD' : 'REVISAR'
    };

    try {
      const res = await fetch('/api/inventory/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': apiKey
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setVehicles(prev => [payload, ...prev]);
        setSelectedVehicle(payload);
        setShowAddModal(false);
        setNewVehicle({
          interno: '',
          vin: '',
          vehiculo: '',
          color: '',
          recepcion: new Date().toLocaleDateString('es-AR'),
          pago: 'NO PAGADO',
          boxUbicacion: '1-C-1',
          box: '1',
          ubicacion: 'C-1',
          llave: 'A',
          estado: 'OK',
        });
      } else {
        alert("Ocurrió un error al intentar agregar la unidad.");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexión.");
    }
  };

  // Derive stats dynamically
  const stats: DashboardStats = useMemo(() => {
    const total = vehicles.length;
    const ok = vehicles.filter(v => v.opState === 'OK').length;
    const conNovedad = vehicles.filter(v => v.opState === 'NOVEDAD').length;
    const conRevisar = vehicles.filter(v => v.opState === 'REVISAR').length;
    const conManual = vehicles.filter(v => v.manual && v.manual !== '✘').length;
    const facturado = vehicles.filter(v => v.facturado.toLowerCase().includes('si')).length;
    const noPago = vehicles.filter(v => v.pago.toUpperCase().includes('NO')).length;

    return {
      total,
      ok,
      novedad: conNovedad,
      revisar: conRevisar,
      conManual,
      facturado,
      noPago
    };
  }, [vehicles]);

  // Derive top locations & models for charts
  const topFamilies = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach(v => {
      const name = v.vehiculo.split(' ')[0].toUpperCase();
      const fam = ['AMAROK', 'NIVUS', 'POLO', 'T-CROSS', 'TERA', 'TAOS', 'GOL', 'VOYAGE', 'UP!', 'VIRTUS'].includes(name) ? name : 'OTROS';
      counts[fam] = (counts[fam] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [vehicles]);

  const topLocations = useMemo(() => {
    const counts: Record<string, number> = {};
    vehicles.forEach(v => {
      const u = v.ubicacion || 'SIN DATO';
      counts[u] = (counts[u] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [vehicles]);

  return (
    <div id="root-portal" className="min-h-screen bg-slate-50 font-sans text-slate-700 flex selection:bg-indigo-600 selection:text-white">
      
      {/* Sidebar Navigation */}
      <Sidebar 
        currentView={currentView} 
        onViewChange={(v) => {
          setCurrentView(v);
          // Auto select first vehicle matching view if any to populate panel
          if (v === 'seguimiento') {
            const seg = vehicles.find(item => item.opState === 'NOVEDAD');
            if (seg) setSelectedVehicle(seg);
          }
        }} 
        title="VW Autosol"
        subtitle="PDI Jujuy"
      />

      {/* Main Panel Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Header */}
        <header className="px-8 py-5 border-b border-slate-250/80 bg-white shrink-0 flex items-center justify-between shadow-xs">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight leading-none">
              {currentView === 'inicio' && 'Control Visual de Internos'}
              {currentView === 'stock' && 'Estadísticas y Stock General'}
              {currentView === 'seguimiento' && 'Control de Novedades y Daños (Fardo)'}
            </h1>
            <p className="text-xs text-slate-500 font-sans mt-2">
              Inventario inteligente en tiempo real sincronizado con hoja maestra de Google Sheets.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchInventory}
              disabled={loading}
              className="p-2.5 rounded-xl bg-slate-50 border border-slate-255 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              title="Refrescar Inventario"
            >
              <RefreshCw size={15} className={`stroke-[2.5] ${loading ? 'animate-spin' : ''}`} />
            </button>

            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <span className="text-xs font-semibold text-slate-700">Nelson Calidad</span>
            </div>
          </div>
        </header>

        {/* View Space wrapper */}
        <div className="flex-1 overflow-hidden p-8">
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-4 text-xs font-semibold flex items-center justify-between shadow-xs">
              <span>{error}</span>
              <button onClick={fetchInventory} className="underline text-rose-800 hover:text-rose-950 font-bold ml-4 cursor-pointer">Reintentar</button>
            </div>
          )}

          {currentView === 'inicio' && (
            <DashboardView
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              stats={stats}
              handleUpdateVehicle={handleUpdateVehicle}
              handleDeleteVehicle={handleDeleteVehicle}
            />
          )}

          {currentView === 'buscador' && (
            <SearchView
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              handleUpdateVehicle={handleUpdateVehicle}
              handleDeleteVehicle={handleDeleteVehicle}
            />
          )}

          {currentView === 'stock' && (
            <DistributionView
              topFamilies={topFamilies}
              topLocations={topLocations}
            />
          )}

          {currentView === 'seguimiento' && (
            <FollowupView
              vehicles={vehicles}
              selectedVehicle={selectedVehicle}
              setSelectedVehicle={setSelectedVehicle}
              stats={stats}
              handleUpdateVehicle={handleUpdateVehicle}
              handleDeleteVehicle={handleDeleteVehicle}
            />
          )}

          {currentView === 'historial' && (
            <HistoryView />
          )}
        </div>

      </main>

    </div>
  );
}
