<!-- src/components/UserProfile.vue -->
<template>
  <div class="max-w-2xl mx-auto px-4 py-12 min-h-screen">
    <div class="mb-10 text-center">
      <h2 class="text-3xl md:text-4xl font-serif font-bold text-stone-800 mb-2">Mi Perfil</h2>
      <p class="text-stone-500">Mantén tu información actualizada.</p>
    </div>

    <div class="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-100 relative overflow-hidden">
      <!-- Decoración -->
      <div class="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-[100px] -z-0"></div>

      <div class="relative z-10 space-y-8">
        
        <!-- Avatar Upload -->
        <div class="flex flex-col items-center">
          <div class="relative group cursor-pointer" @click="triggerFileInput">
            <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-stone-100">
              <img v-if="profile.avatar_url" :src="profile.avatar_url" class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex items-center justify-center text-stone-300">
                <User class="w-12 h-12" />
              </div>
            </div>
            <div class="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera class="w-8 h-8 text-white" />
            </div>
            <div v-if="uploading" class="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center">
              <Loader2 class="w-8 h-8 text-rose-500 animate-spin" />
            </div>
          </div>
          <p class="text-xs text-stone-400 mt-3 font-medium">Toca para cambiar foto</p>
          <input type="file" ref="fileInput" class="hidden" accept="image/*" @change="uploadAvatar" />
        </div>

        <!-- Formulario -->
        <div class="space-y-5">
          <div>
            <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 ml-1">Nombre Completo</label>
            <div class="relative">
              <User class="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
              <input 
                v-model="profile.full_name" 
                type="text" 
                class="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all font-medium text-stone-700"
              >
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 ml-1">Teléfono (WhatsApp)</label>
            <div class="relative">
              <Phone class="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
              <input 
                v-model="profile.phone" 
                type="tel" 
                class="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:ring-2 focus:ring-rose-200 focus:border-rose-300 outline-none transition-all font-medium text-stone-700"
              >
            </div>
          </div>

          <div>
            <label class="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 ml-1">Correo Electrónico</label>
            <div class="relative">
              <Mail class="w-4 h-4 text-stone-400 absolute left-4 top-3.5" />
              <input 
                v-model="email" 
                type="email" 
                disabled
                class="w-full pl-10 pr-4 py-3 bg-stone-100 border border-stone-200 rounded-xl text-stone-500 cursor-not-allowed"
              >
            </div>
            <p class="text-[10px] text-stone-400 mt-1 ml-1">El correo no se puede cambiar.</p>
          </div>
        </div>

        <button 
          @click="updateProfile" 
          :disabled="saving"
          class="w-full bg-stone-900 text-white py-4 rounded-xl font-bold text-sm hover:bg-stone-800 transition-all shadow-lg shadow-stone-200 flex items-center justify-center gap-2"
        >
          <Loader2 v-if="saving" class="w-4 h-4 animate-spin" />
          <span>{{ saving ? 'Guardando...' : 'Guardar Cambios' }}</span>
        </button>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'
import { User, Phone, Mail, Camera, Loader2 } from 'lucide-vue-next'
import { useToast } from '../composables/useToast'

const profile = ref({ full_name: '', phone: '', avatar_url: '' })
const email = ref('')
const loading = ref(true)
const saving = ref(false)
const uploading = ref(false)
const fileInput = ref(null)
const toast = useToast()

const getProfile = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    email.value = user.email

    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, phone, avatar_url')
      .eq('id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (data) profile.value = data
  } catch (error) {
    toast.error('Error cargando perfil')
  } finally {
    loading.value = false
  }
}

const updateProfile = async () => {
  try {
    saving.value = true
    const { data: { user } } = await supabase.auth.getUser()
    
    const updates = {
      id: user.id,
      full_name: profile.value.full_name,
      phone: profile.value.phone,
      avatar_url: profile.value.avatar_url,
      updated_at: new Date()
    }

    const { error } = await supabase.from('profiles').upsert(updates)
    if (error) throw error
    
    toast.success('Perfil actualizado correctamente')
  } catch (error) {
    toast.error('Error al guardar: ' + error.message)
  } finally {
    saving.value = false
  }
}

const triggerFileInput = () => fileInput.value.click()

const uploadAvatar = async (event) => {
  try {
    uploading.value = true
    const file = event.target.files[0]
    if (!file) return

    const { data: { user } } = await supabase.auth.getUser()
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/${Math.random()}.`

    // 1. Subir archivo
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, { upsert: true })

    if (uploadError) throw uploadError

    // 2. Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    // 3. Actualizar estado local y guardar en DB
    profile.value.avatar_url = publicUrl
    await updateProfile()
    
  } catch (error) {
    toast.error('Error subiendo imagen: ' + error.message)
  } finally {
    uploading.value = false
  }
}

onMounted(getProfile)
</script>
