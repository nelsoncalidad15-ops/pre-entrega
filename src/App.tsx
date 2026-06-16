import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpenCheck,
  Car,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Fuel,
  KeyRound,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Wifi,
  WifiOff,
} from 'lucide-react';

import { INITIAL_VEHICLES } from './data/initialData';
import { Vehicle } from './types';

type SyncState = 'idle' | 'syncing' | 'online' | 'fallback' | 'error';

interface SheetRow extends Vehicle {
  family: string;
  searchable: string;
}

const SHEET_STORAGE_KEY = 'gestion-pre-entrega-sheet-url';
const bundledRows = INITIAL_VEHICLES.map(normalizeVehicle);

const fieldAliases: Record<keyof Vehicle, string[]> = {
  interno: ['INTERNO'],
  vin: ['VIN'],
  vehiculo: ['VEHICULO'],
  color: ['COLOR'],
  recepcion: ['F. DE RECEPCION', 'F DE RECEPCION', 'RECEPCION'],
  pago: ['F. DE PAGO', 'F DE PAGO', 'PAGO'],
  boxUbicacion: ['BOX Y UBICACION', 'BOX Y UBICACIÓN'],
  box: ['N DE BOX', 'Nº DE BOX', 'NO DE BOX', 'BOX'],
  ubicacion: ['UBICACION', 'UBICACIÓN'],
  armadoPor: ['ARMADO POR'],
  codRadio: ['COD RADIO'],
  llave: ['LLAVE'],
  combustible: ['COMBUSTIBLE'],
  estado: ['ESTADO'],
  informe: ['INFORME DE LA UNIDAD', 'INFORME'],
  otroInforme: ['OTRO INFORME'],
  accesorios: ['ACCESORIOS'],
  exhibicion: ['EN EXHIBICION', 'EN EXHIBICIÓN'],
  preEntregado: ['PRE-ENTRGADO', 'PRE-ENTREGADO'],
  viajes: ['VIAJES'],
  manual: ['MANUAL'],
  check: ['CHECK'],
  destinoActual: ['DESTINO ACTUAL'],
  destinoTerminal: ['DESTINO TERMINAL'],
  facturado: ['FACTURADO'],
  venta: ['VENTA'],
  vendedor: ['VENDEDOR'],
  dominio: ['DOMINIO'],
  ordenes: ['N ORDENES', 'Nº ORDENES', 'NO ORDENES'],
  controlRealizado: ['CONTROL REALIZADO'],
  opState: [''],
};

function clean(value: unknown) {
  return String(value ?? '').replace(/\r/g, '').trim();
}

