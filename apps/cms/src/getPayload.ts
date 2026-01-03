/* eslint-disable no-console */
import { unstable_cache as cache } from 'next/cache'
import payload from 'payload'

import config from './payload.config'

let cached = (global as any).payload

if (!cached) {
  cached = (global as any).payload = {
    client: null,
    promise: null,
  }
}

interface Args {
  config: any
  initOptions?: any
}

export const getPayload = async ({ initOptions }: Partial<Args> = {}): Promise<any> => {
  if (cached.client) {
    return cached.client
  }

  if (!cached.promise) {
    cached.promise = payload.init({
      ...(initOptions || {}),
      config: config,
      secret: process.env.PAYLOAD_SECRET,
    }).then(payloadClient => {
      console.log('Payload initialized')
      cached.client = payloadClient
      return payloadClient
    })
  }

  try {
    cached.client = await cached.promise
  } catch (e: unknown) {
    cached.promise = null
    throw e
  }

  return cached.client
}

/**
 * Gets a cached payload instance that can be used server-side
 * All API routes and server component should use this to get payload
 */
export const getCachedPayload = (options?: Partial<Args>) => cache(async () => getPayload(options))
