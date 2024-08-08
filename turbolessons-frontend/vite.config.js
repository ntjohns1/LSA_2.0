import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import postcssImport from "postcss-import";
import postcssCalc from "postcss-calc";
import postcssCustomProperties from "postcss-custom-properties";
import react from "@vitejs/plugin-react";
import path from "path";
import getEnvModule from "./env";
import dns from "dns";

dns.setDefaultResultOrder("verbatim");

getEnvModule().setEnvironmentVarsFromTestEnv(__dirname);

process.env.CLIENT_ID = process.env.SPA_CLIENT_ID || process.env.CLIENT_ID;

const env = {};

// List of environment variables made available to the app
["ISSUER", "CLIENT_ID"].forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Environment variable ${key} must be set. See README.md`);
  }
  env[key] = process.env[key];
});

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      filename: "service-worker.js",
      workbox: {
        swDest: path.resolve(__dirname, "./dist/service-worker.js"),
        dontCacheBustURLsMatching: [new RegExp('\\.[0-9a-f]{16}\\.js$')],
      },
      registerType: "autoUpdate",
    }),
  ],
  define: {
    "process.env": {},
    global: "globalThis", // handle the global variable issue
  },
  resolve: {
    alias: {
      "react-router-dom": path.resolve(
        __dirname,
        "node_modules/react-router-dom"
      ),
    },
  },
  server: {
    port: process.env.PORT || 3000,
  },
  build: {
    rollupOptions: {
      // always throw with build warnings
      onwarn(warning, warn) {
        // Suppress "Module level directives cause errors when bundled" warnings
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        warn(warning);
      },
    },
    css: {
      postcss: {
        plugins: [
          postcssImport(),
          postcssCustomProperties({
            preserve: false,
          }),
          postcssCalc(),
        ],
      },
    },
  },
});
