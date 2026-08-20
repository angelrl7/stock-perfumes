import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { formatoPesos, type Movimiento } from '../data/mock'

export default function MovementRow({ movimiento }: { movimiento: Movimiento }) {
  const esVenta = movimiento.tipo === 'venta'
  const Icono = esVenta ? ArrowDownLeft : ArrowUpRight

  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span
        className={[
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          esVenta
            ? 'bg-acento-suave text-acento-texto'
            : 'bg-alerta-suave text-alerta-texto',
        ].join(' ')}
      >
        <Icono size={15} strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px]">
          <span className="font-medium">{esVenta ? 'Venta' : 'Reposición'}</span>
          <span className="text-tenue"> · {movimiento.producto}</span>
        </p>
        <p className="mt-0.5 text-[12px] text-tenue">
          {movimiento.hora} · {movimiento.medioPago}
        </p>
      </div>

      <p
        className={[
          'shrink-0 text-[13px] font-medium tabular-nums',
          esVenta ? 'text-acento-texto' : 'text-tinta',
        ].join(' ')}
      >
        {esVenta ? '+' : '−'}
        {formatoPesos(Math.abs(movimiento.monto))}
      </p>
    </div>
  )
}
