export interface Perfume {
  id: string;
  nombre: string;
  marca: string;
  precio_compra: number;
  margen: number;
  precio_manual: number | null;
  stock: number;
  stock_minimo: number;
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

export interface PerfumeInput {
  nombre: string;
  marca: string;
  precio_compra: number;
  margen: number;
  precio_manual: number | null;
  stock: number;
  stock_minimo: number;
}
