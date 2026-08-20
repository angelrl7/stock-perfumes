/** Umbrales de presentacion: cuando una tarjeta se muestra "en alerta".
 *  No cambia ninguna regla de negocio, solo decide colores y avisos. */
import type { Perfume } from "../types";

/** Piso usado cuando el producto no tiene stock_minimo cargado. */
export const UMBRAL_POCO_STOCK = 5;

export function sinStock(p: Pick<Perfume, "stock">): boolean {
  return p.stock <= 0;
}

/** Poco stock: por debajo del minimo del producto, o de 5 si no tiene minimo. */
export function pocoStock(p: Pick<Perfume, "stock" | "stock_minimo">): boolean {
  const minimo = p.stock_minimo > 0 ? p.stock_minimo : UMBRAL_POCO_STOCK;
  return p.stock <= minimo;
}
