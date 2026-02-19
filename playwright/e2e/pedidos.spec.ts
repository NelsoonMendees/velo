import { test, expect } from '../support/fixtures'
import { gerarCodigoPedido } from '../support/helpers'
import type { OrderDetails } from '../support/actions/orderLookupActions'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open()
  })

  test('Deve buscar um pedido aprovado', async ({ app }) => {
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

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
  })

  test('Deve buscar um pedido reprovado', async ({ app }) => {
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

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
  })

  test('Deve buscar um pedido em analise', async ({ app }) => {
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

    await app.orderLookup.searchOrder(order.number)
    await app.orderLookup.validateOrderDetails(order)
  })

  test('Deve exibir mensagem de pedido não encontrado', async ({ app }) => {
    const order = gerarCodigoPedido()

    await app.orderLookup.searchOrder(order)
    await app.orderLookup.validateOrderNotFoundMessage()
  })

  test('Deve exibir mensagem de pedido não encontrado ao informar numero de pedido diferente do padrão', async ({ app }) => {
    await app.orderLookup.searchOrder('ABC1234')
    await app.orderLookup.validateOrderNotFoundMessage()
  })
})
