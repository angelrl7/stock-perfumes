import { ChevronRight } from "lucide-react";

interface Props {
  cantidad: number;
  onVer?: () => void;
}

/** Tira finita, apenas teñida: avisa sin robarle protagonismo a las fotos. */
export default function TiraStockBajo({ cantidad, onVer }: Props) {
  if (cantidad === 0) return null;

  return (
    <button
      type="button"
      onClick={onVer}
      className="borde-fino flex w-full items-center justify-between gap-3 rounded-lg bg-alerta-suave px-3 py-2 text-left transition-opacity hover:opacity-80"
    >
      <span className="text-[13px] text-alerta-texto">
        {cantidad} {cantidad === 1 ? "producto" : "productos"} por reponer
      </span>
      <ChevronRight size={15} strokeWidth={1.75} className="shrink-0 text-alerta-texto" />
    </button>
  );
}
