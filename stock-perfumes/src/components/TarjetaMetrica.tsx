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
      <p className="text-[13px] text-tenue">{label}</p>
      <p
        className={[
          "mt-1.5 text-[24px] leading-none font-medium tracking-tight tabular-nums",
          colorValor[tono],
        ].join(" ")}
      >
        {valor}
      </p>
      {comparativo && (
        <p className={`mt-2.5 text-[12px] ${colorComparativo[tendencia]}`}>
          {flechas[tendencia] && <span className="mr-1">{flechas[tendencia]}</span>}
          {comparativo}
        </p>
      )}
    </>
  );

  const clases = "borde-fino w-full rounded-xl bg-superficie p-4 text-left";

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
