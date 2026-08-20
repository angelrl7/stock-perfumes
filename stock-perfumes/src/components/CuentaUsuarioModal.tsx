import { useState } from "react";
import type { MovimientoCaja } from "../types";
import { formatoARS } from "../lib/precio";
import { fechaCorta, hoyISO } from "../lib/fecha";
import FilaMovimiento from "./FilaMovimiento";

interface Props {
  usuario: string;
  esPropia: boolean;
  saldo: number;
  cobrado: number;
  fiado: number;
  movimientos: MovimientoCaja[];
  onDescontar: (monto: number, descripcion: string, fecha: string) => Promise<void>;
  onCerrar: () => void;
}

export default function CuentaUsuarioModal({
  usuario,
  esPropia,
  saldo,
  cobrado,
  fiado,
  movimientos,
  onDescontar,
  onCerrar,
}: Props) {
  const [formAbierto, setFormAbierto] = useState(false);
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(hoyISO());
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const m = parseFloat(monto) || 0;

  const confirmar = async () => {
    if (m <= 0) return setError("El monto tiene que ser mayor a 0.");
    if (m > saldo) return setError("No podés descontar más de lo que hay en la cuenta.");
    setGuardando(true);
    setError(null);
    try {
      await onDescontar(m, descripcion, fecha);
      setMonto("");
      setDescripcion("");
      setFormAbierto(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
    }
    setGuardando(false);
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-cabecera">
          <h2>Cuenta de {usuario}</h2>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            ✕
          </button>
        </div>
        <p className="modal-sub">
          Saldo disponible: <strong>{formatoARS(saldo)}</strong>
        </p>

        <div className="cuenta-desglose">
          <div>
            <span className="finanzas-tarjeta-label">Cobrado</span>
            <span className="fin-in-texto">{formatoARS(cobrado)}</span>
          </div>
          <div>
            <span className="finanzas-tarjeta-label">Fiado</span>
            <span className="fin-out-texto">{formatoARS(fiado)}</span>
          </div>
        </div>

        {esPropia &&
          (formAbierto ? (
            <>
              <label className="campo">
                <span>Monto a descontar</span>
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
                <span>Motivo (opcional)</span>
                <input
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej: retiro personal"
                />
              </label>
              <label className="campo">
                <span>Fecha</span>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </label>

              {error && <p className="error-msg">{error}</p>}

              <div className="modal-botones">
                <button className="btn-secundario" onClick={() => setFormAbierto(false)}>
                  Cancelar
                </button>
                <button className="btn-primario" onClick={confirmar} disabled={guardando}>
                  {guardando ? "Guardando…" : "Confirmar"}
                </button>
              </div>
            </>
          ) : (
            <button
              className="btn-secundario finanzas-btn-mov"
              onClick={() => setFormAbierto(true)}
              disabled={saldo <= 0}
            >
              − Descontar dinero
            </button>
          ))}

        <p className="cuenta-subtitulo">Movimientos de esta cuenta</p>
        {movimientos.length === 0 ? (
          <p className="vacio">Todavía no se descontó nada de esta cuenta.</p>
        ) : (
          <ul className="borde-fino divisor-fino overflow-hidden rounded-xl bg-superficie">
            {movimientos.map((mv) => (
              <FilaMovimiento
                key={mv.id}
                sentido={mv.tipo === "retiro" ? "sale" : "entra"}
                titulo={mv.tipo === "retiro" ? "Retiro" : "Ingreso"}
                detalle={mv.descripcion || undefined}
                meta={fechaCorta(mv.fecha)}
                monto={formatoARS(mv.monto)}
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}