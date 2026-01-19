<template>
  <div class="max-w-4xl mx-auto p-4 md:p-8 min-h-[80vh]">
    <!-- Header -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h2 class="text-3xl font-serif font-bold text-stone-800 mb-2">Mis Reservas</h2>
        <p class="text-stone-500">Gestiona tus citas y revisa tu historial.</p>
      </div>
      
      <!-- Botón de Contacto General -->
      <a 
        href="https://wa.me/573001234567" 
        target="_blank"
        class="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-100"
      >
        <MessageCircle class="w-4 h-4" />
        <span>Contactar al Studio</span>
      </a>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20">
      <Loader2 class="w-10 h-10 text-rose-400 animate-spin mb-4" />
      <p class="text-stone-400 font-medium animate-pulse">Cargando tus reservas...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="bookings.length === 0" class="text-center py-20 bg-white rounded-[2rem] border border-stone-100 shadow-sm">
      <div class="bg-stone-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        <CalendarX2 class="w-8 h-8 text-stone-300" />
      </div>
      <h3 class="text-stone-800 font-bold text-xl mb-2">No tienes reservas</h3>
      <p class="text-stone-400 mb-6">Aún no has agendado ninguna cita con nosotros.</p>
      <button 
        @click="$emit('navigate', 'booking')"
        class="px-6 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg"
      >
        Agendar Cita
      </button>
    </div>

    <!-- Bookings List -->
    <div v-else class="space-y-4">
      <div 
        v-for="booking in bookings" 
        :key="booking.id"
        class="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-6"
      >
        <!-- Date Badge -->
        <div class="flex-shrink-0 flex md:flex-col items-center justify-center gap-2 md:gap-0 bg-stone-50 rounded-xl p-4 min-w-[90px] border border-stone-100">
          <span class="text-xs font-bold text-stone-400 uppercase">{{ getMonth(booking.appointment_date) }}</span>
          <span class="text-2xl font-serif font-bold text-stone-800">{{ getDay(booking.appointment_date) }}</span>
          <span class="text-xs font-medium text-stone-500">{{ getTime(booking.appointment_date) }}</span>
        </div>

        <!-- Info -->
        <div class="flex-grow space-y-2">
          <div class="flex items-start justify-between">
            <div>
              <h3 class="font-bold text-stone-800 text-lg">{{ booking.services?.name }}</h3>
              <p class="text-sm text-stone-500 flex items-center gap-2">
                <Clock class="w-3 h-3" /> {{ booking.services?.duration_min }} min
                <span class="text-stone-300">|</span>
                <span class="font-semibold text-rose-500">${{ Number(booking.services?.price).toLocaleString('es-CO') }}</span>
              </p>
            </div>
            <span :class="[
              'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider',
              getStatusClass(booking.status)
            ]">
              {{ translateStatus(booking.status) }}
            </span>
          </div>

          <div class="pt-2 flex items-center gap-2 text-xs text-stone-400">
            <User class="w-3 h-3" />
            <span>Para: <span class="font-semibold text-stone-600">{{ booking.guest_name || 'Mí' }}</span></span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex md:flex-col gap-2 justify-center border-t md:border-t-0 md:border-l border-stone-100 pt-4 md:pt-0 md:pl-6">
          <a 
            :href="getWhatsAppLink(booking)"
            target="_blank"
            class="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-xs hover:bg-green-100 transition-colors"
          >
            <MessageCircle class="w-3 h-3" /> Ayuda / Contacto
          </a>
          
          <button 
            v-if="booking.status === 'pending'"
            @click="confirmCancel(booking)"
            class="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-bold text-xs hover:bg-red-100 transition-colors"
          >
            <XCircle class="w-3 h-3" /> Cancelar
          </button>
        </div>
      </div>
    </div>

    <!-- Cancel Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-100 relative animate-in fade-in zoom-in duration-200">
        <div class="text-center">
          <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle class="w-6 h-6 text-red-500" />
          </div>
          <h3 class="text-xl font-serif font-bold text-stone-800 mb-2">¿Cancelar Cita?</h3>
          <p class="text-stone-500 text-sm mb-6 leading-relaxed">Esta acción no se puede deshacer. ¿Estás seguro?</p>
          
          <div class="flex gap-3">
            <button @click="showCancelModal = false" class="flex-1 py-3 rounded-xl font-bold text-sm text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
              Volver
            </button>
            <button @click="handleCancel" class="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-100">
              Sí, Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { supabase } from '../supabase'
import { Loader2, CalendarX2, Clock, User, MessageCircle, XCircle } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const bookings = ref([])
const loading = ref(true)
const showCancelModal = ref(false)
const bookingToCancel = ref(null)
const toast = useToast()
let realtimeChannel = null

const fetchBookings = async () => {
  loading.value = true
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data, error } = await supabase
    .from('appointments')
    .select('*, services(name, price, duration_min)')
    .eq('client_id', user.id)
    .order('appointment_date', { ascending: false })

  if (!error) bookings.value = data
  loading.value = false
}

const confirmCancel = (booking) => {
  bookingToCancel.value = booking
  showCancelModal.value = true
}

const handleCancel = async () => {
  if (!bookingToCancel.value) return

  // Verificar estado antes de cancelar (por si el admin la completó hace un segundo)
  const { data: current, error: fetchError } = await supabase
    .from('appointments')
    .select('status')
    .eq('id', bookingToCancel.value.id)
    .single()

  if (fetchError || !current || current.status === 'completed') {
    toast.error('No se puede cancelar: La cita ya fue completada o no existe.')
    fetchBookings()
    showCancelModal.value = false
    return
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', bookingToCancel.value.id)
  
  if (!error) {
    fetchBookings()
    toast.success('Cita cancelada correctamente')
    showCancelModal.value = false
  }
}

const getMonth = (d) => new Date(d).toLocaleString('es-ES', { month: 'short' }).replace('.', '')
const getDay = (d) => new Date(d).getDate()
const getTime = (d) => new Date(d).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
const translateStatus = (s) => ({ pending: 'Pendiente', completed: 'Completada', cancelled: 'Cancelada' }[s] || s)
const getStatusClass = (s) => ({ pending: 'bg-amber-50 text-amber-600', completed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-600' }[s])

const getWhatsAppLink = (b) => `https://wa.me/573001234567?text=${encodeURIComponent(`Hola, tengo una consulta sobre mi cita de ${b.services?.name} del día ${new Date(b.appointment_date).toLocaleDateString()}.`)}`

onMounted(() => {
  fetchBookings()

  // Suscripción en Tiempo Real para el Cliente
  realtimeChannel = supabase
    .channel('client-bookings')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, async (payload) => {
      // Recargar siempre que haya un cambio para asegurar consistencia total
      fetchBookings()
    })
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>