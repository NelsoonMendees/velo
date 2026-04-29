import { Page } from '@playwright/test'
import type { App, Orders } from './fixtures'
import type { CheckoutFormData } from './actions/checkoutActions'
import type { SuccessStatus } from './actions/successActions'

export type FinancingCustomer = Required<CheckoutFormData> & {
  paymentMethod: 'financiamento'
  totalPrice: string
  status: SuccessStatus
}

export async function runFinancingScenario(
  { app, orders }: { app: App; orders: Orders },
  customer: FinancingCustomer,
  score: number,
  downPayment?: string
) {
  await app.checkout.mockCreditAnalysis(score)
  await orders.deleteByCpf(customer.cpf)
  await app.checkout.fillForm(customer)
  await app.checkout.selectPaymentMethod(customer.paymentMethod)
  if (downPayment !== undefined) await app.checkout.fillDownPayment(downPayment)
  await app.checkout.expectSummaryTotal(customer.totalPrice)
  await app.checkout.submit()
  await app.success.expectStatus(customer.status)
}

export function gerarCodigoPedido(prefixo = 'VLO', tamanho = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let sufixo = ''

  // Gera "tamanho" caracteres aleatórios
  for (let i = 0; i < tamanho; i++) {
    sufixo += chars[Math.floor(Math.random() * chars.length)]
  }

  return `${prefixo}-${sufixo}`
}
