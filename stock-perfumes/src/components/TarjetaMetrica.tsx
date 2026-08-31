interface Props {
  label: string;
  valor: string;
  /** Texto comparativo, ej: "12% vs ayer". Se omite si no hay con qué comparar. */
  comparativo?: string;
  tendencia?: "sube" | "baja" | "neutra";
  onClick?: () => void;
  /** Tinta el número: acento para ingresos, alerta para salidas. */
  tono?: "normal" | "entra" | "sale";
}

const flechas = { sube: "▲", baja: "▼", neutra: "" } as const;

const colorComparativo = {
  sube: "text-acento-texto",
  baja: "text-alerta-texto",
  neutra: "text-tenue",
} as const;

const colorValor = {
  normal: "",
  entra: "text-acento-texto",
  sale: "text-alerta-texto",
} as const;

/**
 * Tamaño de arranque según el largo del número: "$ 12.345.678" (8 dígitos) no
 * puede ir al mismo cuerpo que "$ 4.500". El CSS lo achica todavía más si la
 * tarjeta queda más angosta que esto.
 */
function tamanoValor(valor: string): number {
  const largo = valor.length;
  if (largo <= 9) return 24;
  if (largo <= 11) return 21;
  if (largo <= 13) return 18;
  return 16;
}

/** Label chico arriba, número grande abajo, comparativo al pie. */
export default function TarjetaMetrica({
  label,
  valor,
  comparativo,
  tendencia = "neutra",
  onClick,
  tono = "normal",
}: Props) {
  const contenido = (
    <>
      <p className="truncate text-[13px] text-tenue">{label}</p>
      <p
        className={[
          "tarjeta-metrica-valor mt-1.5 leading-none font-medium tracking-tight tabular-nums whitespace-nowrap",
          colorValor[tono],
        ].join(" ")}
        style={{ "--tam": `${tamanoValor(valor)}px` } as React.CSSProperties}
        title={valor}
      >
        {valor}
      </p>
      {comparativo && (
        <p className={`mt-2.5 truncate text-[12px] ${colorComparativo[tendencia]}`}>
          {flechas[tendencia] && <span className="mr-1">{flechas[tendencia]}</span>}
          {comparativo}
        </p>
      )}
    </>
  );

  const clases =
    "tarjeta-metrica borde-fino w-full min-w-0 overflow-hidden rounded-xl bg-superficie p-4 text-left";

  if (!onClick) return <div className={clases}>{contenido}</div>;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${clases} transition-colors hover:border-acento`}
    >
      {contenido}
    </button>
  );
}
