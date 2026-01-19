<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from './supabase'
import { LogOut, User, Shield, LayoutDashboard, CalendarPlus, Home, Settings, Calendar, Sparkles, Heart, MapPin, Phone, Mail, Instagram, Facebook, ArrowRight, Menu, X } from 'lucide-vue-next'
import ToastContainer from './components/ToastContainer.vue'
import { useToast } from './composables/useToast'

const router = useRouter()
const route = useRoute()
const toast = useToast()

const user = ref(null)
const userRole = ref('client')
const userAvatar = ref(null)
const userName = ref('')
const loading = ref(true)
const showLogoutModal = ref(false)
const mobileMenuOpen = ref(false)

// --- Lógica de Inactividad (Timeout) ---
const INACTIVITY_LIMIT = 20 * 60 * 1000; // 2 minutos en milisegundos
let inactivityTimer = null

const resetInactivityTimer = () => {
  // Si no hay usuario logueado, no hacemos nada
  if (!user.value) return

  // Reiniciar el contador
  if (inactivityTimer) clearTimeout(inactivityTimer)
  
  inactivityTimer = setTimeout(async () => {
    // Solo cerramos sesión en Supabase. El onAuthStateChange manejará la redirección y limpieza.
    await supabase.auth.signOut()
    toast.info('Tu sesión se cerró por inactividad.')
  }, INACTIVITY_LIMIT)
}

const setupActivityListeners = () => {
  // Escuchar cualquier interacción del usuario para resetear el timer
  window.addEventListener('mousemove', resetInactivityTimer)
  window.addEventListener('click', resetInactivityTimer)
  window.addEventListener('keydown', resetInactivityTimer)
  window.addEventListener('scroll', resetInactivityTimer)
  window.addEventListener('touchstart', resetInactivityTimer)
}

const cleanupActivityListeners = () => {
  window.removeEventListener('mousemove', resetInactivityTimer)
  window.removeEventListener('click', resetInactivityTimer)
  window.removeEventListener('keydown', resetInactivityTimer)
  window.removeEventListener('scroll', resetInactivityTimer)
  window.removeEventListener('touchstart', resetInactivityTimer)
  if (inactivityTimer) clearTimeout(inactivityTimer)
}

const checkUser = async () => {
  try {
    const { data: { user: currentUser }, error } = await supabase.auth.getUser()
    
    if (error) throw error

    if (currentUser) {
      user.value = currentUser
      
      // Consultar rol del usuario
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name, avatar_url')
        .eq('id', currentUser.id)
        .single()
      
      if (profile) {
        userRole.value = profile.role || 'client'
        userAvatar.value = profile.avatar_url
        userName.value = profile.full_name || currentUser.user_metadata?.full_name || currentUser.email
      } else {
        userRole.value = 'client'
        userName.value = currentUser.user_metadata?.full_name || currentUser.email
      }
    } else {
      // Si no hay usuario (sesión inválida o expirada)
      handleSessionExpired()
    }
  } catch (e) {
    // Error verificando sesión (token expirado, revocado, etc)
    handleSessionExpired()
  } finally {
    loading.value = false
  }
}

const handleSessionExpired = () => {
  // Lista de rutas que requieren estar logueado
  const protectedRoutes = ['dashboard', 'profile', 'my-bookings']
  
  // Si estamos en una ruta protegida y falla la sesión, expulsar
  if (protectedRoutes.includes(route.name)) {
    user.value = null
    userRole.value = 'client'
    router.push('/login')
    toast.info('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
  }
}

const requestLogout = () => {
  showLogoutModal.value = true
}

const confirmLogout = async () => {
  try {
    await supabase.auth.signOut()
    // El listener onAuthStateChange manejará la redirección
    showLogoutModal.value = false
  } catch (error) {
  }
}

let authListener = null

onMounted(() => {
  checkUser()
  setupActivityListeners() // Iniciar escuchas de actividad
  
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
      // LIMPIEZA DE URL (Soporte para Implicit Flow y PKCE)
      const url = new URL(window.location.href)
      const hasToken = url.hash.includes('access_token')
      const hasCode = url.searchParams.has('code')

      if (hasToken || hasCode) {
        // Limpiar hash y query params de autenticación
        url.hash = ''
        url.searchParams.delete('code')
        window.history.replaceState(null, '', url.pathname + url.search)
      }
      checkUser()
    } else if (event === 'SIGNED_OUT') {
      // Capturamos el rol antes de limpiar el estado para decidir la redirección
      const wasAdmin = userRole.value === 'admin'

      // SOLUCIÓN 2: Forzar redirección al Login al cerrar sesión
      user.value = null
      userRole.value = 'client'
      userAvatar.value = null
      userName.value = ''
      
      // Usamos nextTick para esperar a que Vue actualice el estado antes de navegar
      nextTick(() => {
        if (route.path !== '/login') {
          // Si era Admin, redirigir al Login para reingreso rápido.
          // Si era Cliente, redirigir al Home para no ser intrusivos.
          if (wasAdmin) {
            router.push('/login')
          } else {
            router.push('/')
          }
        }
      })
    }
  })
  authListener = data
})

