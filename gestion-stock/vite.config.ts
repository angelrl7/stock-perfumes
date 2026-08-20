import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Puerto propio: la app de perfumes usa el 5173 y si está ocupado
    // Vite se corre solo de puerto sin avisar mucho.
    // strictPort hace que falle en vez de mudarse en silencio.
    port: 5180,
    strictPort: true,
    open: true,
  },
})
