<template>
  <div class="max-w-7xl mx-auto p-4 md:p-10 min-h-screen bg-stone-50">
    
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
      <div class="space-y-2">
        <div class="flex items-center gap-2 text-rose-500 font-bold uppercase tracking-widest text-xs">
          <ShieldCheck class="w-4 h-4" /> Panel Administrativo
        </div>
        <h2 class="text-4xl md:text-5xl font-serif font-bold text-stone-800 tracking-tight">
          Gestión de <span class="italic text-rose-400">Citas</span>
        </h2>
        <p class="text-stone-500 font-light text-lg">Visualiza y administra la agenda de Beauty Studio.</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full md:w-auto">
        <div class="bg-white border border-stone-100 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-transform hover:scale-105">
          <div class="bg-rose-50 p-3 rounded-xl text-rose-500">
            <CalendarCheck2 class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Total Citas</p>
            <p class="text-2xl font-serif font-bold text-stone-800">{{ appointments.length }}</p>
          </div>
        </div>
        
        <div class="bg-white border border-stone-100 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-transform hover:scale-105">
          <div class="bg-amber-50 p-3 rounded-xl text-amber-500">
            <Clock class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Pendientes</p>
            <p class="text-2xl font-serif font-bold text-stone-800">{{ pendingCount }}</p>
          </div>
        </div>

        <div class="bg-white border border-stone-100 p-4 rounded-2xl shadow-sm flex items-center gap-4 transition-transform hover:scale-105">
          <div class="bg-red-50 p-3 rounded-xl text-red-500">
            <XCircle class="w-6 h-6" />
          </div>
          <div>
            <p class="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Canceladas</p>
            <p class="text-2xl font-serif font-bold text-stone-800">{{ cancelledCount }}</p>
          </div>
        </div>
      </div>
    </div>

    

      <!-- Quick Actions Toolbar -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      <button 
        @click="openServicesModal"
        class="flex flex-col md:flex-row items-center justify-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl hover:border-rose-200 hover:shadow-md transition-all group active:scale-95"
        title="Gestionar precios y servicios"
      >
        <div class="p-2.5 bg-stone-50 rounded-full group-hover:bg-rose-50 transition-colors">
          <Briefcase class="w-5 h-5 text-stone-600 group-hover:text-rose-500" />
        </div>
        <span class="font-bold text-stone-600 text-sm">Servicios</span>
      </button>

      <button 
        @click="openHoursModal"
        class="flex flex-col md:flex-row items-center justify-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl hover:border-rose-200 hover:shadow-md transition-all group active:scale-95"
        title="Configurar horarios de atención"
      >
        <div class="p-2.5 bg-stone-50 rounded-full group-hover:bg-rose-50 transition-colors">
          <Clock class="w-5 h-5 text-stone-600 group-hover:text-rose-500" />
        </div>
        <span class="font-bold text-stone-600 text-sm">Horarios</span>
      </button>

      <button 
        @click="checkReminders"
        class="flex flex-col md:flex-row items-center justify-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl hover:border-indigo-200 hover:shadow-md transition-all group active:scale-95"
        title="Ver recordatorios pendientes para mañana"
      >
        <div class="p-2.5 bg-stone-50 rounded-full group-hover:bg-indigo-50 transition-colors">
          <BellRing class="w-5 h-5 text-stone-600 group-hover:text-indigo-500" />
        </div>
        <span class="font-bold text-stone-600 text-sm">Recordatorios</span>
      </button>

      <button 
        @click="exportToCSV"
        class="flex flex-col md:flex-row items-center justify-center gap-3 p-4 bg-white border border-stone-200 rounded-2xl hover:border-green-200 hover:shadow-md transition-all group active:scale-95"
        title="Descargar reporte en Excel/CSV"
      >
        <div class="p-2.5 bg-stone-50 rounded-full group-hover:bg-green-50 transition-colors">
          <FileDown class="w-5 h-5 text-stone-600 group-hover:text-green-600" />
        </div>
        <span class="font-bold text-stone-600 text-sm">Exportar</span>
      </button>
    </div>

    <!-- Filters and Search (Sticky Bar) -->
    <div class="flex flex-col-reverse md:flex-row justify-between items-center gap-4 mb-6 bg-white p-3 rounded-2xl border border-stone-100 shadow-sm sticky top-20 z-30">
      <!-- Date Filters -->
      <div class="flex gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-hide">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          @click="currentFilter = filter.value"
          :class="[
            'px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap',
            currentFilter === filter.value 
              ? 'bg-stone-800 text-white shadow-md' 
              : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
          ]"
        >
          {{ filter.label }}
        </button>
      </div>

      <!-- Search -->
      <div class="relative w-full md:w-auto">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input 
          v-model="searchQuery"
          type="text"
          placeholder="Buscar cliente, fecha..."
          class="w-full md:w-64 pl-10 pr-4 py-2.5 bg-stone-50 border-none rounded-xl focus:ring-2 focus:ring-rose-100 text-sm font-medium text-stone-600 placeholder-stone-400 transition-all"
        >
      </div>
    </div>

    <div class="space-y-4">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 class="w-10 h-10 text-rose-400 animate-spin" />
        <p class="text-stone-400 font-medium animate-pulse text-sm tracking-wide">Sincronizando agenda...</p>
      </div>

      <template v-else>
        <!-- Empty State -->
        <div v-if="filteredAppointments.length === 0" class="text-center py-24 bg-white rounded-[2.5rem] border border-stone-100 shadow-sm">
          <div class="bg-stone-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CalendarX2 class="w-10 h-10 text-stone-300" />
          </div>
          <h3 class="text-stone-800 font-serif font-bold text-2xl mb-2">{{ searchQuery ? 'Sin resultados' : 'Agenda Libre' }}</h3>
          <p class="text-stone-400 font-light">{{ searchQuery ? 'No se encontraron citas que coincidan con tu búsqueda.' : 'No hay citas programadas en este momento.' }}</p>
        </div>

        <!-- Appointments List -->
        <div 
          v-for="appointment in paginatedAppointments" 
          :key="appointment.id"
          class="group bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 transition-all hover:shadow-xl hover:shadow-rose-100/40 hover:border-rose-100"
        >
          <!-- Info Cliente & Servicio -->
          <div class="flex items-start gap-5 w-full lg:w-auto">
            <!-- Date Box -->
            <div class="flex-shrink-0 bg-stone-50 rounded-2xl p-4 text-center min-w-[80px] border border-stone-100 group-hover:bg-rose-50 group-hover:border-rose-100 transition-colors">
              <p class="text-xs text-stone-400 font-bold uppercase mb-1">{{ getMonth(appointment.appointment_date) }}</p>
              <p class="text-2xl font-serif font-bold text-stone-800 group-hover:text-rose-500 transition-colors">{{ getDay(appointment.appointment_date) }}</p>
              <p class="text-xs text-stone-500 font-medium mt-1">{{ getTime(appointment.appointment_date) }}</p>
            </div>

            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full overflow-hidden bg-stone-100 border border-stone-200 flex-shrink-0">
                  <img 
                    v-if="appointment.profiles?.avatar_url" 
                    :src="appointment.profiles.avatar_url" 
                    class="w-full h-full object-cover"
                  />
                  <User v-else class="w-full h-full p-2 text-stone-300" />
                </div>
                <div>
                <h3 class="font-serif font-bold text-stone-800 text-xl tracking-tight">
                  {{ appointment.guest_name || appointment.profiles?.full_name || 'Cliente Anónimo' }}
                </h3>
                <p class="text-sm text-stone-400 font-medium flex items-center gap-2">
                  <Phone class="w-3 h-3" /> {{ appointment.guest_phone || appointment.profiles?.phone || 'Sin teléfono' }}
                </p>
                </div>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <span class="flex items-center gap-1.5 text-stone-600 font-bold text-[10px] uppercase tracking-wider bg-stone-100 px-3 py-1.5 rounded-full">
                  <Sparkles class="w-3 h-3 text-rose-400" /> {{ appointment.services?.name }}
                </span>
                
                <!-- Status Badge -->
                <span :class="[
                  'flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full',
                  appointment.status === 'completed' ? 'bg-green-50 text-green-600' : 
                  appointment.status === 'cancelled' ? 'bg-red-50 text-red-600' : 
                  'bg-amber-50 text-amber-600'
                ]">
                  <span class="w-1.5 h-1.5 rounded-full" :class="[
                    appointment.status === 'completed' ? 'bg-green-500' : 
                    appointment.status === 'cancelled' ? 'bg-red-500' : 
                    'bg-amber-500'
                  ]"></span>
                  {{ translateStatus(appointment.status) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-3 w-full lg:w-auto border-t border-stone-100 lg:border-none pt-5 lg:pt-0 mt-2 lg:mt-0">
            <a 
              v-if="appointment.profiles?.phone"
              :href="generateWhatsAppLink(appointment)"
              target="_blank"
              class="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-green-100 transition-all transform active:scale-95"
            >
              <MessageCircle class="w-4 h-4" />
              <span class="lg:hidden xl:inline">WhatsApp</span>
            </a>
            <button 
              v-else
              disabled
              class="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-stone-200 text-stone-400 px-6 py-3 rounded-xl font-bold text-sm cursor-not-allowed"
            >
              <MessageCircle class="w-4 h-4" />
              <span class="lg:hidden xl:inline">Sin Teléfono</span>
            </button>
            
            <div class="flex gap-2">
              <button 
                v-if="appointment.status === 'pending'"
                @click="cancelAppointment(appointment.id)"
                title="Cancelar cita"
                class="p-3 rounded-xl bg-stone-50 text-stone-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all border border-stone-100"
              >
                <XCircle class="w-5 h-5" />
              </button>

              <button 
                v-if="appointment.status === 'pending'"
                @click="completeAppointment(appointment.id)"
                title="Marcar como completada"
                class="p-3 rounded-xl bg-stone-50 text-stone-400 hover:bg-stone-800 hover:text-white transition-all border border-stone-100"
              >
                <CheckCheck class="w-5 h-5" />
              </button>

              <button 
                @click="deleteAppointment(appointment.id)"
                title="Eliminar cita"
                class="p-3 rounded-xl bg-stone-50 text-stone-400 hover:bg-gray-100 hover:text-gray-600 transition-all border border-stone-100"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <!-- Pagination Controls -->
        <div v-if="filteredAppointments.length > itemsPerPage" class="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-stone-100">
          <span class="text-sm text-stone-500 font-medium">
            Mostrando {{ (currentPage - 1) * itemsPerPage + 1 }} - {{ Math.min(currentPage * itemsPerPage, filteredAppointments.length) }} de {{ filteredAppointments.length }} resultados
          </span>
          <div class="flex gap-2">
            <button 
              @click="prevPage" 
              :disabled="currentPage === 1"
              class="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
            >
              <ChevronLeft class="w-5 h-5 text-stone-600" />
            </button>
            <button 
              @click="nextPage" 
              :disabled="currentPage === totalPages"
              class="p-2.5 rounded-xl border border-stone-200 hover:bg-stone-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-white"
            >
              <ChevronRight class="w-5 h-5 text-stone-600" />
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Cancel Confirmation Modal -->
    <div v-if="showCancelModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-2xl max-w-sm w-[95%] p-6 shadow-2xl border border-stone-100 relative animate-in fade-in zoom-in duration-200">
        <div class="text-center">
          <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle class="w-6 h-6 text-red-500" />
          </div>
          <h3 class="text-xl font-serif font-bold text-stone-800 mb-2">Cancelar Cita</h3>
          <p class="text-stone-500 text-sm mb-6 leading-relaxed">¿Estás seguro que deseas cancelar esta cita? Quedará registrada como cancelada.</p>
          
          <div class="flex gap-3">
            <button @click="showCancelModal = false" class="flex-1 py-3 rounded-xl font-bold text-sm text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
              Volver
            </button>
            <button @click="confirmCancel" class="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-100">
              Sí, Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Appointment Confirmation Modal -->
    <div v-if="showDeleteAppointmentModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-2xl max-w-sm w-[95%] p-6 shadow-2xl border border-stone-100 relative animate-in fade-in zoom-in duration-200">
        <div class="text-center">
          <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 class="w-6 h-6 text-red-500" />
          </div>
          <h3 class="text-xl font-serif font-bold text-stone-800 mb-2">Eliminar Cita</h3>
          <p class="text-stone-500 text-sm mb-6 leading-relaxed">¿Estás seguro de que deseas eliminar permanentemente esta cita? Esta acción no se puede deshacer.</p>
          
          <div class="flex gap-3">
            <button @click="showDeleteAppointmentModal = false" class="flex-1 py-3 rounded-xl font-bold text-sm text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
              Cancelar
            </button>
            <button @click="confirmDeleteAppointment" class="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-100">
              Sí, Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Services Management Modal -->
    <div v-if="showServicesModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-2xl max-w-4xl w-[95%] p-4 md:p-6 shadow-2xl border border-stone-100 relative animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-xl font-serif font-bold text-stone-800">Catálogo de Servicios</h3>
            <p class="text-sm text-stone-500">Edita precios, duración y disponibilidad.</p>
          </div>
          <button @click="showServicesModal = false" class="p-2 hover:bg-stone-100 rounded-full"><X class="w-5 h-5" /></button>
        </div>

        <!-- Add New Service Form -->
        <div class="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-100">
          <div class="flex flex-col md:flex-row gap-4 items-end">
            <div class="flex-grow w-full">
              <label class="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 block">Nombre del Servicio</label>
              <input type="text" v-model="newService.name" placeholder="Ej: Corte de Cabello" class="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-100 outline-none font-medium">
            </div>
            <div class="w-full md:w-32">
              <label class="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 block">Precio</label>
              <input type="number" v-model="newService.price" placeholder="0" class="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-100 outline-none font-medium">
            </div>
            <div class="w-full md:w-24">
              <label class="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-1 block">Minutos</label>
              <input type="number" v-model="newService.duration_min" placeholder="60" class="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:ring-2 focus:ring-rose-100 outline-none font-medium">
            </div>
            <button @click="createService" class="w-full md:w-auto px-4 py-2 bg-stone-800 text-white rounded-lg font-bold text-sm hover:bg-stone-900 transition-colors shadow-sm flex items-center justify-center gap-2 h-[38px]">
              <Plus class="w-4 h-4" /> <span class="hidden md:inline">Agregar</span>
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-100">
                <th class="pb-3 pl-2">Nombre</th>
                <th class="pb-3">Precio ($)</th>
                <th class="pb-3">Duración (min)</th>
                <th class="pb-3 text-center">Estado</th>
                <th class="pb-3 text-right pr-2">Acciones</th>
              </tr>
            </thead>
            <tbody class="text-sm">
              <tr v-for="service in servicesList" :key="service.id" class="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                <td class="py-4 pl-2 font-medium text-stone-800">
                  <input type="text" v-model="service.name" class="w-full p-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-100 outline-none text-stone-700 font-bold">
                </td>
                <td class="py-4">
                  <input type="number" v-model="service.price" class="w-24 p-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-100 outline-none font-bold text-stone-600">
                </td>
                <td class="py-4">
                  <input type="number" v-model="service.duration_min" class="w-20 p-2 bg-white border border-stone-200 rounded-lg focus:ring-2 focus:ring-rose-100 outline-none text-stone-600">
                </td>
                <td class="py-4 text-center">
                  <button 
                    @click="toggleServiceActive(service)"
                    :class="[
                      'px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all',
                      service.active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    ]"
                  >
                    {{ service.active ? 'Activo' : 'Inactivo' }}
                  </button>
                </td>
                <td class="py-4 text-right pr-2 flex items-center justify-end gap-2">
                  <button @click="saveService(service)" class="p-2 bg-stone-800 text-white rounded-lg hover:bg-stone-900 transition-colors shadow-sm" title="Guardar cambios">
                    <Save class="w-4 h-4" />
                  </button>
                  <button @click="deleteService(service.id)" class="p-2 bg-white border border-red-100 text-red-500 rounded-lg hover:bg-red-50 transition-colors shadow-sm" title="Eliminar servicio">
                    <Trash2 class="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Delete Service Confirmation Modal -->
    <div v-if="showDeleteServiceModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-2xl max-w-sm w-[95%] p-6 shadow-2xl border border-stone-100 relative animate-in fade-in zoom-in duration-200">
        <div class="text-center">
          <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Trash2 class="w-6 h-6 text-red-500" />
          </div>
          <h3 class="text-xl font-serif font-bold text-stone-800 mb-2">Eliminar Servicio</h3>
          <p class="text-stone-500 text-sm mb-6 leading-relaxed">¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.</p>
          
          <div class="flex gap-3">
            <button @click="showDeleteServiceModal = false" class="flex-1 py-3 rounded-xl font-bold text-sm text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
              Cancelar
            </button>
            <button @click="confirmDeleteService" class="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-colors shadow-lg shadow-red-100">
              Sí, Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Business Hours Modal -->
    <div v-if="showHoursModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-2xl max-w-2xl w-[95%] p-4 md:p-6 shadow-2xl border border-stone-100 relative animate-in fade-in zoom-in duration-200 max-h-[85vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h3 class="text-xl font-serif font-bold text-stone-800">Horarios de Atención</h3>
            <p class="text-sm text-stone-500">Define qué días y a qué horas pueden reservar tus clientes.</p>
          </div>
          <button @click="showHoursModal = false" class="p-2 hover:bg-stone-100 rounded-full"><X class="w-5 h-5" /></button>
        </div>

        <div class="space-y-3 pb-4">
          <div v-for="day in businessHours" :key="day.id" :class="['flex flex-col sm:flex-row items-stretch sm:items-center justify-between p-4 rounded-xl border transition-colors gap-3 sm:gap-4', day.is_closed ? 'bg-stone-50 border-stone-100 opacity-75' : 'bg-white border-stone-200']">
            
            <div class="flex items-center justify-between sm:justify-start gap-4 sm:w-32">
              <div class="flex items-center gap-2">
                <div :class="['w-3 h-3 rounded-full', day.is_closed ? 'bg-stone-300' : 'bg-green-500']"></div>
                <span class="font-bold text-stone-700 capitalize">{{ getDayName(day.day_of_week) }}</span>
              </div>
              <span v-if="day.is_closed" class="sm:hidden text-xs font-bold text-stone-400">CERRADO</span>
            </div>

            <div class="flex-grow flex items-center justify-center">
              <div v-if="!day.is_closed" class="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <input type="time" v-model="day.open_time" class="w-full sm:w-auto p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold text-stone-600 focus:ring-2 focus:ring-rose-100 outline-none text-center">
                <span class="text-stone-400 hidden sm:inline">-</span>
                <input type="time" v-model="day.close_time" class="w-full sm:w-auto p-2 bg-stone-50 border border-stone-200 rounded-lg text-sm font-bold text-stone-600 focus:ring-2 focus:ring-rose-100 outline-none text-center">
              </div>
              <div v-else class="hidden sm:block text-sm font-bold text-stone-400 px-4">CERRADO</div>
            </div>

            <div class="flex items-center justify-end sm:justify-start">
              <button 
                @click="toggleDayClosed(day)"
                :class="['w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-lg text-xs font-bold transition-colors', day.is_closed ? 'bg-stone-200 text-stone-500 hover:bg-stone-300' : 'bg-rose-100 text-rose-600 hover:bg-rose-200']"
              >
                {{ day.is_closed ? 'Abrir Horario' : 'Cerrar Día' }}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-6 flex justify-end">
          <button @click="saveBusinessHours" class="flex items-center gap-2 px-6 py-3 bg-stone-900 text-white rounded-xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg">
            <Save class="w-4 h-4" /> Guardar Horarios
          </button>
        </div>
      </div>
    </div>

    <!-- Reminders Modal -->
    <div v-if="showRemindersModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-2xl max-w-2xl w-[95%] p-6 shadow-2xl border border-stone-100 relative animate-in fade-in zoom-in duration-200 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-xl font-serif font-bold text-stone-800">Recordatorios para Mañana</h3>
          <button @click="showRemindersModal = false" class="p-2 hover:bg-stone-100 rounded-full"><X class="w-5 h-5" /></button>
        </div>
        
        <div v-if="tomorrowAppointments.length === 0" class="text-center py-10 text-stone-500">
          No hay citas programadas para mañana.
        </div>

        <div v-else class="space-y-3">
          <div v-for="apt in tomorrowAppointments" :key="apt.id" class="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
            <div>
              <p class="font-bold text-stone-800">{{ apt.guest_name || apt.profiles?.full_name }}</p>
              <p class="text-xs text-stone-500">{{ getTime(apt.appointment_date) }} - {{ apt.services?.name }}</p>
              
              <!-- Estado del Envío de Correo -->
              <div class="mt-1.5">
                <template v-if="apt.emailStatus">
                <span v-if="['sent', 'already_sent'].includes(apt.emailStatus.status)" class="inline-flex items-center gap-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                  <Check class="w-3 h-3" /> Enviado a {{ apt.emailStatus.email }}
                </span>
                <span v-else-if="apt.emailStatus.status === 'skipped'" class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                  <AlertCircle class="w-3 h-3" /> {{ translateReason(apt.emailStatus.reason) }}
                </span>
                <span v-else class="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-100">
                  <XCircle class="w-3 h-3" /> Error: {{ apt.emailStatus.error?.message || 'Desconocido' }}
                </span>
                </template>
                <span v-else class="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full border border-gray-200">
                  <Clock class="w-3 h-3" /> Sin estado (Verifica despliegue)
                </span>
              </div>
            </div>
            <a 
              :href="generateReminderLink(apt)"
              target="_blank"
              class="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg text-xs font-bold hover:bg-green-600 transition-colors"
            >
              <MessageCircle class="w-3 h-3" /> Enviar Wpp
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { supabase } from '../supabase'
import { 
  ShieldCheck, MessageCircle, CheckCheck, 
  Trash2, Loader2, CalendarX2, Sparkles, User,
  Clock, CalendarCheck2, Phone, XCircle, Search, FileDown, ChevronLeft, ChevronRight, BellRing, X,
  Check, AlertCircle, Briefcase, Save, Plus
} from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const appointments = ref([])
const servicesList = ref([]) // Lista para el modal de servicios
const businessHours = ref([]) // Lista para el modal de horarios
const loading = ref(true)
const newService = ref({ name: '', price: '', duration_min: 60 })
const showCancelModal = ref(false)
const showDeleteServiceModal = ref(false)
const serviceToDelete = ref(null)
const showServicesModal = ref(false)
const showHoursModal = ref(false)
const showRemindersModal = ref(false)
const tomorrowAppointments = ref([])
const appointmentToCancel = ref(null)
const showDeleteAppointmentModal = ref(false)
const appointmentToDelete = ref(null)
const currentFilter = ref('today')
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10
const toast = useToast()

const filters = [
  { label: 'Hoy', value: 'today' },
  { label: 'Esta Semana', value: 'week' },
  { label: 'Este Mes', value: 'month' },
  { label: 'Todas', value: 'all' }
]

const pendingCount = computed(() => appointments.value.filter(a => a.status === 'pending').length)
const cancelledCount = computed(() => appointments.value.filter(a => a.status === 'cancelled').length)

const fetchAppointments = async (filter = currentFilter.value, search = searchQuery.value) => {
  try {
    loading.value = true
    
    let query = supabase
      .from('appointments')
      .select(`
        *,
        profiles (full_name, phone, avatar_url),
        services (name, price)
      `)
      .order('appointment_date', { ascending: true })
    
    if (search) {
      // Búsqueda Server-Side: Busca en nombre o teléfono del invitado
      // Esto es mucho más eficiente para grandes volúmenes de datos
      query = query.or(`guest_name.ilike.%${search}%,guest_phone.ilike.%${search}%`)
    } else {
      // Aplicar filtros de fecha solo si no se está buscando
      const now = new Date()
      const todayStr = now.toISOString().split('T')[0]
      
      if (filter === 'today') {
        query = query
          .gte('appointment_date', `${todayStr}T00:00:00`)
          .lte('appointment_date', `${todayStr}T23:59:59`)
      } else if (filter === 'week') {
        const firstDay = new Date(now.setDate(now.getDate() - now.getDay())) // Domingo
        const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6))
        query = query
          .gte('appointment_date', firstDay.toISOString())
          .lte('appointment_date', lastDay.toISOString())
      } else if (filter === 'month') {
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        query = query
          .gte('appointment_date', firstDay.toISOString())
          .lte('appointment_date', lastDay.toISOString())
      }
    }

    const { data, error } = await query

    if (error) throw error
    appointments.value = data
  } catch (error) {
    toast.error('Error al cargar la agenda: ' + error.message)
  } finally {
    loading.value = false
  }
}

