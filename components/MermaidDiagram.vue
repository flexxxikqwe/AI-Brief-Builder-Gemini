<template>
  <div class="mermaid-container bg-gray-50 dark:bg-zinc-800/50 rounded-lg p-4 overflow-x-auto transition-colors">
    <div v-if="rendering" class="flex items-center justify-center h-48">
      <div class="animate-pulse flex flex-col items-center gap-2">
        <div class="h-4 w-32 bg-gray-200 dark:bg-zinc-700 rounded"></div>
        <div class="h-4 w-48 bg-gray-200 dark:bg-zinc-700 rounded"></div>
      </div>
    </div>
    
    <div v-show="!rendering && !error" ref="diagramRef" class="flex justify-center dark:invert dark:hue-rotate-180"></div>
    
    <div v-if="error" class="flex flex-col items-center gap-4 py-8">
      <div class="text-red-500 dark:text-red-400 flex items-center gap-2">
        <AlertCircle class="w-5 h-5" />
        <span>Could not render diagram</span>
      </div>
      <button 
        @click="showRaw = !showRaw"
        class="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium underline"
      >
        {{ showRaw ? 'Hide raw' : 'Show raw' }}
      </button>
      <pre v-if="showRaw" class="text-xs bg-gray-100 dark:bg-zinc-800 p-4 rounded w-full overflow-x-auto text-gray-700 dark:text-zinc-300">{{ diagram }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { AlertCircle } from 'lucide-vue-next'
import { useTheme } from '~/composables/useTheme'

const props = defineProps<{
  diagram: string
}>()

const { theme } = useTheme()
const diagramRef = ref<HTMLElement | null>(null)
const rendering = ref(true)
const error = ref(false)
const showRaw = ref(false)
const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`

const renderDiagram = async () => {
  if (!props.diagram) return
  
  rendering.value = true
  error.value = false
  
  try {
    const mermaid = (await import('mermaid')).default
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose',
      fontFamily: 'inherit'
    })
    
    if (diagramRef.value) {
      diagramRef.value.innerHTML = ''
      const { svg } = await mermaid.render(id, props.diagram)
      diagramRef.value.innerHTML = svg
    }
  } catch (err) {
    console.error('Mermaid rendering error:', err)
    error.value = true
  } finally {
    rendering.value = false
  }
}

onMounted(() => {
  renderDiagram()
})

watch(() => props.diagram, () => {
  nextTick(() => renderDiagram())
})

// Re-render on theme change if needed, but here we use CSS filters for simplicity
// as mermaid rendering can be heavy and theme: 'dark' in mermaid is sometimes inconsistent
</script>
