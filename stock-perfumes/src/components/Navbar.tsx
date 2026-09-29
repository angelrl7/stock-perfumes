import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Banknote,
  Download,
  History,
  LogOut,
  Moon,
  MoreHorizontal,
  Package,
  Plus,
  Sun,
  Wallet,
  type LucideProps,
} from "lucide-react";
import type { Tema, Vista } from "../App";
import type { Perfume } from "../types";
import { compartirListaPrecios } from "../lib/listaPrecios";

interface Props {
  vista: Vista;
  onVista: (v: Vista) => void;
  bajos: number;
  pendientes: number;
  tema: Tema;
  onTema: () => void;
  perfumes: Perfume[];
  onAgregarProducto: () => void;
  onSalir: () => void;
}

const SECCIONES: {
  valor: Vista;
  titulo: string;
  icono: ComponentType<LucideProps>;
}[] = [
  { valor: "stock", titulo: "Stock", icono: Package },
  { valor: "ventas", titulo: "Ventas", icono: Wallet },
  { valor: "historial", titulo: "Historial", icono: History },
  { valor: "finanzas", titulo: "Finanzas", icono: Banknote },
];

export default function Navbar({
  vista,
  onVista,
  bajos,
  pendientes,
  tema,
  onTema,
  perfumes,
  onAgregarProducto,
  onSalir,
}: Props) {
  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!abierto) return;
    const alTocarFuera = (e: MouseEvent | TouchEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    const alPresionarEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAbierto(false);
    };
    document.addEventListener("mousedown", alTocarFuera);
    document.addEventListener("touchstart", alTocarFuera);
    document.addEventListener("keydown", alPresionarEscape);
    return () => {
      document.removeEventListener("mousedown", alTocarFuera);
      document.removeEventListener("touchstart", alTocarFuera);
      document.removeEventListener("keydown", alPresionarEscape);
    };
  }, [abierto]);

  const badgeDe = (v: Vista) => (v === "stock" ? bajos : v === "ventas" ? pendientes : 0);

  return (
    <>
      {/* Barra superior: en mobile queda solo logo + acciones. */}
      <header className="borde-fino-b fixed inset-x-0 top-0 z-30 bg-superficie/90 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between gap-3 px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            {/* logo.jpeg es el logo entero (1280×697, con texto): acá se recorta
                solo el gráfico de barras para que entre en el cuadradito. */}
            <span className="relative h-8 w-8 shrink-0 overflow-hidden rounded-lg bg-[#0b1215]">
              <img
                src="/logo.jpeg"
                alt=""
                className="absolute max-w-none"
                style={{ width: 106, left: -37, top: -4 }}
              />
            </span>
            <span className="truncate text-[16px] font-semibold tracking-tight">
              Ge<span className="text-acento">Stock</span>
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            <div className="hidden items-center gap-1 md:flex">
              {SECCIONES.map((s) => {
                const activo = vista === s.valor;
                const badge = badgeDe(s.valor);
                return (
                  <button
                    key={s.valor}
                    type="button"
                    onClick={() => onVista(s.valor)}
                    aria-current={activo ? "page" : undefined}
                    className={[
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] transition-colors",
                      activo
                        ? "bg-acento-suave font-medium text-acento-texto"
                        : "text-tenue hover:text-tinta",
                    ].join(" ")}
                  >
                    {s.titulo}
                    {badge > 0 && (
                      <span className={s.valor === "stock" ? "badge-bajo" : "badge-deuda"}>
                        {badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="btn-tema"
              onClick={onTema}
              aria-label={tema === "oscuro" ? "Usar modo claro" : "Usar modo oscuro"}
              title={tema === "oscuro" ? "Modo claro" : "Modo oscuro"}
            >
              {tema === "oscuro" ? (
                <Sun size={17} strokeWidth={1.75} />
              ) : (
                <Moon size={17} strokeWidth={1.75} />
              )}
            </button>

            {/* Menú de acciones que no son secciones. */}
            <div className="relative" ref={contenedorRef}>
              <button
                type="button"
                className="btn-tema"
                onClick={() => setAbierto((o) => !o)}
                aria-expanded={abierto}
                aria-label="Más acciones"
              >
                <MoreHorizontal size={17} strokeWidth={1.75} />
              </button>

              {abierto && (
                <div className="borde-fino absolute right-0 top-full z-50 mt-2 w-60 max-w-[calc(100vw-32px)] overflow-hidden rounded-xl bg-superficie p-1.5">
                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-lienzo"
                    onClick={() => {
                      onAgregarProducto();
                      setAbierto(false);
                    }}
                  >
                    <Plus size={16} strokeWidth={1.75} className="text-tenue" />
                    Agregar producto
                  </button>

                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] transition-colors hover:bg-lienzo"
                    onClick={() => {
                      compartirListaPrecios(perfumes);
                      setAbierto(false);
                    }}
                  >
                    <Download size={16} strokeWidth={1.75} className="text-tenue" />
                    Lista de precios (PDF)
                  </button>

                  <div className="my-1 h-px bg-borde" />

                  <button
                    type="button"
                    className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] text-tenue transition-colors hover:bg-lienzo"
                    onClick={() => {
                      onSalir();
                      setAbierto(false);
                    }}
                  >
                    <LogOut size={16} strokeWidth={1.75} />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Bottom nav: solo mobile. */}
      <nav className="borde-fino-t margen-seguro fixed inset-x-0 bottom-0 z-30 bg-superficie/95 backdrop-blur-sm md:hidden">
        <div className="mx-auto flex w-full max-w-md items-stretch">
          {SECCIONES.map((s) => {
            const activo = vista === s.valor;
            const badge = badgeDe(s.valor);
            const Icono = s.icono;
            return (
              <button
                key={s.valor}
                type="button"
                onClick={() => onVista(s.valor)}
                aria-current={activo ? "page" : undefined}
                className={[
                  "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors",
                  activo ? "text-acento-texto" : "text-tenue",
                ].join(" ")}
              >
                <span
                  className={[
                    "relative flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                    activo ? "bg-acento-suave" : "",
                  ].join(" ")}
                >
                  <Icono size={17} strokeWidth={1.75} />
                  {badge > 0 && (
                    <span
                      className={[
                        "absolute -top-0.5 right-1.5 h-1.5 w-1.5 rounded-full",
                        s.valor === "stock" ? "bg-alerta" : "bg-acento",
                      ].join(" ")}
                    />
                  )}
                </span>
                <span className={activo ? "font-medium" : ""}>{s.titulo}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
