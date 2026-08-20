export type Filtro = 'Todos' | 'Ropa' | 'Accesorios' | 'Hogar' | 'Poco stock'

export const FILTROS: Filtro[] = ['Todos', 'Ropa', 'Accesorios', 'Hogar', 'Poco stock']

type Props = {
  activo: Filtro
  onCambiar: (filtro: Filtro) => void
}

export default function CategoryChips({ activo, onCambiar }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Filtrar productos"
      className="borde-fino flex gap-1 overflow-x-auto rounded-full bg-superficie p-1"
    >
      {FILTROS.map((f) => {
        const esActivo = f === activo
        return (
          <button
            key={f}
            role="tab"
            aria-selected={esActivo}
            type="button"
            onClick={() => onCambiar(f)}
            className={[
              'shrink-0 rounded-full px-3 py-1.5 text-[13px] transition-colors',
              esActivo
                ? 'bg-acento font-medium text-white'
                : 'text-tenue hover:text-tinta',
            ].join(' ')}
          >
            {f}
          </button>
        )
      })}
    </div>
  )
}
