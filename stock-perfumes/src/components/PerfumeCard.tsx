import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { ArrowUpDown, Pencil, ShoppingCart } from "lucide-react";
import type { Perfume } from "../types";
import { formatoARS, precioSugerido } from "../lib/precio";
import FotoProducto from "./FotoProducto";
import { pocoStock, sinStock } from "./umbrales";

interface Props {
  perfume: Perfume;
  onEditar: () => void;
  onAjustar: () => void;
  onVender: () => void;
}

/** Los tres botones miden lo mismo y entran en una card de 150px: a esa medida
 *  no hay lugar para etiquetas de texto, así que la jerarquía la marca el color
 *  (vender en emerald sólido, los otros dos en superficie con borde fino). */
const BOTON = "flex h-10 flex-1 items-center justify-center rounded-lg transition-colors";

export default function PerfumeCard({ perfume, onEditar, onAjustar, onVender }: Props) {
  const [verFoto, setVerFoto] = useState(false);

  // En la compu se espera poder cerrar la foto con Escape.
  useEffect(() => {
    if (!verFoto) return;
    const alTecla = (e: KeyboardEvent) => {
      if (e.key === "Escape") setVerFoto(false);
    };
    window.addEventListener("keydown", alTecla);
    return () => window.removeEventListener("keydown", alTecla);
  }, [verFoto]);

  const sugerido = precioSugerido(perfume);
  const agotado = sinStock(perfume);
  const poco = pocoStock(perfume);

  return (
    <article className="borde-fino overflow-hidden rounded-xl bg-superficie">
      {/* El group va acá y no en la card: pasar por los botones no tiene por qué
          oscurecer la foto. */}
      <div className="group relative aspect-3/4 bg-hueso">
        <FotoProducto perfume={perfume} />

        {/* Toda la foto amplía. */}
        {perfume.foto_url && (
          <button
            type="button"
            className="absolute inset-0 z-0 cursor-zoom-in"
            onClick={() => setVerFoto(true)}
            aria-label={`Ver foto de ${perfume.nombre}`}
          />
        )}

        <span
          className={[
            "pointer-events-none absolute top-2 right-2 z-20 rounded-full px-2 py-0.5 text-[11px] backdrop-blur-sm",
            poco ? "bg-alerta text-white" : "bg-white/85 text-[#0f6e56]",
          ].join(" ")}
        >
          {agotado ? "Sin stock" : `${perfume.stock} u`}
        </span>

        {/* Marca, nombre y precio sobre el degradado. */}
        <div className="velo-foto pointer-events-none absolute inset-x-0 bottom-0 z-10 px-3 pt-8 pb-3">
          {perfume.marca && (
            <p className="truncate text-[11px] tracking-wide text-white/60 uppercase">
              {perfume.marca}
            </p>
          )}
          <h3 className="truncate text-[13px] font-medium text-white">{perfume.nombre}</h3>
          <p className="mt-0.5 text-[13px] text-white/75 tabular-nums">{formatoARS(sugerido)}</p>
        </div>
      </div>

      {/* Acciones siempre a la vista: desde el celular no hay hover. */}
      <div className="borde-fino-t flex items-stretch gap-1.5 p-1.5">
        <button
          type="button"
          onClick={onVender}
          disabled={agotado}
          aria-label={`Vender ${perfume.nombre}`}
          title={agotado ? "Sin stock" : "Vender"}
          className={`${BOTON} bg-acento text-white hover:bg-acento-vivo disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-acento`}
        >
          <ShoppingCart size={17} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={onAjustar}
          aria-label={`Ajustar stock de ${perfume.nombre}`}
          title="Movimiento de stock"
          className={`${BOTON} borde-fino text-tinta hover:bg-lienzo`}
        >
          <ArrowUpDown size={16} strokeWidth={1.75} />
        </button>

        <button
          type="button"
          onClick={onEditar}
          aria-label={`Editar ${perfume.nombre}`}
          title="Editar"
          className={`${BOTON} borde-fino text-tinta hover:bg-lienzo`}
        >
          <Pencil size={15} strokeWidth={1.75} />
        </button>
      </div>

      {/* La foto ampliada va al body: si queda dentro de la card, el hover de la
          card le hace de contenedor al position:fixed y la imagen parpadea. */}
      {verFoto &&
        perfume.foto_url &&
        createPortal(
          <div className="foto-ampliada" onClick={() => setVerFoto(false)}>
            <img src={perfume.foto_url} alt={perfume.nombre} />
          </div>,
          document.body
        )}
    </article>
  );
}
