import { test, expect } from '@playwright/test'
import { gerarCodigoPedido } from '../support/helpers'

test.describe('Consulta de Pedido', async () => {
  test.beforeEach(async ({ page }) => {
    //Arrange
    await page.goto('http://localhost:5173/')
    await expect(page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()

    await page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
  })

  test('Deve buscar um pedido aprovado', async ({ page }) => {
    //test data
    const orderId = 'VLO-61GOR8'
    const orderStatus = 'APROVADO'

    //Act
    await page.locator('input[name="order-id"]').fill(orderId)
    // await page.getByRole('textbox', { name: 'Número do Pedido' }).fill('VLO-61GOR8')
    await page.getByTestId('search-order-button').click()

    //Assert
    // await expect(page.getByTestId('order-result-id')).toContainText('VLO-61GOR8', { timeout: 10_000 })
    // await expect(page.getByTestId('order-result-status')).toContainText('APROVADO')
    //await expect(page.getByText('VLO-61GOR8')).toBeVisible()

    // const containerPedido = page
    //   .getByRole('paragraph')
    //   .filter({ hasText: /^Pedido$/ })
    //   .locator('..')
    // await expect(containerPedido).toContainText('VLO-61GOR8')
    // await expect(page.getByText(orderStatus)).toBeVisible()

    await expect(page.getByTestId(`order-result-${orderId}`)).toMatchAriaSnapshot(`
    - img
    - paragraph: Pedido
    - paragraph: ${orderId}
    - img
    - text: ${orderStatus}
    - img "Velô Sprint"
    - paragraph: Modelo
    - paragraph: Velô Sprint
    - paragraph: Cor
    - paragraph: Midnight Black
    - paragraph: Interior
    - paragraph: cream
    - paragraph: Rodas
    - paragraph: sport Wheels
    - heading "Dados do Cliente" [level=4]
    - paragraph: Nome
    - paragraph: Nelson Mendes
    - paragraph: Email
    - paragraph: nelson_mendes@live.com
    - paragraph: Loja de Retirada
    - paragraph
    - paragraph: Data do Pedido
    - paragraph: /\\d+\\/\\d+\\/\\d+/
    - heading "Pagamento" [level=4]
    - paragraph: À Vista
    - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
    `)
  })

  test('Deve exibir mensagem de pedido não encontrado', async ({ page }) => {
    //test data
    const orderId = gerarCodigoPedido()

    //Act
    await page.getByRole('textbox', { name: 'Número do Pedido' }).fill(orderId)
    await page.getByRole('button', { name: 'Buscar Pedido' }).click()

    //Assert
    //   const title = page.getByRole('heading', { name: 'Pedido não encontrado' })
    //   await expect(title).toBeVisible()

    //   const message = page.locator('p', { hasText: 'Verifique o número do pedido e tente novamente' })
    //   await expect(message).toBeVisible()

    await expect(page.locator('#root')).toMatchAriaSnapshot(`
            - img
            - heading "Pedido não encontrado" [level=3]
            - paragraph: Verifique o número do pedido e tente novamente
            `)
  })
})
