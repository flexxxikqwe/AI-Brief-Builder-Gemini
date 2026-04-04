import { ref, type Ref } from 'vue'
import type { BriefData, GenerateParams } from '~/types/brief'
import { useAuthStore } from '~/stores/auth'
import { useRuntimeConfig } from '#app'

export const useBrief = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<BriefData | null>(null)
  const history = ref<BriefData[]>([])

  const clearError = () => {
    error.value = null
  }

  const restoreFromHistory = (index: number) => {
    if (history.value[index]) {
      result.value = history.value[index]
    }
  }

  const generate = async (params: GenerateParams) => {
    const authStore = useAuthStore()
    const config = useRuntimeConfig()

    if (!authStore.token) {
      error.value = 'You must be logged in to generate a brief'
      return
    }

    loading.value = true
    error.value = null

    try {
      const response = await $fetch<BriefData>(`${config.public.apiBase}/generate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authStore.token}`
        },
        body: params
      })

      result.value = response
      
      // Add to history (max 5 items, in-memory)
      const historyItem = { ...response, mode: params.mode, persona: params.persona }
      history.value.unshift(historyItem)
      if (history.value.length > 5) {
        history.value.pop()
      }
    } catch (err: any) {
      error.value = err.data?.message || err.message || 'Failed to generate brief'
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    result,
    history,
    generate,
    clearError,
    restoreFromHistory
  }
}
