import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Triumph White Sands',
        short_name: 'Triumph White Sands',
        description: 'Triumph White Sands - إدارة استلام الملابس',
        theme_color: '#0f4c5c',
        background_color: '#f4f8f9',
        display: 'standalone',
        dir: 'rtl',
        lang: 'ar',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' }]
      }
    })
  ]
});
