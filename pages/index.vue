<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- LEFT COLUMN: Form -->
      <div class="space-y-8">
        <div class="space-y-2">
          <h1 class="text-3xl font-bold text-gray-900 dark:text-zinc-50 tracking-tight">{{ t('form-title') }}</h1>
          <p class="text-gray-500 dark:text-zinc-400">{{ t('form-subtitle') }}</p>
        </div>

        <form @submit.prevent="handleGenerate" class="space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-zinc-800">
          <div class="space-y-2">
            <label for="rawInput" class="block text-sm font-medium text-gray-700 dark:text-zinc-300">{{ t('form-idea-label') }}</label>
            <textarea
              id="rawInput"
              v-model="form.rawInput"
              :placeholder="t('form-idea-placeholder')"
              class="w-full min-h-[160px] p-4 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all resize-none overflow-hidden"
              @input="autoResize"
              @keydown.enter.meta="handleGenerate"
              @keydown.enter.ctrl="handleGenerate"
              required
            ></textarea>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <label for="mode" class="block text-sm font-medium text-gray-700 dark:text-zinc-300">{{ t('form-mode-label') }}</label>
              <select
                id="mode"
                v-model="form.mode"
                class="w-full p-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              >
                <option value="internal">{{ t('mode-internal') }}</option>
                <option value="stakeholder">{{ t('mode-stakeholder') }}</option>
                <option value="mvp">{{ t('mode-mvp') }}</option>
              </select>
            </div>

            <div class="space-y-2">
              <label for="persona" class="block text-sm font-medium text-gray-700 dark:text-zinc-300">{{ t('form-persona-label') }}</label>
              <select
                id="persona"
                v-model="form.persona"
                class="w-full p-2.5 border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
              >
                <option value="CEO">{{ t('persona-ceo') }}</option>
                <option value="CTO">{{ t('persona-cto') }}</option>
                <option value="PM">{{ t('persona-pm') }}</option>
              </select>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              id="compressToMvp"
              v-model="form.compressToMvp"
              type="checkbox"
              class="w-4 h-4 text-violet-600 border-gray-300 dark:border-zinc-600 rounded focus:ring-violet-500 bg-white dark:bg-zinc-800"
            />
            <label for="compressToMvp" class="text-sm text-gray-700 dark:text-zinc-300">{{ t('form-compress-mvp') }}</label>
          </div>

          <div class="space-y-4">
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex items-center justify-center gap-2 py-3 px-4 bg-violet-600 hover:bg-violet-700 text-white font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              <template v-if="loading">
                <Loader2 class="w-5 h-5 animate-spin" />
                <span>{{ t('form-generating-btn') }}</span>
              </template>
              <template v-else>
                <Sparkles class="w-5 h-5" />
                <span>{{ t('form-generate-btn') }}</span>
              </template>
            </button>

            <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg flex items-start justify-between">
              <div class="flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle class="w-5 h-5 flex-shrink-0" />
                <span class="text-sm">{{ error }}</span>
              </div>
              <button @click="clearError" class="text-red-400 dark:text-red-500 hover:text-red-500 dark:hover:text-red-400">
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>

        <!-- History -->
        <div v-if="history.length > 0" class="space-y-4">
          <h3 class="text-sm font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider">{{ t('history-recent') }}</h3>
          <div class="flex overflow-x-auto gap-4 pb-4 scrollbar-hide">
            <button
              v-for="(item, index) in history"
              :key="index"
              @click="restoreFromHistory(index)"
              class="flex-shrink-0 w-64 p-4 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md hover:border-violet-200 dark:hover:border-violet-800 transition-all text-left space-y-2"
            >
              <p class="text-sm font-bold text-gray-900 dark:text-zinc-100 line-clamp-2">{{ item.summary }}</p>
              <div class="flex items-center gap-2">
                <span class="text-[10px] px-1.5 py-0.5 bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 rounded uppercase font-bold">{{ t(`mode-${item.mode}` as any) }}</span>
                <span class="text-[10px] px-1.5 py-0.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded uppercase font-bold">{{ t(`persona-${item.persona?.toLowerCase()}` as any) }}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- RIGHT COLUMN: Result -->
      <div class="min-h-[600px]">
        <!-- Empty State -->
        <div v-if="!result && !loading" class="h-full flex flex-col items-center justify-center text-center space-y-4 bg-gray-50/50 dark:bg-zinc-900/50 rounded-3xl border-2 border-dashed border-gray-200 dark:border-zinc-800 p-12">
          <div class="w-16 h-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-sm flex items-center justify-center">
            <Sparkles class="w-8 h-8 text-gray-300 dark:text-zinc-600" />
          </div>
          <div class="space-y-2">
            <h3 class="text-xl font-bold text-gray-900 dark:text-zinc-100">{{ t('result-empty-title') }}</h3>
            <p class="text-gray-500 dark:text-zinc-400 max-w-xs mx-auto">{{ t('result-empty-desc') }}</p>
          </div>
        </div>

        <!-- Loading State -->
        <div v-else-if="loading" class="h-full bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 p-8 shadow-sm space-y-6">
          <div class="flex items-center gap-3">
            <div class="flex gap-1">
              <span class="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:0ms]"></span>
              <span class="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
              <span class="w-2 h-2 bg-violet-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
            </div>
            <span class="text-sm text-gray-500 dark:text-zinc-400 font-medium">{{ t('result-loading-text') }}</span>
          </div>
          <div 
            ref="streamRef"
            class="text-xs font-mono text-gray-400 dark:text-zinc-500 bg-gray-50 dark:bg-zinc-800/50 rounded-xl p-4 max-h-[400px] overflow-y-auto leading-relaxed whitespace-pre-wrap break-all"
          >{{ streamingText || t('result-loading-connecting') }}</div>
        </div>

        <!-- Result State -->
        <div v-else-if="result" class="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-100 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div class="p-8 space-y-8">
            <!-- Header -->
            <div class="flex items-start justify-between gap-4">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-zinc-50 leading-tight">{{ result.summary }}</h2>
              <div 
                class="flex-shrink-0 px-3 py-1 rounded-full text-sm font-bold"
                :class="result.confidenceScore >= 7 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'"
              >
                {{ result.confidenceScore }}/10
              </div>
            </div>

            <hr class="border-gray-100 dark:border-zinc-800" />

            <!-- Core Info -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="space-y-1">
                <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-problem') }}</p>
                <p class="text-sm text-gray-700 dark:text-zinc-300">{{ result.businessProblem }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-goal') }}</p>
                <p class="text-sm text-gray-700 dark:text-zinc-300">{{ result.goal }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-target-user') }}</p>
                <p class="text-sm text-gray-700 dark:text-zinc-300">{{ result.targetUser }}</p>
              </div>
            </div>

            <!-- Solution -->
            <div class="space-y-2">
              <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-proposed-solution') }}</p>
              <p class="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{{ result.proposedSolution }}</p>
            </div>

            <!-- Scope -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-3">
                <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-mvp-scope') }}</p>
                <ul class="space-y-2">
                  <li v-for="item in result.mvpScope" :key="item" class="flex items-start gap-2 text-sm text-gray-700 dark:text-zinc-300">
                    <CheckCircle2 class="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
              <div class="space-y-3">
                <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-out-of-scope') }}</p>
                <ul class="space-y-2">
                  <li v-for="item in result.outOfScope" :key="item" class="flex items-start gap-2 text-sm text-gray-700 dark:text-zinc-300">
                    <XCircle class="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Risks & Assumptions -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div class="space-y-3">
                <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-risks') }}</p>
                <ul class="space-y-2">
                  <li v-for="item in result.risks" :key="item" class="flex items-start gap-2 text-sm text-gray-700 dark:text-zinc-300">
                    <AlertTriangle class="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
              <div class="space-y-3">
                <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-assumptions') }}</p>
                <ul class="space-y-2">
                  <li v-for="item in result.assumptions" :key="item" class="flex items-start gap-2 text-sm text-gray-700 dark:text-zinc-300">
                    <Info class="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <span>{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- Tech Approach -->
            <div class="space-y-2">
              <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-tech-approach') }}</p>
              <p class="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{{ result.technicalApproach }}</p>
            </div>

            <!-- User Flow -->
            <div class="space-y-4">
              <p class="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">{{ t('result-user-flow') }}</p>
              <MermaidDiagram :diagram="result.mermaidDiagram" />
            </div>

            <!-- Accordions -->
            <div class="space-y-4">
              <details class="group border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
                  <span class="text-sm font-bold text-gray-700 dark:text-zinc-300">{{ t('result-clarifying-questions') }}</span>
                  <ChevronDown class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div class="p-4 pt-0">
                  <ul class="space-y-2">
                    <li v-for="item in result.clarifyingQuestions" :key="item" class="text-sm text-gray-600 dark:text-zinc-400 list-disc ml-4">{{ item }}</li>
                  </ul>
                </div>
              </details>

              <details class="group border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden">
                <summary class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 transition-all">
                  <span class="text-sm font-bold text-gray-700 dark:text-zinc-300">{{ t('result-stakeholder-reply') }}</span>
                  <ChevronDown class="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div class="p-4 pt-0">
                  <p class="text-sm text-gray-600 dark:text-zinc-400 italic">{{ result.stakeholderReply }}</p>
                </div>
              </details>
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div class="flex items-center gap-2">
              <button 
                @click="exportMarkdown"
                class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm"
              >
                <Download class="w-4 h-4" />
                <span>{{ t('action-export') }}</span>
              </button>
              <button 
                @click="handleGenerate"
                :disabled="loading"
                class="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm font-semibold text-gray-700 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-700 transition-all shadow-sm disabled:opacity-50"
              >
                <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': loading }" />
                <span>{{ t('action-regenerate') }}</span>
              </button>
            </div>
            <button 
              @click="reset"
              class="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-semibold hover:bg-violet-700 transition-all shadow-sm"
            >
              <Plus class="w-4 h-4" />
              <span>{{ t('action-new-brief') }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, onMounted, ref, watch, nextTick } from 'vue'
import { 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Info, 
  ChevronDown, 
  Download, 
  RefreshCw,
  Plus
} from 'lucide-vue-next'
import { useBrief } from '~/composables/useBrief'
import type { GenerationMode, GenerationPersona } from '~/types/brief'
import { useLocale } from '~/composables/useLocale'

const { loading, error, result, history, streamingText, generate, clearError, restoreFromHistory } = useBrief()
const { locale, t } = useLocale()

const streamRef = ref<HTMLElement | null>(null)

watch(streamingText, () => {
  nextTick(() => {
    if (streamRef.value) {
      streamRef.value.scrollTop = streamRef.value.scrollHeight
    }
  })
})

const form = reactive({
  rawInput: '',
  mode: 'mvp' as GenerationMode,
  persona: 'PM' as GenerationPersona,
  compressToMvp: true
})

const handleGenerate = async () => {
  if (!form.rawInput || loading.value) return
  await generate({ 
    ...form,
    responseLanguage: locale.value
  })
}

const autoResize = (event: Event) => {
  const target = event.target as HTMLTextAreaElement
  target.style.height = 'auto'
  target.style.height = target.scrollHeight + 'px'
}

const reset = () => {
  result.value = null
  form.rawInput = ''
  // Focus textarea after next tick
  setTimeout(() => {
    const textarea = document.getElementById('rawInput')
    textarea?.focus()
  }, 0)
}

const exportMarkdown = () => {
  if (!result.value) return

  const r = result.value
  const md = `# ${r.summary}
**Confidence:** ${r.confidenceScore}/10

## Problem
${r.businessProblem}

## Goal
${r.goal}

## Target User
${r.targetUser}

## Proposed Solution
${r.proposedSolution}

## MVP Scope
${r.mvpScope.map(i => `- [x] ${i}`).join('\n')}

## Out of Scope
${r.outOfScope.map(i => `- [ ] ${i}`).join('\n')}

## Risks
${r.risks.map(i => `- [!] ${i}`).join('\n')}

## Assumptions
${r.assumptions.map(i => `- [i] ${i}`).join('\n')}

## Technical Approach
${r.technicalApproach}

## User Flow (Mermaid)
\`\`\`mermaid
${r.mermaidDiagram}
\`\`\`

## Clarifying Questions
${r.clarifyingQuestions.map(i => `- ${i}`).join('\n')}

## Stakeholder Reply
${r.stakeholderReply}

## Missing Info
${r.missingInfo.map(i => `- ${i}`).join('\n')}
`

  const blob = new Blob([md], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  
  const words = r.summary.split(' ').slice(0, 3).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const filename = `brief-${words.join('-')}-${Date.now()}.md`
  
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