function keyName(value: string) {
  return clean(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

function firstValue(source: Record<string, string>, aliases: string[]) {
  const normalized = new Map(Object.entries(source).map(([key, value]) => [keyName(key), clean(value)]));
  for (const alias of aliases) {
    const value = normalized.get(keyName(alias));
    if (value) return value;
  }
  return '';
}

function getFamily(vehicle: string) {
  const value = vehicle.toLowerCase();
  const families = ['amarok', 't-cross', 'tcross', 'tera', 'nivus', 'taos', 'polo', 'virtus', 'vento', 'voyage', 'gol', 'saveiro', 'tiguan'];
  const found = families.find((name) => value.includes(name));
  if (!found) return 'OTROS';
  if (found === 'tcross') return 'T-CROSS';
  return found.toUpperCase();
}

function getOperationalState(row: Pick<Vehicle, 'estado' | 'informe' | 'otroInforme' | 'controlRealizado'>): Vehicle['opState'] {
  const text = [row.estado, row.informe, row.otroInforme, row.controlRealizado].join(' ').toLowerCase();
  if (['a reparar', 'rayad', 'aboll', 'golpe', 'faltante', 'perdida', 'pendiente', 'revisar'].some((word) => text.includes(word))) {
    return 'NOVEDAD';
  }
  if (row.estado.toLowerCase().includes('reparada')) return 'REVISAR';
  return 'OK';
}

function normalizeVehicle(vehicle: Vehicle): SheetRow {
  const normalized = {
    ...vehicle,
    interno: clean(vehicle.interno),
    vin: clean(vehicle.vin).toUpperCase(),
    vehiculo: clean(vehicle.vehiculo),
    color: clean(vehicle.color),
    recepcion: clean(vehicle.recepcion),
    pago: clean(vehicle.pago),
    boxUbicacion: clean(vehicle.boxUbicacion),
    box: clean(vehicle.box),
    ubicacion: clean(vehicle.ubicacion),
    armadoPor: clean(vehicle.armadoPor),
    codRadio: clean(vehicle.codRadio),
    llave: clean(vehicle.llave),
    combustible: clean(vehicle.combustible),
    estado: clean(vehicle.estado),
    informe: clean(vehicle.informe),
    otroInforme: clean(vehicle.otroInforme),
    accesorios: clean(vehicle.accesorios),
    exhibicion: clean(vehicle.exhibicion),
    preEntregado: clean(vehicle.preEntregado),
    viajes: clean(vehicle.viajes),
    manual: clean(vehicle.manual),
    check: clean(vehicle.check),
    destinoActual: clean(vehicle.destinoActual),
    destinoTerminal: clean(vehicle.destinoTerminal),
    facturado: clean(vehicle.facturado),
    venta: clean(vehicle.venta),
    vendedor: clean(vehicle.vendedor),
    dominio: clean(vehicle.dominio),
    ordenes: clean(vehicle.ordenes),
    controlRealizado: clean(vehicle.controlRealizado),
  };

  const opState = getOperationalState(normalized);
  const family = getFamily(normalized.vehiculo);
  return {
    ...normalized,
    opState,
    family,
    searchable: Object.values(normalized).join(' ').toLowerCase(),
  };
}

function rowFromSheet(row: Record<string, string>): SheetRow {
  const vehicle = Object.fromEntries(
    Object.entries(fieldAliases).map(([field, aliases]) => [field, field === 'opState' ? 'OK' : firstValue(row, aliases)])
  ) as Vehicle;

  return normalizeVehicle(vehicle);
}

function parseCsv(text: string) {
  const rows: string[][] = [];
  let current = '';
  let row: string[] = [];
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"' && quoted && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      row.push(current);
      current = '';
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && next === '\n') index += 1;
      row.push(current);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      current = '';
    } else {
      current += char;
    }
  }

  row.push(current);
  if (row.some((cell) => cell.trim())) rows.push(row);
  const headers = rows.shift()?.map(clean) ?? [];
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, clean(cells[index])])));
}

function toCsvUrl(input: string) {
  const value = clean(input);
  const id = value.match(/\/spreadsheets\/d\/([^/]+)/)?.[1];
  const gid = value.match(/[?&]gid=(\d+)/)?.[1] ?? '0';
  if (id) return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
  return value;
}

