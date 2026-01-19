import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../supabase'

import HomeView from '../components/HomeView.vue'
import AdminDashboard from '../components/AdminDashboard.vue'
import BookingForm from '../components/BookingForm.vue'
import MyBookings from '../components/MyBookings.vue'
import ProfileSettings from '../components/ProfileSettings.vue'
import LoginComponent from '../components/LoginComponente.vue'

const routes = [
  { 
    path: '/login', 
    name: 'login', 
    component: LoginComponent,
    meta: { guestOnly: true }
  },
  { 
    path: '/', 
    name: 'home', 
    component: HomeView 
  },
  { 
    path: '/dashboard', 
    name: 'dashboard', 
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'admin' }
  },
  { 
    path: '/booking', 
    name: 'booking', 
    component: BookingForm,
  },
  { 
    path: '/my-bookings', 
    name: 'my-bookings', 
    component: MyBookings,
    meta: { requiresAuth: true }
  },
  { 
    path: '/profile', 
    name: 'profile', 
    component: ProfileSettings,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const { data: { user } } = await supabase.auth.getUser()

  if (to.meta.requiresAuth && !user) {
    next('/login')
    return
  }

  if (to.meta.guestOnly && user) {
    next('/')
    return
  }

  if (to.meta.role) {
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

export default router