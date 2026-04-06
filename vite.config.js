import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/30days/',  // ← GitHub repo adınla aynı olmalı
})
