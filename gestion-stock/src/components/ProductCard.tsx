import { useState } from 'react'
import { ImageOff, Pencil, ShoppingCart } from 'lucide-react'
import { UMBRAL_POCO_STOCK, formatoPesos, type Producto } from '../data/mock'

type Props = {
  producto: Producto
  onVender?: (producto: Producto) => void
  onEditar?: (producto: Producto) => void
}

export default function ProductCard({ producto, onVender, onEditar }: Props) {
  const [cargando, setCargando] = useState(true)
  const [falló, setFalló] = useState(false)
  const poco = producto.stock < UMBRAL_POCO_STOCK

  return (
    <article className="borde-fino group relative aspect-3/4 overflow-hidden rounded-xl bg-hueso">
      {/* Skeleton mientras baja la foto */}
      {cargando && !falló && <div className="skeleton absolute inset-0" />}

      {falló ? (
        <div className="absolute inset-0 flex items-center justify-center bg-hueso text-tenue">
          <ImageOff size={20} strokeWidth={1.5} />
        </div>
      ) : (
        <img
          src={producto.foto}
          alt={producto.nombre}
          loading="lazy"
          onLoad={() => setCargando(false)}
          onError={() => {
            setCargando(false)
            setFalló(true)
          }}
          className={[
            'absolute inset-0 h-full w-full object-cover transition-all duration-300',
            'group-hover:brightness-[0.72] group-focus-within:brightness-[0.72]',
            cargando ? 'opacity-0' : 'opacity-100',
          ].join(' ')}
        />
      )}

      {/* Pill de stock */}
      <span
        className={[
          'absolute top-2 right-2 z-10 rounded-full px-2 py-0.5 text-[11px] backdrop-blur-sm',
          poco ? 'bg-alerta text-white' : 'bg-white/85 text-[#0f6e56]',
        ].join(' ')}
      >
        {producto.stock} u
      </span>

      {/* Acciones al pasar el mouse (y al tabular con teclado) */}
      <div className="absolute inset-0 z-10 flex items-center justify-center gap-2.5 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100">
        <button
          type="button"
          onClick={() => onVender?.(producto)}
          aria-label={`Vender ${producto.nombre}`}
          title="Vender"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#0f6e56] transition-transform hover:scale-105"
        >
          <ShoppingCart size={16} strokeWidth={1.75} />
        </button>
        <button
          type="button"
          onClick={() => onEditar?.(producto)}
          aria-label={`Editar ${producto.nombre}`}
          title="Editar"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1c1c1a] transition-transform hover:scale-105"
        >
          <Pencil size={15} strokeWidth={1.75} />
        </button>
      </div>

      {/* Nombre y precio sobre el degradado */}
      <div className="velo-foto absolute inset-x-0 bottom-0 z-10 px-3 pt-8 pb-3">
        <h3 className="truncate text-[13px] font-medium text-white">{producto.nombre}</h3>
        <p className="mt-0.5 text-[13px] text-white/75 tabular-nums">
          {formatoPesos(producto.precio)}
        </p>
      </div>
    </article>
  )
}
