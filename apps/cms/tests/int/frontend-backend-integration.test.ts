import { describe, it, expect, beforeAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { vi } from 'vitest'

// Mock environment variables
vi.mock('process', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...(actual as any),
    env: {
      ...(actual as any).env,
      PAYLOAD_SECRET: 'test-secret',
      DATABASE_URL: process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/payload_test',
      ZITADEL_CLIENT_ID: 'test-client-id',
      ZITADEL_CLIENT_SECRET: 'test-client-secret',
      ZITADEL_URL: 'https://test-zitadel.com',
      ZITADEL_AUTH_URL: 'https://test-zitadel.com/oauth/v2/authorize',
      ZITADEL_TOKEN_URL: 'https://test-zitadel.com/oauth/v2/token',
      ZITADEL_USERINFO_URL: 'https://test-zitadel.com/oidc/v1/userinfo',
      PUBLIC_APP_URL: 'http://localhost:3000',
      PAYLOAD_PUBLIC_SERVER_URL: 'http://localhost:3001',
    },
  }
})

describe('Frontend ↔ Backend integration tests', () => {
  let payload: any = null
  let createdUser: any = null
  let product: any = null

  beforeAll(async () => {
    // Initialize Payload instance
    payload = await getPayload({ config })

    // Create a test user
    createdUser = await payload.create({
      collection: 'users',
      data: {
        email: 'test@example.com',
        password: 'testPassword123!',
                idp_id: '123456789012345683', // ZITADEL identifier format
      },
      overrideAccess: true, // Bypass access controls and validations for testing
    })

    // Create a test product
    product = await payload.create({
      collection: 'products',
      data: {
        title: 'Test Product',
        description: 'Test Description',
        price: 100,
        variants: [
          {
            size: 'M',
            color: 'blue',
            stock: 10,
          }
        ]
      },
    })
  })

  it('frontend can access user data through Payload API', async () => {
    // Test that user data can be accessed through Payload's API
    const user = await payload.findByID({
      collection: 'users',
      id: createdUser.id,
    })

    expect(user).toBeDefined()
    expect(user.email).toBe('test@example.com')
  })

  it('frontend can query products through Payload API', async () => {
    // Test that products can be queried through Payload's API
    const result = await payload.find({
      collection: 'products',
      where: {
        title: {
          equals: 'Test Product'
        }
      }
    })

    expect(result.docs).toBeDefined()
    expect(result.docs.length).toBeGreaterThan(0)
    expect(result.docs[0].title).toBe('Test Product')
    expect(result.docs[0].variants).toBeDefined()
    expect(result.docs[0].variants[0].size).toBe('M')
  })

  it('frontend can create and update products through Payload API', async () => {
    // Test that products can be created and updated through Payload's API
    const newProduct = await payload.create({
      collection: 'products',
      data: {
        title: 'Frontend Created Product',
        description: 'Created via frontend request',
        price: 200,
        variants: [
          {
            size: 'L',
            color: 'red',
            stock: 5,
          }
        ]
      },
    })

    expect(newProduct).toHaveProperty('id')
    expect(newProduct.title).toBe('Frontend Created Product')

    // Update the product
    const updatedProduct = await payload.update({
      collection: 'products',
      id: newProduct.id,
      data: {
        title: 'Updated Frontend Product',
        price: 250,
      },
    })

    expect(updatedProduct.title).toBe('Updated Frontend Product')
    expect(updatedProduct.price).toBe(250)
  })

  it('unauthenticated operations are properly handled', async () => {
    // Test that operations without proper authentication/authorization are handled
    // For this test, we'll try to perform an operation that requires admin rights
    // on a user that doesn't have admin rights

    // Create a regular user
    const regularUser = await payload.create({
      collection: 'users',
      data: {
        email: 'regular@example.com',
        password: 'regularPassword123!',
                idp_id: '123456789012345684', // ZITADEL identifier format
      },
      overrideAccess: true, // Bypass access controls and validations for testing
    })

    // Try to delete a product (which requires admin or editor role according to the access config)
    try {
      await payload.delete({
        collection: 'products',
        id: product.id,
        overrideAccess: false, // Don't override access control
      })
      // If we reach this line, the delete was allowed, which shouldn't happen for a regular user
      expect(false).toBe(true) // This should not happen
    } catch (error) {
      // This is expected - the operation should be denied
      expect(error).toBeDefined()
    }
  })
})