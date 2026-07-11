# Stock Perfumes

Web app de control de stock de perfumes para dos usuarios, con precio de compra
y precio sugerido calculado por margen. React + Vite + TypeScript + Supabase.

## Funcionalidades

- Lista de perfumes con stock, precio de compra y precio sugerido
- Precio sugerido automático: `compra × (1 + margen%)`, redondeado a $100.
  Se puede pisar con un precio manual por producto.
- Movimientos de stock (venta / entrada / ajuste) con historial de quién y cuándo
- Alerta de stock bajo (configurable por producto)
- Búsqueda por nombre o marca
- Login con email y contraseña (Supabase Auth)
- Mobile-first, instalable como PWA básica

## Puesta en marcha (una sola vez)

### 1. Crear el proyecto en Supabase

1. Entrá a [supabase.com](https://supabase.com) y creá un proyecto gratuito.
2. En **SQL Editor → New query**, pegá el contenido de `supabase/schema.sql` y ejecutalo.
3. En **Authentication → Users → Add user**, creá los dos usuarios
   (email + contraseña, marcá "Auto Confirm User").
4. En **Authentication → Sign In / Providers**, deshabilitá "Allow new users to sign up"
   para que nadie más pueda registrarse.

### 2. Configurar el proyecto local

```bash
npm install
cp .env.example .env
```

Completá `.env` con la URL y la anon key de tu proyecto
(Supabase → **Settings → API**).

```bash
npm run dev
```

### 3. Deploy en Vercel

1. Subí el repo a GitHub.
2. En Vercel: **New Project → importar el repo** (detecta Vite solo).
3. En **Environment Variables** cargá `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
4. Deploy. Listo: los dos usuarios entran desde el celular con su email y contraseña.

## Notas

- La anon key es pública por diseño; la seguridad real la dan las políticas RLS
  del schema (solo usuarios autenticados pueden leer/escribir).
- El historial guarda los últimos 100 movimientos en pantalla; en la base quedan todos.
- Para agregarla a la pantalla de inicio del celular: abrir en el navegador →
  menú → "Agregar a pantalla de inicio".
