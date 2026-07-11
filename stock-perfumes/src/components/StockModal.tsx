import { useState } from "react";
import type { Perfume, TipoMovimiento } from "../types";

interface Props {
  perfume: Perfume;
  onAjustar: (cantidad: number, tipo: TipoMovimiento) => Promise<void>;
  onCerrar: () => void;
}

export default function StockModal({ perfume, onAjustar, onCerrar }: Props) {
  const [tipo, setTipo] = useState<TipoMovimiento>("venta");
  const [cantidad, setCantidad] = useState("1");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = parseInt(cantidad) || 0;
  const delta = tipo === "entrada" ? n : -n;
  const resultado = perfume.stock + delta;

  const confirmar = async () => {
    if (n <= 0) {
      setError("La cantidad tiene que ser mayor a 0.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await onAjustar(delta, tipo);
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al ajustar.");
      setGuardando(false);
    }
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Movimiento de stock</h2>
        <p className="modal-sub">{perfume.nombre} · stock actual: <strong>{perfume.stock}</strong></p>

        <div className="tipo-selector">
          <button className={tipo === "venta" ? "activo" : ""} onClick={() => setTipo("venta")}>Venta</button>
          <button className={tipo === "entrada" ? "activo" : ""} onClick={() => setTipo("entrada")}>Entrada</button>
          <button className={tipo === "ajuste" ? "activo" : ""} onClick={() => setTipo("ajuste")}>Ajuste −</button>
        </div>

        <label className="campo">
          <span>Cantidad</span>
          <div className="stepper">
            <button onClick={() => setCantidad(String(Math.max(1, n - 1)))}>−</button>
            <input type="number" inputMode="numeric" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            <button onClick={() => setCantidad(String(n + 1))}>+</button>
          </div>
        </label>

        <p className="vista-previa">
          Stock resultante: <strong className={resultado < 0 ? "texto-rojo" : ""}>{resultado}</strong>
        </p>

        {error && <p className="error-msg">{error}</p>}

        <div className="modal-botones">
          <button className="btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button className="btn-primario" onClick={confirmar} disabled={guardando || resultado < 0}>
            {guardando ? "Guardando…" : "Confirmar"}
          </button>
        </div>
      </div>
    </div>
  );
}
