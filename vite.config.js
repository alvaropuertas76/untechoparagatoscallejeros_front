import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Determinar la base URL para GitHub Pages
// Nombre del repositorio para GitHub Pages (asumimos que será 'untechoparagatoscallejeros_front')
const repositoryName = 'untechoparagatoscallejeros_front'
const base = process.env.NODE_ENV === 'production' ? `/${repositoryName}/` : '/'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: base,
})
