import { ref, onMounted, watch } from 'vue'

export type Theme = 'light' | 'dark'

export const useTheme = () => {
  const theme = ref<Theme>('light')

  const applyTheme = (t: Theme) => {
    if (process.server) return
    const html = document.documentElement
    if (t === 'dark') {
      html.classList.add('dark')
    } else {
      html.classList.remove('dark')
    }
  }

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    try {
      localStorage.setItem('theme', theme.value)
    } catch (e) {}
  }

  onMounted(() => {
    try {
      const saved = localStorage.getItem('theme') as Theme | null
      if (saved && (saved === 'light' || saved === 'dark')) {
        theme.value = saved
      } else {
        theme.value = 'light'
      }
    } catch (e) {
      theme.value = 'light'
    }
    applyTheme(theme.value)
  })

  watch(theme, (newTheme) => {
    applyTheme(newTheme)
  })

  return {
    theme,
    toggleTheme
  }
}
