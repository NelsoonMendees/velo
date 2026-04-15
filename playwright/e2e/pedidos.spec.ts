import { test, expect } from '../support/fixtures'
import { gerarCodigoPedido } from '../support/helpers'
import { TEST_ORDERS } from '../support/database/orderFactory'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open()
  })

  test('Deve buscar um pedido aprovado', async ({ app, orders }) => {
    const { db: orderDb, details } = TEST_ORDERS.APROVADO

    await orders.deleteByNumber(details.number)
    await orders.insert(orderDb)

    await app.orderLookup.searchOrder(details.number)
    await app.orderLookup.validateOrderDetails(details)
  })

  test('Deve buscar um pedido reprovado', async ({ app, orders }) => {
    const { db: orderDb, details } = TEST_ORDERS.REPROVADO

    await orders.deleteByNumber(details.number)
    await orders.insert(orderDb)

    await app.orderLookup.searchOrder(details.number)
    await app.orderLookup.validateOrderDetails(details)
  })

  test('Deve buscar um pedido em analise', async ({ app, orders }) => {
    const { db: orderDb, details } = TEST_ORDERS.EM_ANALISE

    await orders.deleteByNumber(details.number)
    await orders.insert(orderDb)

    await app.orderLookup.searchOrder(details.number)
    await app.orderLookup.validateOrderDetails(details)
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

  test('Deve manter o botão de busca desabilitado com o campo vazio ou apenas espaços', async ({ app, page }) => {
    const button = app.orderLookup.elements.searchButton

    await expect(button).toBeDisabled()

    await app.orderLookup.elements.orderInput.fill('      ')
    await expect(button).toBeDisabled()
  })
})
