import { jsPDF } from "jspdf";
import type { Venta } from "../types";
import type { MovimientoCajaUnificado } from "./finanzas";
import { formatoARS } from "./precio";
import { fechaCorta } from "./fecha";
import { compartirOGuardarPDF, truncar } from "./pdf";

const IZQ = 14;
const DER = 196;

const TIPO_TEXTO: Record<string, string> = {
  cobro: "Cobro",
  ingreso: "Ingreso",
  retiro: "Retiro",
};

function construirReporteMensual(
  etiqueta: string,
  ventas: Venta[],
  movimientos: MovimientoCajaUnificado[]
): jsPDF {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  let y = 18;

  const saltoDePagina = () => {
    doc.addPage();
    y = 18;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`Movimientos · ${etiqueta}`, IZQ, y);
  y += 10;

  // ---- Ventas ----
  doc.setFontSize(12);
  doc.text("Ventas", IZQ, y);
  y += 7;
  doc.setFontSize(9);

  if (ventas.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text("No hubo ventas este mes.", IZQ, y);
    doc.setTextColor(0);
    y += 10;
  } else {
    doc.setFont("helvetica", "bold");
    doc.text("Fecha", IZQ, y);
    doc.text("Cliente", IZQ + 16, y);
    doc.text("Producto", IZQ + 62, y);
    doc.text("Usuario", IZQ + 124, y);
    doc.text("Total", DER, y, { align: "right" });
    y += 2;
    doc.setDrawColor(180);
    doc.line(IZQ, y, DER, y);
    y += 5;
    doc.setFont("helvetica", "normal");

    let totalVentas = 0;
    for (const v of ventas) {
      if (y > 275) saltoDePagina();
      doc.text(fechaCorta(v.creado_en.slice(0, 10)), IZQ, y);
      doc.text(truncar(v.cliente, 24), IZQ + 16, y);
      doc.text(truncar(v.perfume_nombre, 26), IZQ + 62, y);
      doc.text(truncar(v.usuario, 15), IZQ + 124, y);
      doc.text(formatoARS(v.total), DER, y, { align: "right" });
      totalVentas += v.total;
      y += 6;
    }
    y += 3;
    doc.setDrawColor(180);
    doc.line(IZQ, y, DER, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Total vendido", IZQ, y);
    doc.text(formatoARS(totalVentas), DER, y, { align: "right" });
    y += 12;
  }

  // ---- Caja ----
  if (y > 250) saltoDePagina();
  doc.setFontSize(12);
  doc.text("Movimientos de caja", IZQ, y);
  y += 7;
  doc.setFontSize(9);

  if (movimientos.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120);
    doc.text("No hubo movimientos de caja este mes.", IZQ, y);
    doc.setTextColor(0);
  } else {
    doc.setFont("helvetica", "bold");
    doc.text("Fecha", IZQ, y);
    doc.text("Tipo", IZQ + 16, y);
    doc.text("Descripción", IZQ + 40, y);
    doc.text("Usuario", IZQ + 124, y);
    doc.text("Monto", DER, y, { align: "right" });
    y += 2;
    doc.setDrawColor(180);
    doc.line(IZQ, y, DER, y);
    y += 5;
    doc.setFont("helvetica", "normal");

    let neto = 0;
    for (const m of movimientos) {
      if (y > 275) saltoDePagina();
      doc.text(fechaCorta(m.fecha), IZQ, y);
      doc.text(TIPO_TEXTO[m.tipo] ?? m.tipo, IZQ + 16, y);
      doc.text(truncar(m.descripcion, 34), IZQ + 40, y);
      doc.text(truncar(m.usuario, 15), IZQ + 124, y);
      const signo = m.monto < 0 ? "−" : "+";
      doc.text(`${signo}${formatoARS(Math.abs(m.monto))}`, DER, y, { align: "right" });
      neto += m.monto;
      y += 6;
    }
    y += 3;
    doc.setDrawColor(180);
    doc.line(IZQ, y, DER, y);
    y += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Saldo neto del mes", IZQ, y);
    doc.text(formatoARS(neto), DER, y, { align: "right" });
  }

  return doc;
}

/** Genera el reporte del mes y lo comparte (celular) o lo descarga (PC). */
export async function compartirReporteMensual(
  mesId: string,
  etiqueta: string,
  ventas: Venta[],
  movimientos: MovimientoCajaUnificado[]
): Promise<void> {
  const doc = construirReporteMensual(etiqueta, ventas, movimientos);
  await compartirOGuardarPDF(doc, `movimientos-${mesId}.pdf`);
}