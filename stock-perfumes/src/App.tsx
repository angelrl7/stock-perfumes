import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { usePerfumes } from "./hooks/usePerfumes";
import type { Perfume, TipoMovimiento } from "./types";
import Login from "./components/Login";
import NombreForm from "./components/NombreForm";
import PerfumeCard from "./components/PerfumeCard";
import PerfumeForm from "./components/PerfumeForm";
import StockModal from "./components/StockModal";
import VentaModal from "./components/VentaModal";
import Ventas from "./components/Ventas";
import Historial from "./components/Historial";
import { estaSaldada } from "./lib/ventas";

type Vista = "stock" | "ventas" | "historial";
type Tema = "claro" | "oscuro";

function temaInicial(): Tema {
  const guardado = localStorage.getItem("tema");
  if (guardado === "claro" || guardado === "oscuro") return guardado;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro";
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [listo, setListo] = useState(false);
  const [tema, setTema] = useState<Tema>(temaInicial);

  useEffect(() => {
    document.documentElement.dataset.tema = tema;
    localStorage.setItem("tema", tema);
  }, [tema]);

  const alternarTema = () =>
    setTema((t) => (t === "oscuro" ? "claro" : "oscuro"));

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setListo(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!listo) return <div className="cargando-pantalla">Cargando…</div>;
  if (!session)
    return (
      <>
        <button
          className="btn-tema btn-tema-login"
          onClick={alternarTema}
          aria-label="Cambiar tema"
        >
          {tema === "oscuro" ? "☀️" : "🌙"}
        </button>
        <Login />
      </>
    );

  const nombre =
    typeof session.user.user_metadata?.nombre === "string"
      ? session.user.user_metadata.nombre.trim()
      : "";
  if (!nombre) return <NombreForm />;

  return <Panel usuario={nombre} tema={tema} onTema={alternarTema} />;
}

function Panel({
  usuario,
  tema,
  onTema,
}: {
  usuario: string;
  tema: Tema;
  onTema: () => void;
}) {
  const {
    perfumes,
    movimientos,
    ventas,
    cargando,
    error,
    crear,
    editar,
    eliminar,
    ajustarStock,
    crearVenta,
    agregarPago,
  } = usePerfumes(usuario);

  const [vista, setVista] = useState<Vista>("stock");
  const [busqueda, setBusqueda] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Perfume | null>(null);
  const [ajustando, setAjustando] = useState<Perfume | null>(null);
  const [vendiendo, setVendiendo] = useState<Perfume | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return perfumes;
    return perfumes.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q)
    );
  }, [perfumes, busqueda]);

  const bajos = perfumes.filter((p) => p.stock <= p.stock_minimo).length;
  const pendientes = ventas.filter((v) => !estaSaldada(v));
  const saldadas = ventas.filter(estaSaldada);

  return (
    <div className="app">
      <header className="header">
        <div className="header-titulo">
          <h1><span className="header-flor">✦</span> Stock Productos</h1>
          <div className="header-acciones">
            <button className="btn-tema" onClick={onTema} aria-label="Cambiar tema">
              {tema === "oscuro" ? "☀️" : "🌙"}
            </button>
            <button className="btn-salir" onClick={() => supabase.auth.signOut()}>Salir</button>
          </div>
        </div>
        <nav className="tabs">
          <button className={vista === "stock" ? "activo" : ""} onClick={() => setVista("stock")}>
            Stock{bajos > 0 && <span className="badge-bajo">{bajos}</span>}
          </button>
          <button className={vista === "ventas" ? "activo" : ""} onClick={() => setVista("ventas")}>
            Ventas{pendientes.length > 0 && <span className="badge-deuda">{pendientes.length}</span>}
          </button>
          <button className={vista === "historial" ? "activo" : ""} onClick={() => setVista("historial")}>
            Historial
          </button>
        </nav>
      </header>

      <main className="contenido">
        {error && <p className="error-msg">{error}</p>}

        {vista === "stock" && (
          <>
            <input
              className="buscador"
              type="search"
              placeholder="Buscar por nombre o marca…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />

            {cargando ? (
              <p className="vacio">Cargando productos…</p>
            ) : filtrados.length === 0 ? (
              <p className="vacio">
                {perfumes.length === 0
                  ? "No hay productos cargados. Agregá el primero con el botón +."
                  : "Ningún producto coincide con la búsqueda."}
              </p>
            ) : (
              <div className="lista">
                {filtrados.map((p) => (
                  <PerfumeCard
                    key={p.id}
                    perfume={p}
                    onEditar={() => setEditando(p)}
                    onAjustar={() => setAjustando(p)}
                    onVender={() => setVendiendo(p)}
                  />
                ))}
              </div>
            )}

            <button className="fab" onClick={() => setFormAbierto(true)} aria-label="Agregar producto">
              +
            </button>
          </>
        )}

        {vista === "ventas" && <Ventas ventas={pendientes} onPago={agregarPago} />}

        {vista === "historial" && (
          <Historial movimientos={movimientos} ventas={saldadas} />
        )}
      </main>

      {formAbierto && (
        <PerfumeForm onGuardar={crear} onCerrar={() => setFormAbierto(false)} />
      )}

      {editando && (
        <PerfumeForm
          perfume={editando}
          onGuardar={(d) => editar(editando.id, d)}
          onEliminar={async () => {
            await eliminar(editando.id);
            setEditando(null);
          }}
          onCerrar={() => setEditando(null)}
        />
      )}

      {ajustando && (
        <StockModal
          perfume={ajustando}
          onAjustar={(cantidad: number, tipo: TipoMovimiento) =>
            ajustarStock(ajustando, cantidad, tipo)
          }
          onCerrar={() => setAjustando(null)}
        />
      )}

      {vendiendo && (
        <VentaModal
          perfume={vendiendo}
          onVender={(datos) => crearVenta(vendiendo, datos)}
          onCerrar={() => setVendiendo(null)}
        />
      )}
    </div>
  );
}
