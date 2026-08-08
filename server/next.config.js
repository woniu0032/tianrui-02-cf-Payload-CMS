/** @type {import('next').NextConfig} */
import { withPayload } from '@payloadcms/next/withPayload'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default withPayload({
  outputFileTracingRoot: __dirname,
})
