import { Moon, Sun } from 'lucide-react'
import { useTema } from '../hooks/useTema'

export default function ThemeToggle() {
  const { tema, alternar } = useTema()
  const oscuro = tema === 'oscuro'

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={oscuro ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      title={oscuro ? 'Tema claro' : 'Tema oscuro'}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-tenue transition-colors hover:bg-acento-suave hover:text-acento-texto"
    >
      {oscuro ? <Sun size={16} strokeWidth={1.75} /> : <Moon size={16} strokeWidth={1.75} />}
    </button>
  )
}
