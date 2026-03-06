import { test, expect } from '@playwright/test'

test.describe('Configurador (/configure) - regras de preço e preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configure')
    await expect(page).toHaveURL(/\/configure$/)
  })

  test('ao selecionar "Lunar White" deve manter o preço base (R$ 40.000,00) e atualizar o preview', async ({ page }) => {
    const previewImage = page.getByRole('img', { name: /Velô Sprint/i }).first()
    const priceSection = page.getByText('Preço de Venda').locator('..')
    const car = page.locator('img[alt^="Velô Sprint"]')

    // Checkpoint: estado inicial
    await expect(priceSection.getByText('R$ 40.000,00')).toBeVisible()
    await expect(previewImage).toHaveAttribute('alt', /aero wheels/i)

    // Act: trocar cor (não altera preço)
    await page.getByRole('button', { name: 'Lunar White' }).click()

    // Assert: preview muda e preço permanece
    await expect(car).toHaveAttribute('src', '/src/assets/lunar-white-aero-wheels.png')
    await expect(previewImage).toHaveAttribute('alt', /lunar-white/i)
    await expect(priceSection.getByText('R$ 40.000,00')).toBeVisible()
  })

  test('ao selecionar "Sport Wheels" deve somar +R$ 2.000 (R$ 42.000,00) e ao voltar "Aero Wheels" retornar ao base', async ({ page }) => {
    const previewImage = page.getByRole('img', { name: /Velô Sprint/i }).first()
    const priceSection = page.getByText('Preço de Venda').locator('..')
    const car = page.locator('img[alt^="Velô Sprint"]')

    // Checkpoint: estado inicial
    await expect(priceSection.getByText('R$ 40.000,00')).toBeVisible()
    await expect(previewImage).toHaveAttribute('alt', /aero wheels/i)

    // Act: selecionar Sport Wheels (+ R$ 2.000,00)
    await page.getByRole('button', { name: /Sport Wheels/i }).click()

    // Checkpoint: preço atualizado e preview com sport
    await expect(car).toHaveAttribute('src', '/src/assets/glacier-blue-sport-wheels.png')
    await expect(priceSection.getByText('R$ 42.000,00')).toBeVisible()
    await expect(previewImage).toHaveAttribute('alt', /sport wheels/i)

    // Act: voltar para Aero Wheels
    await page.getByRole('button', { name: /Aero Wheels/i }).click()

    // Assert: retorna ao preço base
    await expect(car).toHaveAttribute('src', '/src/assets/glacier-blue-aero-wheels.png')
    await expect(priceSection.getByText('R$ 40.000,00')).toBeVisible()
    await expect(previewImage).toHaveAttribute('alt', /aero wheels/i)
  })
})
