<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-pink-100 px-4">
    <div class="max-w-md w-full bg-white/80 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-white/50 text-center transform transition-all hover:scale-[1.01]">
      
      <div class="mb-6 inline-flex items-center justify-center w-20 h-20 bg-pink-500 rounded-2xl shadow-lg shadow-pink-200 animate-bounce-slow">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </div>

      <h1 class="text-4xl font-extrabold text-gray-800 tracking-tight mb-2">
        Beauty <span class="text-pink-600">Studio</span>
      </h1>
      <p class="text-gray-500 mb-10 font-medium">Realza tu belleza natural con expertos.</p>

      <button 
        @click="loginGoogle"
        :disabled="loading"
        class="group relative w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-100 py-4 px-6 rounded-2xl font-bold text-gray-700 transition-all duration-300 hover:border-pink-300 hover:bg-pink-50 hover:shadow-md active:scale-95 disabled:opacity-50"
      >
        <img 
          src="https://www.svgrepo.com/show/475656/google-color.svg" 
          class="w-6 h-6 group-hover:rotate-12 transition-transform" 
          alt="Google Icon"
        >
        <span>{{ loading ? 'Conectando...' : 'Continuar con Google' }}</span>
      </button>

      <div class="mt-8 flex items-center justify-center gap-2 text-xs text-gray-400 uppercase tracking-widest">
        <span class="w-8 h-px bg-gray-200"></span>
        <span>Acceso Seguro</span>
        <span class="w-8 h-px bg-gray-200"></span>
      </div>

      <p class="mt-8 text-sm text-gray-500">
        Al ingresar, aceptas agendar bajo disponibilidad. 
        <br>
        <span class="text-pink-500 font-semibold italic">Uñas • Pestañas • Cejas</span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase'

const loading = ref(false)

const loginGoogle = async () => {
  try {
    loading.value = true
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
        queryParams: {
          // ESTO FUERZA EL SELECTOR DE CUENTAS DE GOOGLE
          access_type: 'offline',
          prompt: 'select_account' // ← Clave para mostrar selector de cuentas
        }
      }
    })
    if (error) throw error
  } catch (error) {
    console.error('Error de autenticación:', error.message)
    alert('Hubo un problema al conectar con Google.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.animate-bounce-slow {
  animation: bounce 3s infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
  50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
}
</style>