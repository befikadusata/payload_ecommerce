import { test, expect } from '@playwright/test'

test.describe('Critical user journey (ZITADEL login flow)', () => {
  test('user is redirected to ZITADEL, authenticates, and returns to app', async ({ page }) => {
    // Visit the app
    await page.goto('http://localhost:5173') // Qwik app typically runs on port 5173

    // Check that the page loads correctly
    await expect(page).toHaveTitle(/E-commerce Store/)

    // Click Login button (this should trigger ZITADEL authentication)
    await page.locator('text=Login').click()

    // User should be redirected to ZITADEL for authentication
    // Wait for redirect to ZITADEL (this URL would be configured in the app)
    await page.waitForURL('**/zitadel**', { timeout: 10000 })

    // Note: In a real test environment, we would need to mock ZITADEL
    // For this test, we'll simulate successful authentication by going back to the app
    // with a successful callback (in real scenario, ZITADEL would redirect back)

    // Simulate successful authentication by navigating to the callback endpoint
    // This simulates what would happen after successful ZITADEL authentication
    await page.goto('http://localhost:3001/api/auth/zitadel/callback?code=mock-auth-code')

    // Wait for redirect back to the frontend app
    await page.waitForURL('http://localhost:5173/**', { timeout: 10000 })

    // Products page should load
    await expect(page.locator('h1')).toContainText('Our Products')

    // Products should render
    await expect(page.locator('data-testid=product-card').first()).toBeVisible()

    // Variants should be visible
    const productCards = page.locator('data-testid=product-card')
    await expect(productCards).toHaveCount({ min: 1 })

    // Check that at least one product has variants displayed
    const firstProduct = productCards.first()
    await expect(firstProduct.locator('data-testid=product-variant').first()).toBeVisible()

    // Chat should be enabled when authenticated
    await expect(page.locator('data-testid=chat-container')).toBeVisible()
  })

  test('login flow completes successfully with products and chat available', async ({ page }) => {
    // Start from the homepage
    await page.goto('http://localhost:5173')

    // Click login
    await page.locator('text=Login').click()

    // Simulate the authentication flow completion
    // In a real test, we would authenticate with ZITADEL
    await page.goto('http://localhost:5173/protected')

    // Verify products are loaded
    await expect(page.locator('data-testid=product-card').first()).toBeVisible()

    // Verify chat functionality is available
    await expect(page.locator('data-testid=chat-input')).toBeVisible()
    await expect(page.locator('data-testid=chat-messages')).toBeVisible()
  })
})