import type { MovimientoCaja, Venta } from "../types";
import { totalPagado } from "./ventas";

/** Capital invertido en stock: precio de costo × cantidad, de todos los productos. */
export function capitalEnStock(perfumes: { precio_compra: number; stock: number }[]): number {
  return perfumes.reduce((suma, p) => suma + p.precio_compra * p.stock, 0);
}

export interface Ganancia {
  monto: number;
  porcentaje: number;
}

export interface GananciaDeUsuario extends Ganancia {
  usuario: string;
}

/**
 * Ganancia bruta por usuario: total vendido menos el costo de lo vendido, usando
 * el precio de compra ACTUAL de cada producto (las ventas no guardan un costo
 * histórico; si el producto ya se borró, esa venta no suma costo al cálculo).
 * De mayor a menor ganancia.
 */
export function gananciaPorUsuario(
  ventas: Venta[],
  perfumes: { id: string; precio_compra: number }[]
): GananciaDeUsuario[] {
  const costoPorId = new Map(perfumes.map((p) => [p.id, p.precio_compra]));
  const mapa = new Map<string, { vendido: number; costo: number }>();
  for (const v of ventas) {
    const actual = mapa.get(v.usuario) ?? { vendido: 0, costo: 0 };
    actual.vendido += v.total;
    actual.costo += (v.perfume_id ? costoPorId.get(v.perfume_id) ?? 0 : 0) * v.cantidad;
    mapa.set(v.usuario, actual);
  }
  return [...mapa.entries()]
    .map(([usuario, { vendido, costo }]) => {
      const monto = vendido - costo;
      return { usuario, monto, porcentaje: costo > 0 ? (monto / costo) * 100 : 0 };
    })
    .sort((a, b) => b.monto - a.monto);
}

/** Ganancia bruta total (todos los usuarios combinados). Ver {@link gananciaPorUsuario}. */
export function gananciaTotal(
  ventas: Venta[],
  perfumes: { id: string; precio_compra: number }[]
): Ganancia {
  const porUsuario = gananciaPorUsuario(ventas, perfumes);
  const monto = porUsuario.reduce((suma, g) => suma + g.monto, 0);
  const totalVendido = ventas.reduce((suma, v) => suma + v.total, 0);
  const costoTotal = totalVendido - monto;
  return { monto, porcentaje: costoTotal > 0 ? (monto / costoTotal) * 100 : 0 };
}

export interface TotalPorUsuario {
  usuario: string;
  total: number;
}

/** Total vendido (valor de venta, no lo cobrado) por cada usuario, de mayor a menor. */
export function totalVendidoPorUsuario(ventas: Venta[]): TotalPorUsuario[] {
  const mapa = new Map<string, number>();
  for (const v of ventas) {
    mapa.set(v.usuario, (mapa.get(v.usuario) ?? 0) + v.total);
  }
  return [...mapa.entries()]
    .map(([usuario, total]) => ({ usuario, total }))
    .sort((a, b) => b.total - a.total);
}

export interface VentasDeUsuario {
  usuario: string;
  total: number;
  ventas: Venta[];
}

/** Ventas agrupadas por usuario (cada una con el detalle), de mayor a menor total. */
export function ventasPorUsuarioDetalle(ventas: Venta[]): VentasDeUsuario[] {
  const mapa = new Map<string, Venta[]>();
  for (const v of ventas) {
    if (!mapa.has(v.usuario)) mapa.set(v.usuario, []);
    mapa.get(v.usuario)!.push(v);
  }
  return [...mapa.entries()]
    .map(([usuario, lista]) => ({
      usuario,
      total: lista.reduce((suma, v) => suma + v.total, 0),
      ventas: [...lista].sort((a, b) => b.creado_en.localeCompare(a.creado_en)),
    }))
    .sort((a, b) => b.total - a.total);
}

export type TipoMovimientoCajaUnificado = "cobro" | "ingreso" | "retiro";

export interface MovimientoCajaUnificado {
  id: string;
  tipo: TipoMovimientoCajaUnificado;
  /** Positivo si entra plata, negativo si sale. */
  monto: number;
  descripcion: string;
  usuario: string;
  fecha: string;
}

/** Une los cobros de ventas con los movimientos manuales de caja, ordenado del más nuevo al más viejo. */
export function movimientosCaja(
  ventas: Venta[],
  cajaMovimientos: MovimientoCaja[]
): MovimientoCajaUnificado[] {
  const deCobros: MovimientoCajaUnificado[] = ventas.flatMap((v) =>
    v.pagos.map((p) => ({
      id: `pago-${p.id}`,
      tipo: "cobro" as const,
      monto: Number(p.monto),
      descripcion: `${v.cliente} · ${v.perfume_nombre}`,
      usuario: p.usuario,
      fecha: p.fecha,
    }))
  );
  const manuales: MovimientoCajaUnificado[] = cajaMovimientos.map((m) => ({
    id: `caja-${m.id}`,
    tipo: m.tipo,
    monto: m.tipo === "retiro" ? -Math.abs(m.monto) : Math.abs(m.monto),
    descripcion: m.descripcion || (m.tipo === "ingreso" ? "Ingreso manual" : "Retiro"),
    usuario: m.usuario,
    fecha: m.fecha,
  }));
  return [...deCobros, ...manuales].sort((a, b) => b.fecha.localeCompare(a.fecha));
}

