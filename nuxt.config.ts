// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
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
    geminiApiKey: '',
    public: {
      apiBase: '/api',
      geminiApiKey: '' // Will be overridden by NUXT_PUBLIC_GEMINI_API_KEY in runtime
    }
  },
  vite: {
    define: {
      'import.meta.env.VITE_GEMINI_API_KEY': 
        JSON.stringify(
          [
            process.env.API_KEY,
            process.env.VITE_GEMINI_API_KEY,
            process.env.GEMINI_API_KEY,
            process.env.NUXT_PUBLIC_GEMINI_API_KEY
          ].find(key => key && key !== 'GEMINI_API_KEY' && key !== 'TODO_KEYHERE' && key !== 'MY_GEMINI_API_KEY') || ''
        )
    }
  }
})
