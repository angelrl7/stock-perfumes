import { useState } from "react";
import type { Movimiento, Venta } from "../types";
import { VentaItem } from "./Ventas";

const ETIQUETAS: Record<string, { texto: string; clase: string; signo: string }> = {
  entrada: { texto: "Entrada", clase: "mov-entrada", signo: "+" },
  venta: { texto: "Venta", clase: "mov-venta", signo: "−" },
  ajuste: { texto: "Ajuste", clase: "mov-ajuste", signo: "−" },
};

function fechaLinda(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type Seccion = "ventas" | "stock";

interface Props {
  movimientos: Movimiento[];
  /** Ventas ya saldadas (pagadas del todo). */
  ventas: Venta[];
}

export default function Historial({ movimientos, ventas }: Props) {
  const [seccion, setSeccion] = useState<Seccion>("ventas");

  return (
    <>
      <div className="sub-tabs">
        <button
          className={seccion === "ventas" ? "activo" : ""}
          onClick={() => setSeccion("ventas")}
        >
          Ventas cobradas
        </button>
        <button
          className={seccion === "stock" ? "activo" : ""}
          onClick={() => setSeccion("stock")}
        >
          Movimientos de stock
        </button>
      </div>

      {seccion === "ventas" &&
        (ventas.length === 0 ? (
          <p className="vacio">
            Todavía no hay ventas cobradas del todo. Cuando una venta se salde va a
            aparecer acá, en verde y con su detalle.
          </p>
        ) : (
          <ul className="ventas">
            {ventas.map((v) => (
              <VentaItem key={v.id} venta={v} />
            ))}
          </ul>
        ))}

      {seccion === "stock" &&
        (movimientos.length === 0 ? (
          <p className="vacio">
            Todavía no hay movimientos. Cuando cargues ventas o entradas van a aparecer acá.
          </p>
        ) : (
          <ul className="historial">
            {movimientos.map((m) => {
              const e = ETIQUETAS[m.tipo] ?? ETIQUETAS.ajuste;
              return (
                <li key={m.id} className="mov">
                  <span className={`mov-tipo ${e.clase}`}>{e.texto}</span>
                  <div className="mov-info">
                    <span className="mov-nombre">{m.perfume_nombre}</span>
                    <span className="mov-meta">{fechaLinda(m.creado_en)} · {m.usuario}</span>
                  </div>
                  <span className={`mov-cantidad ${e.clase}`}>{e.signo}{m.cantidad}</span>
                </li>
              );
            })}
          </ul>
        ))}
    </>
  );
}
