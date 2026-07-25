import { useState } from "react";
import type { TipoCaja } from "../types";
import { hoyISO } from "../lib/fecha";
import { formatoARS } from "../lib/precio";

interface Props {
  saldoActual: number;
  onGuardar: (tipo: TipoCaja, monto: number, descripcion: string, fecha: string) => Promise<void>;
  onCerrar: () => void;
}

export default function CajaModal({ saldoActual, onGuardar, onCerrar }: Props) {
  const [tipo, setTipo] = useState<TipoCaja>("retiro");
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const m = parseFloat(monto) || 0;
  const resultado = tipo === "retiro" ? saldoActual - m : saldoActual + m;

  const confirmar = async () => {
    if (m <= 0) return setError("El monto tiene que ser mayor a 0.");
    if (tipo === "retiro" && m > saldoActual)
      return setError("No podés retirar más de lo que hay en la caja.");
    setGuardando(true);
    setError(null);
    try {
      await onGuardar(tipo, m, descripcion, fecha);
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
      setGuardando(false);
    }
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cabecera">
          <h2>Movimiento de caja</h2>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <p className="modal-sub">
          Saldo actual: <strong>{formatoARS(saldoActual)}</strong>
        </p>

        <div className="tipo-selector">
          <button className={tipo === "retiro" ? "activo" : ""} onClick={() => setTipo("retiro")}>
            Retiro
          </button>
          <button className={tipo === "ingreso" ? "activo" : ""} onClick={() => setTipo("ingreso")}>
            Ingreso
          </button>
        </div>

        <label className="campo">
          <span>Monto</span>
          <input
            type="number"
            inputMode="decimal"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            placeholder="0"
            autoFocus
          />
        </label>

        <label className="campo">
          <span>Descripción</span>
          <input
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder={tipo === "retiro" ? "Ej: pago de alquiler" : "Ej: aporte extra"}
          />
        </label>

        <label className="campo">
          <span>Fecha</span>
          <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
        </label>

        <p className="vista-previa">
          Saldo resultante:{" "}
          <strong className={resultado < 0 ? "texto-rojo" : ""}>{formatoARS(resultado)}</strong>
        </p>

        {error && <p className="error-msg">{error}</p>}

        <div className="modal-botones">
          <button className="btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button className="btn-primario" onClick={confirmar} disabled={guardando}>
            {guardando ? "Guardando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
