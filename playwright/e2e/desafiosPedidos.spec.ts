import { test, expect } from '@playwright/test'

test('Deve buscar um pedido aprovado', async ({ page }) => {
  //Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()

  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  //Act
  await page.locator('input[name="order-id"]').fill('VLO-351NPI')
  await page.getByTestId('search-order-button').click()

  //Assert
  await expect(page.getByTestId('order-result-id')).toContainText('VLO-351NPI', { timeout: 10_000 })
  await expect(page.getByTestId('order-result-status')).toContainText('APROVADO')
  await expect(page.getByText('VLO-351NPI')).toBeVisible()

  // const containerPedido = page
  //   .getByRole('paragraph')
  //   .filter({ hasText: /^Pedido$/ })
  //   .locator('..')
  // await expect(containerPedido).toContainText('VLO-61GOR8')
  // await expect(page.getByText(orderStatus)).toBeVisible()
})

test('Deve exibir mensagem de pedido não encontrado', async ({ page }) => {
  //test data
  const orderId = 'VLO-61GOR8'

  //Arrange
  await page.goto('http://localhost:5173/')
  await expect(page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()

  await page.getByRole('link', { name: 'Consultar Pedido' }).click()
  await expect(page.getByRole('heading')).toContainText('Consultar Pedido')

  //Act
  await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderId)
  await page.getByRole('button', { name: 'Buscar Pedido' }).click()

  //Assert
  const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
  await expect(title).toBeVisible()

  const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })
  await expect(message).toBeVisible()
})
