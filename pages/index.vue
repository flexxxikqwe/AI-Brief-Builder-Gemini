<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">Your Tasks</h2>
        <p class="text-sm text-gray-500">Manage and track your daily activities</p>
      </div>
      <button 
        @click="isCreateModalOpen = true"
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
      >
        <Plus class="w-4 h-4 mr-2" />
        New Task
      </button>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4 items-center">
      <div class="relative flex-grow w-full md:w-auto">
        <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search class="h-4 w-4 text-gray-400" />
        </div>
        <input
          v-model="taskStore.searchQuery"
          type="text"
          placeholder="Search tasks..."
          class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        />
      </div>
      
      <div class="flex items-center gap-2 w-full md:w-auto">
        <Filter class="h-4 w-4 text-gray-400" />
        <select 
          v-model="taskStore.filterStatus"
          class="block w-full md:w-auto pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-all"
        >
          <option value="all">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      <div class="flex items-center gap-2 w-full md:w-auto">
        <ArrowUpDown class="h-4 w-4 text-gray-400" />
        <select 
          v-model="taskStore.sortBy"
          class="block w-full md:w-auto pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-lg transition-all"
        >
          <option value="createdAt">Date Created</option>
          <option value="title">Title</option>
          <option value="priority">Priority</option>
        </select>
      </div>
    </div>

    <!-- Task List -->
    <div v-if="taskStore.loading" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="w-10 h-10 text-indigo-600 animate-spin mb-4" />
      <p class="text-gray-500 font-medium">Loading tasks...</p>
    </div>

    <div v-else-if="taskStore.filteredTasks.length === 0" class="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
      <div class="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
        <ClipboardList class="h-8 w-8 text-gray-400" />
      </div>
      <h3 class="text-lg font-medium text-gray-900">No tasks found</h3>
      <p class="text-gray-500 mt-1">Try adjusting your filters or create a new task.</p>
      <button 
        @click="isCreateModalOpen = true"
        class="mt-6 inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500"
      >
        <Plus class="w-4 h-4 mr-1" />
        Create your first task
      </button>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="task in taskStore.filteredTasks" 
        :key="task.id"
        class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all group relative"
      >
        <div class="flex justify-between items-start mb-3">
          <span 
            :class="[
              'px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider',
              statusClasses[task.status as keyof typeof statusClasses]
            ]"
          >
            {{ task.status.replace('-', ' ') }}
          </span>
          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              @click="editTask(task)"
              class="p-1.5 text-gray-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
              title="Edit Task"
            >
              <Pencil class="w-4 h-4" />
            </button>
            <button 
              @click="confirmDelete(task.id)"
              class="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
              title="Delete Task"
            >
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <h3 class="text-lg font-bold text-gray-900 mb-2 line-clamp-1">{{ task.title }}</h3>
        <p class="text-sm text-gray-600 mb-4 line-clamp-2 h-10">{{ task.description }}</p>
        
        <div class="flex items-center justify-between pt-4 border-t border-gray-50">
          <div class="flex items-center gap-2">
            <div 
              :class="[
                'w-2 h-2 rounded-full',
                priorityColors[task.priority as keyof typeof priorityColors]
              ]"
            ></div>
            <span class="text-xs font-medium text-gray-500 capitalize">{{ task.priority }} Priority</span>
          </div>
          <ClientOnly>
            <span class="text-[10px] text-gray-400 font-mono">
              {{ new Date(task.createdAt).toLocaleDateString() }}
            </span>
          </ClientOnly>
        </div>
      </div>
    </div>

    <!-- Task Modal (Create/Edit) -->
    <div v-if="isModalOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true" @click="closeModal">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 class="text-xl leading-6 font-bold text-gray-900 mb-6">
                  {{ editingTask ? 'Edit Task' : 'Create New Task' }}
                </h3>
                
                <form @submit.prevent="saveTask" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input 
                      v-model="taskForm.title"
                      type="text"
                      required
                      class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Task title"
                    />
                  </div>
                  
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      v-model="taskForm.description"
                      rows="3"
                      class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder="Task description"
                    ></textarea>
                  </div>

                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select 
                        v-model="taskForm.status"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="done">Done</option>
                      </select>
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select 
                        v-model="taskForm.priority"
                        class="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
            <button 
              type="button" 
              @click="saveTask"
              class="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm transition-all"
            >
              {{ editingTask ? 'Update' : 'Create' }}
            </button>
            <button 
              type="button" 
              @click="closeModal"
              class="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Plus, Search, Filter, ArrowUpDown, ClipboardList, 
  Loader2, Pencil, Trash2 
} from 'lucide-vue-next'
import { useTaskStore, type Task } from '~/stores/tasks'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from '#app'
import { ref, computed, reactive, onMounted } from 'vue'

const taskStore = useTaskStore()
const authStore = useAuthStore()
const router = useRouter()

const isCreateModalOpen = ref(false)
const editingTask = ref<Task | null>(null)
const isModalOpen = computed(() => isCreateModalOpen.value || !!editingTask.value)

const taskForm = reactive({
  title: '',
  description: '',
  status: 'todo' as Task['status'],
  priority: 'medium' as Task['priority']
})

const statusClasses = {
  'todo': 'bg-blue-100 text-blue-800',
  'in-progress': 'bg-yellow-100 text-yellow-800',
  'done': 'bg-green-100 text-green-800'
}

const priorityColors = {
  'low': 'bg-gray-400',
  'medium': 'bg-yellow-500',
  'high': 'bg-red-500'
}

const editTask = (task: Task) => {
  editingTask.value = task
  taskForm.title = task.title
  taskForm.description = task.description
  taskForm.status = task.status
  taskForm.priority = task.priority
}

const closeModal = () => {
  isCreateModalOpen.value = false
  editingTask.value = null
  taskForm.title = ''
  taskForm.description = ''
  taskForm.status = 'todo'
  taskForm.priority = 'medium'
}

const saveTask = async () => {
  if (!taskForm.title) return

  let success = false
  if (editingTask.value) {
    success = await taskStore.updateTask(editingTask.value.id, { ...taskForm })
  } else {
    success = await taskStore.createTask({ ...taskForm })
  }

  if (success) {
    closeModal()
  }
}

const confirmDelete = async (id: string) => {
  if (confirm('Are you sure you want to delete this task?')) {
    await taskStore.deleteTask(id)
  }
}

onMounted(async () => {
  authStore.initAuth()
  if (!authStore.isAuthenticated) {
    router.push('/login')
    return
  }
  await taskStore.fetchTasks()
})
</script>
