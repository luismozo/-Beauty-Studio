// supabase/functions/recordatorio-citas/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Manejo de CORS (Preflight request)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 1. Crear cliente de Supabase (usando variables de entorno automáticas)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // --- INICIO BLOQUE DE SEGURIDAD ---
    // Verificar que quien llama a la función es realmente un ADMINISTRADOR
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Falta cabecera de autorización')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) throw new Error('Usuario no autenticado o token inválido')

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Acceso denegado: Se requiere rol de Administrador' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }
    // --- FIN BLOQUE DE SEGURIDAD ---

    // 2. Calcular rango de tiempo (Ajustado a Zona Horaria Colombia UTC-5)
    const now = new Date()
    // Restamos 5 horas para obtener la fecha en Colombia
    const colombiaOffset = 5 * 60 * 60 * 1000
    const nowColombia = new Date(now.getTime() - colombiaOffset)
    
    const tomorrow = new Date(nowColombia)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0]

    // Definir inicio y fin del día en UTC para cubrir todo el día en Colombia
    // 00:00 Colombia = 05:00 UTC
    const startIso = `${tomorrowString}T05:00:00.000Z`
    const endDate = new Date(new Date(startIso).getTime() + (24 * 60 * 60 * 1000) - 1)
    const endIso = endDate.toISOString()

    // 3. Consultar citas pendientes
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        id,
        appointment_date,
        guest_name,
        guest_phone,
        reminder_sent,
        profiles (full_name, phone, email),
        services (name)
      `)
      .eq('status', 'pending')
      .gte('appointment_date', startIso)
      .lte('appointment_date', endIso)

    if (error) {
      throw error
    }

    const results = []
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

    // Helper para esperar entre envíos (Rate Limiting)
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    // 4. Enviar correos y actualizar estado
    if (appointments && appointments.length > 0) {
      for (const apt of appointments) {
        // Si ya se envió, lo marcamos como tal y saltamos el envío real
        if (apt.reminder_sent) {
          results.push({ id: apt.id, status: 'already_sent', email: apt.profiles?.email })
          continue
        }

        const clientName = apt.guest_name || apt.profiles?.full_name || 'Cliente'
        const clientEmail = apt.profiles?.email // El correo debe venir del perfil
        const serviceName = apt.services?.name || 'Servicio'
        const dateObj = new Date(apt.appointment_date)
        const timeStr = dateObj.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        const dateStr = dateObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })

        // Generar enlace de WhatsApp para reprogramar
        const businessPhone = '573107198515' // Reemplaza con el número real de tu negocio (sin +)
        const whatsappText = encodeURIComponent(`Hola, soy ${clientName}. Quisiera reprogramar mi cita de ${serviceName} agendada para el ${dateStr} a las ${timeStr}.`)
        const whatsappLink = `https://wa.me/${businessPhone}?text=${whatsappText}`

        if (clientEmail && RESEND_API_KEY) {
          try {
            const res = await fetch('https://api.resend.com/emails', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
              },
              body: JSON.stringify({
                from: 'Beauty Studio <onboarding@resend.dev>', // Cambia esto si verificas tu dominio
                to: [clientEmail],
                subject: `Recordatorio de Cita: ${serviceName} mañana`,
                html: `
                  <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #db2777;">Hola ${clientName},</h2>
                    <p>Te recordamos que tienes una cita programada con nosotros para mañana.</p>
                    <div style="background-color: #fdf2f8; padding: 20px; border-radius: 10px; margin: 20px 0;">
                      <p style="margin: 5px 0;"><strong>Servicio:</strong> ${serviceName}</p>
                      <p style="margin: 5px 0;"><strong>Fecha:</strong> ${dateStr}</p>
                      <p style="margin: 5px 0;"><strong>Hora:</strong> ${timeStr}</p>
                    </div>
                    <p>Si necesitas reprogramar, por favor contáctanos lo antes posible:</p>
                    
                    <div style="text-align: center; margin: 25px 0;">
                      <a href="${whatsappLink}" style="background-color: #25D366; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px; display: inline-block;">
                        📲 Reprogramar por WhatsApp
                      </a>
                    </div>

                    <p style="color: #888; font-size: 12px; margin-top: 30px;">Beauty Studio - Tu belleza, nuestra pasión.</p>
                  </div>
                `
              })
            })

            if (res.ok) {
              // Marcar como enviado en la base de datos
              await supabase
                .from('appointments')
                .update({ reminder_sent: true })
                .eq('id', apt.id)
              
              results.push({ id: apt.id, status: 'sent', email: clientEmail })
            } else {
              const errorData = await res.json()
              results.push({ id: apt.id, status: 'failed', error: errorData })
            }
          } catch (e) {
            results.push({ id: apt.id, status: 'error', message: e.message })
          }
        } else {
          results.push({ id: apt.id, status: 'skipped', reason: 'No email or API Key' })
        }

        // Esperar 1 segundo entre correos para respetar el límite de Resend (2 req/seg)
        await sleep(1000)
      }
    }

    // 4. Devolver resultados
    return new Response(
      JSON.stringify({ 
        success: true, 
        range: { start: startIso, end: endIso },
        count: appointments?.length || 0,
        appointments: appointments,
        results: results
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
