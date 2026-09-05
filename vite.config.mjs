import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

export default defineConfig(({ mode }) =>
  mode === "pages"
    ? {
        root: fileURLToPath(new URL("./weekly", import.meta.url)),
        publicDir: fileURLToPath(new URL("./public", import.meta.url)),
        base: "/eat/",
        build: {
          outDir: fileURLToPath(new URL("./dist-pages", import.meta.url)),
          emptyOutDir: true,
        },
      }
    : {},
);
