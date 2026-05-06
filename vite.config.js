import { defineConfig } from 'vite' // <--- IL MANQUE CETTE LIGNE

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html', // Ton accueil (l'ancien accueil.html renommé)
        quiz: 'quiz.html'   // Ta scène 3D
      }
    }
  }
})