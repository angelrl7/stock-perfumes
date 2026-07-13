import type { Venta } from "../types";

/** Suma de todos los pagos registrados de una venta. */
export function totalPagado(venta: Venta): number {
  return venta.pagos.reduce((suma, p) => suma + Number(p.monto), 0);
}

/** Una venta está saldada cuando los pagos cubren el total. */
export function estaSaldada(venta: Venta): boolean {
  return totalPagado(venta) >= venta.total;
}
