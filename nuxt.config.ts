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
    // Nuxt автоматически читает NUXT_GEMINI_API_KEY из env в runtime
    // НЕ используем process.env здесь — это работает только во время билда
    geminiApiKey: '',
    public: {
      apiBase: '/api'
    }
  },
})