onUnmounted(() => {
  if (authListener) authListener.subscription.unsubscribe()
  cleanupActivityListeners() // Limpiar escuchas al salir
})

// Watch para activar/desactivar el timer según el estado de login
watch(user, (newUser) => {
  if (newUser) {
    resetInactivityTimer()
  } else {
    if (inactivityTimer) clearTimeout(inactivityTimer)
  }
})

// Cerrar menú móvil al cambiar de ruta
watch(route, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <!-- Global Toasts -->
  <ToastContainer />

  <!-- Loading Screen -->
  <div v-if="loading" class="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-purple-50">
    <div class="text-center space-y-4">
      <div class="animate-spin rounded-full h-16 w-16 border-4 border-pink-500 border-t-transparent mx-auto"></div>
      <p class="text-gray-600 font-semibold animate-pulse">Cargando Beauty Studio...</p>
    </div>
  </div>

  <!-- Main App Layout -->
  <div v-else class="min-h-screen bg-stone-50 overflow-x-hidden">
    
    <!-- Header/Navbar -->
    <header v-if="route.name !== 'login'" class="bg-white/90 backdrop-blur-md border-b border-stone-100 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          
          <!-- Logo -->
          <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/')">
            <div class="bg-stone-900 p-2.5 rounded-xl shadow-md transition-transform hover:scale-105">
              <Sparkles class="w-5 h-5 text-rose-200" />
            </div>
            <div>
              <h1 class="text-xl font-serif font-bold text-stone-800 tracking-tight">Beauty <span class="italic text-rose-500">Studio</span></h1>
              <p class="text-[10px] text-stone-500 font-bold uppercase tracking-widest">{{ userRole === 'admin' ? 'Panel Admin' : 'Agenda tu cita' }}</p>
            </div>
          </div>

          <!-- Navigation Menu -->
          <nav v-if="user" class="hidden md:flex items-center gap-2 mx-4">
            <button @click="router.push('/')" :class="['flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all', route.name === 'home' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900']">
              <Home class="w-4 h-4" /> <span>Inicio</span>
            </button>

            <template v-if="userRole === 'admin'">
              <button @click="router.push('/dashboard')" :class="['flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all', route.name === 'dashboard' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900']">
                <LayoutDashboard class="w-4 h-4" /> <span>Panel</span>
              </button>
            </template>

            <button @click="router.push('/booking')" :class="['flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all', route.name === 'booking' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900']">
              <CalendarPlus class="w-4 h-4" /> <span>{{ userRole === 'admin' ? 'Nueva Reserva' : 'Reservar' }}</span>
            </button>

            <template v-if="userRole === 'client'">
              <button @click="router.push('/my-bookings')" :class="['flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all', route.name === 'my-bookings' ? 'bg-stone-100 text-stone-900 shadow-sm' : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900']">
                <Calendar class="w-4 h-4" /> <span>Mis Reservas</span>
              </button>
            </template>
          </nav>

          <!-- User Menu -->
          <div v-if="user" class="flex items-center gap-2 md:gap-4">
            <div class="hidden md:flex items-center gap-3 bg-stone-50 px-4 py-2 rounded-xl border border-stone-100">
              <div class="bg-white p-1 rounded-lg shadow-sm h-8 w-8 flex items-center justify-center overflow-hidden">
                <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover rounded-md" />
                <User v-else class="w-4 h-4 text-stone-600" />
              </div>
              <div class="text-left">
                <p class="text-xs font-bold text-stone-800 leading-tight">{{ userName }}</p>
                <div class="flex items-center gap-1.5">
                  <Shield v-if="userRole === 'admin'" class="w-3 h-3 text-rose-500" />
                  <span class="text-[10px] font-semibold uppercase tracking-wider" :class="userRole === 'admin' ? 'text-rose-600' : 'text-stone-500'">
                    {{ userRole === 'admin' ? 'Admin' : 'Cliente' }}
                  </span>
                </div>
              </div>
            </div>

            <button @click="router.push('/profile')" class="hidden md:flex items-center gap-2 bg-white hover:bg-stone-50 text-stone-600 px-3 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-sm border border-stone-200" title="Perfil">
              <Settings class="w-4 h-4" />
            </button>

            <button @click="requestLogout" class="hidden md:flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg">
              <LogOut class="w-4 h-4" /> <span class="hidden sm:inline">Salir</span>
            </button>

            <!-- Mobile Menu Toggle -->
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="md:hidden p-2 text-stone-600 hover:bg-stone-100 rounded-xl transition-colors">
              <Menu v-if="!mobileMenuOpen" class="w-6 h-6" />
              <X v-else class="w-6 h-6" />
            </button>
          </div>

          <!-- Guest Menu -->
          <div v-else class="flex items-center gap-4">
            <button @click="router.push('/login')" class="flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg">
              <User class="w-4 h-4" /> <span>Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Menu (Dropdown) -->
      <div v-if="mobileMenuOpen" class="md:hidden absolute top-full left-0 w-full bg-white/95 backdrop-blur-xl border-b border-stone-100 shadow-2xl flex flex-col p-4 gap-2 z-40 animate-in slide-in-from-top-5 duration-200">
        
        <!-- Mobile User Profile -->
        <div v-if="user" class="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100 mb-2">
          <div class="bg-white p-1 rounded-lg shadow-sm h-10 w-10 flex items-center justify-center overflow-hidden">
            <img v-if="userAvatar" :src="userAvatar" class="w-full h-full object-cover rounded-md" />
            <User v-else class="w-5 h-5 text-stone-600" />
          </div>
          <div class="text-left">
            <p class="text-sm font-bold text-stone-800 leading-tight">{{ userName }}</p>
            <span class="text-[10px] font-semibold uppercase tracking-wider text-stone-500">{{ userRole === 'admin' ? 'Administrador' : 'Cliente' }}</span>
          </div>
        </div>

        <!-- Mobile Links -->
        <button @click="router.push('/')" :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all', route.name === 'home' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-50']">
          <Home class="w-5 h-5" /> <span>Inicio</span>
        </button>

        <template v-if="userRole === 'admin'">
          <button @click="router.push('/dashboard')" :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all', route.name === 'dashboard' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-50']">
            <LayoutDashboard class="w-5 h-5" /> <span>Panel Administrativo</span>
          </button>
        </template>

        <button @click="router.push('/booking')" :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all', route.name === 'booking' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-50']">
          <CalendarPlus class="w-5 h-5" /> <span>{{ userRole === 'admin' ? 'Nueva Reserva' : 'Reservar Cita' }}</span>
        </button>

        <template v-if="userRole === 'client'">
          <button @click="router.push('/my-bookings')" :class="['flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all', route.name === 'my-bookings' ? 'bg-stone-100 text-stone-900' : 'text-stone-500 hover:bg-stone-50']">
            <Calendar class="w-5 h-5" /> <span>Mis Reservas</span>
          </button>
        </template>

        <div class="h-px bg-stone-100 my-1"></div>

        <button @click="router.push('/profile')" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-stone-500 hover:bg-stone-50 transition-all"><Settings class="w-5 h-5" /> <span>Configuración</span></button>
        <button @click="requestLogout" class="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-500 hover:bg-red-50 transition-all"><LogOut class="w-5 h-5" /> <span>Cerrar Sesión</span></button>
      </div>
    </header>

    <!-- Main Content -->
    <main :class="{ 'pb-12': user }">
      <Transition name="fade" mode="out-in">
        <router-view :user-role="userRole" @update="checkUser" />
      </Transition>
    </main>

    <!-- Footer -->
    <footer v-if="route.name !== 'login'" class="bg-stone-950 text-stone-400 py-16 mt-auto border-t border-stone-900 relative overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 via-purple-500 to-rose-500 opacity-50"></div>
      <div class="absolute -top-24 -right-24 w-96 h-96 bg-rose-900/10 rounded-full blur-3xl pointer-events-none"></div>

      <div class="max-w-7xl mx-auto px-6 relative z-10">
        <div class="grid md:grid-cols-4 gap-12 mb-16">
          <!-- Brand Column -->
          <div class="col-span-1 md:col-span-1 space-y-6">
            <div class="flex items-center gap-2">
              <div class="bg-stone-900 p-2 rounded-lg border border-stone-800">
                <Sparkles class="w-5 h-5 text-rose-400" />
              </div>
              <h3 class="text-2xl font-serif text-stone-100 tracking-tight">Beauty <span class="italic text-rose-500">Studio</span></h3>
            </div>
            <p class="text-sm leading-relaxed text-stone-500 font-light">
              Redefiniendo la experiencia de belleza con tratamientos personalizados y un ambiente de lujo y serenidad.
            </p>
            <div class="flex gap-4 pt-2">
              <!-- Social Buttons -->
              <a href="#" class="p-2 bg-stone-900 rounded-full hover:bg-rose-500 hover:text-white transition-all duration-300 group">
                <Instagram class="w-4 h-4" />
              </a>
              <a href="#" class="p-2 bg-stone-900 rounded-full hover:bg-blue-600 hover:text-white transition-all duration-300 group">
                <Facebook class="w-4 h-4" />
              </a>
            </div>
          </div>

          <!-- Links Column -->
          <div class="space-y-6">
            <h4 class="text-stone-100 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <span class="w-8 h-[1px] bg-rose-500"></span> Explorar
            </h4>
            <ul class="space-y-3 text-sm">
              <li><button @click="router.push('/')" class="hover:text-rose-400 transition-colors flex items-center gap-2 group"><span class="w-0 group-hover:w-2 h-[1px] bg-rose-400 transition-all"></span> Inicio</button></li>
              <li><button @click="router.push('/booking')" class="hover:text-rose-400 transition-colors flex items-center gap-2 group"><span class="w-0 group-hover:w-2 h-[1px] bg-rose-400 transition-all"></span> Reservar Cita</button></li>
              <li><button @click="router.push('/my-bookings')" class="hover:text-rose-400 transition-colors flex items-center gap-2 group"><span class="w-0 group-hover:w-2 h-[1px] bg-rose-400 transition-all"></span> Mis Reservas</button></li>
              <li v-if="userRole === 'admin'"><button @click="router.push('/dashboard')" class="hover:text-rose-400 transition-colors flex items-center gap-2 group"><span class="w-0 group-hover:w-2 h-[1px] bg-rose-400 transition-all"></span> Panel Admin</button></li>
            </ul>
          </div>

          <!-- Contact Column -->
          <div class="space-y-6">
            <h4 class="text-stone-100 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <span class="w-8 h-[1px] bg-rose-500"></span> Contacto
            </h4>
            <ul class="space-y-4 text-sm">
              <li class="flex items-start gap-3 group">
                <div class="p-2 bg-stone-900 rounded-lg group-hover:bg-stone-800 transition-colors">
                  <MapPin class="w-4 h-4 text-rose-400" />
                </div>
                <span class="mt-1">Calle Principal 123<br>Ciudad, País</span>
              </li>
              <li class="flex items-center gap-3 group">
                <div class="p-2 bg-stone-900 rounded-lg group-hover:bg-stone-800 transition-colors">
                  <Phone class="w-4 h-4 text-rose-400" />
                </div>
                <span>+57 300 123 4567</span>
              </li>
              <li class="flex items-center gap-3 group">
                <div class="p-2 bg-stone-900 rounded-lg group-hover:bg-stone-800 transition-colors">
                  <Mail class="w-4 h-4 text-rose-400" />
                </div>
                <span>contacto@beautystudio.com</span>
              </li>
            </ul>
          </div>

          <!-- Newsletter Column -->
          <div class="space-y-6">
            <h4 class="text-stone-100 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
              <span class="w-8 h-[1px] bg-rose-500"></span> Newsletter
            </h4>
            <p class="text-sm text-stone-500">Suscríbete para recibir ofertas exclusivas y consejos de belleza.</p>
            <div class="relative">
              <input type="email" placeholder="Tu correo electrónico" class="w-full bg-stone-900 border border-stone-800 rounded-xl py-3 pl-4 pr-12 text-sm text-stone-300 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all placeholder-stone-600">
              <button class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors">
                <ArrowRight class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Bar -->
        <div class="pt-8 border-t border-stone-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-stone-600">
          <p>© {{ new Date().getFullYear() }} Beauty Studio. Todos los derechos reservados.</p>
          <div class="flex items-center gap-6">
            <a href="#" class="hover:text-stone-400 transition-colors">Privacidad</a>
            <a href="#" class="hover:text-stone-400 transition-colors">Términos</a>
            <p class="flex items-center gap-1 text-stone-500">
              Hecho con <Heart class="w-3 h-3 text-rose-500 fill-current animate-pulse" />
            </p>
          </div>
        </div>
      </div>
    </footer>

    <!-- Logout Modal -->
    <div v-if="showLogoutModal" class="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm transition-all">
      <div class="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-stone-100">
        <div class="text-center">
          <div class="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <LogOut class="w-6 h-6 text-rose-500 ml-1" />
          </div>
          <h3 class="text-xl font-serif font-bold text-stone-800 mb-2">Cerrar Sesión</h3>
          <p class="text-stone-500 text-sm mb-6">¿Estás seguro que deseas salir?</p>
          <div class="flex gap-3">
            <button @click="showLogoutModal = false" class="flex-1 py-3 rounded-xl font-bold text-sm text-stone-600 bg-stone-100 hover:bg-stone-200">Cancelar</button>
            <button @click="confirmLogout" class="flex-1 py-3 rounded-xl font-bold text-sm text-white bg-stone-900 hover:bg-stone-800 shadow-lg">Sí, Salir</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(5px); }
</style>
