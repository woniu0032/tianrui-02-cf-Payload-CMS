import config from '@payload-config'
import { graphQLPlaygroundHandler } from '@payloadcms/next/routes'

export const GET = graphQLPlaygroundHandler(config)