// Watch para recargar cuando cambia el filtro
watch(currentFilter, (newFilter) => {
  fetchAppointments(newFilter, searchQuery.value)
  currentPage.value = 1 // Resetear página al filtrar
})

// Watch con Debounce para búsqueda en servidor
let searchTimeout = null
watch(searchQuery, (newQuery) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  
  searchTimeout = setTimeout(() => {
    currentPage.value = 1
    if (newQuery && currentFilter.value !== 'all') {
      currentFilter.value = 'all'
    }
    fetchAppointments(currentFilter.value, newQuery)
  }, 500) // Esperar 500ms después de que dejes de escribir
})

// Helpers de fecha
const getMonth = (dateStr) => new Date(dateStr).toLocaleString('es-ES', { month: 'short' }).replace('.', '')
const getDay = (dateStr) => new Date(dateStr).getDate()
const getTime = (dateStr) => new Date(dateStr).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('es-ES', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const translateStatus = (status) => {
  const map = { pending: 'Pendiente', completed: 'Completada', cancelled: 'Cancelada' }
  return map[status] || status
}

const filteredAppointments = computed(() => appointments.value)

// Paginación Computada
const totalPages = computed(() => Math.ceil(filteredAppointments.value.length / itemsPerPage))

const paginatedAppointments = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredAppointments.value.slice(start, end)
})

