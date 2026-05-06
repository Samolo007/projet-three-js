import { defineConfig } from 'vite' 

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: 'index.html', 
        quiz: 'quiz.html' ,
       halfway: 'halfway.html' 
      }
    }
  }
})