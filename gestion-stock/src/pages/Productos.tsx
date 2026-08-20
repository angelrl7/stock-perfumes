import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import ProductCard from '../components/ProductCard'
import StockAlert from '../components/StockAlert'
import CategoryChips, { type Filtro } from '../components/CategoryChips'
import { UMBRAL_POCO_STOCK, productos, productosPocoStock } from '../data/mock'

export default function Productos() {
  const [filtro, setFiltro] = useState<Filtro>('Todos')

  const visibles = useMemo(() => {
    if (filtro === 'Todos') return productos
    if (filtro === 'Poco stock') return productos.filter((p) => p.stock < UMBRAL_POCO_STOCK)
    return productos.filter((p) => p.categoria === filtro)
  }, [filtro])

  return (
    <section>
      <StockAlert
        cantidad={productosPocoStock.length}
        onVer={() => setFiltro('Poco stock')}
      />

      <header className="mt-5 mb-4 flex items-center justify-between gap-3">
        <h1 className="text-[20px] font-medium tracking-tight">Productos</h1>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-lg bg-acento px-3 py-1.5 text-[13px] font-medium text-white transition-colors hover:bg-acento-vivo"
        >
          <Plus size={14} strokeWidth={2} />
          Nuevo
        </button>
      </header>

      <div className="mb-5">
        <CategoryChips activo={filtro} onCambiar={setFiltro} />
      </div>

      {visibles.length === 0 ? (
        <p className="py-12 text-center text-[13px] text-tenue">
          No hay productos en esta categoría
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-5">
          {visibles.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      )}
    </section>
  )
}
