import { NavLink } from 'react-router-dom'
import { ArrowLeftRight, Boxes, House, Package } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

const secciones = [
  { to: '/', label: 'Inicio', icono: House, end: true },
  { to: '/productos', label: 'Productos', icono: Package, end: false },
  { to: '/movimientos', label: 'Movimientos', icono: ArrowLeftRight, end: false },
]

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  [
    'rounded-lg px-3 py-1.5 text-[13px] transition-colors',
    isActive
      ? 'bg-acento-suave font-medium text-acento-texto'
      : 'text-tenue hover:text-tinta',
  ].join(' ')

export default function Navbar() {
  return (
    <>
      {/* Barra superior: en mobile queda solo logo + toggle */}
      <header className="borde-fino-b fixed inset-x-0 top-0 z-20 bg-superficie/90 backdrop-blur-sm">
        <nav className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-acento">
              <Boxes size={16} strokeWidth={1.75} className="text-white" />
            </span>
            <span className="text-[15px] font-medium tracking-tight">Aroma</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="hidden items-center gap-1 md:flex">
              {secciones.map((s) => (
                <NavLink key={s.to} to={s.to} end={s.end} className={claseEnlace}>
                  {s.label}
                </NavLink>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      {/* Bottom nav: solo mobile */}
      <nav className="borde-fino-t margen-seguro fixed inset-x-0 bottom-0 z-20 bg-superficie/95 backdrop-blur-sm md:hidden">
        <div className="mx-auto flex w-full max-w-md items-stretch">
          {secciones.map((s) => (
            <NavLink
              key={s.to}
              to={s.to}
              end={s.end}
              className={({ isActive }) =>
                [
                  'flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-colors',
                  isActive ? 'text-acento-texto' : 'text-tenue',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={[
                      'flex h-7 w-12 items-center justify-center rounded-full transition-colors',
                      isActive ? 'bg-acento-suave' : '',
                    ].join(' ')}
                  >
                    <s.icono size={17} strokeWidth={1.75} />
                  </span>
                  <span className={isActive ? 'font-medium' : ''}>{s.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}
