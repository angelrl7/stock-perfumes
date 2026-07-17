import { useState } from "react";
import type { Perfume } from "../types";
import { formatoARS, precioSugerido } from "../lib/precio";

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
  const bajo = stock <= minimo;
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
        fill={bajo ? "var(--rojo)" : "var(--ambar)"}
        opacity="0.85"
      />
    </svg>
  );
}

export default function PerfumeCard({ perfume, onEditar, onAjustar, onVender }: Props) {
  const [verFoto, setVerFoto] = useState(false);
  const sugerido = precioSugerido(perfume);
  const bajo = perfume.stock <= perfume.stock_minimo;
  const esManual = perfume.precio_manual != null && perfume.precio_manual > 0;

  return (
    <article className={`card ${bajo ? "card-bajo" : ""}`}>
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
          <Frasquito stock={perfume.stock} minimo={perfume.stock_minimo} />
        )}
        <span className={`card-stock ${bajo ? "stock-bajo" : ""}`}>
          {perfume.stock}
        </span>
      </div>

      <div className="card-info">
        <p className="card-marca">{perfume.marca || "—"}</p>
        <h3 className="card-nombre">{perfume.nombre}</h3>

        <div className="card-precios">
          <div>
            <span className="precio-label">Compra</span>
            <span className="precio-compra">{formatoARS(perfume.precio_compra)}</span>
          </div>
          <div>
            <span className="precio-label">
              Sugerido {esManual ? "· manual" : `· +${perfume.margen}%`}
            </span>
            <span className="precio-sugerido">{formatoARS(sugerido)}</span>
          </div>
        </div>

        {perfume.creado_por && (
          <p className="card-cargado">Cargado por {perfume.creado_por}</p>
        )}
        {bajo && <p className="alerta-bajo">Stock bajo · mínimo {perfume.stock_minimo}</p>}
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
        <button className="btn-chico" onClick={onEditar}>Editar</button>
      </div>

      {verFoto && perfume.foto_url && (
        <div className="foto-ampliada" onClick={() => setVerFoto(false)}>
          <img src={perfume.foto_url} alt={perfume.nombre} />
        </div>
      )}
    </article>
  );
}