function StatusBadge({ state }: { state: Vehicle['opState'] }) {
  const styles = {
    OK: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    NOVEDAD: 'border-rose-200 bg-rose-50 text-rose-700',
    REVISAR: 'border-amber-200 bg-amber-50 text-amber-700',
  };
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${styles[state]}`}>{state}</span>;
}

function DataPoint({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase text-slate-500">
        {Icon && <Icon size={14} />}
        {label}
      </div>
      <div className="mt-1 whitespace-pre-line text-sm font-semibold text-slate-900">{value || '-'}</div>
    </div>
  );
}

export default function App() {
  const [rows, setRows] = useState<SheetRow[]>(bundledRows);
  const [query, setQuery] = useState('');
  const [stateFilter, setStateFilter] = useState('TODOS');
  const [sheetUrl, setSheetUrl] = useState(() => localStorage.getItem(SHEET_STORAGE_KEY) ?? '');
  const [syncState, setSyncState] = useState<SyncState>('fallback');
  const [lastSync, setLastSync] = useState('');
  const [selectedVin, setSelectedVin] = useState(bundledRows[0]?.vin ?? '');

  const syncSheet = async (url = sheetUrl) => {
    const csvUrl = toCsvUrl(url);
    if (!csvUrl) {
      setRows(bundledRows);
      setSyncState('fallback');
      setLastSync('');
      return;
    }

    setSyncState('syncing');
    try {
      const response = await fetch(csvUrl);
      if (!response.ok) throw new Error('No se pudo leer la hoja');
      const parsed = parseCsv(await response.text()).map(rowFromSheet).filter((row) => row.interno || row.vin);
      if (!parsed.length) throw new Error('La hoja no tiene filas con interno o VIN');
      setRows(parsed);
      setSelectedVin(parsed[0].vin);
      setSyncState('online');
      setLastSync(new Date().toLocaleString('es-AR'));
      localStorage.setItem(SHEET_STORAGE_KEY, url);
    } catch (error) {
      console.error(error);
      setRows(bundledRows);
      setSyncState('error');
      setLastSync('');
    }
  };

  useEffect(() => {
    if (sheetUrl) {
      syncSheet(sheetUrl);
    }
  }, []);

  const filteredRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesQuery = !needle || row.searchable.includes(needle);
      const matchesState = stateFilter === 'TODOS' || row.opState === stateFilter;
      return matchesQuery && matchesState;
    });
  }, [query, rows, stateFilter]);

  const selected = rows.find((row) => row.vin === selectedVin) ?? filteredRows[0] ?? rows[0];
  const stats = useMemo(() => {
    const count = (state: Vehicle['opState']) => rows.filter((row) => row.opState === state).length;
    return {
      total: rows.length,
      ok: count('OK'),
      novedad: count('NOVEDAD'),
      revisar: count('REVISAR'),
      sinPago: rows.filter((row) => row.pago.toLowerCase().includes('no')).length,
      facturado: rows.filter((row) => row.facturado.toLowerCase().includes('si')).length,
    };
  }, [rows]);

  const syncCopy = {
    idle: 'Listo para sincronizar',
    syncing: 'Sincronizando con Sheet',
    online: 'Sincronizado con Google Sheets',
    fallback: 'Usando datos de muestra',
    error: 'No se pudo sincronizar, usando muestra',
  }[syncState];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-900 text-white">
                <Car size={21} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-950">Gestion Pre-Entrega</h1>
                <p className="text-sm text-slate-500">Consulta operativa de unidades, llaves, manuales y estado PDI.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${syncState === 'online' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
              {syncState === 'online' ? <Wifi size={14} /> : <WifiOff size={14} />}
              {syncCopy}
            </span>
            {lastSync && <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600"><Clock3 size={14} />{lastSync}</span>}
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-5 px-4 py-5 sm:px-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <section className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <DataPoint label="Unidades" value={String(stats.total)} icon={Car} />
            <DataPoint label="OK" value={String(stats.ok)} icon={CheckCircle2} />
            <DataPoint label="Novedad" value={String(stats.novedad)} icon={AlertTriangle} />
            <DataPoint label="Revisar" value={String(stats.revisar)} icon={ShieldCheck} />
            <DataPoint label="No pagado" value={String(stats.sinPago)} icon={FileSpreadsheet} />
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_120px]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  className="h-11 w-full rounded-md border border-slate-300 bg-white pl-10 pr-3 text-sm font-semibold outline-none transition focus:border-slate-900"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar interno, VIN, dominio, modelo, color, box, vendedor..."
                />
              </label>
              <select
                className="h-11 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold outline-none focus:border-slate-900"
                value={stateFilter}
                onChange={(event) => setStateFilter(event.target.value)}
              >
                <option value="TODOS">Todos</option>
                <option value="OK">OK</option>
                <option value="NOVEDAD">Novedad</option>
                <option value="REVISAR">Revisar</option>
              </select>
              <button
                className="h-11 rounded-md bg-slate-900 px-4 text-sm font-bold text-white transition hover:bg-slate-700"
                onClick={() => {
                  setQuery('');
                  setStateFilter('TODOS');
                }}
              >
                Limpiar
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-black uppercase text-slate-700">Unidades encontradas</h2>
              <span className="text-xs font-bold text-slate-500">{filteredRows.length} resultados</span>
            </div>
            <div className="max-h-[590px] overflow-auto">
              <table className="w-full min-w-[920px] border-collapse text-left">
                <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] uppercase text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Interno</th>
                    <th className="px-4 py-3">VIN</th>
                    <th className="px-4 py-3">Vehiculo</th>
                    <th className="px-4 py-3">Box</th>
                    <th className="px-4 py-3">Llave</th>
                    <th className="px-4 py-3">Manual</th>
                    <th className="px-4 py-3">Estado</th>
                    <th className="px-4 py-3">Destino</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRows.map((row) => (
                    <tr
                      key={`${row.interno}-${row.vin}`}
                      className={`cursor-pointer transition hover:bg-slate-50 ${selected?.vin === row.vin ? 'bg-sky-50' : ''}`}
                      onClick={() => setSelectedVin(row.vin)}
                    >
                      <td className="px-4 py-3 font-black text-slate-950">{row.interno}</td>
                      <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{row.vin}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{row.vehiculo}</div>
                        <div className="text-xs font-semibold text-slate-500">{row.color}</div>
                      </td>
                      <td className="px-4 py-3 font-bold">{row.boxUbicacion || row.ubicacion || '-'}</td>
                      <td className="px-4 py-3 font-bold">{row.llave || '-'}</td>
                      <td className="px-4 py-3 font-bold">{row.manual || '-'}</td>
                      <td className="px-4 py-3"><StatusBadge state={row.opState} /></td>
                      <td className="px-4 py-3 text-xs font-semibold text-slate-600">{row.destinoActual || row.destinoTerminal || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <aside className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-black uppercase text-slate-700">Conexion Sheet</h2>
              <FileSpreadsheet size={18} className="text-slate-500" />
            </div>
            <input
              className="h-10 w-full rounded-md border border-slate-300 px-3 text-xs font-semibold outline-none focus:border-slate-900"
              value={sheetUrl}
              onChange={(event) => setSheetUrl(event.target.value)}
              placeholder="Pegar URL de Google Sheets o CSV publicado"
            />
            <button
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-slate-900 text-sm font-bold text-white transition hover:bg-slate-700 disabled:cursor-wait disabled:opacity-70"
              disabled={syncState === 'syncing'}
              onClick={() => syncSheet()}
            >
              <RefreshCw size={16} className={syncState === 'syncing' ? 'animate-spin' : ''} />
              Sincronizar
            </button>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              La hoja debe estar publicada o accesible con enlace. La web solo visualiza datos, no modifica el Sheet.
            </p>
          </div>

          {selected && (
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-black uppercase text-slate-500">Ficha de unidad</div>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">{selected.interno}</h2>
                  <div className="font-mono text-xs font-bold text-slate-500">{selected.vin}</div>
                </div>
                <StatusBadge state={selected.opState} />
              </div>

              <div className="space-y-3">
                <DataPoint label="Vehiculo" value={selected.vehiculo} icon={Car} />
                <div className="grid grid-cols-2 gap-3">
                  <DataPoint label="Box" value={selected.boxUbicacion || selected.ubicacion} icon={MapPin} />
                  <DataPoint label="Llave" value={selected.llave} icon={KeyRound} />
                  <DataPoint label="Manual" value={selected.manual} icon={BookOpenCheck} />
                  <DataPoint label="Combustible" value={selected.combustible} icon={Fuel} />
                </div>
                <DataPoint label="Estado de unidad" value={selected.estado || selected.informe} icon={ShieldCheck} />
                <DataPoint label="Informe / novedad" value={[selected.informe, selected.otroInforme].filter(Boolean).join('\n')} icon={AlertTriangle} />
                <div className="grid grid-cols-2 gap-3">
                  <DataPoint label="Pago" value={selected.pago} />
                  <DataPoint label="Facturado" value={selected.facturado} />
                  <DataPoint label="Dominio" value={selected.dominio} />
                  <DataPoint label="Ordenes" value={selected.ordenes} />
                </div>
                <DataPoint label="Destino" value={[selected.destinoActual, selected.destinoTerminal].filter(Boolean).join('\n')} icon={MapPin} />
                <DataPoint label="Venta / vendedor" value={[selected.venta, selected.vendedor].filter(Boolean).join('\n')} />
                <DataPoint label="Exhibicion / pre-entregado" value={[selected.exhibicion, selected.preEntregado].filter(Boolean).join('\n')} />
              </div>
            </div>
          )}
        </aside>
      </main>
    </div>
  );
}
