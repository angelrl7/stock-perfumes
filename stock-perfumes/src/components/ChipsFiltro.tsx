interface Props {
  opciones: string[];
  activo: string;
  onCambiar: (valor: string) => void;
  etiqueta?: string;
}

/** Segmented control de filtros. El chip activo va en emerald sólido. */
export default function ChipsFiltro({ opciones, activo, onCambiar, etiqueta }: Props) {
  if (opciones.length <= 1) return null;

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
    </div>
  );
}
