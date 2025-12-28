import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://mern-estate-six-api.vercel.app",
        secure: false,
        changeOrigin: true,
      },
    },
  },
  plugins: [react()],
});
