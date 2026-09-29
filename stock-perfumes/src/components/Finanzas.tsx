import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import type { MovimientoCaja, Perfume, TipoCaja, Venta } from "../types";
import { formatoARS } from "../lib/precio";
import { fechaCorta } from "../lib/fecha";
import { totalPagado } from "../lib/ventas";
import {
  capitalEnStock,
  cobradoYFiadoDeUsuario,
  fiadoPorUsuario,
  gananciaPorMes,
  gananciaPorUsuario,
  gananciaTotal,
  movimientosCaja,
  movimientosCajaDelMes,
  movimientosDeUsuario,
  saldoCaja,
  saldoIndividual,
  ventasDelMes,
  ventasPorMes,
  ventasPorUsuarioDetalle,
  type Ganancia,
  type VentasDeUsuario,
} from "../lib/finanzas";
import { compartirReporteMensual } from "../lib/reporteMensual";
import CajaModal from "./CajaModal";
import CuentaUsuarioModal from "./CuentaUsuarioModal";
import FilaMovimiento from "./FilaMovimiento";
import TarjetaMetrica from "./TarjetaMetrica";

interface Props {
  usuarioActual: string;
  perfumes: Perfume[];
  ventas: Venta[];
  cajaMovimientos: MovimientoCaja[];
  onMovimientoCaja: (
    tipo: TipoCaja,
    monto: number,
    descripcion: string,
    fecha: string,
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

function porcentajeDe(parte: number, total: number): string {
  return total > 0 ? `${Math.round((parte / total) * 100)}%` : "0%";
}

function CajaUsuarioVentas({
  datos,
  totalGeneral,
  ganancia,
}: {
  datos: VentasDeUsuario;
  totalGeneral: number;
  ganancia?: Ganancia;
}) {
  const [abierto, setAbierto] = useState(false);

  return (
    <li className="finanzas-usuario-caja">
      <button
        className="finanzas-usuario-cabecera"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
      >
        <span className="finanzas-usuario-nombre-bloque">
          <span className="finanzas-usuario-nombre">{datos.usuario}</span>
          {ganancia && (
            <span
              className={`finanzas-usuario-ganancia ${
                ganancia.monto < 0 ? "fin-out-texto" : "fin-in-texto"
              }`}
            >
              Ganancia: {formatoARS(ganancia.monto)} (
              {Math.round(ganancia.porcentaje)}%)
            </span>
          )}
        </span>
        <span className="finanzas-usuario-cabecera-derecha">
          <span className="finanzas-usuario-total">
            {formatoARS(datos.total)}{" "}
            <span className="finanzas-tarjeta-porcentaje">
              ({porcentajeDe(datos.total, totalGeneral)})
            </span>
          </span>
          <ChevronDown
            size={16}
            className={`finanzas-usuario-chevron ${abierto ? "abierto" : ""}`}
          />
        </span>
      </button>

      {abierto && (
        <ul className="finanzas-usuario-ventas">
          {datos.ventas.map((v) => (
            <li key={v.id}>
              <div className="finanzas-usuario-venta-info">
                <span className="finanzas-usuario-venta-cliente">
                  {v.cliente}
                </span>
                <span className="finanzas-usuario-venta-meta">
                  {v.perfume_nombre}
                  {v.cantidad > 1 ? ` ×${v.cantidad}` : ""} ·{" "}
                  {fechaLinda(v.creado_en)}
                </span>
              </div>
              <strong>{formatoARS(v.total)}</strong>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
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
  const [plataCalleAbierta, setPlataCalleAbierta] = useState(false);
  const [gananciaAbierta, setGananciaAbierta] = useState(false);
  const [generandoMes, setGenerandoMes] = useState<string | null>(null);
  const [errorPdf, setErrorPdf] = useState<string | null>(null);
  const [filtroPorMes, setFiltroPorMes] = useState<Record<string, string>>({});

  const descargarMes = async (
    mesId: string,
    etiqueta: string,
    usuarioFiltro: string,
  ) => {
    setGenerandoMes(mesId);
    setErrorPdf(null);
    try {
      const usuario = usuarioFiltro || undefined;
      const etiquetaFinal = usuario ? `${etiqueta} · ${usuario}` : etiqueta;
      const idArchivo = usuario
        ? `${mesId}-${usuario.trim().replace(/\s+/g, "-").toLowerCase()}`
        : mesId;
      await compartirReporteMensual(
        idArchivo,
        etiquetaFinal,
        ventasDelMes(mesId, ventas, usuario),
        movimientosCajaDelMes(mesId, ventas, cajaMovimientos, usuario),
      );
    } catch (e) {
      setErrorPdf(
        e instanceof Error ? e.message : "No se pudo generar el PDF.",
      );
    }
    setGenerandoMes(null);
  };

  const capital = capitalEnStock(perfumes);
  const saldo = saldoCaja(ventas, cajaMovimientos);
  const plataEnLaCalle = ventas.reduce(
    (suma, v) => suma + Math.max(0, v.total - totalPagado(v)),
    0,
  );
  const porUsuario = ventasPorUsuarioDetalle(ventas);
  // Lo facturado, sin descontar los movimientos de caja: un retiro baja la caja, no las ventas.
  const totalDeVentas = porUsuario.reduce((suma, u) => suma + u.total, 0);
  const ledger = movimientosCaja(ventas, cajaMovimientos);
  const meses = ventasPorMes(ventas);
  const fiadoUsuarios = fiadoPorUsuario(ventas);
  const ganancia = gananciaTotal(ventas, perfumes);
  const gananciaUsuarios = gananciaPorUsuario(ventas, perfumes);
  const gananciaMeses = gananciaPorMes(ventas, perfumes);

  return (
    <>
      <div className="finanzas-resumen">
        <TarjetaMetrica label="Caja en común" valor={formatoARS(saldo)} />
        <TarjetaMetrica label="Capital en stock" valor={formatoARS(capital)} />
        <TarjetaMetrica
          label="Ganancia"
          valor={formatoARS(ganancia.monto)}
          comparativo={`${Math.round(ganancia.porcentaje)}% sobre el costo`}
          tendencia={ganancia.monto < 0 ? "baja" : "sube"}
          tono={ganancia.monto < 0 ? "sale" : "entra"}
          onClick={() => setGananciaAbierta(true)}
        />
        <TarjetaMetrica
          label="Plata en la calle"
          valor={formatoARS(plataEnLaCalle)}
          tono="sale"
          comparativo="Fiado sin cobrar"
          onClick={() => setPlataCalleAbierta(true)}
        />
        <TarjetaMetrica
          label="Total de las ventas"
          valor={formatoARS(totalDeVentas)}
        />
        {porUsuario.map((u) => (
          <TarjetaMetrica
            key={u.usuario}
            label={`Cuenta · ${u.usuario}`}
            valor={formatoARS(
              saldoIndividual(u.usuario, ventas, cajaMovimientos),
            )}
            onClick={() => setCuentaAbierta(u.usuario)}
          />
        ))}
      </div>

      <div className="sub-tabs">
        <button
          className={seccion === "caja" ? "activo" : ""}
          onClick={() => setSeccion("caja")}
        >
          Caja
        </button>
        <button
          className={seccion === "usuarios" ? "activo" : ""}
          onClick={() => setSeccion("usuarios")}
        >
          Por usuario
        </button>
        <button
          className={seccion === "meses" ? "activo" : ""}
          onClick={() => setSeccion("meses")}
        >
          Por mes
        </button>
      </div>

      {seccion === "caja" && (
        <>
          <button
            className="btn-secundario finanzas-btn-mov"
            onClick={() => setModalAbierto(true)}
          >
            + Movimiento de caja
          </button>
          {ledger.length === 0 ? (
            <p className="vacio">Todavía no hay movimientos de plata.</p>
          ) : (
            <ul className="borde-fino divisor-fino overflow-hidden rounded-xl bg-superficie">
              {ledger.map((m) => (
                <FilaMovimiento
                  key={m.id}
                  sentido={m.monto < 0 ? "sale" : "entra"}
                  titulo={ETIQUETA_TIPO[m.tipo]}
                  detalle={m.descripcion}
                  meta={`${fechaCorta(m.fecha)} · ${m.usuario}`}
                  monto={formatoARS(Math.abs(m.monto))}
                />
              ))}
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
              <CajaUsuarioVentas
                key={u.usuario}
                datos={u}
                totalGeneral={totalDeVentas}
                ganancia={gananciaUsuarios.find((g) => g.usuario === u.usuario)}
              />
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
              {meses.map((mes) => {
                const usuarioFiltro = filtroPorMes[mes.mes] ?? "";
                const ventasMes = ventasDelMes(mes.mes, ventas);
                const gananciaMes = gananciaTotal(ventasMes, perfumes);
                const gananciaMesUsuarios = gananciaPorUsuario(
                  ventasMes,
                  perfumes,
                );
                return (
                  <li key={mes.mes} className="finanzas-mes">
                    <div className="finanzas-mes-cabecera">
                      <span className="finanzas-mes-etiqueta">
                        {mes.etiqueta}
                      </span>
                      <span className="finanzas-mes-total">
                        {formatoARS(mes.total)}
                      </span>
                    </div>
                    <p
                      className={`finanzas-mes-ganancia ${
                        gananciaMes.monto < 0 ? "fin-out-texto" : "fin-in-texto"
                      }`}
                    >
                      Ganancia del mes:{" "}
                      <strong>{formatoARS(gananciaMes.monto)}</strong> (
                      {Math.round(gananciaMes.porcentaje)}%)
                    </p>
                    <ul className="finanzas-mes-usuarios">
                      {mes.porUsuario.map((u) => {
                        const g = gananciaMesUsuarios.find(
                          (x) => x.usuario === u.usuario,
                        );
                        return (
                          <li key={u.usuario}>
                            <span className="finanzas-usuario-nombre-bloque">
                              <span>{u.usuario}</span>
                              {g && (
                                <span
                                  className={`finanzas-usuario-ganancia ${
                                    g.monto < 0
                                      ? "fin-out-texto"
                                      : "fin-in-texto"
                                  }`}
                                >
                                  Ganancia: {formatoARS(g.monto)} (
                                  {Math.round(g.porcentaje)}%)
                                </span>
                              )}
                            </span>
                            <span>
                              {formatoARS(u.total)}{" "}
                              <span className="finanzas-tarjeta-porcentaje">
                                ({porcentajeDe(u.total, mes.total)})
                              </span>
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    <p className="finanzas-mes-pdf-label">Descargar PDF de:</p>
                    <div className="filtro-mov">
                      <button
                        className={usuarioFiltro === "" ? "activo" : ""}
                        onClick={() =>
                          setFiltroPorMes((f) => ({ ...f, [mes.mes]: "" }))
                        }
                      >
                        Todos
                      </button>
                      {mes.porUsuario.map((u) => (
                        <button
                          key={u.usuario}
                          className={
                            usuarioFiltro === u.usuario ? "activo" : ""
                          }
                          onClick={() =>
                            setFiltroPorMes((f) => ({
                              ...f,
                              [mes.mes]: u.usuario,
                            }))
                          }
                        >
                          {u.usuario}
                        </button>
                      ))}
                    </div>
                    <button
                      className="btn-chico finanzas-mes-pdf"
                      onClick={() =>
                        descargarMes(mes.mes, mes.etiqueta, usuarioFiltro)
                      }
                      disabled={generandoMes === mes.mes}
                    >
                      {generandoMes === mes.mes ? (
                        "Generando…"
                      ) : (
                        <>
                          <Download size={14} strokeWidth={1.75} />
                          Descargar PDF
                        </>
                      )}
                    </button>
                  </li>
                );
              })}
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
          {...cobradoYFiadoDeUsuario(cuentaAbierta, ventas)}
          movimientos={movimientosDeUsuario(cuentaAbierta, cajaMovimientos)}
          onDescontar={(monto, descripcion, fecha) =>
            onMovimientoCaja("retiro", monto, descripcion, fecha)
          }
          onCerrar={() => setCuentaAbierta(null)}
        />
      )}

      {plataCalleAbierta && (
        <div
          className="modal-fondo"
          onClick={() => setPlataCalleAbierta(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h2>Plata en la calle</h2>
              <button
                className="modal-cerrar"
                onClick={() => setPlataCalleAbierta(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <p className="modal-sub">
              Total fiado:{" "}
              <strong className="texto-rojo">
                {formatoARS(plataEnLaCalle)}
              </strong>
            </p>

            {fiadoUsuarios.length === 0 ? (
              <p className="vacio">No hay deuda pendiente de ningún usuario.</p>
            ) : (
              <ul className="desglose-usuarios">
                {fiadoUsuarios.map((u) => (
                  <li key={u.usuario} className="desglose-fila">
                    <span className="desglose-nombre">{u.usuario}</span>
                    <span className="desglose-monto fin-out-texto">
                      {formatoARS(u.total)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {gananciaAbierta && (
        <div className="modal-fondo" onClick={() => setGananciaAbierta(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cabecera">
              <h2>Ganancia</h2>
              <button
                className="modal-cerrar"
                onClick={() => setGananciaAbierta(false)}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <p className="modal-sub">
              Total: <strong>{formatoARS(ganancia.monto)}</strong> (
              {Math.round(ganancia.porcentaje)}%)
            </p>

            {gananciaUsuarios.length === 0 ? (
              <p className="vacio">Todavía no hay ventas registradas.</p>
            ) : (
              <ul className="desglose-usuarios">
                {gananciaUsuarios.map((u) => (
                  <li key={u.usuario} className="desglose-fila">
                    <span className="desglose-nombre">{u.usuario}</span>
                    <span
                      className={`desglose-monto ${u.monto < 0 ? "fin-out-texto" : "fin-in-texto"}`}
                    >
                      {formatoARS(u.monto)}{" "}
                      <span className="finanzas-tarjeta-porcentaje">
                        ({Math.round(u.porcentaje)}%)
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}

            {gananciaMeses.length > 0 && (
              <>
                <p className="cuenta-subtitulo">Resumen por mes</p>
                <ul className="ganancia-meses">
                  {gananciaMeses.map((m) => (
                    <li key={m.mes} className="ganancia-mes">
                      <span className="ganancia-mes-etiqueta">{m.etiqueta}</span>
                      <div className="ganancia-mes-datos">
                        <div>
                          <span>Vendido</span>
                          <strong>{formatoARS(m.vendido)}</strong>
                        </div>
                        <div>
                          <span>Inversión</span>
                          <strong>{formatoARS(m.inversion)}</strong>
                        </div>
                        <div>
                          <span>Ganancia</span>
                          <strong
                            className={
                              m.monto < 0 ? "fin-out-texto" : "fin-in-texto"
                            }
                          >
                            {formatoARS(m.monto)}
                          </strong>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
