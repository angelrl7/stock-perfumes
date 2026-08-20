import { useState } from "react";
import type { Movimiento, TipoMovimiento, Venta } from "../types";
import { VentaItem } from "./Ventas";
import FilaMovimiento, { type Sentido } from "./FilaMovimiento";
import TarjetaMetrica from "./TarjetaMetrica";

/** Este listado cuenta unidades, no plata: una entrada suma stock y una venta
 *  lo descuenta. Por eso el signo y el color siguen al stock, no a la caja. */
const ETIQUETAS: Record<TipoMovimiento, { texto: string; sentido: Sentido }> = {
  entrada: { texto: "Reposición", sentido: "entra" },
  venta: { texto: "Venta", sentido: "sale" },
  ajuste: { texto: "Ajuste", sentido: "sale" },
};

type FiltroMov = TipoMovimiento | "todos";

const FILTROS: { valor: FiltroMov; texto: string }[] = [
  { valor: "todos", texto: "Todos" },
  { valor: "venta", texto: "Ventas" },
  { valor: "entrada", texto: "Entradas" },
];

function fechaLinda(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function esDeHoy(iso: string): boolean {
  return new Date(iso).toDateString() === new Date().toDateString();
}

type Seccion = "ventas" | "stock";

interface Props {
  movimientos: Movimiento[];
  /** Ventas ya saldadas (pagadas del todo). */
  ventas: Venta[];
}

export default function Historial({ movimientos, ventas }: Props) {
  const [seccion, setSeccion] = useState<Seccion>("ventas");
  const [filtroMov, setFiltroMov] = useState<FiltroMov>("todos");

  const movimientosFiltrados =
    filtroMov === "todos" ? movimientos : movimientos.filter((m) => m.tipo === filtroMov);

  const deHoy = movimientos.filter((m) => esDeHoy(m.creado_en));
  const salioHoy = deHoy
    .filter((m) => m.tipo === "venta" || m.tipo === "ajuste")
    .reduce((suma, m) => suma + m.cantidad, 0);
  const entroHoy = deHoy
    .filter((m) => m.tipo === "entrada")
    .reduce((suma, m) => suma + m.cantidad, 0);

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
            aparecer acá, con su detalle.
          </p>
        ) : (
          <ul className="ventas">
            {ventas.map((v) => (
              <VentaItem key={v.id} venta={v} />
            ))}
          </ul>
        ))}

      {seccion === "stock" && (
        <>
          <div className="finanzas-resumen">
            <TarjetaMetrica
              label="Salió hoy"
              valor={`${salioHoy} u`}
              tono="sale"
              comparativo="Vendido o ajustado"
            />
            <TarjetaMetrica
              label="Entró hoy"
              valor={`${entroHoy} u`}
              tono="entra"
              comparativo="Reposición"
            />
          </div>

          {movimientos.length > 0 && (
            <div className="filtro-mov">
              {FILTROS.map((f) => (
                <button
                  key={f.valor}
                  className={filtroMov === f.valor ? "activo" : ""}
                  onClick={() => setFiltroMov(f.valor)}
                >
                  {f.texto}
                </button>
              ))}
            </div>
          )}

          {movimientos.length === 0 ? (
            <p className="vacio">
              Todavía no hay movimientos. Cuando cargues ventas o entradas van a aparecer acá.
            </p>
          ) : movimientosFiltrados.length === 0 ? (
            <p className="vacio">No hay movimientos de este tipo.</p>
          ) : (
            <ul className="borde-fino divisor-fino overflow-hidden rounded-xl bg-superficie">
              {movimientosFiltrados.map((m) => {
                const e = ETIQUETAS[m.tipo] ?? ETIQUETAS.ajuste;
                return (
                  <FilaMovimiento
                    key={m.id}
                    sentido={e.sentido}
                    titulo={e.texto}
                    detalle={m.perfume_nombre}
                    meta={`${fechaLinda(m.creado_en)} · ${m.usuario}`}
                    monto={`${m.cantidad} u`}
                  />
                );
              })}
            </ul>
          )}
        </>
      )}
    </>
  );
}
