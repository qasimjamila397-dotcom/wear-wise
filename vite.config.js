import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// "base" must match your GitHub repository name (wear-wise), because GitHub Pages
// serves the site at https://YOUR-NAME.github.io/wear-wise/
export default defineConfig({
  base: "/wear-wise/",
  plugins: [react()],
});
