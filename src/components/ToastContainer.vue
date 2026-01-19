<template>
  <div class="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
    <TransitionGroup name="toast">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="pointer-events-auto min-w-[300px] max-w-md p-4 rounded-xl shadow-xl border flex items-start gap-3 transform transition-all duration-300"
        :class="{
          'bg-white border-green-100 text-green-800': toast.type === 'success',
          'bg-white border-red-100 text-red-800': toast.type === 'error',
          'bg-white border-blue-100 text-blue-800': toast.type === 'info'
        }"
      >
        <!-- Iconos -->
        <div class="mt-0.5">
          <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-green-500" />
          <AlertCircle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-500" />
          <Info v-else class="w-5 h-5 text-blue-500" />
        </div>
        
        <div class="flex-1">
          <p class="text-sm font-medium leading-tight">{{ toast.message }}</p>
        </div>

        <button @click="removeToast(toast.id)" class="text-gray-400 hover:text-gray-600">
          <X class="w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useToast } from '../composables/useToast'
import { CheckCircle, AlertCircle, Info, X } from 'lucide-vue-next'

const { toasts, removeToast } = useToast()
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style>