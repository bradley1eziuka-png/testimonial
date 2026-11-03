import { defineConfig } from 'vite';
import { resolve } from 'node:path';

// The page lives at review/index.html so dev and build both serve it at /review/.
export default defineConfig({
  build: {
    rollupOptions: { input: { review: resolve(__dirname, 'review/index.html') } },
  },
  server: { open: '/review/' },
});
