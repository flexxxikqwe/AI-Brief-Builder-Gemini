import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useRuntimeConfig, navigateTo } from '#app'

export interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

export const useTaskStore = defineStore('tasks', {
  state: () => ({
    tasks: [] as Task[],
    loading: false,
    error: null as string | null,
    searchQuery: '',
    filterStatus: 'all' as 'all' | 'todo' | 'in-progress' | 'done',
    sortBy: 'createdAt' as 'createdAt' | 'title' | 'priority',
    sortOrder: 'desc' as 'asc' | 'desc'
  }),

  getters: {
    filteredTasks: (state) => {
      let result = [...state.tasks]

      // Search
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase()
        result = result.filter(t => 
          t.title.toLowerCase().includes(query) || 
          t.description.toLowerCase().includes(query)
        )
      }

      // Filter
      if (state.filterStatus !== 'all') {
        result = result.filter(t => t.status === state.filterStatus)
      }

      // Sort
      result.sort((a, b) => {
        let valA: any = a[state.sortBy as keyof Task]
        let valB: any = b[state.sortBy as keyof Task]

        if (state.sortBy === 'priority') {
          const priorityMap = { low: 1, medium: 2, high: 3 }
          valA = priorityMap[a.priority as keyof typeof priorityMap]
          valB = priorityMap[b.priority as keyof typeof priorityMap]
        }

        if (valA < valB) return state.sortOrder === 'asc' ? -1 : 1
        if (valA > valB) return state.sortOrder === 'asc' ? 1 : -1
        return 0
      })

      return result
    }
  },

  actions: {
    async fetchTasks() {
      const authStore = useAuthStore()
      if (!authStore.token) return

      this.loading = true
      this.error = null
      try {
        const config = useRuntimeConfig()
        const response = await $fetch<Task[]>(`${config.public.apiBase}/tasks`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        this.tasks = response
      } catch (err: any) {
        if (err.status === 401) {
          authStore.logout()
          navigateTo('/login')
        }
        this.error = err.data?.message || 'Failed to fetch tasks'
      } finally {
        this.loading = false
      }
    },

    async createTask(taskData: Partial<Task>) {
      const authStore = useAuthStore()
      try {
        const config = useRuntimeConfig()
        const newTask = await $fetch<Task>(`${config.public.apiBase}/tasks`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: taskData
        })
        this.tasks.unshift(newTask)
        return true
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to create task'
        return false
      }
    },

    async updateTask(id: string, updates: Partial<Task>) {
      const authStore = useAuthStore()
      try {
        const config = useRuntimeConfig()
        const updatedTask = await $fetch<Task>(`${config.public.apiBase}/tasks/${id}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          },
          body: updates
        })
        const index = this.tasks.findIndex(t => t.id === id)
        if (index !== -1) {
          this.tasks[index] = updatedTask
        }
        return true
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to update task'
        return false
      }
    },

    async deleteTask(id: string) {
      const authStore = useAuthStore()
      try {
        const config = useRuntimeConfig()
        await $fetch(`${config.public.apiBase}/tasks/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        this.tasks = this.tasks.filter(t => t.id !== id)
        return true
      } catch (err: any) {
        this.error = err.data?.message || 'Failed to delete task'
        return false
      }
    }
  }
})
