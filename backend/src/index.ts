// backend/src/index.ts
import 'dotenv/config'
import 'express-async-errors'
import app from './app'

const PORT = Number(process.env.PORT) || 4000

app.listen(PORT, () => {
  console.log(`🐕 Dumb Construtor API running on port ${PORT}`)
  console.log(`   ENV: ${process.env.NODE_ENV}`)
})
