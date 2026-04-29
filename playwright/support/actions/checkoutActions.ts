import { Page, expect } from '@playwright/test'

type CheckoutField = 'name' | 'surname' | 'email' | 'phone' | 'cpf' | 'store' | 'terms'

export type PaymentMethod = 'avista' | 'financiamento'

export type CheckoutFormData = {
  name?: string
  surname?: string
  email?: string
  phone?: string
  cpf?: string
  store?: string
  acceptTerms?: boolean
}

const DEFAULT_VALID_DATA: Required<CheckoutFormData> = {
  name: 'Nelson',
  surname: 'Mendes',
  email: 'nelson@email.com',
  phone: '(11) 99999-0001',
  cpf: '529.982.247-25',
  store: 'Velô Paulista - Av. Paulista,',
  acceptTerms: true,
}

export function createCheckoutActions(page: Page) {
  return {
    async open() {
      await page.goto('/order')
    },

    async fillForm(overrides: CheckoutFormData = {}) {
      const data = { ...DEFAULT_VALID_DATA, ...overrides }

      if (data.name)    await page.getByTestId('checkout-name').fill(data.name)
      if (data.surname) await page.getByTestId('checkout-surname').fill(data.surname)
      if (data.email)   await page.getByTestId('checkout-email').fill(data.email)
      if (data.phone)   await page.getByTestId('checkout-phone').fill(data.phone)
      if (data.cpf)     await page.getByTestId('checkout-cpf').fill(data.cpf)

      if (data.store) {
        await page.getByTestId('checkout-store').click()
        await page.getByRole('option', { name: data.store }).click()
      }

      if (data.acceptTerms) {
        await page.getByTestId('checkout-terms').check()
      }
    },

    async submit() {
      await page.getByTestId('checkout-submit').click()
    },

    async mockCreditAnalysis(score: number) {
      await page.route('**/functions/v1/credit-analysis', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'Done', score })
        })
      })
    },

    async selectPaymentMethod(method: PaymentMethod) {
      await page.getByTestId(`payment-${method}`).click()
    },

    async expectSummaryTotal(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    },

    async fillDownPayment(value: string) {
      await page.getByTestId('input-entry-value').fill(value)
    },

    async expectFieldError(field: CheckoutField, message: string) {
      await expect(page.getByTestId(`checkout-${field}-error`)).toHaveText(message)
    },
  }
}
