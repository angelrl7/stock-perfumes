import type { Perfume } from "../types";

/** Redondea al múltiplo de 100 más cercano (precios "lindos" en ARS). */
export function redondear(valor: number): number {
  return Math.round(valor / 100) * 100;
}

/** Precio sugerido: manual si existe, si no compra + margen%. */
export function precioSugerido(p: Pick<Perfume, "precio_compra" | "margen" | "precio_manual">): number {
  if (p.precio_manual != null && p.precio_manual > 0) return p.precio_manual;
  return redondear(p.precio_compra * (1 + p.margen / 100));
}

export function formatoARS(valor: number): string {
  return valor.toLocaleString("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  });
}
