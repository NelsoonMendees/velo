import { test as base } from '@playwright/test'
import { createOrderLookupActions } from './actions/orderLookupActions'

type App = {
  orderLookup: ReturnType<typeof createOrderLookupActions>
}

export const test = base.extend<{ app: App }>({
  app: async ({ page }, use) => {
    const app: App = {
      orderLookup: createOrderLookupActions(page)
    }
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(app)
  }
})

export { expect } from '@playwright/test'
