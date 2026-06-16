export interface Vehicle {
  interno: string;
  vin: string;
  vehiculo: string;
  color: string;
  recepcion: string;
  pago: string;
  boxUbicacion: string;
  box: string;
  ubicacion: string;
  armadoPor: string;
  codRadio: string;
  llave: string;
  combustible: string;
  estado: string;
  informe: string;
  otroInforme: string;
  accesorios: string;
  exhibicion: string;
  preEntregado: string;
  viajes: string;
  manual: string;
  check: string;
  destinoActual: string;
  destinoTerminal: string;
  facturado: string;
  venta: string;
  vendedor: string;
  dominio: string;
  ordenes: string;
  controlRealizado: string;
  opState: 'OK' | 'NOVEDAD' | 'REVISAR';
}

export type ViewType = 'inicio' | 'buscador' | 'stock' | 'seguimiento' | 'sheets' | 'historial';

export interface DashboardStats {
  total: number;
  ok: number;
  novedad: number;
  revisar: number;
  facturado: number;
  noPago: number;
  conManual: number;
}
