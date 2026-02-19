import { Page, expect } from '@playwright/test'

type OrderStatus = 'APROVADO' | 'REPROVADO' | 'EM_ANALISE'

export type OrderDetails = {
  number: string
  status: OrderStatus
  color: string
  wheels: string
  customer: { name: string; email: string }
  payment: string
}

const statusClasses = {
  APROVADO: ['bg-green-100', 'text-green-700', 'lucide-circle-check-big'],
  REPROVADO: ['bg-red-100', 'text-red-700', 'lucide-circle-x'],
  EM_ANALISE: ['bg-amber-100', 'text-amber-700', 'lucide-clock']
} as const

export function createOrderLookupActions(page: Page) {
  const orderInput = page.getByRole('textbox', { name: 'Número do Pedido' })
  const searchButton = page.getByRole('button', { name: 'Buscar Pedido' })

  return {
    elements: {
      orderInput,
      searchButton
    },

    async open() {
      await page.goto('/')
      await expect(page.getByTestId('hero-section').getByRole('heading', { name: 'Velô Sprint' })).toBeVisible()

      await page.getByRole('link', { name: 'Consultar Pedido' }).click()
      await expect(page.getByRole('heading')).toContainText('Consultar Pedido')
    },

    async searchOrder(code: string) {
      await orderInput.fill(code)
      await searchButton.click()
    },

    async validateOrderDetails(order: OrderDetails) {
      const orderResult = page.getByTestId(`order-result-${order.number}`)
      await expect(orderResult).toMatchAriaSnapshot(`
      - img
      - paragraph: Pedido
      - paragraph: ${order.number}
      - status:
        - img
        - text: ${order.status}
      - img "Velô Sprint"
      - paragraph: Modelo
      - paragraph: Velô Sprint
      - paragraph: Cor
      - paragraph: ${order.color}
      - paragraph: Interior
      - paragraph: cream
      - paragraph: Rodas
      - paragraph: ${order.wheels}
      - heading "Dados do Cliente" [level=4]
      - paragraph: Nome
      - paragraph: ${order.customer.name}
      - paragraph: Email
      - paragraph: ${order.customer.email}
      - paragraph: Loja de Retirada
      - paragraph
      - paragraph: Data do Pedido
      - paragraph: /\\d+\\/\\d+\\/\\d+/
      - heading "Pagamento" [level=4]
      - paragraph: ${order.payment}
      - paragraph: /R\\$ \\d+\\.\\d+,\\d+/
      `)

      const [bgClass, textClass, iconClass] = statusClasses[order.status]
      const statusBadge = page.getByRole('status').filter({ hasText: order.status })
      await expect(statusBadge).toHaveClass(new RegExp(bgClass))
      await expect(statusBadge).toHaveClass(new RegExp(textClass))
      await expect(statusBadge.locator('svg')).toHaveClass(new RegExp(iconClass))
    },

    async validateOrderNotFoundMessage() {
      await expect(page.locator('#root')).toMatchAriaSnapshot(`
      - img
      - heading "Pedido não encontrado" [level=3]
      - paragraph: Verifique o número do pedido e tente novamente
      `)
    }
  }
}
