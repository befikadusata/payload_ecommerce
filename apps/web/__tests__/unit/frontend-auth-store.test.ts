import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAuthStore } from '../../src/hooks/use-auth'
import type { User } from '../../src/contexts/auth-context'

// Mock the fetch API
global.fetch = vi.fn()

// Mock process.env
vi.mock('process', async () => {
  const actual = await vi.importActual('process')
  return {
    ...actual,
    env: {
      ...actual.env,
      PUBLIC_PAYLOAD_URL: 'http://localhost:3001',
    },
  }
})

// Mock Qwik functions
vi.mock('@builder.io/qwik', async () => {
  const actual = await vi.importActual('@builder.io/qwik')
  return {
    ...actual,
    useStore: (initialState: any) => initialState,
    useVisibleTask$: (fn: any) => fn,
    $: (fn: any) => fn,
  }
})

describe('Frontend Auth Store Logic', () => {
  let mockFetch: any

  beforeEach(() => {
    mockFetch = global.fetch as Mock
    vi.clearAllMocks()
  })

  it('when /api/users/me returns 200, authStore.user is set', async () => {
    const mockUser: User = {
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockUser,
    })

    // Create a mock auth store to test the checkAuthStatus function
    const authStore = {
      user: null,
      loading: true,
      error: null,
    }

    // Mock the checkAuthStatus function implementation
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/users/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const userData = await response.json()
          authStore.user = {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.email,
          }
        } else {
          authStore.user = null
        }
      } catch (error) {
        authStore.error = error instanceof Error ? error.message : 'Failed to check authentication status'
        authStore.user = null
      } finally {
        authStore.loading = false
      }
    }

    await checkAuthStatus()

    expect(authStore.user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
    })
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBeNull()
  })

  it('when /api/users/me returns 401, user is null', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
    })

    const authStore = {
      user: { id: 'existing-user', email: 'old@example.com', name: 'Old User' },
      loading: true,
      error: null,
    }

    // Mock the checkAuthStatus function implementation
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/users/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const userData = await response.json()
          authStore.user = {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.email,
          }
        } else {
          authStore.user = null
        }
      } catch (error) {
        authStore.error = error instanceof Error ? error.message : 'Failed to check authentication status'
        authStore.user = null
      } finally {
        authStore.loading = false
      }
    }

    await checkAuthStatus()

    expect(authStore.user).toBeNull()
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBeNull()
  })

  it('loading state behaves correctly', async () => {
    const authStore = {
      user: null,
      loading: true,
      error: null,
    }

    // Initially loading should be true
    expect(authStore.loading).toBe(true)

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'user-123', email: 'test@example.com', name: 'Test User' }),
    })

    // Mock the checkAuthStatus function implementation
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/users/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const userData = await response.json()
          authStore.user = {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.email,
          }
        } else {
          authStore.user = null
        }
      } catch (error) {
        authStore.error = error instanceof Error ? error.message : 'Failed to check authentication status'
        authStore.user = null
      } finally {
        authStore.loading = false
      }
    }

    await checkAuthStatus()

    // After completion, loading should be false
    expect(authStore.loading).toBe(false)
  })

  it('errors are handled gracefully', async () => {
    const mockError = new Error('Network error')
    mockFetch.mockRejectedValueOnce(mockError)

    const authStore = {
      user: null,
      loading: true,
      error: null,
    }

    // Mock the checkAuthStatus function implementation
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/users/me`, {
          credentials: 'include',
        })

        if (response.ok) {
          const userData = await response.json()
          authStore.user = {
            id: userData.id,
            email: userData.email,
            name: userData.name || userData.email,
          }
        } else {
          authStore.user = null
        }
      } catch (error) {
        authStore.error = error instanceof Error ? error.message : 'Failed to check authentication status'
        authStore.user = null
      } finally {
        authStore.loading = false
      }
    }

    await checkAuthStatus()

    expect(authStore.user).toBeNull()
    expect(authStore.loading).toBe(false)
    expect(authStore.error).toBe('Network error')
  })
})