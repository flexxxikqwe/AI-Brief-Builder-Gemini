<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <LayoutList class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-xl font-bold text-gray-900 tracking-tight">TaskFlow</h1>
        </div>
        
        <div class="flex items-center gap-4">
          <ClientOnly>
            <template v-if="authStore.isAuthenticated">
              <span class="text-sm text-gray-500 hidden sm:inline">Welcome, {{ authStore.user?.username }}</span>
              <button 
                @click="handleLogout"
                class="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Logout
              </button>
            </template>
            <template v-else>
              <NuxtLink 
                to="/login"
                class="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
              >
                Login
              </NuxtLink>
            </template>
          </ClientOnly>
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-white border-t border-gray-200 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-sm text-gray-500">
          &copy; 2026 TaskFlow. Built for the Senior Frontend Developer Hiring Task.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { LayoutList } from 'lucide-vue-next'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from '#app'

const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>
