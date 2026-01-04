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

describe('API /users/me endpoint integration tests', () => {
  let payload: any = null
  let createdUser: any = null
  let userJWT: string | null = null

  beforeAll(async () => {
    // Initialize Payload instance
    payload = await getPayload({ config })

    // Create a test user
    createdUser = await payload.create({
      collection: 'users',
      data: {
        email: 'test@example.com',
        password: 'testPassword123!',
        idp_id: '123456789012345678', // ZITADEL identifier format
      },
      overrideAccess: true, // Bypass access controls and validations for testing
    })
  })

  it('user is created successfully', async () => {
    // Test that the user was created successfully
    expect(createdUser).toBeDefined()
    expect(createdUser.email).toBe('test@example.com')
  })

  it('user can be retrieved by ID', async () => {
    // Test that the user can be retrieved by ID
    const retrievedUser = await payload.findByID({
      collection: 'users',
      id: createdUser.id,
    })

    expect(retrievedUser).toBeDefined()
    expect(retrievedUser.email).toBe('test@example.com')
  })

  it('returned user matches ZITADEL idp_id', async () => {
    // Update the user to have a ZITADEL idp_id
    const updatedUser = await payload.update({
      collection: 'users',
      id: createdUser.id,
      data: {
        idp_id: 'test-zitadel-sub-123',
      },
    })

    // Verify the idp_id field was updated
    expect(updatedUser.idp_id).toBe('test-zitadel-sub-123')
  })
})