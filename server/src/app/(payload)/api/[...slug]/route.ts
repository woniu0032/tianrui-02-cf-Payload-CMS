import config from '@payload-config'
import { restHandler } from '@payloadcms/next/routes'

export const GET = restHandler(config)
export const POST = restHandler(config)
export const DELETE = restHandler(config)
export const PATCH = restHandler(config)
export const PUT = restHandler(config)
