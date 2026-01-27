import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
    //Arrange   
    await page.goto('http://localhost:5173/');
    await expect(page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' })).toBeVisible();
    await page.getByRole('link', { name: 'Consultar Pedido' }).click();
    await expect(page.getByRole('heading')).toContainText('Consultar Pedido');

    //Act
    await page.getByTestId('search-order-id').fill('VLO-PI2NR0');
    await page.getByTestId('search-order-button').click();

    //Assert
    await expect(page.getByTestId('order-result-id')).toContainText('VLO-PI2NR0');
    await expect(page.getByTestId('order-result-status')).toContainText('APROVADO');
});