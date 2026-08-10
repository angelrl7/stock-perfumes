import { useState } from "react";
import { Pencil } from "lucide-react";
import type { Perfume } from "../types";
import { formatoARS, precioMayorista, precioSugerido } from "../lib/precio";

interface Props {
  perfume: Perfume;
  onEditar: () => void;
  onAjustar: () => void;
  onVender: () => void;
}

/** Frasquito SVG cuyo nivel de "líquido" representa el stock. */
function Frasquito({ stock, minimo }: { stock: number; minimo: number }) {
  // Lleno = 4 veces el stock mínimo (o al menos 8 unidades de escala)
  const tope = Math.max(minimo * 4, 8);
  const nivel = Math.max(0, Math.min(1, stock / tope));
  const sinStock = stock <= 0;
  const alturaLiquido = 30 * nivel; // cuerpo del frasco: 30 de alto
  const y = 46 - alturaLiquido;

  return (
    <svg width="34" height="52" viewBox="0 0 34 52" aria-hidden="true">
      {/* tapa */}
      <rect x="12" y="2" width="10" height="7" rx="1.5" fill="var(--tinta-suave)" />
      {/* cuello */}
      <rect x="14" y="9" width="6" height="5" fill="var(--tinta-suave)" />
      {/* cuerpo */}
      <rect
        x="5" y="14" width="24" height="34" rx="6"
        fill="none" stroke="var(--tinta-suave)" strokeWidth="2"
      />
      {/* líquido */}
      <rect
        x="8" y={y} width="18" height={alturaLiquido + 1} rx="4"
        fill={sinStock ? "var(--rojo)" : "var(--ambar)"}
        opacity="0.85"
      />
    </svg>
  );
}

export default function PerfumeCard({ perfume, onEditar, onAjustar, onVender }: Props) {
  const [verFoto, setVerFoto] = useState(false);
  const sugerido = precioSugerido(perfume);
  const mayorista = precioMayorista(perfume);
  const sinStock = perfume.stock <= 0;
  const esManual = perfume.precio_manual != null && perfume.precio_manual > 0;

  return (
    <article className={`card ${sinStock ? "card-bajo" : ""}`}>
      <div className="card-superior">
        <div className="card-frasco">
          {perfume.foto_url ? (
            <button
              className="card-foto"
              onClick={() => setVerFoto(true)}
              aria-label={`Ver foto de ${perfume.nombre}`}
            >
              <img src={perfume.foto_url} alt={perfume.nombre} loading="lazy" />
            </button>
          ) : (
            <div className="card-frasco-caja">
              <Frasquito stock={perfume.stock} minimo={perfume.stock_minimo} />
            </div>
          )}
          <span
            className={`card-stock ${sinStock ? "stock-bajo" : ""}`}
            title={`${perfume.stock} en stock`}
          >
            {perfume.stock}
          </span>
        </div>

        <div className="card-info">
          <div className="card-marca-fila">
            <p className="card-marca">{perfume.marca || "—"}</p>
            {sinStock && <span className="chip-sin-stock">Sin stock</span>}
          </div>
          <h3 className="card-nombre">{perfume.nombre}</h3>

          <div className="card-precios">
            <div>
              <span className="precio-label">
                Final {esManual ? "· manual" : `· +${perfume.margen}%`}
              </span>
              <span className="precio-sugerido">{formatoARS(sugerido)}</span>
            </div>
            <div>
              <span className="precio-label">Mayorista</span>
              <span className="precio-mayorista">{formatoARS(mayorista)}</span>
            </div>
          </div>

          {perfume.creado_por && (
            <p className="card-cargado">Cargado por {perfume.creado_por}</p>
          )}
        </div>
      </div>

      <div className="card-acciones">
        <button
          className="btn-chico btn-vender"
          onClick={onVender}
          disabled={perfume.stock <= 0}
        >
          Vender
        </button>
        <button className="btn-chico btn-ajustar" onClick={onAjustar}>± Stock</button>
        <button
          className="btn-chico btn-editar-icono"
          onClick={onEditar}
          aria-label={`Editar ${perfume.nombre}`}
          title="Editar"
        >
          <Pencil size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>

      {verFoto && perfume.foto_url && (
        <div className="foto-ampliada" onClick={() => setVerFoto(false)}>
          <img src={perfume.foto_url} alt={perfume.nombre} />
        </div>
      )}
    </article>
  );
}
