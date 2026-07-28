import { useState } from "react";
import type { MovimientoCaja, Perfume, TipoCaja, Venta } from "../types";
import { formatoARS } from "../lib/precio";
import { fechaCorta } from "../lib/fecha";
import { totalPagado } from "../lib/ventas";
import {
  capitalEnStock,
  movimientosCaja,
  movimientosCajaDelMes,
  movimientosDeUsuario,
  saldoCaja,
  saldoIndividual,
  ventasDelMes,
  ventasPorMes,
  ventasPorUsuarioDetalle,
} from "../lib/finanzas";
import { compartirReporteMensual } from "../lib/reporteMensual";
import CajaModal from "./CajaModal";
import CuentaUsuarioModal from "./CuentaUsuarioModal";

interface Props {
  usuarioActual: string;
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

function fechaLinda(iso: string): string {
  return new Date(iso).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Finanzas({
  usuarioActual,
  perfumes,
  ventas,
  cajaMovimientos,
  onMovimientoCaja,
}: Props) {
  const [seccion, setSeccion] = useState<Seccion>("caja");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [cuentaAbierta, setCuentaAbierta] = useState<string | null>(null);
  const [generandoMes, setGenerandoMes] = useState<string | null>(null);
  const [errorPdf, setErrorPdf] = useState<string | null>(null);

  const descargarMes = async (mesId: string, etiqueta: string) => {
    setGenerandoMes(mesId);
    setErrorPdf(null);
    try {
      await compartirReporteMensual(
        mesId,
        etiqueta,
        ventasDelMes(mesId, ventas),
        movimientosCajaDelMes(mesId, ventas, cajaMovimientos)
      );
    } catch (e) {
      setErrorPdf(e instanceof Error ? e.message : "No se pudo generar el PDF.");
    }
    setGenerandoMes(null);
  };

  const capital = capitalEnStock(perfumes);
  const saldo = saldoCaja(ventas, cajaMovimientos);
  const plataEnLaCalle = ventas.reduce(
    (suma, v) => suma + Math.max(0, v.total - totalPagado(v)),
    0
  );
  const porUsuario = ventasPorUsuarioDetalle(ventas);
  const totalDeVentas =
    porUsuario.reduce(
      (suma, u) => suma + saldoIndividual(u.usuario, ventas, cajaMovimientos),
      0
    ) + plataEnLaCalle;
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
          <span className="finanzas-tarjeta-label">Plata en la calle</span>
          <span className="finanzas-tarjeta-valor">{formatoARS(plataEnLaCalle)}</span>
        </div>
        <div className="finanzas-tarjeta finanzas-tarjeta-gris">
          <span className="finanzas-tarjeta-label">Total de las ventas</span>
          <span className="finanzas-tarjeta-valor">{formatoARS(totalDeVentas)}</span>
        </div>
        {porUsuario.map((u) => (
          <button
            className="finanzas-tarjeta"
            key={u.usuario}
            onClick={() => setCuentaAbierta(u.usuario)}
          >
            <span className="finanzas-tarjeta-label">Cuenta · {u.usuario}</span>
            <span className="finanzas-tarjeta-valor">
              {formatoARS(saldoIndividual(u.usuario, ventas, cajaMovimientos))}
            </span>
          </button>
        ))}
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
              <li key={u.usuario} className="finanzas-usuario-caja">
                <div className="finanzas-usuario-cabecera">
                  <span className="finanzas-usuario-nombre">{u.usuario}</span>
                  <span className="finanzas-usuario-total">{formatoARS(u.total)}</span>
                </div>
                <ul className="finanzas-usuario-ventas">
                  {u.ventas.map((v) => (
                    <li key={v.id}>
                      <div className="finanzas-usuario-venta-info">
                        <span className="finanzas-usuario-venta-cliente">{v.cliente}</span>
                        <span className="finanzas-usuario-venta-meta">
                          {v.perfume_nombre}
                          {v.cantidad > 1 ? ` ×${v.cantidad}` : ""} · {fechaLinda(v.creado_en)}
                        </span>
                      </div>
                      <strong>{formatoARS(v.total)}</strong>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ))}

      {seccion === "meses" &&
        (meses.length === 0 ? (
          <p className="vacio">Todavía no hay ventas registradas.</p>
        ) : (
          <>
            {errorPdf && <p className="error-msg">{errorPdf}</p>}
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
                  <button
                    className="btn-chico finanzas-mes-pdf"
                    onClick={() => descargarMes(mes.mes, mes.etiqueta)}
                    disabled={generandoMes === mes.mes}
                  >
                    {generandoMes === mes.mes ? "Generando…" : "🧾 Descargar PDF"}
                  </button>
                </li>
              ))}
            </ul>
          </>
        ))}

      {modalAbierto && (
        <CajaModal
          saldoActual={saldo}
          onGuardar={onMovimientoCaja}
          onCerrar={() => setModalAbierto(false)}
        />
      )}

      {cuentaAbierta && (
        <CuentaUsuarioModal
          usuario={cuentaAbierta}
          esPropia={cuentaAbierta === usuarioActual}
          saldo={saldoIndividual(cuentaAbierta, ventas, cajaMovimientos)}
          movimientos={movimientosDeUsuario(cuentaAbierta, cajaMovimientos)}
          onDescontar={(monto, descripcion, fecha) =>
            onMovimientoCaja("retiro", monto, descripcion, fecha)
          }
          onCerrar={() => setCuentaAbierta(null)}
        />
      )}
    </>
  );
}
