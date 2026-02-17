import { test } from '@playwright/test'
import { gerarCodigoPedido } from '../support/helpers'
import { OrderLockupPage, OrderDetails } from '../support/pages/OrderLockupPage'
import { HomePage } from '../support/pages/HomePage'

test.describe('Consulta de Pedido', async () => {
  let orderLockupPage: OrderLockupPage

  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page)
    await homePage.goto()
    await homePage.goToOrderLookup()

    orderLockupPage = new OrderLockupPage(page)
  })

  test('Deve buscar um pedido aprovado', async ({ page }) => {
    //test data
    const order: OrderDetails = {
      number: 'VLO-351NPI',
      status: 'APROVADO' as const,
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: {
        name: 'Nelson Mendes',
        email: 'nelson_mendes@live.com'
      },
      payment: 'À Vista'
    }

    await orderLockupPage.searchOrder(order.number)
    await orderLockupPage.validateOrderDetails(order)
  })

  test('Deve buscar um pedido reprovado', async ({ page }) => {
    const order: OrderDetails = {
      number: 'VLO-OEZV0T',
      status: 'REPROVADO' as const,
      color: 'Lunar White',
      wheels: 'sport Wheels',
      customer: {
        name: 'Lorraine Crispim',
        email: 'lorrainecrispim20@outlook.com'
      },
      payment: 'À Vista'
    }

    await orderLockupPage.searchOrder(order.number)
    await orderLockupPage.validateOrderDetails(order)
  })

  test('Deve buscar um pedido em analise', async ({ page }) => {
    const order: OrderDetails = {
      number: 'VLO-FK02OY',
      status: 'EM_ANALISE' as const,
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: {
        name: 'Fernanda Karolina',
        email: 'fernanda@qa.com'
      },
      payment: 'À Vista'
    }

    await orderLockupPage.searchOrder(order.number)
    await orderLockupPage.validateOrderDetails(order)
  })

  test('Deve exibir mensagem de pedido não encontrado', async ({ page }) => {
    const order = gerarCodigoPedido()

    await orderLockupPage.searchOrder(order)
    await orderLockupPage.validateOrderNotFoundMessage()
  })

  test('Deve exibir mensagem de pedido não encontrado ao informar numero de pedido diferente do padrão', async ({ page }) => {
    await orderLockupPage.searchOrder('ABC1234')
    await orderLockupPage.validateOrderNotFoundMessage()
  })
})
