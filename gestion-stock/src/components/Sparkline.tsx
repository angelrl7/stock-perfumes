type Props = {
  datos: number[]
  ancho?: number
  alto?: number
}

/* Mini gráfico de línea. Sin ejes ni grilla: solo la forma de la tendencia. */
export default function Sparkline({ datos, ancho = 64, alto = 24 }: Props) {
  if (datos.length < 2) return null

  const min = Math.min(...datos)
  const max = Math.max(...datos)
  const rango = max - min || 1
  const margen = 2

  const puntos = datos.map((v, i) => {
    const x = (i / (datos.length - 1)) * ancho
    const y = alto - margen - ((v - min) / rango) * (alto - margen * 2)
    return [x, y] as const
  })

  const linea = puntos.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [ultimoX, ultimoY] = puntos[puntos.length - 1]

  return (
    <svg
      width={ancho}
      height={alto}
      viewBox={`0 0 ${ancho} ${alto}`}
      fill="none"
      aria-hidden="true"
      className="shrink-0 overflow-visible text-acento"
    >
      <polyline
        points={linea}
        stroke="currentColor"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={ultimoX} cy={ultimoY} r={2} fill="currentColor" />
    </svg>
  )
}
