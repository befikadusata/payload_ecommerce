import { Payload } from 'payload'
import path from 'path'
import { fileURLToPath } from 'url'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export const seedProducts = async (payload: Payload) => {
  payload.logger.info('Seeding products...')

  // Create example products
  const products = [
    {
      title: 'Premium T-Shirt',
      description: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'A high-quality t-shirt made from 100% organic cotton. Comfortable and durable for everyday wear.',
            },
          ],
        },
      ],
      price: 29.99,
      variants: [
        {
          size: 'Small',
          color: 'Blue',
          stock: 10,
          additionalPrice: 0,
        },
        {
          size: 'Medium',
          color: 'Blue',
          stock: 15,
          additionalPrice: 0,
        },
        {
          size: 'Large',
          color: 'Blue',
          stock: 8,
          additionalPrice: 0,
        },
        {
          size: 'Small',
          color: 'Red',
          stock: 5,
          additionalPrice: 2,
        },
        {
          size: 'Large',
          color: 'Red',
          stock: 12,
          additionalPrice: 2,
        },
      ],
    },
    {
      title: 'Wireless Headphones',
      description: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'Premium noise-cancelling wireless headphones with 30-hour battery life and premium sound quality.',
            },
          ],
        },
      ],
      price: 199.99,
      variants: [
        {
          size: 'Standard',
          color: 'Black',
          stock: 25,
          additionalPrice: 0,
        },
        {
          size: 'Standard',
          color: 'White',
          stock: 18,
          additionalPrice: 5,
        },
      ],
    },
  ]

  for (const product of products) {
    await payload.create({
      collection: 'products',
      data: product,
    })
  }

  payload.logger.info('Successfully seeded products!')
}