import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ command }) => {
  // Use '/' for local dev/preview, '/workspace/' for production (build for GitHub Pages)
  const base = process.env.VITE_BASE_PATH || (command === 'serve' ? '/' : '/workspace/');
  const iconSrc = base === '/' ? '/vite.svg' : `${base}vite.svg`;
  
  return {
    base,
    server: {
      host: true, // Enable external access for GitHub Codespaces
      port: 5173,
    },
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: {
          short_name: 'BillSplit',
          name: 'Bill Splitter App',
          icons: [
            {
              src: iconSrc,
              sizes: '192x192',
              type: 'image/svg+xml',
            },
            {
              src: iconSrc,
              sizes: '512x512',
              type: 'image/svg+xml',
            },
          ],
          start_url: '.',
          display: 'standalone',
          background_color: '#ffffff',
          theme_color: '#BB3E00',
          description: 'Split bills easily with friends. Modern, internationalized, and mobile-friendly.',
          lang: 'en',
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
  }
})
