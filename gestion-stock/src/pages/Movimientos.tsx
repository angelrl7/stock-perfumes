import MovementRow from '../components/MovementRow'
import { formatoPesos, movimientos } from '../data/mock'

export default function Movimientos() {
  const ventas = movimientos.filter((m) => m.tipo === 'venta')
  const reposiciones = movimientos.filter((m) => m.tipo === 'reposicion')

  const entro = ventas.reduce((total, m) => total + m.monto, 0)
  const salio = reposiciones.reduce((total, m) => total + Math.abs(m.monto), 0)

  return (
    <section>
      <header className="mb-5">
        <h1 className="text-[20px] font-medium tracking-tight">Movimientos</h1>
        <p className="mt-0.5 text-[13px] text-tenue">Hoy</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="borde-fino rounded-xl bg-superficie p-4">
          <p className="text-[13px] text-tenue">Entró</p>
          <p className="mt-1.5 text-[24px] leading-none font-medium tracking-tight tabular-nums text-acento-texto">
            {formatoPesos(entro)}
          </p>
          <p className="mt-2.5 text-[12px] text-tenue">
            {ventas.length} {ventas.length === 1 ? 'venta' : 'ventas'}
          </p>
        </div>

        <div className="borde-fino rounded-xl bg-superficie p-4">
          <p className="text-[13px] text-tenue">Salió / reposición</p>
          <p className="mt-1.5 text-[24px] leading-none font-medium tracking-tight tabular-nums text-alerta-texto">
            {formatoPesos(salio)}
          </p>
          <p className="mt-2.5 text-[12px] text-tenue">
            {reposiciones.length} {reposiciones.length === 1 ? 'reposición' : 'reposiciones'}
          </p>
        </div>
      </div>

      <h2 className="mt-8 mb-3 text-[13px] text-tenue">Detalle del día</h2>
      <div className="borde-fino divisor-fino rounded-xl bg-superficie">
        {movimientos.map((m) => (
          <MovementRow key={m.id} movimiento={m} />
        ))}
      </div>
    </section>
  )
}
