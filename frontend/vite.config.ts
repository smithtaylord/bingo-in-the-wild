/// <reference types="vitest" />

import vue from "@vitejs/plugin-vue";
import path from "path";
import {defineConfig} from "vite";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    plugins: [vue()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    test: {
        globals: true,
        environment: "jsdom",
    },
    build: {
        outDir: "dist",
    },
    server: {
        historyApiFallback: true,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
        },
    }
});
