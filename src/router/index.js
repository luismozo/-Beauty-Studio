import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../supabase'

// HomeView se carga de inmediato para mejor LCP (Largest Contentful Paint)
import HomeView from '../components/HomeView.vue'

const routes = [
  { 
    path: '/login', 
    name: 'login', 
    // Lazy Loading: Se descarga solo si el usuario entra aquí
    component: () => import('../components/LoginComponente.vue'),
    meta: { 
      guestOnly: true, 
      title: 'Iniciar Sesión',
      description: 'Accede a tu cuenta en Beauty Studio para gestionar tus citas.'
    }
  },
  { 
    path: '/', 
    name: 'home', 
    component: HomeView,
    meta: { 
      title: 'Inicio',
      description: 'Bienvenido a Beauty Studio. Tu destino para el cuidado personal, belleza y relajación. Reserva tu cita hoy mismo.'
    }
  },
  { 
    path: '/dashboard', 
    name: 'dashboard', 
    // Lazy Loading crítico para seguridad: El código de admin no se expone a clientes
    component: () => import('../components/AdminDashboard.vue'),
    meta: { 
      requiresAuth: true, 
      role: 'admin', 
      title: 'Panel Administrativo',
      robots: 'noindex, nofollow' // IMPORTANTE: No queremos que Google indexe el panel privado
    }
  },
  { 
    path: '/settings', 
    name: 'settings', 
    component: () => import('../components/AdminSettings.vue'),
    meta: { 
      requiresAuth: true, 
      role: 'admin', 
      title: 'Configuración',
      robots: 'noindex, nofollow'
    }
  },
  { 
    path: '/booking', 
    name: 'booking', 
    component: () => import('../components/BookingForm.vue'),
    meta: { 
      title: 'Reservar Cita',
      description: 'Agenda tu cita en línea para corte de cabello, manicure, pedicure y más en Beauty Studio. Rápido y fácil.'
    }
  },
  { 
    path: '/my-bookings', 
    name: 'my-bookings', 
    component: () => import('../components/MyBookings.vue'),
    meta: { 
      requiresAuth: true, 
      title: 'Mis Reservas',
      description: 'Consulta y gestiona tus próximas citas en Beauty Studio.'
    }
  },
  { 
    path: '/profile', 
    name: 'profile', 
    component: () => import('../components/ProfileSettings.vue'),
    meta: { 
      requiresAuth: true, 
      title: 'Mi Perfil',
      description: 'Gestiona tu información personal y preferencias.'
    }
  },
  // Captura de rutas no existentes (404) -> Redirigir a Home
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/' 
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  if (!to.meta.requiresAuth && !to.meta.guestOnly && !to.meta.role) {
    next()
    return
  }

  // Obtener usuario fresco en cada navegación para evitar problemas de caché al cerrar sesión
  const { data } = await supabase.auth.getUser()
  const user = data.user

  if (to.meta.requiresAuth && !user) {
    next('/login')
    return
  }

  if (to.meta.guestOnly && user) {
    next('/')
    return
  }

  if (to.meta.role && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== to.meta.role) {
      next('/')
      return
    }
  }

  next()
})


// --- SEO ENGINE: Actualizar Meta Tags Dinámicamente ---
router.afterEach((to) => {
  // 1. Actualizar Título
  const title = to.meta.title ? `${to.meta.title} | Beauty Studio` : 'Beauty Studio'
  document.title = title

  // 2. Actualizar Descripción (Meta Description)
  const description = to.meta.description || 'Beauty Studio - Tu centro de belleza y bienestar.'
  
  // Buscar o crear meta description
  let metaDesc = document.querySelector('meta[name="description"]')
  if (!metaDesc) {
    metaDesc = document.createElement('meta')
    metaDesc.setAttribute('name', 'description')
    document.head.appendChild(metaDesc)
  }
  metaDesc.setAttribute('content', description)

  // 3. Actualizar Open Graph (Para compartir en WhatsApp/Facebook)
  const updateMetaTag = (property, content) => {
    let tag = document.querySelector(`meta[property="${property}"]`)
    if (!tag) {
      tag = document.createElement('meta')
      tag.setAttribute('property', property)
      document.head.appendChild(tag)
    }
    tag.setAttribute('content', content)
  }

  updateMetaTag('og:title', title)
  updateMetaTag('og:description', description)
  // updateMetaTag('og:image', 'URL_DE_TU_LOGO_O_BANNER.jpg') // Opcional: Agregar imagen por defecto

  // 4. Manejo de Robots (Evitar indexar admin)
  if (to.meta.robots) {
    let metaRobots = document.querySelector('meta[name="robots"]')
    if (!metaRobots) {
      metaRobots = document.createElement('meta')
      metaRobots.setAttribute('name', 'robots')
      document.head.appendChild(metaRobots)
    }
    metaRobots.setAttribute('content', to.meta.robots)
  } else {
    // Si no es admin, asegurarnos de permitir indexación
    const metaRobots = document.querySelector('meta[name="robots"]')
    if (metaRobots) metaRobots.setAttribute('content', 'index, follow')
  }

  // 5. Canonical URL (Evitar contenido duplicado)
  let canonicalLink = document.querySelector('link[rel="canonical"]')
  if (!canonicalLink) {
    canonicalLink = document.createElement('link')
    canonicalLink.setAttribute('rel', 'canonical')
    document.head.appendChild(canonicalLink)
  }
  // Construir URL absoluta (en producción será tu dominio real)
  canonicalLink.setAttribute('href', `${window.location.origin}${to.path}`)

  // 6. JSON-LD (Datos Estructurados para Google Maps/Search)
  // Esto ayuda a Google a entender que eres un Negocio Local real
  if (to.name === 'home') {
    let script = document.querySelector('#schema-json')
    if (!script) {
      script = document.createElement('script')
      script.id = 'schema-json'
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    
    const schema = {
      "@context": "https://schema.org",
      "@type": "BeautySalon",
      "name": "Beauty Studio",
      "image": "", // Puedes poner la URL de tu logo aquí
      "url": window.location.origin,
      "telephone": "+573001234567",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Calle Principal 123",
        "addressLocality": "Ciudad",
        "addressCountry": "CO"
      },
      "priceRange": "$$"
    }
    script.textContent = JSON.stringify(schema)
  }
})

export default router