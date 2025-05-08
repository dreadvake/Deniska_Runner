
import { defineConfig } from 'vite';
import legacy from '@vitejs/plugin-legacy';

export default defineConfig({
    plugins: [
        legacy({
            targets: ['defaults', 'not IE 11']
        })
    ],
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
    },
    publicDir: 'src/assets',
    server: {
        port: 8080,
        open: true,
        watch: {
            usePolling: true
        }
    }
});