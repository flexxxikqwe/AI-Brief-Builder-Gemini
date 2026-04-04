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
    geminiApiKey: '',
    public: {
      apiBase: '/api',
      geminiApiKey: process.env.NUXT_PUBLIC_GEMINI_API_KEY || 
                    process.env.GEMINI_API_KEY || 
                    ''
    }
  },
  vite: {
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': 
        JSON.stringify(process.env.VITE_GEMINI_API_KEY || 
                       process.env.GEMINI_API_KEY || '')
    }
  }
})
