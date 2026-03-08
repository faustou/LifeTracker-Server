import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import actividadesRouter from './rutas/actividades'
import completadosRouter from './rutas/completados'
import configuracionRouter from './rutas/configuracion'
import rachasRouter from './rutas/rachas'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

const CLIENT_URL = process.env.CLIENT_URL

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true)
    // Permitir localhost en desarrollo
    if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true)
    // Permitir la URL del cliente en produccion
    if (CLIENT_URL && origin === CLIENT_URL) return callback(null, true)
    callback(new Error('CORS no permitido'))
  },
  credentials: true,
}))
app.use(express.json())

app.use('/api/actividades', actividadesRouter)
app.use('/api/completados', completadosRouter)
app.use('/api/configuracion', configuracionRouter)
app.use('/api/rachas', rachasRouter)

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})
