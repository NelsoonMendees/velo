import { test, expect } from '@playwright/test'

test('Deve buscar um pedido existente', async ({ page }) => {
    //Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()
    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

    //Act
    await page.locator('input[name="order-id"]').fill('VLO-61GOR8')
    // await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-61GOR8')
    await page.getByTestId('search-order-button').click()

    //Assert
    // await expect(page.getByTestId('order-result-id')).toContainText('VLO-61GOR8', { timeout: 10_000 })
    // await expect(page.getByTestId('order-result-status')).toContainText('APROVADO')

    await expect(page.getByText('VLO-61GOR8')).toBeVisible()
    await expect(page.getByText('APROVADO')).toBeVisible()
})
