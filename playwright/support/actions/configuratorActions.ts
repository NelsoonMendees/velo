import { Page, expect } from '@playwright/test'

type ColorOption = 'glacier-blue' | 'midnight-black' | 'lunar-white'
type WheelOption = 'aero' | 'sport'
type OptionalOption = 'precision-park' | 'flux-capacitor'

export function createConfiguratorActions(page: Page) {
  const priceSection = page.getByText('Preço de Venda').locator('..')

  return {
    async open() {
      await page.goto('/configure')
      await expect(page).toHaveURL(/\/configure$/)
    },

    async selectColor(color: ColorOption) {
      await page.getByTestId(`color-option-${color}`).click()
    },

    async selectWheels(wheel: WheelOption) {
      await page.getByTestId(`wheel-option-${wheel}`).click()
    },

    async validatePrice(price: string) {
      await expect(priceSection.getByText(price)).toBeVisible()
    },

    async validatePreview(color: ColorOption, wheel: WheelOption) {
      await expect(page.getByRole('img', { name: `Velô Sprint - ${color} with ${wheel} wheels` })).toBeVisible()
    },

    async toggleOptional(optional: OptionalOption) {
      await page.getByTestId(`opt-${optional}`).click()
    },

    async validateOptionalChecked(optional: OptionalOption, checked: boolean) {
      const checkbox = page.getByTestId(`opt-${optional}`)
      if (checked) {
        await expect(checkbox).toBeChecked()
      } else {
        await expect(checkbox).not.toBeChecked()
      }
    },

    async goToCheckout() {
      await page.getByRole('button', { name: 'Monte o Seu' }).click()
      await expect(page).toHaveURL(/\/order/)
    },

    async validateCheckoutSummaryOptional(name: string) {
      await expect(page.getByText(name)).toBeVisible()
    },

    async validateCheckoutTotalPrice(price: string) {
      await expect(page.getByTestId('summary-total-price')).toHaveText(price)
    }
  }
}
