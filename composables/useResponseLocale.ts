import { ref, onMounted, watch } from 'vue'

export const useResponseLocale = () => {
  const responseLocale = ref<'en' | 'ru'>('en')

  const toggleResponseLocale = () => {
    responseLocale.value = responseLocale.value === 'en' ? 'ru' : 'en'
    try {
      localStorage.setItem('responseLocale', responseLocale.value)
    } catch (e) {}
  }

  onMounted(() => {
    try {
      const saved = localStorage.getItem('responseLocale') as 'en' | 'ru' | null
      if (saved && (saved === 'en' || saved === 'ru')) {
        responseLocale.value = saved
      }
    } catch (e) {}
  })

  return {
    responseLocale,
    toggleResponseLocale
  }
}
