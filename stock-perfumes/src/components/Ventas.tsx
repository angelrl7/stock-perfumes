import { useState } from "react";
import type { Venta } from "../types";
import { formatoARS } from "../lib/precio";
import { fechaCorta, hoyISO } from "../lib/fecha";
import { totalPagado } from "../lib/ventas";
import { compartirTicketPDF } from "../lib/ticket";

const TIPO_PAGO: Record<string, string> = {
  contado: "Contado",
  semanal: "Pago semanal",
  mensual: "Pago mensual",
};

function fechaLinda(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  ventas: Venta[];
  onPago: (ventaId: string, monto: number, fecha: string) => Promise<void>;
}

export default function Ventas({ ventas, onPago }: Props) {
  if (ventas.length === 0) {
    return (
      <p className="vacio">
        No hay ventas con pagos pendientes. Las ventas nuevas se cargan con el botón
        "Vender" de un producto; cuando se saldan pasan al Historial.
      </p>
    );
  }

  return (
    <ul className="ventas">
      {ventas.map((v) => (
        <VentaItem key={v.id} venta={v} onPago={onPago} />
      ))}
    </ul>
  );
}

export function VentaItem({
  venta,
  onPago,
}: {
  venta: Venta;
  onPago?: Props["onPago"];
}) {
  const [abierto, setAbierto] = useState(false);
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pagado = totalPagado(venta);
  const saldo = venta.total - pagado;
  const saldada = saldo <= 0;

  const registrar = async () => {
    if (!onPago) return;
    const m = parseFloat(monto) || 0;
    if (m <= 0) return setError("El monto tiene que ser mayor a 0.");
    setGuardando(true);
    setError(null);
    try {
      await onPago(venta.id, m, fecha);
      setMonto("");
      setAbierto(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar el pago.");
    }
    setGuardando(false);
  };

  return (
    <li className={`venta ${saldada ? "venta-saldada" : ""}`}>
      <div className="venta-cabecera">
        <div className="venta-info">
          <span className="venta-cliente">{venta.cliente}</span>
          <span className="venta-detalle">
            {venta.perfume_nombre}
            {venta.cantidad > 1 ? ` ×${venta.cantidad}` : ""}
          </span>
          <span className="venta-meta">
            {fechaLinda(venta.creado_en)} · {venta.usuario} · {TIPO_PAGO[venta.tipo_pago]}
          </span>
        </div>
        <div className="venta-montos">
          <strong className="venta-total">{formatoARS(venta.total)}</strong>
          {saldada ? (
            <span className="chip-pagada">✓ Pagada</span>
          ) : (
            <span className="venta-saldo">Debe {formatoARS(saldo)}</span>
          )}
        </div>
      </div>

      {venta.pagos.length > 0 && (
        <ul className="venta-pagos">
          {venta.pagos.map((p) => (
            <li key={p.id}>
              <span>
                {fechaCorta(p.fecha)} · {p.usuario}
              </span>
              <strong>+{formatoARS(Number(p.monto))}</strong>
            </li>
          ))}
        </ul>
      )}

      {!saldada && onPago && abierto && (
        <div className="pago-form">
          <input
            type="number"
            inputMode="decimal"
            placeholder="Monto"
            value={monto}
            onChange={(ev) => setMonto(ev.target.value)}
            autoFocus
          />
          <input
            type="date"
            value={fecha}
            onChange={(ev) => setFecha(ev.target.value)}
          />
          <button
            className="btn-chico btn-ajustar"
            onClick={registrar}
            disabled={guardando}
          >
            {guardando ? "…" : "Guardar"}
          </button>
        </div>
      )}

      <div className="venta-acciones">
        {!saldada && onPago && !abierto && (
          <button className="btn-agregar-pago" onClick={() => setAbierto(true)}>
            + Registrar pago
          </button>
        )}
        <button className="btn-ticket" onClick={() => compartirTicketPDF(venta)}>
          🧾 Ticket PDF
        </button>
      </div>

      {error && <p className="error-msg">{error}</p>}
    </li>
  );
}
