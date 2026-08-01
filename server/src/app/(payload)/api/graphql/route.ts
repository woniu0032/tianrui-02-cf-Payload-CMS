import config from '@payload-config'
import { graphQLHandler } from '@payloadcms/next/routes'

export const GET = graphQLHandler(config)
export const POST = graphQLHandler(config)
