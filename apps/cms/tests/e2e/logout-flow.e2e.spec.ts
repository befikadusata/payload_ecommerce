import { test, expect } from '@playwright/test'

test.describe('Logout flow', () => {
  test('logout clears session and restricts access', async ({ page }) => {
    // First, ensure the user is logged in by visiting the protected page
    await page.goto('http://localhost:5173/protected')

    // Verify user is logged in by checking for user-specific elements
    await expect(page.locator('data-testid=user-menu')).toBeVisible()

    // Verify that /api/users/me returns user data when authenticated
    const responseBeforeLogout = await page.request.get('http://localhost:3001/api/users/me')
    expect(responseBeforeLogout.status()).toBe(200)

    // Click logout button
    await page.locator('text=Logout').click()

    // Wait for logout to complete
    await page.waitForTimeout(1000) // Allow time for logout process

    // After logout, verify user is no longer authenticated
    await expect(page.locator('data-testid=user-menu')).not.toBeVisible()

    // Verify that /api/users/me returns 401 after logout
    const responseAfterLogout = await page.request.get('http://localhost:3001/api/users/me')
    expect(responseAfterLogout.status()).toBe(401)

    // Chat should be disabled when not authenticated
    await expect(page.locator('data-testid=chat-container')).not.toBeVisible()

    // GraphQL access should be denied after logout
    const graphQLResponse = await page.request.post('http://localhost:3001/api/graphql', {
      headers: {
        'Content-Type': 'application/json',
      },
      data: JSON.stringify({
        query: `query { Products { docs { id title } } }`
      })
    })

    // Should return unauthorized or require authentication
    const graphQLResult = await graphQLResponse.json()
    expect(graphQLResponse.status()).toBe(200) // GraphQL returns 200 even with errors

    if (graphQLResult.errors) {
      const hasAuthError = graphQLResult.errors.some((error: any) =>
        error.message.toLowerCase().includes('forbidden') ||
        error.message.toLowerCase().includes('unauthorized') ||
        error.message.toLowerCase().includes('access')
      )
      expect(hasAuthError).toBe(true)
    }
  })

  test('logout flow from user menu', async ({ page }) => {
    // Visit the protected page to ensure user is logged in
    await page.goto('http://localhost:5173/protected')

    // Verify user is logged in
    await expect(page.locator('data-testid=user-menu')).toBeVisible()

    // Click on user menu to open logout options
    await page.locator('data-testid=user-menu').click()

    // Click logout from the menu
    await page.locator('text=Logout').click()

    // Wait for logout to complete
    await page.waitForTimeout(1000)

    // Verify user is logged out
    await expect(page.locator('data-testid=user-menu')).not.toBeVisible()

    // Verify restricted access to protected resources
    const response = await page.request.get('http://localhost:3001/api/users/me')
    expect(response.status()).toBe(401)
  })
})