import { Router, Response } from 'express'
import { autenticar, RequestConUsuario } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(autenticar)

router.get('/', async (req: RequestConUsuario, res: Response) => {
  // Crear config por defecto si no existe (reemplaza el trigger al_crear_usuario)
  await supabase
    .from('configuracion_usuario')
    .upsert({ usuario_id: req.usuarioId! }, { onConflict: 'usuario_id', ignoreDuplicates: true })

  const { data, error } = await supabase
    .from('configuracion_usuario')
    .select('*')
    .eq('usuario_id', req.usuarioId!)
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

router.patch('/', async (req: RequestConUsuario, res: Response) => {
  const { horas_sueno, horas_trabajo, dias_trabajo } = req.body

  const { data, error } = await supabase
    .from('configuracion_usuario')
    .update({ horas_sueno, horas_trabajo, dias_trabajo })
    .eq('usuario_id', req.usuarioId!)
    .select()
    .single()

  if (error) { res.status(500).json({ error: error.message }); return }
  res.json(data)
})

export default router
