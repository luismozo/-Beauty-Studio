<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Hero Section -->
    <div class="relative bg-stone-900 text-white overflow-hidden rounded-b-[3rem] shadow-2xl">
      <!-- Fondo abstracto sutil y elegante -->
      <div class="absolute inset-0 opacity-20">
        <div class="absolute -top-24 -left-24 w-96 h-96 bg-rose-300 rounded-full blur-[100px]"></div>
        <div class="absolute top-1/2 right-0 w-80 h-80 bg-stone-600 rounded-full blur-[100px]"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
        <div class="mb-8 p-4 bg-white/5 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
          <Sparkles class="w-6 h-6 text-rose-200" />
        </div>
        <h1 class="text-4xl md:text-7xl font-serif font-medium tracking-tight mb-6 text-stone-50">
          Beauty <span class="italic text-rose-200">Studio</span>
        </h1>
        <p class="text-lg md:text-xl text-stone-300 max-w-2xl font-light leading-relaxed tracking-wide">
          Elevando tu belleza natural con tratamientos exclusivos y atención personalizada en un ambiente de serenidad y lujo.
        </p>
      </div>
    </div>

    <!-- Features Grid -->
    <div class="max-w-7xl mx-auto px-6 py-20">
      <div class="grid md:grid-cols-3 gap-8">
        <div class="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100 group">
          <div class="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-rose-50 transition-colors duration-500">
            <Star class="w-8 h-8 text-stone-400 group-hover:text-rose-400 transition-colors duration-500" />
          </div>
          <h3 class="text-2xl font-serif text-stone-800 mb-4">Expertos Calificados</h3>
          <p class="text-stone-500 leading-relaxed font-light">Profesionales certificados dedicados a perfeccionar cada detalle de tu experiencia estética.</p>
        </div>

        <div class="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100 group">
          <div class="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-rose-50 transition-colors duration-500">
            <ShieldCheck class="w-8 h-8 text-stone-400 group-hover:text-rose-400 transition-colors duration-500" />
          </div>
          <h3 class="text-2xl font-serif text-stone-800 mb-4">Productos Premium</h3>
          <p class="text-stone-500 leading-relaxed font-light">Selección exclusiva de marcas de alta gama para garantizar resultados duraderos y seguros.</p>
        </div>

        <div class="bg-white p-10 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100 group">
          <div class="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-rose-50 transition-colors duration-500">
            <Clock class="w-8 h-8 text-stone-400 group-hover:text-rose-400 transition-colors duration-500" />
          </div>
          <h3 class="text-2xl font-serif text-stone-800 mb-4">Atención Puntual</h3>
          <p class="text-stone-500 leading-relaxed font-light">Valoramos tu tiempo. Nuestro sistema de reservas garantiza una atención sin esperas.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { Sparkles, Star, ShieldCheck, Clock } from 'lucide-vue-next'
</script>