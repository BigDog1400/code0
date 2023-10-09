import react from "@vitejs/plugin-react-swc"

export default (src) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": src,
    },
  },
})
