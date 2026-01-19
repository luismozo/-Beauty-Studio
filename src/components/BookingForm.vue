<template>
  <div class="w-full max-w-5xl mx-auto px-2 sm:px-4 md:px-8 py-6 md:py-12 min-h-screen">
    
    <div class="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden transition-all">
      
      <div class="bg-stone-900 p-6 md:p-10 text-white relative overflow-hidden">
        <div class="relative z-10">
          <h2 class="text-3xl md:text-5xl font-serif font-medium mb-2 md:mb-3 tracking-tight">Reserva tu cita</h2>
          <p class="text-stone-300 text-sm md:text-lg font-light opacity-90 flex items-center gap-2">
            <span class="animate-pulse w-2 h-2 bg-green-400 rounded-full"></span>
            Disponibilidad en tiempo real verificada
          </p>
        </div>
        <!-- Decoración sutil de fondo -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-rose-900/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div class="p-4 sm:p-6 md:p-10 grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        
        <!-- SECCIÓN DE SERVICIOS -->
        <div class="space-y-6">
          <div class="flex items-center justify-between border-b border-gray-100 pb-4">
            <h3 class="text-stone-800 font-bold flex items-center gap-3 uppercase tracking-widest text-xs md:text-sm">
              <Sparkles class="w-4 h-4 text-rose-400" /> 1. Elige tu servicio
            </h3>
            <span class="text-[10px] font-bold text-stone-400 bg-stone-50 px-2 py-1 rounded-md uppercase">Paso 1/3</span>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="space-y-4">
            <div v-for="i in 3" :key="i" class="h-24 bg-stone-50 animate-pulse rounded-3xl border border-stone-100"></div>
          </div>

          <!-- Error State -->
          <div v-else-if="loadError" class="text-center py-8">
            <AlertCircle class="w-12 h-12 text-red-400 mx-auto mb-4" />
            <p class="text-red-600 font-bold">{{ loadError }}</p>
            <button @click="loadServices" class="mt-4 px-6 py-2 bg-stone-800 text-white rounded-xl font-bold hover:bg-stone-900">
              Reintentar
            </button>
          </div>

          <!-- Empty State -->
          <div v-else-if="services.length === 0" class="text-center py-8">
            <Flower2 class="w-12 h-12 text-stone-300 mx-auto mb-4" />
            <p class="text-stone-500 font-bold">No hay servicios disponibles</p>
          </div>

          <!-- Services List -->
          <div v-else class="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            <button 
              v-for="service in services" 
              :key="service.id"
              @click="form.service_id = service.id"
              :class="[
                'w-full flex items-center gap-3 md:gap-4 p-3 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 transition-all duration-300 transform',
                form.service_id === service.id 
                  ? 'border-rose-300 bg-rose-50 shadow-lg shadow-rose-100/50 -translate-y-1' 
                  : 'border-stone-50 bg-white hover:border-rose-100 hover:shadow-md'
              ]"
            >
              <div :class="[
                'p-3 md:p-4 rounded-2xl flex-shrink-0 transition-colors',
                form.service_id === service.id ? 'bg-rose-400 text-white shadow-lg' : 'bg-stone-50 text-stone-400'
              ]">
                <component :is="getIcon(service.name)" class="w-6 h-6 md:w-7 md:h-7" />
              </div>

              <div class="flex-grow text-left">
                <p class="font-serif font-bold text-stone-800 text-sm sm:text-base md:text-xl tracking-tight leading-tight mb-1">
                  {{ service.name }}
                </p>
                <div class="flex items-center gap-3">
                  <span class="text-rose-500 font-bold text-sm md:text-lg">
                    ${{ Number(service.price).toLocaleString('es-CO') }}
                  </span>
                  <span class="h-1 w-1 bg-stone-300 rounded-full"></span>
                  <span class="text-stone-400 font-bold text-xs uppercase tracking-tighter">
                    {{ service.duration_min }} min
                  </span>
                </div>
              </div>
              
              <div v-if="form.service_id === service.id" class="bg-rose-400 rounded-full p-1 text-white scale-125 md:scale-150 mr-2">
                <Check class="w-3 h-3 md:w-4 md:h-4" />
              </div>
            </button>
          </div>
        </div>

        <!-- SECCIÓN DE FECHA Y HORA -->
        <div class="space-y-8 bg-stone-50 p-5 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-stone-100 self-start">
          
          <!-- Selector de Fecha -->
          <div class="space-y-4">
            <h3 class="text-stone-800 font-bold flex items-center gap-3 uppercase tracking-widest text-xs">
              <CalendarDays class="w-4 h-4 text-rose-400" /> 2. Selecciona el día
            </h3>
            <div class="relative group">
              <input 
                type="date" 
                v-model="form.date" 
                :min="minDate"
                class="w-full bg-white border border-stone-200 rounded-2xl p-4 md:p-5 focus:border-rose-300 focus:ring-2 focus:ring-rose-100 focus:outline-none font-medium text-stone-700 shadow-sm transition-all text-center md:text-left"
              >
            </div>
          </div>

          <!-- Selector de Horario -->
          <div v-if="form.date" class="space-y-4">
            <div class="flex justify-between items-center">
              <h3 class="text-stone-800 font-bold flex items-center gap-3 uppercase tracking-widest text-xs">
                <Clock3 class="w-4 h-4 text-rose-400" /> 3. Horarios
              </h3>
              <div v-if="checkingSlots" class="flex items-center gap-2 text-[10px] text-rose-500 font-bold animate-pulse uppercase">
                <RefreshCw class="w-3 h-3 animate-spin" /> Verificando...
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 md:gap-3">
              <button 
                v-for="time in availableTimeSlots" 
                :key="time"
                @click="form.time = time"
                :disabled="isPastTime(time) || isOccupied(time)"
                :class="[
                  'py-3 md:py-4 rounded-xl md:rounded-2xl font-bold text-xs md:text-sm transition-all border relative overflow-hidden',
                  isPastTime(time) || isOccupied(time)
                    ? 'bg-stone-100 border-stone-50 text-stone-300 cursor-not-allowed' 
                    : form.time === time 
                      ? 'bg-stone-800 border-stone-800 text-white shadow-lg scale-105' 
                      : 'bg-white border-stone-200 text-stone-500 hover:border-rose-300 hover:text-rose-500'
                ]"
              >
                {{ time }}
                <div v-if="isOccupied(time)" class="absolute inset-0 bg-red-500/10 flex items-center justify-center">
                   <span class="bg-red-500 text-white text-[8px] px-1 rounded absolute top-0 right-0">Full</span>
                </div>
              </button>
            </div>
          </div>

          <!-- Botón de Confirmación -->
          <div class="pt-4">
            <button 
              @click="openConfirmationModal" 
              :disabled="submitting || !isValid"
              class="w-full relative group overflow-hidden"
            >
              <div :class="[
                'w-full py-5 md:py-6 rounded-2xl md:rounded-3xl font-black text-sm md:text-lg transition-all flex items-center justify-center gap-3 shadow-2xl',
                isValid ? 'bg-stone-900 text-white hover:bg-stone-800 active:scale-95' : 'bg-stone-200 text-stone-400 cursor-not-allowed'
              ]">
                <Loader2 v-if="submitting" class="w-6 h-6 animate-spin" />
                <span v-else>{{ buttonLabel }}</span>
              </div>
            </button>

            <!-- Mensaje de éxito/error -->
            <transition enter-active-class="duration-300" enter-from-class="opacity-0 -y-2">
              <div v-if="message" :class="[
                'mt-6 p-4 rounded-2xl text-center font-bold text-sm border flex items-center justify-center gap-2',
                isError ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100 shadow-inner'
              ]">
                <AlertCircle v-if="isError" class="w-5 h-5" />
                <CheckCircle v-else class="w-5 h-5" />
                {{ message }}
              </div>
            </transition>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-[2rem] max-w-md w-[95%] p-6 md:p-8 shadow-2xl border border-stone-100 relative animate-in fade-in zoom-in duration-300">
        
        <button @click="showModal = false" class="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 text-stone-400 transition-colors">
          <X class="w-5 h-5" />
        </button>

        <div class="text-center mb-6">
          <div class="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck class="w-6 h-6 text-rose-500" />
          </div>
          <h3 class="text-2xl font-serif font-bold text-stone-800">Confirmar Datos</h3>
          <p class="text-stone-500 text-sm mt-1">Para finalizar, necesitamos verificar tu información de contacto.</p>
        </div>

        <div class="space-y-4">
          <!-- Resumen de Cita -->
          <div class="bg-stone-50 p-4 rounded-2xl border border-stone-100 text-sm space-y-2">
            <div class="flex justify-between">
              <span class="text-stone-500">Servicio:</span>
              <span class="font-bold text-stone-800">{{ getServiceName(form.service_id) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-500">Fecha:</span>
              <span class="font-bold text-stone-800">{{ form.date }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-stone-500">Hora:</span>
              <span class="font-bold text-stone-800">{{ form.time }}</span>
            </div>
          </div>

          <!-- Formulario de Datos -->
          <div class="space-y-3">
            <div>
              <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 ml-1">Nombre Completo</label>
              <div class="relative">
                <User class="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                <input 
                  v-model="customerForm.full_name" 
                  type="text" 
                  placeholder="Ej: María Pérez"
                  class="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all font-medium text-stone-700"
                >
              </div>
            </div>
            
            <div>
              <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 ml-1">WhatsApp</label>
              <div class="relative">
                <Phone class="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
                <input 
                  v-model="customerForm.phone" 
                  type="tel" 
                  placeholder="Ej: 300 123 4567"
                  class="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all font-medium text-stone-700"
                >
              </div>
            </div>
          </div>

          <button 
            @click="finalizeBooking" 
            :disabled="submitting || !isCustomerFormValid"
            class="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 disabled:opacity-50 disabled:cursor-not-allowed mt-4 flex items-center justify-center gap-2"
          >
            <Loader2 v-if="submitting" class="w-4 h-4 animate-spin" />
            <span>{{ submitting ? 'Confirmando...' : 'CONFIRMAR RESERVA' }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { supabase } from '../supabase'
import { 
  Sparkles, Clock3, CalendarDays, Scissors, 
  Heart, Wand2, Flower2, Zap, Check, Loader2, 
  CheckCircle, AlertCircle, RefreshCw, X, User, Phone, UserCheck
} from 'lucide-vue-next'

const props = defineProps({
  userRole: {
    type: String,
    default: 'client'
  }
})

const services = ref([])
const occupiedRanges = ref([]) // Cambiamos Slots simples por Rangos de tiempo
const loading = ref(true)
const loadError = ref('')
const checkingSlots = ref(false)
const submitting = ref(false)
const message = ref('')
const isError = ref(false)
const showModal = ref(false)
let realtimeChannel = null

const form = ref({ service_id: '', date: '', time: '' })
const customerForm = ref({ full_name: '', phone: '' })
const minDate = new Date().toISOString().split('T')[0]
const availableTimeSlots = ref([])

// Botón inteligente
const buttonLabel = computed(() => {
  if (!form.value.service_id) return '1. Elige un servicio'
  if (!form.value.date) return '2. Selecciona fecha'
  if (!form.value.time) return '3. Elige el horario'
  return 'CONTINUAR'
})

const isCustomerFormValid = computed(() => 
  customerForm.value.full_name.length > 3 && 
  customerForm.value.phone.length > 6
)

const getServiceName = (id) => {
  const s = services.value.find(s => s.id === id)
  return s ? s.name : 'Servicio'
}

// Cargar servicios
const loadServices = async () => {
  loading.value = true
  loadError.value = ''
  try {
    
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('id')
    
    if (error) {
      loadError.value = `Error al cargar servicios: ${error.message}`
      return
    }
    
    if (data && data.length > 0) {
      services.value = data
    } else {
      loadError.value = 'No hay servicios disponibles en este momento'
    }
  } catch (e) {
    loadError.value = `Error inesperado: ${e.message}`
  } finally {
    loading.value = false
  }
}

// Cargar perfil del usuario
const fetchProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, phone')
      .eq('id', user.id)
      .single()
    
    if (data) {
      customerForm.value.full_name = data.full_name || user.user_metadata.full_name || ''
      customerForm.value.phone = data.phone || ''
    }
  }
}

// Generar slots basados en horarios de DB
const generateTimeSlots = async (dateStr) => {
  availableTimeSlots.value = []
  if (!dateStr) return

  const date = new Date(dateStr + 'T00:00:00') // Forzar zona horaria local
  const dayOfWeek = date.getDay() // 0-6

  const { data: schedule } = await supabase
    .from('business_hours')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!schedule || schedule.is_closed) {
    return // Día cerrado
  }

  // Generar horas entre open_time y close_time
  let current = new Date(`2000-01-01T${schedule.open_time}`)
  const end = new Date(`2000-01-01T${schedule.close_time}`)

  while (current < end) {
    const timeString = current.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })
    availableTimeSlots.value.push(timeString)
    current.setHours(current.getHours() + 1) // Intervalos de 1 hora
  }
}

