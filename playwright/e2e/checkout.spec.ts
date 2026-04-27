import { test } from '../support/fixtures'
import { DEFAULT_VALID_DATA } from '../support/actions/checkoutActions'

test.describe('CT05 - Checkout e Confirmação - Pagamento À Vista (Fluxo Feliz)', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
    await app.configurator.goToCheckout()
  })

  test('Deve criar pedido aprovado ao pagar à vista com dados válidos', async ({ app, orders }) => {
    await orders.deleteByCpf(DEFAULT_VALID_DATA.cpf)

    // Pré-condição: preço base R$ 40.000,00 persistido do configurador
    await app.checkout.expectSummaryTotal('R$ 40.000,00')

    // Passo 1: preencher formulário com dados válidos e selecionar loja
    await app.checkout.fillForm()

    // Passo 2: selecionar aba À Vista e verificar valor exibido
    await app.checkout.selectPaymentMethod('avista')
    await app.checkout.expectSummaryTotal('R$ 40.000,00')

    // Passo 3: confirmar pedido
    await app.checkout.submit()

    // Passo 4: verificar página de confirmação
    await app.success.expectStatus('APROVADO')
    await app.success.expectOrderNumber()
    await app.success.expectCustomerName(`${DEFAULT_VALID_DATA.name} ${DEFAULT_VALID_DATA.surname}`)
    await app.success.expectCustomerEmail(DEFAULT_VALID_DATA.email)
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
