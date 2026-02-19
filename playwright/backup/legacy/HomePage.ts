import { Page, expect } from '@playwright/test'

export class HomePage {
  constructor(private readonly page: Page) { }

  async goto() {
    await this.page.goto('http://localhost:5173/')
    await expect(this.page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()
  }

  async goToOrderLookup() {
    await this.page.getByRole('link', { name: 'Consultar Pedido' }).click()
    await expect(this.page.getByRole('heading')).toContainText('Consultar Pedido')
  }
}
