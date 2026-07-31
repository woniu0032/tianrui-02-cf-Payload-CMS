import payload from 'payload'
import config from './payload.config'
import express from 'express'

const PORT = process.env.PORT || 8080

async function start() {
  const app = express()

  // Initialize Payload with Express app
  await payload.init({
    config,
    express: app,
    secret: process.env.PAYLOAD_SECRET || 'tianrui-payload-secret-key-2024',
  })

  // Start the server
  app.listen(PORT, () => {
    console.log(`🚀 Payload CMS server listening on port ${PORT}`)
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin`)
    console.log(`🔌 API: http://localhost:${PORT}/api`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
