import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                catalog: resolve(__dirname, 'catalog.html'),
                product: resolve(__dirname, 'product.html'),
                cart: resolve(__dirname, 'cart.html')
            }
        }
    }
});
