import { test, expect } from '../support/fixtures'

test.describe('CT04 - Checkout - Validação de Campos Obrigatórios e Dados Inválidos', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/order')
  })

  test('Deve exibir erros em todos os campos ao confirmar com formulário vazio', async ({ page }) => {
    await page.getByTestId('checkout-submit').click()

    await expect(page.locator('//label[text()="Nome"]/..//p')).toHaveText('Nome deve ter pelo menos 2 caracteres')
    await expect(page.locator('//label[text()="Sobrenome"]/..//p')).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
    await expect(page.locator('//label[text()="Email"]/..//p')).toHaveText('Email inválido')
    await expect(page.locator('//label[text()="Telefone"]/..//p')).toHaveText('Telefone inválido')
    await expect(page.locator('//label[text()="CPF"]/..//p')).toHaveText('CPF inválido')
    await expect(page.locator('//label[text()="Loja para Retirada"]/..//p')).toHaveText('Selecione uma loja')
    await expect(page.locator('p', { hasText: 'Aceite os termos' })).toHaveText('Aceite os termos')
  })

  test('Deve exibir erro ao informar apenas 1 caractere em Nome e Sobrenome', async ({ page }) => {
    await page.getByTestId('checkout-name').fill('A')
    await page.getByTestId('checkout-surname').fill('B')
    await page.getByTestId('checkout-submit').click()
    
    await expect(page.locator('//label[text()="Nome"]/..//p')).toHaveText('Nome deve ter pelo menos 2 caracteres')
    await expect(page.locator('//label[text()="Sobrenome"]/..//p')).toHaveText('Sobrenome deve ter pelo menos 2 caracteres')
  })

  test('Deve exibir erro ao deixar o campo email vazio', async ({ page }) => {
    await page.getByTestId('checkout-name').fill('Nelson')
    await page.getByTestId('checkout-surname').fill('Mendes')
    await page.getByTestId('checkout-phone').fill('(11) 99999-0001')
    await page.getByTestId('checkout-cpf').fill('000.000.000-01')
    await page.getByTestId('checkout-submit').click()

    await expect(page.locator('//label[text()="Email"]/..//p')).toHaveText('Email inválido')
  })

  test('Deve exibir erro ao deixar o campo CPF vazio', async ({ page }) => {
    await page.getByTestId('checkout-name').fill('Nelson')
    await page.getByTestId('checkout-surname').fill('Mendes')
    await page.getByTestId('checkout-email').fill('nelson@email.com')
    await page.getByTestId('checkout-phone').fill('(11) 99999-0001')
    await page.getByTestId('checkout-submit').click()

    await expect(page.locator('//label[text()="CPF"]/..//p')).toHaveText('CPF inválido')
  })

  test('Deve exibir erro ao não aceitar os Termos de Uso', async ({ page }) => {
    await page.getByTestId('checkout-name').fill('Nelson')
    await page.getByTestId('checkout-surname').fill('Mendes')
    await page.getByTestId('checkout-email').fill('nelson@email.com')
    await page.getByTestId('checkout-phone').fill('(11) 99999-0001')
    await page.getByTestId('checkout-cpf').fill('000.000.000-01')
    await page.getByTestId('checkout-store').click()
    await page.getByRole('option', { name: 'Velô Paulista - Av. Paulista,' }).click()
    await page.getByTestId('checkout-submit').click()

    await expect(page.locator('p', { hasText: 'Aceite os termos' })).toHaveText('Aceite os termos')
  })
})
