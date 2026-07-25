import { useState } from "react";
import type { MovimientoCaja, Perfume, TipoCaja, Venta } from "../types";
import { formatoARS } from "../lib/precio";
import { fechaCorta } from "../lib/fecha";
import {
  capitalEnStock,
  movimientosCaja,
  saldoCaja,
  totalVendidoPorUsuario,
  ventasPorMes,
} from "../lib/finanzas";
import CajaModal from "./CajaModal";

interface Props {
  perfumes: Perfume[];
  ventas: Venta[];
  cajaMovimientos: MovimientoCaja[];
  onMovimientoCaja: (
    tipo: TipoCaja,
    monto: number,
    descripcion: string,
    fecha: string
  ) => Promise<void>;
}

type Seccion = "caja" | "usuarios" | "meses";

const ETIQUETA_TIPO: Record<string, string> = {
  cobro: "Cobro",
  ingreso: "Ingreso",
  retiro: "Retiro",
};

export default function Finanzas({ perfumes, ventas, cajaMovimientos, onMovimientoCaja }: Props) {
  const [seccion, setSeccion] = useState<Seccion>("caja");
  const [modalAbierto, setModalAbierto] = useState(false);

  const capital = capitalEnStock(perfumes);
  const saldo = saldoCaja(ventas, cajaMovimientos);
  const totalVendidoHistorico = ventas.reduce((suma, v) => suma + v.total, 0);
  const porUsuario = totalVendidoPorUsuario(ventas);
  const ledger = movimientosCaja(ventas, cajaMovimientos);
  const meses = ventasPorMes(ventas);

  return (
    <>
      <div className="finanzas-resumen">
        <div className="finanzas-tarjeta">
          <span className="finanzas-tarjeta-label">Caja en común</span>
          <span className="finanzas-tarjeta-valor">{formatoARS(saldo)}</span>
        </div>
        <div className="finanzas-tarjeta">
          <span className="finanzas-tarjeta-label">Capital en stock</span>
          <span className="finanzas-tarjeta-valor">{formatoARS(capital)}</span>
        </div>
        <div className="finanzas-tarjeta">
          <span className="finanzas-tarjeta-label">Vendido histórico</span>
          <span className="finanzas-tarjeta-valor">{formatoARS(totalVendidoHistorico)}</span>
        </div>
      </div>

      <div className="sub-tabs">
        <button className={seccion === "caja" ? "activo" : ""} onClick={() => setSeccion("caja")}>
          Caja
        </button>
        <button
          className={seccion === "usuarios" ? "activo" : ""}
          onClick={() => setSeccion("usuarios")}
        >
          Por usuario
        </button>
        <button className={seccion === "meses" ? "activo" : ""} onClick={() => setSeccion("meses")}>
          Por mes
        </button>
      </div>

      {seccion === "caja" && (
        <>
          <button className="btn-secundario finanzas-btn-mov" onClick={() => setModalAbierto(true)}>
            + Movimiento de caja
          </button>
          {ledger.length === 0 ? (
            <p className="vacio">Todavía no hay movimientos de plata.</p>
          ) : (
            <ul className="historial">
              {ledger.map((m) => {
                const clase = m.monto < 0 ? "fin-out" : "fin-in";
                return (
                  <li key={m.id} className="mov">
                    <span className={`mov-tipo ${clase}`}>{ETIQUETA_TIPO[m.tipo]}</span>
                    <div className="mov-info">
                      <span className="mov-nombre">{m.descripcion}</span>
                      <span className="mov-meta">
                        {fechaCorta(m.fecha)} · {m.usuario}
                      </span>
                    </div>
                    <span className={`mov-cantidad ${clase}`}>
                      {m.monto < 0 ? "−" : "+"}
                      {formatoARS(Math.abs(m.monto))}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {seccion === "usuarios" &&
        (porUsuario.length === 0 ? (
          <p className="vacio">Todavía no hay ventas registradas.</p>
        ) : (
          <ul className="finanzas-usuarios">
            {porUsuario.map((u) => (
              <li key={u.usuario} className="finanzas-usuario">
                <span className="finanzas-usuario-nombre">{u.usuario}</span>
                <span className="finanzas-usuario-total">{formatoARS(u.total)}</span>
              </li>
            ))}
          </ul>
        ))}

      {seccion === "meses" &&
        (meses.length === 0 ? (
          <p className="vacio">Todavía no hay ventas registradas.</p>
        ) : (
          <ul className="finanzas-meses">
            {meses.map((mes) => (
              <li key={mes.mes} className="finanzas-mes">
                <div className="finanzas-mes-cabecera">
                  <span className="finanzas-mes-etiqueta">{mes.etiqueta}</span>
                  <span className="finanzas-mes-total">{formatoARS(mes.total)}</span>
                </div>
                <ul className="finanzas-mes-usuarios">
                  {mes.porUsuario.map((u) => (
                    <li key={u.usuario}>
                      <span>{u.usuario}</span>
                      <span>{formatoARS(u.total)}</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ))}

      {modalAbierto && (
        <CajaModal
          saldoActual={saldo}
          onGuardar={onMovimientoCaja}
          onCerrar={() => setModalAbierto(false)}
        />
      )}
    </>
  );
}
