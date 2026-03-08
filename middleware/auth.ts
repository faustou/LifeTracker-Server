import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase'

export interface RequestConUsuario extends Request {
  usuarioId?: string
}

export async function autenticar(
  req: RequestConUsuario,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' })
    return
  }

  const token = authHeader.slice(7)
  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    res.status(401).json({ error: 'Token invalido o expirado' })
    return
  }

  req.usuarioId = user.id
  next()
}
