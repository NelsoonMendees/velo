import { test as base } from '@playwright/test'
import { createOrderLookupActions } from './actions/orderLookupActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createCheckoutActions } from './actions/checkoutActions'
import { createSuccessActions } from './actions/successActions'
import { createDb } from './database/db'
import { insertOrder, deleteOrderByNumber, deleteOrdersByCpf } from './database/orderFactory'
import type { Kysely, Database } from './database/orderFactory'
import type { Insertable } from 'kysely'
import type { OrdersTable } from './database/db'

type App = {
  orderLookup: ReturnType<typeof createOrderLookupActions>
  configurator: ReturnType<typeof createConfiguratorActions>
  checkout: ReturnType<typeof createCheckoutActions>
  success: ReturnType<typeof createSuccessActions>
}

type Orders = {
  insert: (order: Insertable<OrdersTable>) => Promise<void>
  deleteByNumber: (orderNumber: string) => Promise<void>
  deleteByCpf: (cpf: string) => Promise<void>
}

type WorkerFixtures = {
  db: Kysely<Database>
}

export const test = base.extend<{ app: App; orders: Orders }, WorkerFixtures>({
  db: [
    // eslint-disable-next-line no-empty-pattern
    async ({}, use) => {
      const db = createDb()
      await use(db)
      await db.destroy()
    },
    { scope: 'worker' }
  ],
  orders: async ({ db }, use) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use({
      insert: (order) => insertOrder(db, order),
      deleteByNumber: (orderNumber) => deleteOrderByNumber(db, orderNumber),
      deleteByCpf: (cpf) => deleteOrdersByCpf(db, cpf),
    })
  },
  app: async ({ page }, use) => {
    const app: App = {
      orderLookup: createOrderLookupActions(page),
      configurator: createConfiguratorActions(page),
      checkout: createCheckoutActions(page),
      success: createSuccessActions(page),
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(app)
  }
})

export { expect } from '@playwright/test'
