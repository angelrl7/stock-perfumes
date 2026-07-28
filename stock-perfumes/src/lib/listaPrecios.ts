import { jsPDF } from "jspdf";
import type { Perfume } from "../types";
import { formatoARS, precioMayorista, precioSugerido } from "./precio";
import { compartirOGuardarPDF, truncar } from "./pdf";

const IZQ = 14;
const DER = 196;
const COL_FINAL = 150;

function construirListaPrecios(perfumes: Perfume[]): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("Lista de precios", IZQ, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text(new Date().toLocaleDateString("es-AR"), IZQ, y);
  doc.setTextColor(0);
  y += 8;

  const encabezado = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Producto", IZQ, y);
    doc.text("Final", COL_FINAL, y, { align: "right" });
    doc.text("Mayorista", DER, y, { align: "right" });
    y += 2;
    doc.setDrawColor(180);
    doc.line(IZQ, y, DER, y);
    y += 6;
    doc.setFont("helvetica", "normal");
  };

  encabezado();

  const ordenados = [...perfumes].sort((a, b) => a.nombre.localeCompare(b.nombre));
  for (const p of ordenados) {
    if (y > 280) {
      doc.addPage();
      y = 18;
      encabezado();
    }
    const nombre = p.marca ? `${p.nombre} (${p.marca})` : p.nombre;
    doc.text(truncar(nombre, 55), IZQ, y);
    doc.text(formatoARS(precioSugerido(p)), COL_FINAL, y, { align: "right" });
    doc.text(formatoARS(precioMayorista(p)), DER, y, { align: "right" });
    y += 7;
  }

  if (perfumes.length === 0) {
    doc.setTextColor(120);
    doc.text("No hay productos cargados.", IZQ, y);
    doc.setTextColor(0);
  }

  return doc;
}

/** Genera la lista de precios y la comparte (celular) o la descarga (PC). */
export async function compartirListaPrecios(perfumes: Perfume[]): Promise<void> {
  const doc = construirListaPrecios(perfumes);
  const nombre = `lista-precios-${new Date().toISOString().slice(0, 10)}.pdf`;
  await compartirOGuardarPDF(doc, nombre);
}