const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}

const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}

// Exportar a CSV
const exportToCSV = () => {
  const headers = ['Fecha', 'Hora', 'Cliente', 'Teléfono', 'Servicio', 'Precio', 'Estado']
  const rows = filteredAppointments.value.map(apt => [
    new Date(apt.appointment_date).toLocaleDateString('es-ES'),
    new Date(apt.appointment_date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    apt.guest_name || apt.profiles?.full_name || 'Anónimo',
    apt.guest_phone || apt.profiles?.phone || 'Sin teléfono',
    apt.services?.name || 'Servicio eliminado',
    apt.services?.price || 0,
    translateStatus(apt.status)
  ])

  // Usamos punto y coma (;) para compatibilidad con Excel en español y comillas para evitar errores
  const csvContent = [headers, ...rows]
    .map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(';'))
    .join('\n')

  const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `Reporte_Citas_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
}

// --- Lógica de Gestión de Servicios ---
const fetchServices = async () => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('id')
    
    if (error) throw error
    servicesList.value = data
  } catch (e) {
    toast.error('Error al cargar servicios: ' + e.message)
  }
}

const openServicesModal = async () => {
  await fetchServices()
  showServicesModal.value = true
}

const toggleServiceActive = (service) => {
  service.active = !service.active
}

const saveService = async (service) => {
  try {
    const { error } = await supabase
      .from('services')
      .update({ 
        name: service.name,
        price: service.price,
        duration_min: service.duration_min,
        active: service.active
      })
      .eq('id', service.id)

    if (error) throw error
    toast.success(`Servicio "${service.name}" actualizado correctamente.`)
  } catch (e) {
    toast.error('Error al guardar: ' + e.message)
  }
}

const createService = async () => {
  try {
    if (!newService.value.name || !newService.value.price) {
      toast.error('Por favor completa el nombre y precio')
      return
    }

    const { error } = await supabase.from('services').insert({
      name: newService.value.name,
      price: newService.value.price,
      duration_min: newService.value.duration_min,
      active: true
    })

    if (error) throw error
    
    toast.success('Servicio agregado exitosamente')
    newService.value = { name: '', price: '', duration_min: 60 }
    fetchServices()
  } catch (e) {
    toast.error('Error al crear: ' + e.message)
  }
}

const deleteService = (id) => {
  serviceToDelete.value = id
  showDeleteServiceModal.value = true
}

const confirmDeleteService = async () => {
  if (!serviceToDelete.value) return

  try {
    const { error } = await supabase.from('services').delete().eq('id', serviceToDelete.value)
    if (error) throw error
    
    toast.success('Servicio eliminado correctamente')
    fetchServices() // Recargar la lista
  } catch (e) {
    toast.error('Error al eliminar: ' + e.message)
  } finally {
    showDeleteServiceModal.value = false
    serviceToDelete.value = null
  }
}

// --- Lógica de Gestión de Horarios ---
const openHoursModal = async () => {
  try {
    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .order('day_of_week')
    
    if (error) throw error
    businessHours.value = data
    showHoursModal.value = true
  } catch (e) {
    toast.error('Error al cargar horarios: ' + e.message)
  }
}

const getDayName = (dayIndex) => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[dayIndex]
}

const toggleDayClosed = (day) => {
  day.is_closed = !day.is_closed
}

const saveBusinessHours = async () => {
  try {
    const updates = businessHours.value.map(day => ({
      id: day.id,
      day_of_week: day.day_of_week,
      open_time: day.open_time,
      close_time: day.close_time,
      is_closed: day.is_closed
    }))

    const { error } = await supabase.from('business_hours').upsert(updates)
    if (error) throw error
    toast.success('Horarios actualizados correctamente.')
    showHoursModal.value = false
  } catch (e) {
    toast.error('Error al guardar horarios: ' + e.message)
  }
}

const checkReminders = async () => {
  try {
    loading.value = true
    
    // 1. REFRESCAR SESIÓN: Forzamos un token nuevo para evitar el error "Invalid JWT"
    const { data: { session }, error: sessionError } = await supabase.auth.refreshSession()
    
    if (sessionError || !session) {
      // Si falla el refresh, intentamos obtener la sesión actual como respaldo
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) {
        toast.error('Sesión expirada. Por favor inicia sesión nuevamente.')
        return
      }
    }

    // Obtener la sesión más reciente (sea del refresh o la actual)
    const { data: { session: activeSession } } = await supabase.auth.getSession()

    // 2. Usar fetch directo para asegurar el envío de headers (Bypass de supabase.functions.invoke)
    // El Gateway de Supabase requiere 'apikey' (Anon Key) Y 'Authorization' (Bearer Token)
    const response = await fetch(`${supabase.supabaseUrl}/functions/v1/recordatorio-citas`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${activeSession.access_token}`,
        'apikey': supabase.supabaseKey,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errText = await response.text()
      
      // Manejo específico para el error de JWT
      if (response.status === 401 && errText.includes('Invalid JWT')) {
        throw new Error('El sistema de seguridad rechazó el token. Intenta cerrar sesión y volver a entrar.')
      }
      
      throw new Error(`Error ${response.status}: ${errText}`)
    }

    const data = await response.json()
    
    // 4. Procesar respuesta exitosa
    if (data && data.success) {
      const resultsMap = new Map(data.results?.map(r => [r.id, r]) || [])
      
      tomorrowAppointments.value = (data.appointments || []).map(apt => ({
        ...apt,
        emailStatus: resultsMap.get(apt.id)
      }))
      
      showRemindersModal.value = true
      
      const sentCount = data.results?.filter(r => r.status === 'sent').length || 0
      const skippedCount = data.results?.filter(r => r.status === 'skipped').length || 0
      
      if (sentCount > 0) toast.success(`${sentCount} correo(s) enviado(s) exitosamente.`)
      if (skippedCount > 0) toast.info(`${skippedCount} cita(s) omitida(s) (sin email o configuración faltante).`)
      if (sentCount === 0 && skippedCount === 0 && data.appointments?.length === 0) {
        toast.info('No hay citas programadas para mañana.')
      }
    } else {
      toast.error('La función no devolvió una respuesta válida.')
    }
  } catch (e) {
    console.error('Error inesperado:', e)
    toast.error('Error inesperado: ' + e.message)
  } finally {
    loading.value = false
  }
}

