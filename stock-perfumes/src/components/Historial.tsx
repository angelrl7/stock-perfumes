import type { Movimiento } from "../types";

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

export default function Historial({ movimientos }: { movimientos: Movimiento[] }) {
  if (movimientos.length === 0) {
    return <p className="vacio">Todavía no hay movimientos. Cuando cargues ventas o entradas van a aparecer acá.</p>;
  }

  return (
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
  );
}
