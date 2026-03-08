import { Router, Response } from 'express'
import { startOfWeek, format, parseISO } from 'date-fns'
import { autenticar, RequestConUsuario } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(autenticar)

router.get('/', async (req: RequestConUsuario, res: Response) => {
  const { semana, desde, hasta } = req.query

  let query = supabase
    .from('completados')
    .select('*')
    .eq('usuario_id', req.usuarioId!)
    .order('creada_en', { ascending: true })

  if (desde && hasta && typeof desde === 'string' && typeof hasta === 'string') {
    // Rango de fechas (vista mensual)
    query = query.gte('fecha_completado', desde).lte('fecha_completado', hasta)
  } else if (semana && typeof semana === 'string') {
    // Compatibilidad con ?semana= (legacy)
    query = query.eq('inicio_semana', semana)
  } else {
    res.status(400).json({ error: 'Requerido: ?desde=&hasta= o ?semana=' })
    return
  }

  const { data, error } = await query
  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.post('/', async (req: RequestConUsuario, res: Response) => {
  const { actividad_id, fecha_completado, notas } = req.body

  if (!actividad_id || !fecha_completado) {
    res.status(400).json({ error: 'actividad_id y fecha_completado son requeridos' })
    return
  }

  const inicioSemana = format(
    startOfWeek(parseISO(fecha_completado), { weekStartsOn: 1 }),
    'yyyy-MM-dd'
  )

  const { data, error } = await supabase
    .from('completados')
    .insert({
      actividad_id,
      usuario_id: req.usuarioId,
      fecha_completado,
      inicio_semana: inicioSemana,
      notas: notas || null,
    })
    .select()
    .single()

  if (error) {
    // unique constraint violation (ya completado ese dia)
    if (error.code === '23505') {
      res.status(409).json({ error: 'Esta actividad ya fue completada hoy' })
      return
    }
    res.status(500).json({ error: error.message })
    return
  }
  res.status(201).json(data)
})

router.delete('/:id', async (req: RequestConUsuario, res: Response) => {
  const { id } = req.params

  const { error } = await supabase
    .from('completados')
    .delete()
    .eq('id', id)
    .eq('usuario_id', req.usuarioId!)

  if (error) { res.status(500).json({ error: error.message }); return }
  res.status(204).send()
})

export default router
