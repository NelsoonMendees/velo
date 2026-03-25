import { test, expect } from '@playwright/test'

test.describe('CT03 - Configuração do Veículo - Adição de Opcionais e Cálculo de Preço', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/configure')
  })

  test('deve atualizar o preço ao marcar e desmarcar opcionais e redirecionar para checkout com valores persistidos', async ({ page }) => {
    // Arrange - valida estado inicial
    await expect(page.getByText('R$ 40.000,00')).toBeVisible()
    await expect(page.getByRole('checkbox', { name: /Precision Park/ })).not.toBeChecked()
    await expect(page.getByRole('checkbox', { name: /Flux Capacitor/ })).not.toBeChecked()

    // Act - Passo 1: Marcar "Precision Park"
    await page.getByRole('checkbox', { name: /Precision Park/ }).click()

    // Assert - preço acrescido de R$ 5.500,00 → R$ 45.500,00
    await expect(page.getByRole('checkbox', { name: /Precision Park/ })).toBeChecked()
    await expect(page.getByText('R$ 45.500,00')).toBeVisible()

    // Act - Passo 2: Marcar "Flux Capacitor"
    await page.getByRole('checkbox', { name: /Flux Capacitor/ }).click()

    // Assert - preço acrescido de R$ 5.000,00 → R$ 50.500,00
    await expect(page.getByRole('checkbox', { name: /Flux Capacitor/ })).toBeChecked()
    await expect(page.getByText('R$ 50.500,00')).toBeVisible()

    // Act - Passo 3: Desmarcar os dois opcionais
    await page.getByRole('checkbox', { name: /Precision Park/ }).click()
    await page.getByRole('checkbox', { name: /Flux Capacitor/ }).click()

    // Assert - preço voltou ao valor inicial R$ 40.000,00
    await expect(page.getByRole('checkbox', { name: /Precision Park/ })).not.toBeChecked()
    await expect(page.getByRole('checkbox', { name: /Flux Capacitor/ })).not.toBeChecked()
    await expect(page.getByText('R$ 40.000,00')).toBeVisible()

    // Act - Passo 4: Selecionar Precision Park e navegar para checkout
    await page.getByRole('checkbox', { name: /Precision Park/ }).click()
    await expect(page.getByText('R$ 45.500,00')).toBeVisible()

    await page.getByRole('button', { name: 'Monte o Seu' }).click()

    // Assert - redirecionado para /order com configuração e preço persistidos
    await expect(page).toHaveURL(/\/order/)
    await expect(page.getByText('Precision Park')).toBeVisible()
    await expect(page.getByTestId('summary-total-price')).toHaveText('R$ 45.500,00')
  })
})
