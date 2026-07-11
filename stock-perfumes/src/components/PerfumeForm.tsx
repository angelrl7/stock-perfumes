import { useState } from "react";
import type { Perfume, PerfumeInput } from "../types";
import { formatoARS, precioSugerido } from "../lib/precio";

interface Props {
  perfume?: Perfume; // si viene, es edición
  onGuardar: (datos: PerfumeInput) => Promise<void>;
  onEliminar?: () => Promise<void>;
  onCerrar: () => void;
}

export default function PerfumeForm({ perfume, onGuardar, onEliminar, onCerrar }: Props) {
  const [nombre, setNombre] = useState(perfume?.nombre ?? "");
  const [marca, setMarca] = useState(perfume?.marca ?? "");
  const [precioCompra, setPrecioCompra] = useState(String(perfume?.precio_compra ?? ""));
  const [margen, setMargen] = useState(String(perfume?.margen ?? 80));
  const [precioManual, setPrecioManual] = useState(
    perfume?.precio_manual ? String(perfume.precio_manual) : ""
  );
  const [stock, setStock] = useState(String(perfume?.stock ?? 0));
  const [stockMinimo, setStockMinimo] = useState(String(perfume?.stock_minimo ?? 2));
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  const numeros = {
    precio_compra: parseFloat(precioCompra) || 0,
    margen: parseFloat(margen) || 0,
    precio_manual: precioManual ? parseFloat(precioManual) : null,
  };
  const vistaPrevia = precioSugerido(numeros);

  const guardar = async () => {
    if (!nombre.trim()) {
      setError("Poné un nombre para el perfume.");
      return;
    }
    setGuardando(true);
    setError(null);
    try {
      await onGuardar({
        nombre: nombre.trim(),
        marca: marca.trim(),
        precio_compra: numeros.precio_compra,
        margen: numeros.margen,
        precio_manual: numeros.precio_manual,
        stock: parseInt(stock) || 0,
        stock_minimo: parseInt(stockMinimo) || 0,
      });
      onCerrar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar.");
      setGuardando(false);
    }
  };

  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{perfume ? "Editar perfume" : "Nuevo perfume"}</h2>

        <label className="campo">
          <span>Nombre</span>
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="One Million 100ml" />
        </label>

        <label className="campo">
          <span>Marca</span>
          <input value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Paco Rabanne" />
        </label>

        <div className="campos-fila">
          <label className="campo">
            <span>Precio de compra</span>
            <input type="number" inputMode="decimal" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} placeholder="0" />
          </label>
          <label className="campo">
            <span>Margen %</span>
            <input type="number" inputMode="decimal" value={margen} onChange={(e) => setMargen(e.target.value)} />
          </label>
        </div>

        <label className="campo">
          <span>Precio manual (opcional, pisa el calculado)</span>
          <input type="number" inputMode="decimal" value={precioManual} onChange={(e) => setPrecioManual(e.target.value)} placeholder="Dejar vacío para usar el margen" />
        </label>

        <p className="vista-previa">
          Precio sugerido: <strong>{formatoARS(vistaPrevia)}</strong>
        </p>

        <div className="campos-fila">
          <label className="campo">
            <span>{perfume ? "Stock (usar ± Stock para movimientos)" : "Stock inicial"}</span>
            <input type="number" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} disabled={!!perfume} />
          </label>
          <label className="campo">
            <span>Stock mínimo</span>
            <input type="number" inputMode="numeric" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
          </label>
        </div>

        {error && <p className="error-msg">{error}</p>}

        <div className="modal-botones">
          <button className="btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button className="btn-primario" onClick={guardar} disabled={guardando}>
            {guardando ? "Guardando…" : "Guardar"}
          </button>
        </div>

        {perfume && onEliminar && (
          <div className="zona-borrado">
            {confirmarBorrado ? (
              <div className="confirmar-borrado">
                <span>¿Seguro? Se borra el perfume y no se puede deshacer.</span>
                <button className="btn-chico btn-rojo" onClick={onEliminar}>Sí, borrar</button>
                <button className="btn-chico" onClick={() => setConfirmarBorrado(false)}>No</button>
              </div>
            ) : (
              <button className="btn-texto-rojo" onClick={() => setConfirmarBorrado(true)}>
                Borrar perfume
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
