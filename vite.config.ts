import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      ignored: ['**/whatsapp-server/**', '**/.wwebjs_auth/**'],
    },
  },
});
