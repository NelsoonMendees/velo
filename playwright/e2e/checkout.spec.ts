import { test } from '../support/fixtures'
import type { PaymentMethod } from '../support/actions/checkoutActions'
import type { SuccessStatus } from '../support/actions/successActions'
import { runFinancingScenario } from '../support/helpers'
import type { FinancingCustomer } from '../support/helpers'

test.describe('Checkout e Confirmação - Fluxos de Pagamento', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
    await app.configurator.goToCheckout()
  })

  test('CT05 - Deve criar pedido aprovado ao pagar à vista com dados válidos', async ({ app, orders }) => {
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

    // Pré-condição: preço base persistido do configurador
    await app.checkout.expectSummaryTotal(customer.totalPrice)

    await app.checkout.fillForm(customer)
    await app.checkout.selectPaymentMethod(customer.paymentMethod)
    await app.checkout.expectSummaryTotal(customer.totalPrice)
    await app.checkout.submit()

    await app.success.expectStatus(customer.status)
    await app.success.expectOrderNumber()
    await app.success.expectCustomerName(`${customer.name} ${customer.surname}`)
    await app.success.expectCustomerEmail(customer.email)
  })

  test('CT06 - Deve aprovar automaticamente o crédito quando o score do CPF for maior que 700 no financiamento', async ({ app, orders }) => {
    const customer: FinancingCustomer = {
      name: 'Matheus',
      surname: 'Lucas',
      email: 'matheus.lucas@email.com',
      phone: '(11) 98282-1201',
      cpf: '523.922.347-35',
      store: 'Velô Paulista - Av. Paulista,',
      acceptTerms: true,
      paymentMethod: 'financiamento',
      totalPrice: 'R$ 40.800,00',
      status: 'APROVADO'
    }

    await runFinancingScenario({ app, orders }, customer, 750)
  })

  test('CT07 - Deve colocar pedido em análise quando o score do CPF estiver entre 501 e 700', async ({ app, orders }) => {
    const customer: FinancingCustomer = {
      name: 'Ana',
      surname: 'Carvalho',
      email: 'ana.carvalho@email.com',
      phone: '(21) 97654-3210',
      cpf: '413.754.880-08',
      store: 'Velô Paulista - Av. Paulista,',
      acceptTerms: true,
      paymentMethod: 'financiamento',
      totalPrice: 'R$ 40.800,00',
      status: 'EM_ANALISE'
    }

    await runFinancingScenario({ app, orders }, customer, 600)
  })

  test('CT08 - Deve reprovar o pedido quando o score for menor ou igual a 500 e a entrada for inferior a 50%', async ({ app, orders }) => {
    const customer: FinancingCustomer = {
      name: 'Carlos',
      surname: 'Ferreira',
      email: 'carlos.ferreira@email.com',
      phone: '(31) 91234-5678',
      cpf: '111.444.777-35',
      store: 'Velô Paulista - Av. Paulista,',
      acceptTerms: true,
      paymentMethod: 'financiamento',
      totalPrice: 'R$ 40.800,00',
      status: 'REPROVADO'
    }

    await runFinancingScenario({ app, orders }, customer, 300, '0')
  })

  test('CT09 - Deve aprovar o pedido quando a entrada for maior ou igual a 50% independente do score', async ({ app, orders }) => {
    const customer: FinancingCustomer = {
      name: 'Roberta',
      surname: 'Lima',
      email: 'roberta.lima@email.com',
      phone: '(41) 92345-6789',
      cpf: '432.120.987-08',
      store: 'Velô Paulista - Av. Paulista,',
      acceptTerms: true,
      paymentMethod: 'financiamento',
      totalPrice: 'R$ 20.400,00',
      status: 'APROVADO'
    }

    await runFinancingScenario({ app, orders }, customer, 300, '20000')
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
