import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        quiz: resolve(__dirname, 'quiz.html'),
        accueil: resolve(__dirname, 'accueil.html')
      },
    },
  },
})