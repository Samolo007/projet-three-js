import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        quiz: path.resolve(__dirname, 'quiz.html'),
        accueil: path.resolve(__dirname, 'accueil.html'),
      },
    },
  },
})