import { test } from '../support/fixtures'

test.describe('Configurador de Veículo', () => {
  test.beforeEach(async ({ app }) => {
    await app.configurator.open()
  })

  test('deve atualizar o preview sem alterar o preço ao trocar a cor', async ({ app }) => {
    await app.configurator.validatePrice('R$ 40.000,00')

    await app.configurator.selectColor('midnight-black')
    await app.configurator.validatePreview('midnight-black', 'aero')
    await app.configurator.validatePrice('R$ 40.000,00')

    await app.configurator.selectColor('lunar-white')
    await app.configurator.validatePreview('lunar-white', 'aero')
    await app.configurator.validatePrice('R$ 40.000,00')
  })

  test('deve acrescer R$ 2.000,00 ao selecionar Sport Wheels e reverter ao voltar para Aero Wheels', async ({ app }) => {
    await app.configurator.validatePrice('R$ 40.000,00')

    await app.configurator.selectWheels('sport')
    await app.configurator.validatePreview('glacier-blue', 'sport')
    await app.configurator.validatePrice('R$ 42.000,00')

    await app.configurator.selectWheels('aero')
    await app.configurator.validatePreview('glacier-blue', 'aero')
    await app.configurator.validatePrice('R$ 40.000,00')
  })

  test('deve atualizar o preço ao marcar e desmarcar opcionais e redirecionar para checkout com valores persistidos', async ({ app }) => {
    // Arrange - valida estado inicial
    await app.configurator.validatePrice('R$ 40.000,00')
    await app.configurator.validateOptionalChecked('precision-park', false)
    await app.configurator.validateOptionalChecked('flux-capacitor', false)

    // Passo 1: Marcar "Precision Park" → +R$ 5.500,00
    await app.configurator.toggleOptional('precision-park')
    await app.configurator.validateOptionalChecked('precision-park', true)
    await app.configurator.validatePrice('R$ 45.500,00')

    // Passo 2: Marcar "Flux Capacitor" → +R$ 5.000,00
    await app.configurator.toggleOptional('flux-capacitor')
    await app.configurator.validateOptionalChecked('flux-capacitor', true)
    await app.configurator.validatePrice('R$ 50.500,00')

    // Passo 3: Desmarcar os dois opcionais → preço volta a R$ 40.000,00
    await app.configurator.toggleOptional('precision-park')
    await app.configurator.toggleOptional('flux-capacitor')
    await app.configurator.validateOptionalChecked('precision-park', false)
    await app.configurator.validateOptionalChecked('flux-capacitor', false)
    await app.configurator.validatePrice('R$ 40.000,00')

    // Passo 4: Selecionar Precision Park e ir para checkout com valores persistidos
    await app.configurator.toggleOptional('precision-park')
    await app.configurator.validatePrice('R$ 45.500,00')
    await app.configurator.goToCheckout()
    await app.configurator.validateCheckoutSummaryOptional('Precision Park')
    await app.configurator.validateCheckoutTotalPrice('R$ 45.500,00')
  })
})
