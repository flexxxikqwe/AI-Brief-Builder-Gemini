import { ref, onMounted, watch } from 'vue'

export type Locale = 'en' | 'ru'

const translations = {
  en: {
    // Header
    'header-title': 'AI Brief Builder',
    'header-github': 'GitHub',
    'header-footer-text': '© 2026 AI Brief Builder — turn ideas into shippable specs.',
    
    // Form
    'form-title': 'AI Brief Builder',
    'form-subtitle': 'Turn a raw idea into a full product spec in seconds',
    'form-idea-label': 'Your idea',
    'form-idea-placeholder': 'Describe what you want to build — the messier the better',
    'form-mode-label': 'Mode',
    'form-persona-label': 'Persona',
    'form-compress-mvp': 'Compress to MVP scope',
    'form-generate-btn': 'Generate Brief',
    'form-generating-btn': 'Generating...',
    
    // Modes
    'mode-internal': 'Internal',
    'mode-stakeholder': 'Stakeholder',
    'mode-mvp': 'MVP',
    
    // Personas
    'persona-ceo': 'CEO',
    'persona-cto': 'CTO',
    'persona-pm': 'PM',
    
    // History
    'history-recent': 'Recent',
    
    // Result Empty State
    'result-empty-title': 'Your brief will appear here',
    'result-empty-desc': 'The AI will generate goals, MVP scope, risks, tech approach and user flow',
    
    // Result Loading State
    'result-loading-text': 'Generating your brief...',
    'result-loading-connecting': 'Connecting to AI...',
    
    // Result Content
    'result-confidence': 'Confidence',
    'result-problem': 'Problem',
    'result-goal': 'Goal',
    'result-target-user': 'Target User',
    'result-proposed-solution': 'Proposed Solution',
    'result-mvp-scope': 'MVP Scope',
    'result-out-of-scope': 'Out of Scope',
    'result-risks': 'Risks',
    'result-assumptions': 'Assumptions',
    'result-tech-approach': 'Technical Approach',
    'result-user-flow': 'User Flow',
    'result-clarifying-questions': 'Clarifying Questions',
    'result-stakeholder-reply': 'Stakeholder Reply',
    
    // Footer Actions
    'action-export': 'Export .md',
    'action-regenerate': 'Regenerate',
    'action-new-brief': 'New Brief',
    
    // Response Language
    'response-lang-label': 'Response:',
    
    // Errors
    'error-failed-parse': 'Failed to parse AI response',
    'error-connection-lost': 'Connection lost',
    'error-generation-failed': 'Generation failed'
  },
  ru: {
    // Header
    'header-title': 'AI Brief Builder',
    'header-github': 'GitHub',
    'header-footer-text': '© 2026 AI Brief Builder — превращайте идеи в спецификации.',
    
    // Form
    'form-title': 'AI Brief Builder',
    'form-subtitle': 'Превратите идею в полноценную спецификацию за секунды',
    'form-idea-label': 'Ваша идея',
    'form-idea-placeholder': 'Опишите, что вы хотите создать — чем подробнее, тем лучше',
    'form-mode-label': 'Режим',
    'form-persona-label': 'Роль',
    'form-compress-mvp': 'Сжать до MVP',
    'form-generate-btn': 'Создать бриф',
    'form-generating-btn': 'Генерация...',
    
    // Modes
    'mode-internal': 'Внутренний',
    'mode-stakeholder': 'Стейкхолдер',
    'mode-mvp': 'MVP',
    
    // Personas
    'persona-ceo': 'CEO',
    'persona-cto': 'CTO',
    'persona-pm': 'PM',
    
    // History
    'history-recent': 'Недавние',
    
    // Result Empty State
    'result-empty-title': 'Ваш бриф появится здесь',
    'result-empty-desc': 'ИИ сгенерирует цели, MVP, риски, тех. подход и пользовательский путь',
    
    // Result Loading State
    'result-loading-text': 'Создаем ваш бриф...',
    'result-loading-connecting': 'Подключение к ИИ...',
    
    // Result Content
    'result-confidence': 'Уверенность',
    'result-problem': 'Проблема',
    'result-goal': 'Цель',
    'result-target-user': 'Целевой пользователь',
    'result-proposed-solution': 'Предлагаемое решение',
    'result-mvp-scope': 'Границы MVP',
    'result-out-of-scope': 'Вне рамок',
    'result-risks': 'Риски',
    'result-assumptions': 'Предположения',
    'result-tech-approach': 'Технический подход',
    'result-user-flow': 'Путь пользователя',
    'result-clarifying-questions': 'Уточняющие вопросы',
    'result-stakeholder-reply': 'Ответ стейкхолдера',
    
    // Footer Actions
    'action-export': 'Экспорт .md',
    'action-regenerate': 'Пересоздать',
    'action-new-brief': 'Новый бриф',
    
    // Response Language
    'response-lang-label': 'Ответ:',
    
    // Errors
    'error-failed-parse': 'Не удалось разобрать ответ ИИ',
    'error-connection-lost': 'Соединение потеряно',
    'error-generation-failed': 'Ошибка генерации'
  }
}

export const useLocale = () => {
  const locale = ref<Locale>('en')

  const t = (key: string) => {
    const current = translations[locale.value]
    return (current as any)[key] || key
  }

  const toggleLocale = () => {
    locale.value = locale.value === 'en' ? 'ru' : 'en'
    try {
      localStorage.setItem('locale', locale.value)
    } catch (e) {}
  }

  onMounted(() => {
    try {
      const saved = localStorage.getItem('locale') as Locale | null
      if (saved && (saved === 'en' || saved === 'ru')) {
        locale.value = saved
      } else {
        const navLang = navigator.language.toLowerCase()
        if (navLang.startsWith('ru')) {
          locale.value = 'ru'
        }
      }
    } catch (e) {}
  })

  return {
    locale,
    t,
    toggleLocale
  }
}
