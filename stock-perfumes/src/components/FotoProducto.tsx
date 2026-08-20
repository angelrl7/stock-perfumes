import { useState } from "react";
import type { Perfume } from "../types";

/** Frasquito SVG cuyo nivel de "liquido" representa el stock.
 *  Se usa cuando el producto todavia no tiene foto cargada. */
function Frasquito({ stock, minimo }: { stock: number; minimo: number }) {
  // Lleno = 4 veces el stock minimo (o al menos 8 unidades de escala)
  const tope = Math.max(minimo * 4, 8);
  const nivel = Math.max(0, Math.min(1, stock / tope));
  const sinStock = stock <= 0;
  const alturaLiquido = 30 * nivel; // cuerpo del frasco: 30 de alto
  const y = 46 - alturaLiquido;

  return (
    <svg width="58" height="88" viewBox="0 0 34 52" aria-hidden="true">
      {/* tapa */}
      <rect x="12" y="2" width="10" height="7" rx="1.5" fill="currentColor" opacity="0.45" />
      {/* cuello */}
      <rect x="14" y="9" width="6" height="5" fill="currentColor" opacity="0.45" />
      {/* cuerpo */}
      <rect
        x="5" y="14" width="24" height="34" rx="6"
        fill="none" stroke="currentColor" strokeWidth="1.6" opacity="0.55"
      />
      {/* liquido */}
      <rect
        x="8" y={y} width="18" height={alturaLiquido + 1} rx="4"
        fill={sinStock ? "var(--color-alerta)" : "currentColor"}
        opacity={sinStock ? 0.75 : 0.9}
      />
    </svg>
  );
}

interface Props {
  perfume: Perfume;
  /** Se oscurece con el hover de la card (la card es el `group`). */
  conHover?: boolean;
}

/**
 * Ocupa todo el marco de la card. Mientras baja la foto muestra un skeleton;
 * si el producto no tiene foto (o falla), cae en el frasquito sobre acento suave.
 */
export default function FotoProducto({ perfume, conHover = true }: Props) {
  const [cargando, setCargando] = useState(true);
  const [fallo, setFallo] = useState(false);

  const sinFoto = !perfume.foto_url || fallo;

  if (sinFoto) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-acento-suave text-acento-texto">
        <Frasquito stock={perfume.stock} minimo={perfume.stock_minimo} />
      </div>
    );
  }

  return (
    <>
      {cargando && <div className="skeleton absolute inset-0" />}
      <img
        src={perfume.foto_url ?? ""}
        alt={perfume.nombre}
        loading="lazy"
        onLoad={() => setCargando(false)}
        onError={() => {
          setCargando(false);
          setFallo(true);
        }}
        className={[
          "absolute inset-0 h-full w-full object-cover transition-all duration-300",
          conHover ? "group-hover:brightness-[0.88] group-focus-within:brightness-[0.88]" : "",
          cargando ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
    </>
  );
}
