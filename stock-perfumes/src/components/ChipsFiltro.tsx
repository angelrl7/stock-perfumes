import { ChevronDown } from "lucide-react";

interface Props {
  opciones: string[];
  activo: string;
  onCambiar: (valor: string) => void;
  etiqueta?: string;
  /** Opciones que van en un desplegable al final (ej. las marcas). */
  desplegable?: string[];
  /** Texto del desplegable cuando no hay ninguna de sus opciones elegida. */
  etiquetaDesplegable?: string;
}

/** Segmented control de filtros. El chip activo va en emerald sólido. */
export default function ChipsFiltro({
  opciones,
  activo,
  onCambiar,
  etiqueta,
  desplegable = [],
  etiquetaDesplegable = "Más",
}: Props) {
  if (opciones.length + desplegable.length <= 1) return null;

  const desplegableActivo = desplegable.includes(activo);

  return (
    <div
      role="tablist"
      aria-label={etiqueta ?? "Filtrar"}
      className="borde-fino flex gap-1 overflow-x-auto rounded-full bg-superficie p-1"
    >
      {opciones.map((o) => {
        const esActivo = o === activo;
        return (
          <button
            key={o}
            role="tab"
            aria-selected={esActivo}
            type="button"
            onClick={() => onCambiar(o)}
            className={[
              "shrink-0 rounded-full px-3 py-1.5 text-[13px] transition-colors",
              esActivo ? "bg-acento font-medium text-white" : "text-tenue hover:text-tinta",
            ].join(" ")}
          >
            {o}
          </button>
        );
      })}

      {desplegable.length > 0 && (
        <label
          className={[
            "relative flex shrink-0 items-center rounded-full transition-colors",
            desplegableActivo ? "bg-acento text-white" : "text-tenue hover:text-tinta",
          ].join(" ")}
        >
          <select
            aria-label={etiquetaDesplegable}
            value={desplegableActivo ? activo : ""}
            onChange={(e) => e.target.value && onCambiar(e.target.value)}
            className={[
              "cursor-pointer appearance-none rounded-full bg-transparent py-1.5 pr-7 pl-3 text-[13px] outline-none",
              desplegableActivo ? "font-medium" : "",
            ].join(" ")}
          >
            <option value="" disabled>
              {etiquetaDesplegable}
            </option>
            {desplegable.map((o) => (
              <option key={o} value={o} className="bg-superficie text-tinta">
                {o}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            strokeWidth={1.75}
            className="pointer-events-none absolute right-2.5"
          />
        </label>
      )}
    </div>
  );
}
