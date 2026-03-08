import { Router, Response } from 'express'
import { format, subDays } from 'date-fns'
import { autenticar, RequestConUsuario } from '../middleware/auth'
import { supabase } from '../lib/supabase'

const router = Router()
router.use(autenticar)

router.get('/:actividadId', async (req: RequestConUsuario, res: Response) => {
  const { actividadId } = req.params

  const { data, error } = await supabase
    .from('completados')
    .select('fecha_completado')
    .eq('actividad_id', actividadId)
    .eq('usuario_id', req.usuarioId!)
    .order('fecha_completado', { ascending: false })

  if (error) { res.status(500).json({ error: error.message }); return }
  if (!data || data.length === 0) { res.json({ racha: 0 }); return }

  const fechas = new Set(data.map((c: { fecha_completado: string }) => c.fecha_completado))
  let racha = 0
  let diaActual = new Date()

  // Contar dias consecutivos hacia atras desde hoy
  while (true) {
    const fechaStr = format(diaActual, 'yyyy-MM-dd')
    if (fechas.has(fechaStr)) {
      racha++
      diaActual = subDays(diaActual, 1)
    } else {
      break
    }
  }

  res.json({ racha })
})

export default router
