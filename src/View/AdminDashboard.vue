<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h2 class="text-3xl font-bold text-gray-800 mb-6">Gestión de Citas</h2>
    
    <div class="overflow-x-auto bg-white rounded-lg shadow">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-pink-100 text-pink-800">
            <th class="p-4">Cliente</th>
            <th class="p-4">Servicio</th>
            <th class="p-4">Fecha</th>
            <th class="p-4">Estado</th>
            <th class="p-4">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="appt in appointments" :key="appt.id" class="border-b hover:bg-gray-50">
            <td class="p-4">{{ appt.profiles?.full_name || 'Anónimo' }}</td>
            <td class="p-4">{{ appt.services?.name }}</td>
            <td class="p-4">{{ formatDate(appt.appointment_date) }}</td>
            <td class="p-4">
              <span :class="statusColor(appt.status)" class="px-2 py-1 rounded text-xs font-bold uppercase">
                {{ appt.status }}
              </span>
            </td>
            <td class="p-4 flex gap-2">
              <button @click="updateStatus(appt.id, 'confirmed')" class="text-green-600 hover:text-green-800" title="Confirmar">✅</button>
              <button @click="updateStatus(appt.id, 'cancelled')" class="text-red-600 hover:text-red-800" title="Cancelar">❌</button>
              <a 
                :href="getWhatsappLink(appt)" 
                target="_blank"
                class="text-green-500 hover:text-green-700 font-bold"
              >
                📞 WPP
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const appointments = ref([])

// Cargar citas con relaciones (Join automático de Supabase)
const fetchAppointments = async () => {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      id, appointment_date, status,
      profiles ( full_name, phone ),
      services ( name, price )
    `)
    .order('appointment_date', { ascending: true })
  
  if (data) appointments.value = data
}

// Actualizar estado
const updateStatus = async (id, status) => {
  await supabase.from('appointments').update({ status }).eq('id', id)
  fetchAppointments() // Recargar
}

// Formato Fecha
const formatDate = (date) => new Date(date).toLocaleString()

// Colores de estado
const statusColor = (status) => {
  const map = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }
  return map[status] || 'bg-gray-100'
}

// Generador Link WhatsApp
const getWhatsappLink = (appt) => {
  // Asumiendo que guardas el teléfono en profiles
  const phone = appt.profiles?.phone || '' 
  const msg = `Hola ${appt.profiles?.full_name}, te escribo sobre tu cita de ${appt.services?.name}...`
  return `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
}

onMounted(fetchAppointments)
</script>