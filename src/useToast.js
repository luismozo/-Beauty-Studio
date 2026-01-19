import { ref } from 'vue'

// Estado global fuera de la función para que se comparta entre componentes
const toasts = ref([])

export function useToast() {
  const addToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random()
    toasts.value.push({ id, message, type })
    
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  const removeToast = (id) => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info')
  }
}