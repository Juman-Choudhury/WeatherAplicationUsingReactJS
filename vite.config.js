import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Bind to all addresses (0.0.0.0) so your LAN IP is reachable
    host: '0.0.0.0',
    // Optional: pick a port you like (default is 5173)
    port: 3000,
    // If you really want your specific IP hard-coded:
    // host: '192.168.1.42', 
    strictPort: true,        // fail if port is already in use
    open: false,             // don’t auto-open browser on start
  },
})
