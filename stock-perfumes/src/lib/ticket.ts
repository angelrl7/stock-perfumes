import { jsPDF } from "jspdf";
import type { Venta } from "../types";
import { formatoARS } from "./precio";
import { fechaCorta } from "./fecha";
import { totalPagado } from "./ventas";

const ANCHO = 80; // mm, tamaño de ticket de impresora térmica
const IZQ = 8;
const DER = ANCHO - 8;

const TIPO_PAGO: Record<string, string> = {
  contado: "Contado",
  semanal: "Pago semanal",
  mensual: "Pago mensual",
};

function construirTicket(venta: Venta): jsPDF {
  const pagado = totalPagado(venta);
  const saldo = venta.total - pagado;
  const alto = 105 + venta.pagos.length * 5;
  const doc = new jsPDF({ unit: "mm", format: [ANCHO, alto] });
  const cx = ANCHO / 2;
  let y = 12;

  const linea = () => {
    doc.setDrawColor(160);
    doc.setLineDashPattern([1, 1], 0);
    doc.line(IZQ, y, DER, y);
    y += 5;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("STOCK PERFUMES", cx, y, { align: "center" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(110);
  doc.text("Comprobante de venta", cx, y, { align: "center" });
  doc.setTextColor(0);
  y += 6;

  linea();

  const fecha = new Date(venta.creado_en).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  doc.text(`Fecha: ${fecha}`, IZQ, y);
  y += 5;
  doc.text(`Cliente: ${venta.cliente}`, IZQ, y);
  y += 5;
  doc.text(`Vendedor: ${venta.usuario}`, IZQ, y);
  y += 6;

  linea();

  doc.setFont("helvetica", "bold");
  doc.text(`${venta.perfume_nombre} x${venta.cantidad}`, IZQ, y, { maxWidth: 42 });
  doc.text(formatoARS(venta.total), DER, y, { align: "right" });
  y += 5;
  doc.setFont("helvetica", "normal");
  doc.text(`Forma de pago: ${TIPO_PAGO[venta.tipo_pago] ?? venta.tipo_pago}`, IZQ, y);
  y += 6;

  linea();

  if (venta.pagos.length > 0) {
    doc.text("Pagos:", IZQ, y);
    y += 5;
    for (const p of venta.pagos) {
      doc.text(fechaCorta(p.fecha), IZQ + 2, y);
      doc.text(formatoARS(Number(p.monto)), DER, y, { align: "right" });
      y += 5;
    }
    y += 1;
    linea();
  }

  doc.setFont("helvetica", "bold");
  doc.text("Total", IZQ, y);
  doc.text(formatoARS(venta.total), DER, y, { align: "right" });
  y += 5;
  doc.text("Pagado", IZQ, y);
  doc.text(formatoARS(pagado), DER, y, { align: "right" });
  y += 6;

  if (saldo > 0) {
    doc.setTextColor(179, 55, 46);
    doc.text("SALDO PENDIENTE", IZQ, y);
    doc.text(formatoARS(saldo), DER, y, { align: "right" });
  } else {
    doc.setFontSize(12);
    doc.setTextColor(61, 107, 69);
    doc.text("** PAGADO **", cx, y, { align: "center" });
  }
  doc.setTextColor(0);
  y += 9;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(120);
  doc.text("¡Gracias por su compra!", cx, y, { align: "center" });

  return doc;
}

/** Genera el ticket y lo comparte (celular) o lo descarga (PC). */
export async function compartirTicketPDF(venta: Venta): Promise<void> {
  const doc = construirTicket(venta);
  const cliente = venta.cliente.trim().replace(/\s+/g, "-").toLowerCase() || "cliente";
  const nombre = `ticket-${cliente}-${venta.creado_en.slice(0, 10)}.pdf`;

  const blob = doc.output("blob");
  const archivo = new File([blob], nombre, { type: "application/pdf" });
  if (typeof navigator.canShare === "function" && navigator.canShare({ files: [archivo] })) {
    try {
      await navigator.share({ files: [archivo], title: "Ticket de venta" });
      return;
    } catch (err) {
      // Si el usuario cerró el menú de compartir, no hacemos nada más
      if (err instanceof DOMException && err.name === "AbortError") return;
    }
  }
  doc.save(nombre);
}
