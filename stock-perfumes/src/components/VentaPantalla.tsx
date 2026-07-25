import { useState } from "react";
import type { NuevaVenta, Perfume, TipoPago } from "../types";
import { formatoARS, precioMayorista, precioSugerido } from "../lib/precio";

interface Props {
  perfume: Perfume;
  onVender: (datos: NuevaVenta) => Promise<void>;
  onCerrar: () => void;
}

type NivelPrecio = "final" | "mayorista";

export default function VentaPantalla({ perfume, onVender, onCerrar }: Props) {
  const final = precioSugerido(perfume);
  const mayorista = precioMayorista(perfume);
  const [nivelPrecio, setNivelPrecio] = useState<NivelPrecio>("final");
  const [cliente, setCliente] = useState("");
  const [cantidad, setCantidad] = useState("1");
  const [total, setTotal] = useState(String(final));
  const [totalEditado, setTotalEditado] = useState(false);
  const [tipoPago, setTipoPago] = useState<TipoPago>("contado");
  const [entrega, setEntrega] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const n = parseInt(cantidad) || 0;
  const t = parseFloat(total) || 0;
  const e = parseFloat(entrega) || 0;
  const resultado = perfume.stock - n;
  const saldo = Math.max(0, t - (tipoPago === "contado" ? t : e));
  const precioUnitario = nivelPrecio === "mayorista" ? mayorista : final;

  const cambiarCantidad = (valor: number) => {
    const nuevo = Math.max(1, valor);
    setCantidad(String(nuevo));
    if (!totalEditado) setTotal(String(precioUnitario * nuevo));
  };

  const elegirNivel = (nivel: NivelPrecio) => {
    setNivelPrecio(nivel);
    setTotalEditado(false);
    setTotal(String((nivel === "mayorista" ? mayorista : final) * n));
  };

  const confirmar = async () => {
    if (!cliente.trim()) return setError("Poné el nombre del cliente.");
    if (n <= 0) return setError("La cantidad tiene que ser mayor a 0.");
    if (n > perfume.stock) return setError("No hay stock suficiente.");
    if (t <= 0) return setError("El precio tiene que ser mayor a 0.");
    if (tipoPago !== "contado" && e > t)
      return setError("La entrega no puede superar el total.");
    setGuardando(true);
    setError(null);
    try {
      await onVender({
        cliente: cliente.trim(),
        cantidad: n,
        total: t,
        tipo_pago: tipoPago,
        entrega: tipoPago === "contado" ? t : e,
      });
      onCerrar();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar la venta.");
      setGuardando(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-titulo">
          <div className="header-volver">
            <button className="btn-volver" onClick={onCerrar} aria-label="Volver">
              ←
            </button>
            <h1>Nueva venta</h1>
          </div>
        </div>
      </header>

      <main className="contenido">
        <p className="modal-sub">
          {perfume.nombre} · stock actual: <strong>{perfume.stock}</strong>
        </p>

        <label className="campo">
          <span>Cliente</span>
          <input
            value={cliente}
            onChange={(ev) => setCliente(ev.target.value)}
            placeholder="Nombre del cliente"
            autoFocus
          />
        </label>

        <div className="campo">
          <span>Precio</span>
          <div className="tipo-selector">
            <button
              className={nivelPrecio === "final" ? "activo" : ""}
              onClick={() => elegirNivel("final")}
            >
              Final · {formatoARS(final)}
            </button>
            <button
              className={nivelPrecio === "mayorista" ? "activo" : ""}
              onClick={() => elegirNivel("mayorista")}
            >
              Mayorista · {formatoARS(mayorista)}
            </button>
          </div>
        </div>

        <div className="campos-fila">
          <label className="campo">
            <span>Cantidad</span>
            <div className="stepper">
              <button onClick={() => cambiarCantidad(n - 1)}>−</button>
              <input
                type="number"
                inputMode="numeric"
                value={cantidad}
                onChange={(ev) => cambiarCantidad(parseInt(ev.target.value) || 1)}
              />
              <button onClick={() => cambiarCantidad(n + 1)}>+</button>
            </div>
          </label>

          <label className="campo">
            <span>Precio total</span>
            <input
              type="number"
              inputMode="decimal"
              value={total}
              onChange={(ev) => {
                setTotal(ev.target.value);
                setTotalEditado(true);
              }}
            />
          </label>
        </div>

        <div className="campo">
          <span>Forma de pago</span>
          <div className="tipo-selector">
            <button
              className={tipoPago === "contado" ? "activo" : ""}
              onClick={() => setTipoPago("contado")}
            >
              Contado
            </button>
            <button
              className={tipoPago === "semanal" ? "activo" : ""}
              onClick={() => setTipoPago("semanal")}
            >
              Semanal
            </button>
            <button
              className={tipoPago === "mensual" ? "activo" : ""}
              onClick={() => setTipoPago("mensual")}
            >
              Mensual
            </button>
          </div>
        </div>

        {tipoPago !== "contado" && (
          <label className="campo">
            <span>Entrega inicial (opcional)</span>
            <input
              type="number"
              inputMode="decimal"
              value={entrega}
              onChange={(ev) => setEntrega(ev.target.value)}
              placeholder="0"
            />
          </label>
        )}

        <p className="vista-previa">
          Stock resultante:{" "}
          <strong className={resultado < 0 ? "texto-rojo" : ""}>{resultado}</strong>
          {tipoPago !== "contado" && (
            <>
              {" "}· Queda debiendo: <strong>{formatoARS(saldo)}</strong>
            </>
          )}
        </p>

        {error && <p className="error-msg">{error}</p>}

        <div className="modal-botones">
          <button className="btn-secundario" onClick={onCerrar}>
            Cancelar
          </button>
          <button
            className="btn-primario"
            onClick={confirmar}
            disabled={guardando || resultado < 0}
          >
            {guardando ? "Guardando…" : "Registrar venta"}
          </button>
        </div>
      </main>
    </div>
  );
}
