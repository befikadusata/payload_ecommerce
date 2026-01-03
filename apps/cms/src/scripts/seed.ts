import { getPayload } from 'payload'
import { seedProducts } from './seedProducts'
import config from '../payload.config.js'

const seed = async () => {
  const payload = await getPayload({
    config,
    secret: process.env.PAYLOAD_SECRET || '',
  })

  payload.logger.info('Seeding database...')

  // Seed products
  await seedProducts(payload)

  payload.logger.info('Database seeding complete!')
  process.exit(0)
}

seed()