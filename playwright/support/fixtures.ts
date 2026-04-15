import { test as base } from '@playwright/test'
import { createOrderLookupActions } from './actions/orderLookupActions'
import { createConfiguratorActions } from './actions/configuratorActions'
import { createDb } from './database/db'
import { insertOrder, deleteOrderByNumber } from './database/orderFactory'
import type { Kysely, Database } from './database/orderFactory'
import type { Insertable } from 'kysely'
import type { OrdersTable } from './database/db'

type App = {
  orderLookup: ReturnType<typeof createOrderLookupActions>
  configurator: ReturnType<typeof createConfiguratorActions>
}

type Orders = {
  insert: (order: Insertable<OrdersTable>) => Promise<void>
  deleteByNumber: (orderNumber: string) => Promise<void>
}

type WorkerFixtures = {
  db: Kysely<Database>
}

export const test = base.extend<{ app: App; orders: Orders }, WorkerFixtures>({
  db: [
    async ({}, use) => {
      const db = createDb()
      await use(db)
      await db.destroy()
    },
    { scope: 'worker' }
  ],
  orders: async ({ db }, use) => {
    await use({
      insert: (order) => insertOrder(db, order),
      deleteByNumber: (orderNumber) => deleteOrderByNumber(db, orderNumber)
    })
  },
  app: async ({ page }, use) => {
    const app: App = {
      orderLookup: createOrderLookupActions(page),
      configurator: createConfiguratorActions(page)
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(app)
  }
})

export { expect } from '@playwright/test'