// Verificar horarios ocupados (Lógica Avanzada de Rangos)
const fetchOccupiedSlots = async (date) => {
  if (!date) return
  checkingSlots.value = true
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('appointment_date, services(duration_min)') // Traemos la duración
      .gte('appointment_date', `${date}T00:00:00`)
      .lte('appointment_date', `${date}T23:59:59`)
      .neq('status', 'cancelled')

    if (error) {
      return
    }

    if (data) {
      // Calculamos inicio y fin de cada cita existente
      occupiedRanges.value = data.map(apt => {
        const start = new Date(apt.appointment_date)
        const duration = apt.services?.duration_min || 60
        const end = new Date(start.getTime() + duration * 60000)
        return { start, end }
      })
    }
  } catch (e) {
  } finally {
    checkingSlots.value = false
  }
}

const isOccupied = (timeSlot) => {
  if (!form.value.date || !form.value.service_id) return false
  
  // 1. Calcular el rango de la NUEVA cita que el cliente quiere reservar
  const slotStart = new Date(`${form.value.date}T${timeSlot}:00`)
  
  const selectedService = services.value.find(s => s.id === form.value.service_id)
  const myDuration = selectedService?.duration_min || 60
  const slotEnd = new Date(slotStart.getTime() + myDuration * 60000)

  // 2. Verificar si choca con alguna cita existente
  // Fórmula de intersección: (StartA < EndB) && (EndA > StartB)
  return occupiedRanges.value.some(existing => {
    return slotStart < existing.end && slotEnd > existing.start
  })
}

