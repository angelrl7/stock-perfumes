import MetricCard from '../components/MetricCard'
import MovementRow from '../components/MovementRow'
import Sparkline from '../components/Sparkline'
import {
  cajaUltimos7Dias,
  formatoPesos,
  movimientos,
  productosPocoStock,
} from '../data/mock'

export default function Inicio() {
  const ventasHoy = movimientos
    .filter((m) => m.tipo === 'venta')
    .reduce((total, m) => total + m.monto, 0)

  const caja = cajaUltimos7Dias[cajaUltimos7Dias.length - 1]

  return (
    <section>
      <header className="mb-5">
        <h1 className="text-[20px] font-medium tracking-tight">Inicio</h1>
        <p className="mt-0.5 text-[13px] text-tenue">Resumen de hoy</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          label="Plata en caja"
          valor={formatoPesos(caja)}
          comparativo="12% vs ayer"
          tendencia="sube"
          grafico={<Sparkline datos={cajaUltimos7Dias} />}
        />
        <MetricCard
          label="Ventas hoy"
          valor={formatoPesos(ventasHoy)}
          comparativo="4% vs ayer"
          tendencia="baja"
        />
        <MetricCard
          label="Poco stock"
          valor={String(productosPocoStock.length)}
          comparativo="productos bajo 5 u"
          tendencia="neutra"
        />
      </div>

      <h2 className="mt-8 mb-3 text-[13px] text-tenue">Últimos movimientos</h2>
      <div className="borde-fino divisor-fino rounded-xl bg-superficie">
        {movimientos.slice(0, 3).map((m) => (
          <MovementRow key={m.id} movimiento={m} />
        ))}
      </div>
    </section>
  )
}
