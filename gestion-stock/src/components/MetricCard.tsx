import type { ReactNode } from 'react'

type Props = {
  label: string
  valor: string
  comparativo?: string
  tendencia?: 'sube' | 'baja' | 'neutra'
  grafico?: ReactNode
}

const flechas = { sube: '▲', baja: '▼', neutra: '' } as const

const colores = {
  sube: 'text-acento-texto',
  baja: 'text-alerta-texto',
  neutra: 'text-tenue',
} as const

export default function MetricCard({
  label,
  valor,
  comparativo,
  tendencia = 'neutra',
  grafico,
}: Props) {
  return (
    <div className="borde-fino rounded-xl bg-superficie p-4">
      <p className="text-[13px] text-tenue">{label}</p>

      <div className="mt-1.5 flex items-end justify-between gap-3">
        <p className="text-[24px] leading-none font-medium tracking-tight tabular-nums">
          {valor}
        </p>
        {grafico}
      </div>

      {comparativo && (
        <p className={`mt-2.5 text-[12px] ${colores[tendencia]}`}>
          {flechas[tendencia] && <span className="mr-1">{flechas[tendencia]}</span>}
          {comparativo}
        </p>
      )}
    </div>
  )
}
