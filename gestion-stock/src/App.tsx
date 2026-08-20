import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Inicio from './pages/Inicio'
import Productos from './pages/Productos'
import Movimientos from './pages/Movimientos'

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* pt: navbar fija · pb extra en mobile por la bottom nav */}
      <main className="mx-auto w-full max-w-5xl px-5 pt-20 pb-28 md:pb-16">
        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/productos" element={<Productos />} />
          <Route path="/movimientos" element={<Movimientos />} />
        </Routes>
      </main>
    </div>
  )
}
