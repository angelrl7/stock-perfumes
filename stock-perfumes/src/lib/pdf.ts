import type { jsPDF } from "jspdf";

/** Descarga el PDF directamente (carpeta de Descargas del navegador). */
export async function compartirOGuardarPDF(doc: jsPDF, nombre: string): Promise<void> {
  doc.save(nombre);
}

/** Trunca texto para que no se pise con la columna de al lado en tablas de PDF. */
export function truncar(texto: string, max: number): string {
  return texto.length > max ? texto.slice(0, max - 1) + "…" : texto;
}