const generateReminderLink = (apt) => {
  const rawPhone = apt.guest_phone || apt.profiles?.phone || ''
  const phone = rawPhone.replace(/\D/g, '')
  const name = apt.guest_name || apt.profiles?.full_name || 'Clienta'
  const time = getTime(apt.appointment_date)
  const text = encodeURIComponent(`Hola ${name} 👋, te recordamos tu cita en Beauty Studio para mañana a las ${time}. ¡Te esperamos! ✨`)
  return `https://wa.me/${phone}?text=${text}`
}

const translateReason = (reason) => {
  if (reason?.includes('No email')) return 'Falta Email en Perfil'
  if (reason?.includes('API Key')) return 'Falta API Key de Resend'
  return reason
}

const generateWhatsAppLink = (apt) => {
  const rawPhone = apt.guest_phone || apt.profiles?.phone || ''
  // Limpiar el teléfono (dejar solo números) para evitar errores en la API de WhatsApp
  const phone = rawPhone.replace(/\D/g, '')
  const name = apt.guest_name || apt.profiles?.full_name || 'Clienta'
  const service = apt.services?.name || 'Servicio'
  const date = formatDate(apt.appointment_date)
  
  const text = encodeURIComponent(`Hola ${name}, te escribo de Beauty Studio para confirmar tu cita de *${service}* el día *${date}*. ✨`)
  return `https://wa.me/${phone}?text=${text}`
}

