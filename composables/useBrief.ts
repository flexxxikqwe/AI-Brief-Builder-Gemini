import { ref } from 'vue'
import type { BriefData, GenerateParams } from '~/types/brief'

export const useBrief = () => {
  const loading = ref(false)
  const error = ref<string | null>(null)
  const result = ref<BriefData | null>(null)
  const history = ref<BriefData[]>([])
  const streamingText = ref('')  // накопленный сырой текст во время стрима

  const clearError = () => { error.value = null }

  const restoreFromHistory = (index: number) => {
    if (history.value[index]) result.value = history.value[index]
  }

  const generate = async (params: GenerateParams) => {
    loading.value = true
    error.value = null
    result.value = null
    streamingText.value = ''

    const queryParams = new URLSearchParams({
      rawInput: params.rawInput,
      mode: params.mode,
      persona: params.persona,
      compressToMvp: String(params.compressToMvp),
    })

    return new Promise<void>((resolve) => {
      const eventSource = new EventSource(`/api/generate/stream?${queryParams}`)
      let accumulated = ''

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)

          if (data.type === 'chunk') {
            accumulated += data.text
            streamingText.value = accumulated
          }

          if (data.type === 'done') {
            eventSource.close()
            try {
              // Вырезаем JSON из текста — модель иногда оборачивает в ```json
              const jsonMatch = accumulated.match(/\{[\s\S]*\}/)
              if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]) as BriefData
                result.value = parsed
                // Добавляем в историю
                const historyItem = { ...parsed, mode: params.mode, persona: params.persona }
                history.value.unshift(historyItem)
                if (history.value.length > 5) history.value.pop()
              } else {
                error.value = 'Failed to parse AI response'
              }
            } catch {
              error.value = 'Failed to parse AI response'
            }
            loading.value = false
            resolve()
          }

          if (data.type === 'error') {
            eventSource.close()
            error.value = data.message
            loading.value = false
            resolve()
          }
        } catch {
          // ignore malformed SSE frames
        }
      }

      eventSource.onerror = () => {
        eventSource.close()
        if (loading.value) {
          error.value = 'Connection lost. Please try again.'
          loading.value = false
        }
        resolve()
      }

      // Таймаут 40 секунд
      setTimeout(() => {
        if (loading.value) {
          eventSource.close()
          error.value = 'Request timed out. Please try again.'
          loading.value = false
          resolve()
        }
      }, 40000)
    })
  }

  return { loading, error, result, history, streamingText, generate, clearError, restoreFromHistory }
}
