<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Sparkles class="w-5 h-5 text-white" />
          </div>
          <h1 class="text-xl font-bold text-gray-900 tracking-tight">AI Brief Builder</h1>
        </div>
        
        <div class="flex items-center gap-4">
          <!-- Auth removed -->
        </div>
      </div>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-white border-t border-gray-200 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p class="text-sm text-gray-500">
          &copy; 2026 AI Brief Builder. Built for the Senior Frontend Developer Hiring Task.
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next'
</script>
