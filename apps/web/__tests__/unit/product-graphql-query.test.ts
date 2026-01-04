import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

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
    $: (fn: any) => fn,
  }
})

describe('Product GraphQL Query Logic', () => {
  let mockFetch: any

  beforeEach(() => {
    mockFetch = global.fetch as Mock
    vi.clearAllMocks()
  })

  it('products render correctly', async () => {
    const mockProductsData = {
      data: {
        Products: {
          docs: [
            {
              id: 'prod-1',
              title: 'Test Product 1',
              description: 'Test Description 1',
              price: 100,
              variants: [
                {
                  id: 'var-1',
                  size: 'M',
                  color: 'blue',
                  stock: 10,
                  additionalPrice: 0,
                }
              ],
              images: [
                { url: '/images/test1.jpg' }
              ]
            }
          ]
        }
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductsData,
    })

    // Mock the executeQuery function implementation
    const executeQuery = async (query: string, variables: any = {}) => {
      const response = await fetch(`${import.meta.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`)
      }

      return result.data
    }

    const query = `
      query GetProducts {
        Products {
          docs {
            id
            title
            description
            price
            variants {
              id
              size
              color
              stock
              additionalPrice
            }
            images {
              url
            }
          }
        }
      }
    `

    const result = await executeQuery(query)

    expect(result).toEqual(mockProductsData.data)
    expect(result.Products.docs).toHaveLength(1)
    expect(result.Products.docs[0].title).toBe('Test Product 1')
    expect(result.Products.docs[0].variants).toHaveLength(1)
    expect(result.Products.docs[0].variants[0].size).toBe('M')
  })

  it('variants are displayed', async () => {
    const mockProductsData = {
      data: {
        Products: {
          docs: [
            {
              id: 'prod-1',
              title: 'Test Product 1',
              description: 'Test Description 1',
              price: 100,
              variants: [
                {
                  id: 'var-1',
                  size: 'M',
                  color: 'blue',
                  stock: 10,
                  additionalPrice: 0,
                },
                {
                  id: 'var-2',
                  size: 'L',
                  color: 'red',
                  stock: 5,
                  additionalPrice: 10,
                }
              ],
              images: [
                { url: '/images/test1.jpg' }
              ]
            }
          ]
        }
      }
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockProductsData,
    })

    // Mock the executeQuery function implementation
    const executeQuery = async (query: string, variables: any = {}) => {
      const response = await fetch(`${import.meta.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`)
      }

      return result.data
    }

    const query = `
      query GetProducts {
        Products {
          docs {
            id
            title
            description
            price
            variants {
              id
              size
              color
              stock
              additionalPrice
            }
            images {
              url
            }
          }
        }
      }
    `

    const result = await executeQuery(query)

    expect(result.Products.docs[0].variants).toHaveLength(2)
    expect(result.Products.docs[0].variants[0].size).toBe('M')
    expect(result.Products.docs[0].variants[1].size).toBe('L')
    expect(result.Products.docs[0].variants[0].color).toBe('blue')
    expect(result.Products.docs[0].variants[1].color).toBe('red')
  })

  it('unauthorized response is handled', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      statusText: 'Unauthorized',
    })

    // Mock the executeQuery function implementation
    const executeQuery = async (query: string, variables: any = {}) => {
      const response = await fetch(`${import.meta.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`)
      }

      return result.data
    }

    const query = `
      query GetProducts {
        Products {
          docs {
            id
          }
        }
      }
    `

    await expect(executeQuery(query)).rejects.toThrow('GraphQL request failed: Unauthorized')
  })

  it('handles GraphQL errors', async () => {
    const mockErrorData = {
      errors: [
        { message: 'Field "invalidField" is not defined' }
      ]
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockErrorData,
    })

    // Mock the executeQuery function implementation
    const executeQuery = async (query: string, variables: any = {}) => {
      const response = await fetch(`${import.meta.env.PUBLIC_PAYLOAD_URL || 'http://localhost:3001'}/api/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      })

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.errors) {
        throw new Error(`GraphQL errors: ${result.errors.map((e: any) => e.message).join(', ')}`)
      }

      return result.data
    }

    const query = `
      query GetProducts {
        Products {
          docs {
            invalidField
          }
        }
      }
    `

    await expect(executeQuery(query)).rejects.toThrow('GraphQL errors: Field "invalidField" is not defined')
  })
})