<template>
  <div class="max-w-5xl mx-auto p-4 md:p-10 min-h-screen bg-stone-50">
    
    <!-- Header -->
    <div class="mb-10">
      <div class="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-widest text-xs mb-2">
        <Settings class="w-4 h-4" /> Configuración
      </div>
      <h2 class="text-4xl font-serif font-bold text-stone-800">Administración del Negocio</h2>
      <p class="text-stone-500 mt-2">Gestiona tus servicios y horarios de atención.</p>
    </div>

    <!-- Tabs -->
    <div class="flex gap-4 mb-8 border-b border-stone-200">
      <button 
        @click="activeTab = 'services'"
        :class="['pb-3 px-4 font-bold text-sm transition-all border-b-2', activeTab === 'services' ? 'border-rose-500 text-rose-600' : 'border-transparent text-stone-400 hover:text-stone-600']"
      >
        Servicios
      </button>
      <button 
        @click="activeTab = 'hours'"
        :class="['pb-3 px-4 font-bold text-sm transition-all border-b-2', activeTab === 'hours' ? 'border-rose-500 text-rose-600' : 'border-transparent text-stone-400 hover:text-stone-600']"
      >
        Horarios
      </button>
    </div>

    <!-- TAB: SERVICIOS -->
    <div v-if="activeTab === 'services'" class="space-y-6">
      <!-- Add Service Form -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border border-stone-100">
        <h3 class="font-bold text-stone-800 mb-4 flex items-center gap-2"><Plus class="w-4 h-4" /> Nuevo Servicio</h3>
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div class="md:col-span-2">
            <label class="text-xs font-bold text-stone-400 uppercase">Nombre</label>
            <input v-model="newService.name" type="text" class="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-rose-300 outline-none" placeholder="Ej: Corte Premium">
          </div>
          <div>
            <label class="text-xs font-bold text-stone-400 uppercase">Precio</label>
            <input v-model="newService.price" type="number" class="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-rose-300 outline-none" placeholder="0">
          </div>
          <div>
            <label class="text-xs font-bold text-stone-400 uppercase">Minutos</label>
            <div class="flex gap-2">
              <input v-model="newService.duration_min" type="number" class="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 focus:border-rose-300 outline-none" placeholder="30">
              <button @click="addService" :disabled="!newService.name" class="bg-stone-900 text-white p-3 rounded-xl hover:bg-stone-800 disabled:opacity-50">
                <Plus class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Services List -->
      <div class="grid gap-4">
        <div v-for="service in services" :key="service.id" class="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex flex-col md:flex-row items-center gap-4">
          <div class="flex-grow w-full">
            <input v-model="service.name" class="font-bold text-stone-800 bg-transparent border-b border-transparent hover:border-stone-200 focus:border-rose-300 outline-none w-full text-lg transition-colors" />
          </div>
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-xs">$</span>
              <input v-model="service.price" type="number" class="w-24 pl-6 p-2 bg-stone-50 rounded-lg text-sm font-bold text-stone-700 outline-none focus:ring-1 focus:ring-rose-200" />
            </div>
            <div class="relative">
              <input v-model="service.duration_min" type="number" class="w-16 p-2 bg-stone-50 rounded-lg text-sm font-bold text-stone-700 outline-none focus:ring-1 focus:ring-rose-200 text-center" />
              <span class="absolute right-2 top-1/2 -translate-y-1/2 text-stone-400 text-[10px]">min</span>
            </div>
            <button @click="updateService(service)" class="p-2 text-green-600 hover:bg-green-50 rounded-lg" title="Guardar cambios">
              <Save class="w-4 h-4" />
            </button>
            <button @click="toggleServiceActive(service)" :class="['p-2 rounded-lg', service.active ? 'text-rose-500 hover:bg-rose-50' : 'text-stone-300 hover:bg-stone-100']" title="Activar/Desactivar">
              <Power class="w-4 h-4" />
            </button>
            <button @click="deleteService(service.id)" class="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar permanentemente">
              <Trash2 class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB: HORARIOS -->
    <div v-if="activeTab === 'hours'" class="space-y-4">
      <div class="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100">
        <div v-for="hour in hours" :key="hour.id" class="flex flex-col md:flex-row items-center justify-between py-4 border-b border-stone-50 last:border-0 gap-4">
          
          <div class="flex items-center gap-4 w-full md:w-40">
            <div :class="['w-3 h-3 rounded-full', hour.is_closed ? 'bg-red-400' : 'bg-green-400']"></div>
            <span class="font-bold text-stone-700 capitalize">{{ getDayName(hour.day_of_week) }}</span>
          </div>

          <div class="flex items-center gap-4 flex-grow justify-center" :class="{ 'opacity-50 pointer-events-none': hour.is_closed }">
            <input type="time" v-model="hour.open_time" class="p-2 bg-stone-50 rounded-lg font-mono text-sm border border-stone-200 focus:border-rose-300 outline-none" />
            <span class="text-stone-300">-</span>
            <input type="time" v-model="hour.close_time" class="p-2 bg-stone-50 rounded-lg font-mono text-sm border border-stone-200 focus:border-rose-300 outline-none" />
          </div>

          <div class="flex items-center gap-3 w-full md:w-auto justify-end">
            <label class="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" v-model="hour.is_closed" class="hidden peer">
              <span class="text-xs font-bold text-stone-400 peer-checked:text-red-500 transition-colors">
                {{ hour.is_closed ? 'CERRADO' : 'ABIERTO' }}
              </span>
              <div class="w-10 h-6 bg-stone-200 rounded-full peer-checked:bg-red-100 relative transition-colors">
                <div class="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all peer-checked:translate-x-4 peer-checked:bg-red-500"></div>
              </div>
            </label>
            <button @click="updateHour(hour)" class="p-2 bg-stone-900 text-white rounded-lg hover:bg-stone-700 shadow-sm">
              <Save class="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { Settings, Save, Plus, Power, Trash2 } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const activeTab = ref('services')
