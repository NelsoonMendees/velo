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
})
