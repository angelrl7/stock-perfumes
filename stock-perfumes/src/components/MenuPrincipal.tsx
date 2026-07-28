import { useEffect, useRef, useState, type ComponentType } from "react";
import {
  Menu as MenuIcon,
  Package,
  Wallet,
  History,
  Banknote,
  Plus,
  Download,
  Sun,
  Moon,
  LogOut,
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
  descripcion: string;
  icono: ComponentType<LucideProps>;
}[] = [
  { valor: "stock", titulo: "Stock", descripcion: "Ver y administrar el inventario", icono: Package },
  { valor: "ventas", titulo: "Ventas", descripcion: "Cobros pendientes de clientes", icono: Wallet },
  { valor: "historial", titulo: "Historial", descripcion: "Ventas cobradas y movimientos de stock", icono: History },
  { valor: "finanzas", titulo: "Finanzas", descripcion: "Caja en común y movimientos de plata", icono: Banknote },
];

export default function MenuPrincipal({
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

  const ir = (v: Vista) => {
    onVista(v);
    setAbierto(false);
  };

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        className="inline-flex items-center gap-1.5 rounded-full border border-[var(--linea)] bg-[var(--campo-fondo)] px-3 py-1.5 text-[13px] font-semibold text-[var(--tinta)]"
        onClick={() => setAbierto((o) => !o)}
        aria-expanded={abierto}
        aria-label="Abrir menú"
      >
        <MenuIcon size={16} />
        Menú
      </button>

      {abierto && (
        <div className="absolute right-0 top-full z-50 mt-2 w-72 max-w-[calc(100vw-32px)] rounded-2xl border border-[var(--linea)] bg-[var(--marfil-card)] p-2 shadow-lg">
          {SECCIONES.map((s) => {
            const Icono = s.icono;
            const badge = s.valor === "stock" ? bajos : s.valor === "ventas" ? pendientes : 0;
            return (
              <button
                key={s.valor}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[var(--acento-fondo)] ${
                  vista === s.valor ? "bg-[var(--acento-fondo)]" : ""
                }`}
                onClick={() => ir(s.valor)}
              >
                <Icono size={18} className="mt-0.5 shrink-0 text-[var(--ambar)]" />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--tinta)]">{s.titulo}</span>
                    {badge > 0 && (
                      <span className={s.valor === "stock" ? "badge-bajo" : "badge-deuda"}>
                        {badge}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-[var(--tinta-suave)]">{s.descripcion}</span>
                </span>
              </button>
            );
          })}

          <div className="my-1.5 h-px bg-[var(--linea)]" />

          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--tinta)] transition-colors hover:bg-[var(--acento-fondo)]"
            onClick={() => {
              onAgregarProducto();
              setAbierto(false);
            }}
          >
            <Plus size={18} className="text-[var(--ambar)]" />
            Agregar producto
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--tinta)] transition-colors hover:bg-[var(--acento-fondo)]"
            onClick={() => {
              compartirListaPrecios(perfumes);
              setAbierto(false);
            }}
          >
            <Download size={18} className="text-[var(--ambar)]" />
            Lista de precios (PDF)
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--tinta)] transition-colors hover:bg-[var(--acento-fondo)]"
            onClick={onTema}
          >
            {tema === "oscuro" ? (
              <Sun size={18} className="text-[var(--ambar)]" />
            ) : (
              <Moon size={18} className="text-[var(--ambar)]" />
            )}
            {tema === "oscuro" ? "Modo claro" : "Modo oscuro"}
          </button>

          <button
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-[var(--tinta-suave)] transition-colors hover:bg-[var(--acento-fondo)]"
            onClick={() => {
              onSalir();
              setAbierto(false);
            }}
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
}