/** Saldo actual de la caja compartida: todo lo cobrado + ingresos manuales − retiros. */
export function saldoCaja(ventas: Venta[], cajaMovimientos: MovimientoCaja[]): number {
  const cobrado = ventas.reduce((suma, v) => suma + totalPagado(v), 0);
  const manual = cajaMovimientos.reduce(
    (suma, m) => suma + (m.tipo === "retiro" ? -Math.abs(m.monto) : Math.abs(m.monto)),
    0
  );
  return cobrado + manual;
}

/** Movimientos manuales de caja hechos por (y sobre la cuenta de) un usuario puntual. */
export function movimientosDeUsuario(
  usuario: string,
  cajaMovimientos: MovimientoCaja[]
): MovimientoCaja[] {
  return cajaMovimientos
    .filter((m) => m.usuario === usuario)
    .sort((a, b) => b.creado_en.localeCompare(a.creado_en));
}

/**
 * Saldo disponible en la cuenta individual de un usuario: lo que cobró de sus
 * propias ventas, menos lo que ya descontó de su cuenta (+ ingresos manuales propios).
 */
export function saldoIndividual(
  usuario: string,
  ventas: Venta[],
  cajaMovimientos: MovimientoCaja[]
): number {
  const cobrado = ventas
    .filter((v) => v.usuario === usuario)
    .reduce((suma, v) => suma + totalPagado(v), 0);
  const ajuste = movimientosDeUsuario(usuario, cajaMovimientos).reduce(
    (suma, m) => suma + (m.tipo === "retiro" ? -Math.abs(m.monto) : Math.abs(m.monto)),
    0
  );
  return cobrado + ajuste;
}

export interface CobradoYFiado {
  cobrado: number;
  fiado: number;
}

/** De las ventas propias de un usuario: cuánto está cobrado y cuánto sigue fiado. */
export function cobradoYFiadoDeUsuario(usuario: string, ventas: Venta[]): CobradoYFiado {
  const propias = ventas.filter((v) => v.usuario === usuario);
  return {
    cobrado: propias.reduce((suma, v) => suma + totalPagado(v), 0),
    fiado: propias.reduce((suma, v) => suma + Math.max(0, v.total - totalPagado(v)), 0),
  };
}

/** Plata fiada (todavía no cobrada) por cada usuario, de mayor a menor. */
export function fiadoPorUsuario(ventas: Venta[]): TotalPorUsuario[] {
  const mapa = new Map<string, number>();
  for (const v of ventas) {
    const debe = Math.max(0, v.total - totalPagado(v));
    if (debe > 0) mapa.set(v.usuario, (mapa.get(v.usuario) ?? 0) + debe);
  }
  return [...mapa.entries()]
    .map(([usuario, total]) => ({ usuario, total }))
    .sort((a, b) => b.total - a.total);
}

export interface MesVentas {
  mes: string; // "2026-07"
  etiqueta: string; // "Julio 2026"
  porUsuario: TotalPorUsuario[];
  total: number;
}

const MESES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/** Total vendido por mes, con desglose por usuario, del mes más reciente al más viejo. */
export function ventasPorMes(ventas: Venta[]): MesVentas[] {
  const mapa = new Map<string, Map<string, number>>();
  for (const v of ventas) {
    const mes = v.creado_en.slice(0, 7); // "YYYY-MM"
    if (!mapa.has(mes)) mapa.set(mes, new Map());
    const porUsuario = mapa.get(mes)!;
    porUsuario.set(v.usuario, (porUsuario.get(v.usuario) ?? 0) + v.total);
  }
  return [...mapa.entries()]
    .map(([mes, porUsuario]) => {
      const [anio, numMes] = mes.split("-").map(Number);
      const lista = [...porUsuario.entries()]
        .map(([usuario, total]) => ({ usuario, total }))
        .sort((a, b) => b.total - a.total);
      return {
        mes,
        etiqueta: `${MESES[numMes - 1]} ${anio}`,
        porUsuario: lista,
        total: lista.reduce((suma, u) => suma + u.total, 0),
      };
    })
    .sort((a, b) => b.mes.localeCompare(a.mes));
}

export interface GananciaDelMes extends Ganancia {
  mes: string; // "2026-07"
  etiqueta: string; // "Julio 2026"
  vendido: number;
  /** Costo de lo vendido (precio de compra actual × cantidad). */
  inversion: number;
}

/** Resumen mes a mes: vendido, inversión y ganancia, del mes más reciente al más viejo. */
export function gananciaPorMes(
  ventas: Venta[],
  perfumes: { id: string; precio_compra: number }[]
): GananciaDelMes[] {
  return ventasPorMes(ventas).map(({ mes, etiqueta, total }) => {
    const { monto, porcentaje } = gananciaTotal(ventasDelMes(mes, ventas), perfumes);
    return { mes, etiqueta, vendido: total, inversion: total - monto, monto, porcentaje };
  });
}

/** Ventas de un mes puntual ("2026-07"), opcionalmente de un solo usuario, de la más vieja a la más nueva. */
export function ventasDelMes(mes: string, ventas: Venta[], usuario?: string): Venta[] {
  return ventas
    .filter((v) => v.creado_en.slice(0, 7) === mes && (!usuario || v.usuario === usuario))
    .sort((a, b) => a.creado_en.localeCompare(b.creado_en));
}

/** Movimientos de caja (cobros + manuales) de un mes puntual, opcionalmente de un solo usuario. */
export function movimientosCajaDelMes(
  mes: string,
  ventas: Venta[],
  cajaMovimientos: MovimientoCaja[],
  usuario?: string
): MovimientoCajaUnificado[] {
  return movimientosCaja(ventas, cajaMovimientos)
    .filter((m) => m.fecha.slice(0, 7) === mes && (!usuario || m.usuario === usuario))
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
}
