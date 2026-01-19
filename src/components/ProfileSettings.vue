<template>
  <div class="max-w-5xl mx-auto p-6 md:p-10 min-h-[80vh]">
    <!-- Header -->
    <div class="mb-10 text-center md:text-left">
      <h2 class="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-2">Mi Perfil</h2>
      <p class="text-stone-500 font-light text-lg">Gestiona tu información personal y preferencias de contacto.</p>
    </div>

    <div class="grid md:grid-cols-12 gap-8">
      
      <!-- Sidebar / Avatar Card -->
      <div class="md:col-span-4 lg:col-span-3">
        <div class="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-100 flex flex-col items-center text-center relative overflow-hidden group">
          
          <!-- Avatar Circle -->
          <div class="relative w-32 h-32 mb-6">
            <div class="w-full h-full rounded-full overflow-hidden border-4 border-stone-50 shadow-inner bg-stone-100 flex items-center justify-center">
              <img 
                v-if="profile.avatar_url" 
                :src="profile.avatar_url" 
                class="w-full h-full object-cover"
                alt="Avatar"
              />
              <User v-else class="w-12 h-12 text-stone-300" />
            </div>
            
            <!-- Upload Button Overlay -->
            <label class="absolute inset-0 bg-stone-900/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <Camera class="w-8 h-8 text-white" />
              <input 
                type="file" 
                accept="image/*" 
                class="hidden" 
                @change="handleAvatarUpload"
                :disabled="uploading"
              >
            </label>
            
            <div v-if="uploading" class="absolute inset-0 bg-white/80 flex items-center justify-center rounded-full">
              <Loader2 class="w-8 h-8 text-rose-500 animate-spin" />
            </div>
          </div>

          <h3 class="font-bold text-stone-800 text-lg truncate w-full">{{ profile.full_name || 'Usuario' }}</h3>
          <p class="text-sm text-stone-500 font-medium mt-1">{{ userEmail }}</p>
          
          <div class="mt-6 w-full pt-6 border-t border-stone-100">
            <p class="text-xs text-stone-400 mb-2">Rol de cuenta</p>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              :class="profile.role === 'admin' ? 'bg-rose-50 text-rose-600' : 'bg-stone-100 text-stone-500'">
              <Shield v-if="profile.role === 'admin'" class="w-3 h-3" />
              {{ profile.role === 'admin' ? 'Administrador' : 'Cliente' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Main Form -->
      <div class="md:col-span-8 lg:col-span-9">
        <div class="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-stone-100 h-full">
          <h3 class="font-serif font-bold text-xl text-stone-800 mb-8 flex items-center gap-2">
            <Sparkles class="w-5 h-5 text-rose-400" /> Información Personal
          </h3>

          <form @submit.prevent="updateProfile" class="space-y-6 max-w-2xl">
            
            <!-- Nombre -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Nombre Completo</label>
              <div class="relative">
                <User class="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
                <input 
                  v-model="profile.full_name"
                  type="text" 
                  class="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none transition-all font-medium text-stone-700"
                  placeholder="Tu nombre completo"
                >
              </div>
            </div>

            <!-- Teléfono -->
            <div class="space-y-2">
              <label class="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">WhatsApp / Teléfono</label>
              <div class="relative">
                <Phone class="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
                <input 
                  v-model="profile.phone"
                  type="tel" 
                  class="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-rose-100 focus:border-rose-300 outline-none transition-all font-medium text-stone-700"
                  placeholder="+57 300 123 4567"
                >
              </div>
              <p class="text-[10px] text-stone-400 ml-1">Este número será usado para confirmar tus citas.</p>
            </div>

            <!-- Email (Read Only) -->
            <div class="space-y-2 opacity-60">
              <label class="text-xs font-bold text-stone-500 uppercase tracking-wider ml-1">Correo Electrónico</label>
              <div class="relative">
                <Mail class="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
                <input 
                  :value="userEmail"
                  type="email" 
                  disabled
                  class="w-full pl-12 pr-4 py-3 bg-stone-100 border border-stone-200 rounded-xl font-medium text-stone-500 cursor-not-allowed"
                >
              </div>
            </div>

            <!-- Actions -->
            <div class="pt-6 flex items-center gap-4">
              <button 
                type="submit" 
                :disabled="saving"
                class="px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-stone-200 flex items-center gap-2 disabled:opacity-70"
              >
                <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
                <span>{{ saving ? 'Guardando...' : 'Guardar Cambios' }}</span>
              </button>
              
              <transition enter-active-class="duration-300 ease-out" enter-from-class="opacity-0 translate-x-2">
                <span v-if="message" class="text-sm font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle class="w-4 h-4" /> {{ message }}
                </span>
              </transition>
            </div>

          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { User, Phone, Mail, Camera, Loader2, Shield, Sparkles, CheckCircle } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const emit = defineEmits(['update'])
const profile = ref({ full_name: '', phone: '', avatar_url: '', role: 'client' })
const userEmail = ref('')
const uploading = ref(false)
const saving = ref(false)
const message = ref('')
const toast = useToast()

const getProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    userEmail.value = user.email
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    if (data) profile.value = { ...profile.value, ...data }
  }
}

const updateProfile = async () => {
  saving.value = true
  message.value = ''
  try {
    const { data: { user } } = await supabase.auth.getUser()
    const updates = {
      id: user.id,
      full_name: profile.value.full_name,
      phone: profile.value.phone,
      avatar_url: profile.value.avatar_url,
      updated_at: new Date().toISOString(),
    }

    const { error } = await supabase.from('profiles').upsert(updates)
    if (error) throw error
    message.value = 'Perfil actualizado correctamente'
    emit('update')
    toast.success('Perfil actualizado correctamente')
    setTimeout(() => message.value = '', 3000)
  } catch (error) {
    toast.error('Error al actualizar perfil: ' + error.message)
  } finally {
    saving.value = false
  }
}

const handleAvatarUpload = async (event) => {
  const file = event.target.files[0]
  if (!file) return

  uploading.value = true
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No usuario autenticado')

    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}-${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    // 1. Subir imagen al bucket 'avatars'
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      })

    if (uploadError) throw uploadError

    // 2. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // 3. Actualizar estado local y guardar cambios
    profile.value.avatar_url = publicUrl
    await updateProfile()

  } catch (error) {
    console.error('Error subiendo imagen:', error)
    if (error.message && error.message.includes('Bucket not found')) {
      const { data: buckets } = await supabase.storage.listBuckets()
      console.log('📦 Buckets disponibles en tu proyecto:', buckets)
      toast.error('Error de configuración: Bucket "avatars" no encontrado.')
    } else {
      toast.error('Error al subir imagen: ' + error.message)
    }
  } finally {
    uploading.value = false
  }
}

onMounted(() => {
  getProfile()
})
</script>