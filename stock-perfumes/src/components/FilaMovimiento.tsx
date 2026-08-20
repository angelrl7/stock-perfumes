import type { ReactNode } from "react";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

/** entra = plata o mercadería que ingresa (verde); sale = lo contrario (naranja). */
export type Sentido = "entra" | "sale";

interface Props {
  sentido: Sentido;
  /** Palabra que nombra el movimiento: "Venta", "Reposición", "Retiro"… */
  titulo: string;
  /** Detalle al lado del título, en gris. */
  detalle?: ReactNode;
  /** Segunda línea: hora, usuario, medio de pago… */
  meta?: ReactNode;
  /** Monto o cantidad ya formateados, sin el signo. */
  monto: string;
}

/**
 * Fila de listado con ícono circular a la izquierda, detalle en el medio
 * y monto a la derecha. La usan historial, finanzas y la cuenta de usuario.
 */
export default function FilaMovimiento({ sentido, titulo, detalle, meta, monto }: Props) {
  const entra = sentido === "entra";
  const Icono = entra ? ArrowDownLeft : ArrowUpRight;

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span
        className={[
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          entra ? "bg-acento-suave text-acento-texto" : "bg-alerta-suave text-alerta-texto",
        ].join(" ")}
      >
        <Icono size={15} strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px]">
          <span className="font-medium">{titulo}</span>
          {detalle && <span className="text-tenue"> · {detalle}</span>}
        </p>
        {meta && <p className="mt-0.5 truncate text-[12px] text-tenue">{meta}</p>}
      </div>

      <p
        className={[
          "shrink-0 text-[13px] font-medium tabular-nums",
          entra ? "text-acento-texto" : "text-tinta",
        ].join(" ")}
      >
        {entra ? "+" : "−"}
        {monto}
      </p>
    </li>
  );
}
