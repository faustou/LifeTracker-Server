import { Router, Response } from 'express'
import { autenticar, RequestConUsuario } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(autenticar)

router.get('/', async (req: RequestConUsuario, res: Response) => {
  const { data, error } = await supabase
    .from('actividades')
    .select('*')
    .eq('usuario_id', req.usuarioId!)
    .eq('archivada', false)
    .order('orden', { ascending: true })

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.post('/', async (req: RequestConUsuario, res: Response) => {
  const { nombre, tipo, duracion_minutos, color, icono, meta_semanal } = req.body

  if (!nombre || !tipo) {
    res.status(400).json({ error: 'nombre y tipo son requeridos' })
    return
  }

  const { data, error } = await supabase
    .from('actividades')
    .insert({
      nombre,
      tipo,
      duracion_minutos,
      color,
      icono: icono || null,
      meta_semanal,
      usuario_id: req.usuarioId,
    })
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.status(201).json(data)
})

router.patch('/:id', async (req: RequestConUsuario, res: Response) => {
  const { id } = req.params
  const { nombre, tipo, duracion_minutos, color, icono, meta_semanal, archivada, orden } = req.body

  const { data, error } = await supabase
    .from('actividades')
    .update({ nombre, tipo, duracion_minutos, color, icono: icono ?? null, meta_semanal, archivada, orden })
    .eq('id', id)
    .eq('usuario_id', req.usuarioId!)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  if (!data) { res.status(404).json({ error: 'Actividad no encontrada' }); return }
  res.json(data)
})

router.delete('/:id', async (req: RequestConUsuario, res: Response) => {
  const { id } = req.params

  const { error } = await supabase
    .from('actividades')
    .delete()
    .eq('id', id)
    .eq('usuario_id', req.usuarioId!)

  if (error) { res.status(500).json({ error: error.message }); return }
  res.status(204).send()
})

export default router
