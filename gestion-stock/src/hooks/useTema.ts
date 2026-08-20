import { useCallback, useEffect, useState } from 'react'

export type Tema = 'claro' | 'oscuro'

const CLAVE = 'gestion-stock:tema'

function temaInicial(): Tema {
  const guardado = localStorage.getItem(CLAVE)
  if (guardado === 'claro' || guardado === 'oscuro') return guardado
  // Sin elección previa, arrancamos con lo que prefiera el sistema
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro'
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'oscuro')
    localStorage.setItem(CLAVE, tema)
  }, [tema])

  const alternar = useCallback(() => {
    setTema((t) => (t === 'claro' ? 'oscuro' : 'claro'))
  }, [])

  return { tema, alternar }
}
