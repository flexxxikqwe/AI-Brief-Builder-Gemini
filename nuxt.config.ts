// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  tailwindcss: {
    config: {
      darkMode: 'class'
    }
  },
  typescript: {
    strict: true
  },
  app: {
    head: {
      title: 'AI Brief Builder'
    }
  },
  runtimeConfig: {
    geminiApiKey: '', // NUXT_GEMINI_API_KEY
    public: {
      apiBase: '/api',
      geminiApiKey: '' // NUXT_PUBLIC_GEMINI_API_KEY
    }
  },
  vite: {
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': 
        JSON.stringify(
          [
            process.env.NEXT_PUBLIC_GEMINI_API_KEY,
            process.env.NUXT_PUBLIC_GEMINI_API_KEY,
            process.env.GEMINI_API_KEY,
            process.env.API_KEY
          ].find(key => key && key !== 'GEMINI_API_KEY' && key !== 'TODO_KEYHERE') || ''
        )
    }
  }
})
