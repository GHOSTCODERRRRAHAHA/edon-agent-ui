import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devCsp =
  "default-src 'self' http: https: data: blob:; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' http: https:; " +
  "style-src 'self' 'unsafe-inline' http: https:; " +
  "img-src 'self' data: blob: http: https:; " +
  "connect-src 'self' http: https: ws: wss:; " +
  "font-src 'self' data: http: https:;"

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {},
    headers: mode === 'development' ? { 'Content-Security-Policy': devCsp } : {},
  },
  preview: {
    headers: mode === 'development' ? { 'Content-Security-Policy': devCsp } : {},
  },
}))
