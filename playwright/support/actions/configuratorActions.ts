import { Page, expect } from '@playwright/test'

type ColorOption = 'glacier-blue' | 'midnight-black' | 'lunar-white'
type WheelOption = 'aero' | 'sport'

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
      await expect(
        page.getByRole('img', { name: `Velô Sprint - ${color} with ${wheel} wheels` })
      ).toBeVisible()
    }
  }
}