// Watch para cambios en la fecha
watch(() => form.value.date, (newDate) => {
  form.value.time = ''
  generateTimeSlots(newDate)
  fetchOccupiedSlots(newDate)
})

// Obtener icono según el servicio
const getIcon = (name) => {
  const n = name.toLowerCase()
  if (n.includes('uña') || n.includes('manicure') || n.includes('pedicure')) return Wand2
  if (n.includes('pestaña')) return Zap
  if (n.includes('ceja')) return Heart
  if (n.includes('cera') || n.includes('depil')) return Scissors
  return Flower2
}

// Verificar si un horario ya pasó
const isPastTime = (time) => {
  if (form.value.date !== minDate) return false
  
  // Regla de Negocio: Mínimo 2 horas de anticipación
  const now = new Date()
  now.setHours(now.getHours() + 2) 

  const [h, m] = time.split(':')
  const slot = new Date()
  slot.setHours(h, m, 0)
  return slot < now
}

// Validar formulario
const isValid = computed(() => 
  form.value.service_id && 
  form.value.date && 
  form.value.time && 
  !checkingSlots.value
)

// Abrir modal
const openConfirmationModal = () => {
  if (isValid.value) {
    showModal.value = true
  }
}

// Finalizar reserva (Actualizar perfil + Crear cita)
const finalizeBooking = async () => {
  submitting.value = true
  message.value = ''
  isError.value = false
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Debes iniciar sesión para hacer una reserva')
    }

    // Nota: Ya no actualizamos el perfil del usuario aquí para evitar sobrescribir datos personales.
    // Los datos ingresados se guardarán exclusivamente en la cita.

    const finalDate = new Date(`${form.value.date}T${form.value.time}:00`)

    // Verificar disponibilidad final
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', finalDate.toISOString())
      .neq('status', 'cancelled')
      .maybeSingle()

    if (existing) {
      throw new Error('Este horario acaba de ser reservado. Por favor elige otro.')
    }

    // 2. Construir el objeto de la cita
    const appointmentData = {
      client_id: user.id,
      service_id: form.value.service_id,
      appointment_date: finalDate.toISOString(),
      status: 'pending',
      // Guardamos siempre los datos de contacto específicos para esta cita (snapshot)
      // Esto asegura que la reserva tenga el nombre correcto sin afectar el perfil de la cuenta
      guest_name: customerForm.value.full_name,
      guest_phone: customerForm.value.phone
    }

    // 3. Crear la cita
    const { error } = await supabase.from('appointments').insert(appointmentData)
    
    if (error) {
      // Código PostgreSQL 23505: Violación de restricción única (Unique Violation)
      // Esto ocurre si alguien reservó el mismo horario milisegundos antes
      if (error.code === '23505') {
        // UX PRO: Recargar los horarios ocupados para que el usuario vea que ya no está disponible
        await fetchOccupiedSlots(form.value.date)
        // Limpiar la selección de hora inválida
        form.value.time = ''
        throw new Error('¡Lo sentimos! Alguien acaba de reservar este horario hace un segundo. Por favor elige otro.')
      }
      throw error
    }
    
    message.value = '¡Reserva exitosa! Nos pondremos en contacto contigo pronto.'
    isError.value = false
    showModal.value = false
    
    // Limpiar formulario
    form.value = { service_id: '', date: '', time: '' }
    occupiedRanges.value = []
    
  } catch (e) {
    message.value = e.message || 'Error al crear la reserva'
    isError.value = true
    showModal.value = false
  } finally {
    submitting.value = false
  }
}

// Cargar servicios al montar
onMounted(() => {
  loadServices()
  fetchProfile()

  // Suscripción en Tiempo Real para Disponibilidad
  realtimeChannel = supabase
    .channel('booking-slots')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
      // Si hay una nueva cita o una cancelación en la fecha que estoy viendo, recargar slots
      if (form.value.date) {
        const changedDate = payload.new.appointment_date || payload.old.appointment_date
        if (changedDate && changedDate.startsWith(form.value.date)) {
          fetchOccupiedSlots(form.value.date)
        }
      }
    })
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: #f5f5f4;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #d6d3d1;
  border-radius: 10px;
}
</style>