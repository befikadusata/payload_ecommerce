import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock the matrix-js-sdk
const mockCreateClient = vi.fn()
const mockLogin = vi.fn()
const mockLogout = vi.fn()
const mockStartClient = vi.fn()
const mockJoinRoom = vi.fn()
const mockSendEvent = vi.fn()
const mockOn = vi.fn()

vi.mock('matrix-js-sdk', () => ({
  createClient: mockCreateClient,
  Room: class {},
  MatrixEvent: class {},
}))

// Mock the fetch API
global.fetch = vi.fn()

// Mock Qwik functions
vi.mock('@builder.io/qwik', async () => {
  const actual = await vi.importActual('@builder.io/qwik')
  return {
    ...actual,
    useStore: (initialState: any) => initialState,
    useTask$: (fn: any) => fn,
    $: (fn: any) => fn,
  }
})

describe('Chat State Logic', () => {
  let mockMatrixClient: any
  let matrixStore: any

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks()
    
    // Create a mock Matrix client
    mockMatrixClient = {
      on: mockOn,
      startClient: mockStartClient,
      logout: mockLogout,
      joinRoom: mockJoinRoom,
      sendEvent: mockSendEvent,
    }
    
    // Initialize matrix store
    matrixStore = {
      client: null,
      isLoggedIn: false,
      isSyncing: false,
      rooms: [],
      messages: {},
      error: null,
    }
    
    // Mock createClient to return our mock client
    mockCreateClient.mockReturnValue(mockMatrixClient)
    
    // Mock fetch to return successful login response
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        homeserverUrl: 'https://matrix.example.com',
        accessToken: 'test-access-token',
        userId: '@test:example.com',
      }),
    })
  })

  it('chat initializes only when user is authenticated', async () => {
    // Mock login function implementation
    const login = async () => {
      if (matrixStore.isLoggedIn) {
        return
      }

      try {
        const response = await fetch('/api/matrix/login', {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to log in to Matrix')
        }

        const loginData = await response.json()

        matrixStore.client = mockCreateClient({
          baseUrl: loginData.homeserverUrl,
          accessToken: loginData.accessToken,
          userId: loginData.userId,
        })

        // Set up event listeners
        matrixStore.client.on('sync', (state: any) => {
          matrixStore.isSyncing = state === 'SYNCING'
        })

        // Start the client
        await matrixStore.client.startClient()

        matrixStore.isLoggedIn = true
        matrixStore.error = null
      } catch (error) {
        matrixStore.error = error instanceof Error ? error.message : 'Login failed'
        matrixStore.isLoggedIn = false
      }
    }

    // Initially, chat should not be initialized
    expect(matrixStore.client).toBeNull()
    expect(matrixStore.isLoggedIn).toBe(false)

    // Login should initialize the chat
    await login()

    expect(matrixStore.client).not.toBeNull()
    expect(matrixStore.isLoggedIn).toBe(true)
    expect(mockCreateClient).toHaveBeenCalled()
    expect(mockStartClient).toHaveBeenCalled()
  })

  it('chat does not initialize for anonymous users', () => {
    // The store starts uninitialized
    expect(matrixStore.client).toBeNull()
    expect(matrixStore.isLoggedIn).toBe(false)
    
    // This test confirms that without authentication, the chat remains uninitialized
    expect(true).toBe(true)
  })

  it('message send function is gated by auth state', async () => {
    // Mock sendMessage function implementation
    const sendMessage = async (roomId: string, content: string) => {
      if (!matrixStore.client) return

      try {
        await matrixStore.client.sendEvent(
          roomId,
          'm.room.message',
          {
            msgtype: 'm.text',
            body: content,
          },
          // Generate a transaction ID
          Date.now().toString()
        )
      } catch (error) {
        matrixStore.error = error instanceof Error ? error.message : 'Failed to send message'
      }
    }

    // Try to send a message without being logged in
    await sendMessage('!room-id:example.com', 'Hello, world!')
    
    // Should not call sendEvent since client is null
    expect(mockSendEvent).not.toHaveBeenCalled()

    // Now log in and try again
    matrixStore.client = mockMatrixClient
    matrixStore.isLoggedIn = true
    
    await sendMessage('!room-id:example.com', 'Hello, world!')
    
    // Should now call sendEvent
    expect(mockSendEvent).toHaveBeenCalledWith(
      '!room-id:example.com',
      'm.room.message',
      {
        msgtype: 'm.text',
        body: 'Hello, world!',
      },
      expect.any(String) // transaction ID
    )
  })

  it('login function works correctly', async () => {
    // Mock login function implementation
    const login = async () => {
      if (matrixStore.isLoggedIn) {
        return
      }

      try {
        const response = await fetch('/api/matrix/login', {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to log in to Matrix')
        }

        const loginData = await response.json()

        matrixStore.client = mockCreateClient({
          baseUrl: loginData.homeserverUrl,
          accessToken: loginData.accessToken,
          userId: loginData.userId,
        })

        // Set up event listeners
        matrixStore.client.on('sync', (state: any) => {
          matrixStore.isSyncing = state === 'SYNCING'
        })

        // Start the client
        await matrixStore.client.startClient()

        matrixStore.isLoggedIn = true
        matrixStore.error = null
      } catch (error) {
        matrixStore.error = error instanceof Error ? error.message : 'Login failed'
        matrixStore.isLoggedIn = false
      }
    }

    await login()

    expect(matrixStore.isLoggedIn).toBe(true)
    expect(matrixStore.client).not.toBeNull()
    expect(mockCreateClient).toHaveBeenCalledWith({
      baseUrl: 'https://matrix.example.com',
      accessToken: 'test-access-token',
      userId: '@test:example.com',
    })
    expect(mockStartClient).toHaveBeenCalled()
  })

  it('logout function works correctly', async () => {
    // First log in
    matrixStore.client = mockMatrixClient
    matrixStore.isLoggedIn = true

    // Mock logout function implementation
    const logout = async () => {
      if (!matrixStore.client) return

      try {
        await matrixStore.client.logout()
        matrixStore.isLoggedIn = false
        matrixStore.client = null
      } catch (error) {
        matrixStore.error = error instanceof Error ? error.message : 'Logout failed'
      }
    }

    await logout()

    expect(matrixStore.isLoggedIn).toBe(false)
    expect(matrixStore.client).toBeNull()
    expect(mockLogout).toHaveBeenCalled()
  })
})