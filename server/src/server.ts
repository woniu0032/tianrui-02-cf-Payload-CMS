import next from 'next'
import { parse } from 'url'
import { createServer } from 'http'

const port = parseInt(process.env.PORT || '8080', 10)
const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'

async function start() {
  const app = next({ dev, hostname, port, dir: process.cwd() })
  const handle = app.getRequestHandler()
  await app.prepare()

  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url || '/', true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  })

  server.listen(port, hostname, () => {
    console.log(`Payload CMS (Next.js) on http://${hostname}:${port}`)
    console.log(`Admin: http://localhost:${port}/admin`)
    console.log(`API: http://localhost:${port}/api`)
  })
}

start().catch((err) => {
  console.error('Failed to start:', err)
  process.exit(1)
})
