// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  typescript: {
    strict: true
  },
  app: {
    head: {
      title: 'AI Brief Builder'
    }
  },
  runtimeConfig: {
    geminiApiKey: process.env.NUXT_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '',
    public: {
      apiBase: process.env.API_BASE || '/api'
    }
  },
  vite: {
    optimizeDeps: {
      include: ['lucide-vue-next', 'mermaid']
    }
  }
})
