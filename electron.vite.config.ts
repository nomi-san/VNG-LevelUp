import { resolve } from "path";
///@ts-expect-error - This have to use moduleResolution: "nodenext" to work. But it's breaks everything else
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@src": resolve("src"),
      },
    },
    server: {
      port: 3000,
    },
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        "@src": resolve("src"),
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/src"),
        "@src": resolve("src"),
      },
    },
    plugins: [
      TanStackRouterVite({
        routesDirectory: "src/renderer/src/routes",
        quoteStyle: "double",
        semiColons: true,
      }),
      react(),
    ],
    server: {
      port: 3000,
    },
  },
});
