<!-- src/components/ClientAppointments.vue -->
<template>
  <div class="max-w-4xl mx-auto px-4 py-12 min-h-screen">
    <div class="mb-10">
      <h2 class="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-2">Mis Citas</h2>
      <p class="text-stone-500">Gestiona tus próximas visitas a Beauty Studio.</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 3" :key="i" class="h-32 bg-stone-50 animate-pulse rounded-3xl border border-stone-100"></div>
    </div>

    <!-- Empty State -->
    <div v-else-if="appointments.length === 0" class="text-center py-16 bg-white rounded-[2rem] border border-stone-100 shadow-sm">
      <div class="bg-rose-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <CalendarHeart class="w-8 h-8 text-rose-400" />
      </div>
      <h3 class="text-xl font-bold text-stone-800 mb-2">No tienes citas programadas</h3>
      <p class="text-stone-400 mb-6">¿Te gustaría consentirte un poco?</p>
      <router-link to="/reservar" class="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all">
        Reservar Ahora
      </router-link>
    </div>

    <!-- Lista de Citas -->
    <div v-else class="space-y-6">
      <div 
        v-for="apt in appointments" 
        :key="apt.id"
        class="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:shadow-md"
      >
        <div class="flex items-start gap-5">
          <!-- Fecha -->
          <div class="flex-shrink-0 bg-stone-50 rounded-2xl p-4 text-center min-w-[80px] border border-stone-100">
            <p class="text-xs text-stone-400 font-bold uppercase mb-1">{{ getMonth(apt.appointment_date) }}</p>
            <p class="text-2xl font-serif font-bold text-stone-800">{{ getDay(apt.appointment_date) }}</p>
          </div>

          <div>
            <h3 class="font-serif font-bold text-stone-800 text-xl">{{ apt.services?.name }}</h3>
            <p class="text-stone-500 font-medium flex items-center gap-2 mt-1">
              <Clock class="w-4 h-4 text-rose-400" /> {{ getTime(apt.appointment_date) }}
            </p>
            
            <div class="mt-3">
              <span :class="[
                'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
                apt.status === 'pending' ? 'bg-amber-50 text-amber-600' : 
                apt.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              ]">
                {{ translateStatus(apt.status) }}
              </span>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div v-if="apt.status === 'pending'" class="w-full md:w-auto">
          <button 
            @click="cancelAppointment(apt.id)"
            class="w-full md:w-auto px-5 py-2.5 border border-red-100 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle class="w-4 h-4" /> Cancelar Cita
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { CalendarHeart, Clock, XCircle } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const appointments = ref([])
const loading = ref(true)
const toast = useToast()

const fetchMyAppointments = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return // O redirigir a login

    const { data, error } = await supabase
      .from('appointments')
      .select('*, services(name, duration_min)')
      .eq('client_id', user.id)
      .order('appointment_date', { ascending: true })

    if (error) throw error
    appointments.value = data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

const cancelAppointment = async (id) => {
  if (!confirm('¿Estás segura de que deseas cancelar esta cita?')) return

  try {
    const { error } = await supabase
      .from('appointments')
      .update({ status: 'cancelled' })
      .eq('id', id)

    if (error) throw error
    
    toast.success('Cita cancelada correctamente')
    fetchMyAppointments() // Recargar lista
  } catch (e) {
    toast.error('Error al cancelar: ' + e.message)
  }
}

// Helpers
const getMonth = (d) => new Date(d).toLocaleString('es-ES', { month: 'short' }).replace('.', '')
const getDay = (d) => new Date(d).getDate()
const getTime = (d) => new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
const translateStatus = (s) => ({ pending: 'Confirmada', completed: 'Finalizada', cancelled: 'Cancelada' }[s] || s)

onMounted(fetchMyAppointments)
</script>
