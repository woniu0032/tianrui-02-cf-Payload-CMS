import payload from 'payload'
import config from './payload.config'
import http from 'http'

const PORT = process.env.PORT || 8080

async function start() {
  // Initialize Payload
  await payload.init({
    config,
    secret: process.env.PAYLOAD_SECRET || 'tianrui-payload-secret-key-2024',
    local: false,
  })

  // Create HTTP server
  const server = http.createServer((req, res) => {
    // Handle Payload requests
    if (req.url?.startsWith('/api')) {
      // Payload will handle API routes
    }
    
    // For now, just return a simple response
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ message: 'Tianrui Payload CMS is running' }))
  })

  server.listen(PORT, () => {
    console.log(`🚀 Payload CMS server listening on port ${PORT}`)
    console.log(`📊 Admin panel: http://localhost:${PORT}/admin`)
    console.log(`🔌 API: http://localhost:${PORT}/api`)
  })
}

start().catch((error) => {
  console.error('Failed to start server:', error)
  process.exit(1)
})
