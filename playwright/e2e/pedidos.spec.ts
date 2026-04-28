import { test, expect } from '../support/fixtures'
import { gerarCodigoPedido } from '../support/helpers'
import { buildOrder } from '../support/database/orderFactory'

test.describe('Consulta de Pedido', () => {
  test.beforeEach(async ({ app }) => {
    await app.orderLookup.open()
  })

  test('Deve buscar um pedido aprovado', async ({ app, orders }) => {
    const customer = buildOrder({
      number: 'VLO-SE4R01',
      status: 'APROVADO',
      customerName: 'Nelson Mendes',
      customerEmail: 'nelson_mendes@live.com',
      customerPhone: '(11) 99999-0001',
      customerCpf: '000.000.000-01',
      color: { db: 'midnight-black', display: 'Midnight Black' },
      wheels: { db: 'sport', display: 'sport Wheels' },
      payment: { db: 'avista', display: 'À Vista' },
      totalPrice: { db: 40000, display: 'R$ 40.000,00' }
    })

    await orders.deleteByNumber(customer.details.number)
    await orders.insert(customer.db)

    await app.orderLookup.searchOrder(customer.details.number)
    await app.orderLookup.validateOrderDetails(customer.details)
  })

  test('Deve buscar um pedido reprovado', async ({ app, orders }) => {
    const customer = buildOrder({
      number: 'VLO-SE4R02',
      status: 'REPROVADO',
      customerName: 'Lorraine Crispim',
      customerEmail: 'lorrainecrispim20@outlook.com',
      customerPhone: '(11) 99999-0002',
      customerCpf: '000.000.000-02',
      color: { db: 'lunar-white', display: 'Lunar White' },
      wheels: { db: 'sport', display: 'sport Wheels' },
      payment: { db: 'avista', display: 'À Vista' },
      totalPrice: { db: 40000, display: 'R$ 40.000,00' }
    })

    await orders.deleteByNumber(customer.details.number)
    await orders.insert(customer.db)

    await app.orderLookup.searchOrder(customer.details.number)
    await app.orderLookup.validateOrderDetails(customer.details)
  })

  test('Deve buscar um pedido em analise', async ({ app, orders }) => {
    const customer = buildOrder({
      number: 'VLO-SE4R03',
      status: 'EM_ANALISE',
      customerName: 'Fernanda Karolina',
      customerEmail: 'fernanda@qa.com',
      customerPhone: '(62) 98888-4444',
      customerCpf: '736.649.410-04',
      color: { db: 'glacier-blue', display: 'Glacier Blue' },
      wheels: { db: 'aero', display: 'aero Wheels' },
      payment: { db: 'avista', display: 'À Vista' },
      totalPrice: { db: 40000, display: 'R$ 40.000,00' }
    })

    await orders.deleteByNumber(customer.details.number)
    await orders.insert(customer.db)

    await app.orderLookup.searchOrder(customer.details.number)
    await app.orderLookup.validateOrderDetails(customer.details)
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
