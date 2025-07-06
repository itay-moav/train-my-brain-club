import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from "@tailwindcss/vite";
import { version,description } from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  //base: "/akelas",
  plugins: [react(),tailwindcss()],
  define: {
      '__APP_VERSION__': JSON.stringify(version),
      '__APP_NAME__':    JSON.stringify(description)
  },
  server: {
    port: 3001 // change here
  }
})
