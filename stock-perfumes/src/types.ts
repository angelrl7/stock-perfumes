export interface Perfume {
  id: string;
  nombre: string;
  marca: string;
  precio_compra: number;
  margen: number;
  precio_manual: number | null;
  stock: number;
  stock_minimo: number;
  foto_url: string | null;
  creado_en: string;
  actualizado_en: string;
}

export type TipoMovimiento = "entrada" | "venta" | "ajuste";

export interface Movimiento {
  id: string;
  perfume_id: string | null;
  perfume_nombre: string;
  tipo: TipoMovimiento;
  cantidad: number;
  usuario: string;
  creado_en: string;
}

export type TipoPago = "contado" | "semanal" | "mensual";

export interface Pago {
  id: string;
  venta_id: string;
  monto: number;
  fecha: string; // YYYY-MM-DD
  usuario: string;
  creado_en: string;
}

export interface Venta {
  id: string;
  perfume_id: string | null;
  perfume_nombre: string;
  cliente: string;
  cantidad: number;
  total: number;
  tipo_pago: TipoPago;
  usuario: string;
  creado_en: string;
  pagos: Pago[];
}

export interface NuevaVenta {
  cliente: string;
  cantidad: number;
  total: number;
  tipo_pago: TipoPago;
  /** Entrega inicial si es en cuotas; en contado se paga el total. */
  entrega: number;
}

export interface PerfumeInput {
  nombre: string;
  marca: string;
  precio_compra: number;
  margen: number;
  precio_manual: number | null;
  stock: number;
  stock_minimo: number;
  foto_url: string | null;
}
