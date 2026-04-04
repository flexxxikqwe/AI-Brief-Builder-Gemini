import { defineStore } from 'pinia'
import { useRuntimeConfig } from '#app'

interface User {
  id: string
  username: string
  email: string
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    token: null as string | null,
    loading: false,
    error: null as string | null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(credentials: { username: string; password: string }) {
      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const response = await $fetch<{ token: string; user: User }>(`${config.public.apiBase}/auth/login`, {
          method: 'POST',
          body: credentials
        })

        this.token = response.token
        this.user = response.user
        
        if (import.meta.client) {
          localStorage.setItem('token', response.token)
          localStorage.setItem('user', JSON.stringify(response.user))
        }
        
        return true
      } catch (err: any) {
        this.error = err.data?.message || 'Login failed'
        return false
      } finally {
        this.loading = false
      }
    },

    logout() {
      this.token = null
      this.user = null
      if (import.meta.client) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
    },

    initAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
        }
      }
    }
  }
})
