export type Categoria = 'Ropa' | 'Accesorios' | 'Hogar'

export type Producto = {
  id: string
  nombre: string
  precio: number
  stock: number
  categoria: Categoria
  foto: string
}

export type Movimiento = {
  id: string
  tipo: 'venta' | 'reposicion'
  producto: string
  hora: string
  medioPago: string
  monto: number
}

export const UMBRAL_POCO_STOCK = 5

const foto = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`

export const productos: Producto[] = [
  { id: 'p1',  nombre: 'Taza cerámica',      precio: 8400,  stock: 24, categoria: 'Hogar',       foto: foto('photo-1514228742587-6b1558fcca3d') },
  { id: 'p2',  nombre: 'Vela de soja',       precio: 6200,  stock: 3,  categoria: 'Hogar',       foto: foto('photo-1603006905003-be475563bc59') },
  { id: 'p3',  nombre: 'Difusor lavanda',    precio: 12500, stock: 11, categoria: 'Hogar',       foto: foto('photo-1600857544200-b2f666a9a2ec') },
  { id: 'p4',  nombre: 'Jabón artesanal',    precio: 3900,  stock: 42, categoria: 'Hogar',       foto: foto('photo-1600857062241-98e5dba7f214') },
  { id: 'p5',  nombre: 'Set mate',           precio: 18900, stock: 2,  categoria: 'Accesorios',  foto: foto('photo-1587049352846-4a222e784d38') },
  { id: 'p6',  nombre: 'Bolso de lino',      precio: 15400, stock: 7,  categoria: 'Accesorios',  foto: foto('photo-1591561954557-26941169b49e') },
  { id: 'p7',  nombre: 'Cuaderno tapa dura', precio: 5600,  stock: 18, categoria: 'Accesorios',  foto: foto('photo-1531346878377-a5be20888e57') },
  { id: 'p8',  nombre: 'Aceite esencial',    precio: 9800,  stock: 4,  categoria: 'Hogar',       foto: foto('photo-1608571423902-eed4a5ad8108') },
  { id: 'p9',  nombre: 'Remera algodón',     precio: 14200, stock: 1,  categoria: 'Ropa',        foto: foto('photo-1521572163474-6864f9cf17ab') },
  { id: 'p10', nombre: 'Buzo oversize',      precio: 32000, stock: 9,  categoria: 'Ropa',        foto: foto('photo-1556821840-3a63f95609a7') },
  { id: 'p11', nombre: 'Pañuelo seda',       precio: 11300, stock: 3,  categoria: 'Ropa',        foto: foto('photo-1520903920243-00d872a2d1c9') },
  { id: 'p12', nombre: 'Gorra lisa',         precio: 9600,  stock: 4,  categoria: 'Accesorios',  foto: foto('photo-1588850561407-ed78c282e89b') },
]

export const movimientos: Movimiento[] = [
  { id: 'm1', tipo: 'venta',      producto: 'Taza cerámica',            hora: '18:42', medioPago: 'Transferencia', monto: 8400 },
  { id: 'm2', tipo: 'venta',      producto: 'Set mate',                 hora: '17:15', medioPago: 'Efectivo',      monto: 18900 },
  { id: 'm3', tipo: 'reposicion', producto: 'Vela de soja · 12 u',      hora: '15:30', medioPago: 'Proveedor',     monto: -37200 },
  { id: 'm4', tipo: 'venta',      producto: 'Jabón artesanal · 3 u',    hora: '13:08', medioPago: 'Débito',        monto: 11700 },
  { id: 'm5', tipo: 'venta',      producto: 'Difusor lavanda',          hora: '11:50', medioPago: 'Transferencia', monto: 12500 },
  { id: 'm6', tipo: 'reposicion', producto: 'Cuaderno tapa dura · 10 u', hora: '10:20', medioPago: 'Proveedor',    monto: -28000 },
  { id: 'm7', tipo: 'venta',      producto: 'Bolso de lino',            hora: '09:35', medioPago: 'Efectivo',      monto: 15400 },
]

/* Caja de los últimos 7 días, para el sparkline de inicio */
export const cajaUltimos7Dias = [142000, 138500, 151200, 147800, 163400, 158900, 184300]

export const productosPocoStock = productos.filter((p) => p.stock < UMBRAL_POCO_STOCK)

export const formatoPesos = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(n)
