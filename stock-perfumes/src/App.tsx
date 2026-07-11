import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./lib/supabase";
import { usePerfumes } from "./hooks/usePerfumes";
import type { Perfume, TipoMovimiento } from "./types";
import Login from "./components/Login";
import PerfumeCard from "./components/PerfumeCard";
import PerfumeForm from "./components/PerfumeForm";
import StockModal from "./components/StockModal";
import Historial from "./components/Historial";

type Vista = "stock" | "historial";

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setListo(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!listo) return <div className="cargando-pantalla">Cargando…</div>;
  if (!session) return <Login />;
  return <Panel usuario={session.user.email ?? "usuario"} />;
}

function Panel({ usuario }: { usuario: string }) {
  const { perfumes, movimientos, cargando, error, crear, editar, eliminar, ajustarStock } =
    usePerfumes(usuario);

  const [vista, setVista] = useState<Vista>("stock");
  const [busqueda, setBusqueda] = useState("");
  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Perfume | null>(null);
  const [ajustando, setAjustando] = useState<Perfume | null>(null);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return perfumes;
    return perfumes.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q)
    );
  }, [perfumes, busqueda]);

  const bajos = perfumes.filter((p) => p.stock <= p.stock_minimo).length;

  return (
    <div className="app">
      <header className="header">
        <div className="header-titulo">
          <h1><span className="header-flor">✦</span> Stock Perfumes</h1>
          <button className="btn-salir" onClick={() => supabase.auth.signOut()}>Salir</button>
        </div>
        <nav className="tabs">
          <button className={vista === "stock" ? "activo" : ""} onClick={() => setVista("stock")}>
            Stock{bajos > 0 && <span className="badge-bajo">{bajos}</span>}
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
              <p className="vacio">Cargando perfumes…</p>
            ) : filtrados.length === 0 ? (
              <p className="vacio">
                {perfumes.length === 0
                  ? "No hay perfumes cargados. Agregá el primero con el botón +."
                  : "Ningún perfume coincide con la búsqueda."}
              </p>
            ) : (
              <div className="lista">
                {filtrados.map((p) => (
                  <PerfumeCard
                    key={p.id}
                    perfume={p}
                    onEditar={() => setEditando(p)}
                    onAjustar={() => setAjustando(p)}
                  />
                ))}
              </div>
            )}

            <button className="fab" onClick={() => setFormAbierto(true)} aria-label="Agregar perfume">
              +
            </button>
          </>
        )}

        {vista === "historial" && <Historial movimientos={movimientos} />}
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
    </div>
  );
}