const completeAppointment = async (id) => {
  // 1. Verificación de seguridad: Consultar estado actual antes de actuar
  const { data: currentApt } = await supabase
    .from('appointments')
    .select('status')
    .eq('id', id)
    .single()

  if (currentApt && currentApt.status === 'cancelled') {
    toast.error('⚠️ No se puede completar: El cliente acaba de cancelar esta cita.')
    fetchAppointments() // Actualizar visualmente
    return
  }

  // 2. Proceder con la actualización
  const { error } = await supabase
    .from('appointments')
    .update({ status: 'completed' })
    .eq('id', id)
  
  if (!error) {
    toast.success('Cita marcada como completada')
    fetchAppointments()
  } else {
    toast.error('Error al actualizar: ' + error.message)
  }
}

const cancelAppointment = (id) => {
  appointmentToCancel.value = id
  showCancelModal.value = true
}

const confirmCancel = async () => {
  if (!appointmentToCancel.value) return

  // 1. Verificación de seguridad
  const { data: currentApt } = await supabase
    .from('appointments')
    .select('status')
    .eq('id', appointmentToCancel.value)
    .single()

  if (currentApt && currentApt.status !== 'pending') {
    toast.error(`⚠️ El estado de la cita ha cambiado a "${translateStatus(currentApt.status)}".`)
    fetchAppointments()
    showCancelModal.value = false
    return
  }

  const { error } = await supabase
    .from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', appointmentToCancel.value)
  
  if (!error) {
    fetchAppointments()
    toast.success('Cita cancelada correctamente')
    showCancelModal.value = false
    appointmentToCancel.value = null
  }
}

const deleteAppointment = (id) => {
  appointmentToDelete.value = id
  showDeleteAppointmentModal.value = true
}

const confirmDeleteAppointment = async () => {
  if (!appointmentToDelete.value) return

  try {
    const { error } = await supabase.from('appointments').delete().eq('id', appointmentToDelete.value)
    if (error) throw error
    toast.success('Cita eliminada permanentemente')
    fetchAppointments()
  } catch (e) {
    toast.error('Error al eliminar: ' + e.message)
  } finally {
    showDeleteAppointmentModal.value = false
    appointmentToDelete.value = null
  }
}

// --- Realtime Subscription ---
let realtimeChannel = null

onMounted(() => {
  fetchAppointments()

  // Suscribirse a cambios en la tabla 'appointments'
  realtimeChannel = supabase
    .channel('admin-appointments')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments' }, (payload) => {
      if (payload.eventType === 'INSERT') {
        toast.success('¡Nueva cita recibida!')
      } else if (payload.eventType === 'UPDATE') {
      }
      fetchAppointments() // Recargar la lista automáticamente
    })
    .subscribe()
})

onUnmounted(() => {
  if (realtimeChannel) supabase.removeChannel(realtimeChannel)
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
    display: none;
}
.scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
</style>