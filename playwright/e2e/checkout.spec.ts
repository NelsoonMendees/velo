import { test } from '../support/fixtures'
import type { PaymentMethod } from '../support/actions/checkoutActions'
import type { SuccessStatus } from '../support/actions/successActions'

test.describe('CT05 - Checkout e Confirmação - Pagamento À Vista (Fluxo Feliz)', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
    await app.configurator.goToCheckout()
  })

  test('Deve criar pedido aprovado ao pagar à vista com dados válidos', async ({ app, orders }) => {
    const customer = {
      name: 'Nelson',
      surname: 'Mendes',
      email: 'nelson@email.com',
      phone: '(11) 99999-0001',
      cpf: '529.982.247-25',
      store: 'Velô Paulista - Av. Paulista,',
      acceptTerms: true,
      paymentMethod: 'avista' as PaymentMethod,
      totalPrice: 'R$ 40.000,00',
      status: 'APROVADO' as SuccessStatus
    }

    await orders.deleteByCpf(customer.cpf)

    // Pré-condição: preço base R$ 40.000,00 persistido do configurador
    await app.checkout.expectSummaryTotal(customer.totalPrice)

    // Passo 1: preencher formulário com dados válidos e selecionar loja
    await app.checkout.fillForm(customer)

    // Passo 2: selecionar aba À Vista e verificar valor exibido
    await app.checkout.selectPaymentMethod(customer.paymentMethod)
    await app.checkout.expectSummaryTotal(customer.totalPrice)

    // Passo 3: confirmar pedido
    await app.checkout.submit()

    // Passo 4: verificar página de confirmação
    await app.success.expectStatus(customer.status)
    await app.success.expectOrderNumber()
    await app.success.expectCustomerName(`${customer.name} ${customer.surname}`)
    await app.success.expectCustomerEmail(customer.email)
  })

  test('Deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento.', async ({ page, app, orders }) => {
    const customer = {
      name: 'Matheus',
      surname: 'Lucas',
      email: 'matheus.lucas@email.com',
      phone: '(11) 98282-1201',
      cpf: '523.922.347-35',
      store: 'Velô Paulista - Av. Paulista,',
      acceptTerms: true,
      paymentMethod: 'financiamento' as PaymentMethod,
      totalPrice: 'R$ 40.800,00',
      status: 'APROVADO' as SuccessStatus
    }

    await page.route('**/functions/v1/credit-analysis', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: 'Done', score: 750 })
      })
    })

    await orders.deleteByCpf(customer.cpf)

    // Passo 1: preencher formulário com dados válidos e selecionar loja
    await app.checkout.fillForm(customer)

    // Passo 2: selecionar aba À Vista e verificar valor exibido
    await app.checkout.selectPaymentMethod(customer.paymentMethod)
    await app.checkout.expectSummaryTotal(customer.totalPrice)

    // Passo 3: confirmar pedido
    await app.checkout.submit()

    // Passo 4: verificar página de confirmação
    await app.success.expectStatus(customer.status)
  })
})

test.describe('CT04 - Checkout - Validação de Campos Obrigatórios e Dados Inválidos', () => {
  test.beforeEach(async ({ app }) => {
    await app.checkout.open()
  })

  test('Deve exibir erros em todos os campos ao confirmar com formulário vazio', async ({ app }) => {
    await app.checkout.submit()

    await app.checkout.expectFieldError('name', 'Nome deve ter pelo menos 2 caracteres')
    await app.checkout.expectFieldError('surname', 'Sobrenome deve ter pelo menos 2 caracteres')
    await app.checkout.expectFieldError('email', 'Email inválido')
    await app.checkout.expectFieldError('phone', 'Telefone inválido')
    await app.checkout.expectFieldError('cpf', 'CPF inválido')
    await app.checkout.expectFieldError('store', 'Selecione uma loja')
    await app.checkout.expectFieldError('terms', 'Aceite os termos')
  })

  test('Deve exibir erro ao informar apenas 1 caractere em Nome e Sobrenome', async ({ app }) => {
    await app.checkout.fillForm({ name: 'A', surname: 'B' })
    await app.checkout.submit()

    await app.checkout.expectFieldError('name', 'Nome deve ter pelo menos 2 caracteres')
    await app.checkout.expectFieldError('surname', 'Sobrenome deve ter pelo menos 2 caracteres')
  })

  test('Deve exibir erro ao deixar o campo email vazio', async ({ app }) => {
    await app.checkout.fillForm({ email: '' })
    await app.checkout.submit()

    await app.checkout.expectFieldError('email', 'Email inválido')
  })

  test('Deve exibir erro ao deixar o campo CPF vazio', async ({ app }) => {
    await app.checkout.fillForm({ cpf: '' })
    await app.checkout.submit()

    await app.checkout.expectFieldError('cpf', 'CPF inválido')
  })

  test('Deve exibir erro ao não aceitar os Termos de Uso', async ({ app }) => {
    await app.checkout.fillForm({ acceptTerms: false })
    await app.checkout.submit()

    await app.checkout.expectFieldError('terms', 'Aceite os termos')
  })
})