const services = ref([])
const hours = ref([])
const newService = ref({ name: '', price: '', duration_min: 30 })
const toast = useToast()

// --- SERVICIOS ---
const fetchServices = async () => {
  const { data, error } = await supabase.from('services').select('*').order('id')
  if (!error) services.value = data
}

const addService = async () => {
  try {
    const { error } = await supabase.from('services').insert([{
      name: newService.value.name,
      price: newService.value.price,
      duration_min: newService.value.duration_min,
      active: true
    }])
    if (error) throw error
    toast.success('Servicio agregado')
    newService.value = { name: '', price: '', duration_min: 30 }
    fetchServices()
  } catch (e) {
    toast.error('Error: ' + e.message)
  }
}

const updateService = async (service) => {
  try {
    const { error } = await supabase.from('services').update({
      name: service.name,
      price: service.price,
      duration_min: service.duration_min
    }).eq('id', service.id)
    if (error) throw error
    toast.success('Servicio actualizado')
  } catch (e) {
    toast.error('Error al guardar')
  }
}

const toggleServiceActive = async (service) => {
  try {
    const { error } = await supabase.from('services').update({ active: !service.active }).eq('id', service.id)
    if (error) throw error
    service.active = !service.active
    toast.success(service.active ? 'Servicio activado' : 'Servicio desactivado')
  } catch (e) {
    toast.error('Error al cambiar estado')
  }
}

const deleteService = async (id) => {
  if (!confirm('¿Estás seguro de eliminar este servicio? Esta acción es irreversible.')) return
  try {
    const { error } = await supabase.from('services').delete().eq('id', id)
    if (error) throw error
    toast.success('Servicio eliminado')
    fetchServices()
  } catch (e) {
    toast.error('Error al eliminar: ' + e.message)
  }
}

// --- HORARIOS ---
const fetchHours = async () => {
  const { data, error } = await supabase.from('business_hours').select('*').order('day_of_week')
  if (!error) hours.value = data
}

const updateHour = async (hour) => {
  try {
    const { error } = await supabase.from('business_hours').update({
      open_time: hour.open_time,
      close_time: hour.close_time,
      is_closed: hour.is_closed
    }).eq('id', hour.id)
    if (error) throw error
    toast.success('Horario actualizado')
  } catch (e) {
    toast.error('Error al guardar horario')
  }
}

const getDayName = (dayIndex) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[dayIndex]
}

onMounted(() => {
  fetchServices()
  fetchHours()
})
</script>