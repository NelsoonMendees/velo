import { Page, expect } from '@playwright/test'

export type SuccessStatus = 'APROVADO' | 'REPROVADO'

const statusText: Record<SuccessStatus, string> = {
  APROVADO: 'Pedido Aprovado!',
  REPROVADO: 'Crédito Reprovado',
}

export function createSuccessActions(page: Page) {
  return {
    async expectStatus(status: SuccessStatus) {
      await expect(page).toHaveURL(/\/success/)
      await expect(page.getByTestId('success-status')).toHaveText(statusText[status])
    },

    async expectOrderNumber() {
      await expect(page.getByTestId('order-id')).toContainText('VLO-')
    },

    async expectCustomerName(fullName: string) {
      await expect(page.getByText(fullName)).toBeVisible()
    },

    async expectCustomerEmail(email: string) {
      await expect(page.getByText(email)).toBeVisible()
    },

    async getOrderNumber(): Promise<string> {
      return page.getByTestId('order-id').innerText()
    },
  }
}
