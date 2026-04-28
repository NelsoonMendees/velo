import { Insertable, Kysely } from 'kysely'
import type { Database, OrdersTable } from './db'
import type { OrderDetails, OrderStatus } from '../actions/orderLookupActions'

export type { Kysely, Database }

type NewOrder = Insertable<OrdersTable>

type TestOrderInput = {
  number: string
  status: OrderStatus
  customerName: string
  customerEmail: string
  customerPhone: string
  customerCpf: string
  color: { db: string; display: string }
  wheels: { db: string; display: string }
  payment: { db: string; display: string }
  totalPrice: { db: number; display: string }
  optionals?: string[] | null
}

export function buildOrder(input: TestOrderInput) {
  return {
    db: {
      order_number: input.number,
      color: input.color.db,
      wheel_type: input.wheels.db,
      optionals: input.optionals ?? null,
      customer_name: input.customerName,
      customer_email: input.customerEmail,
      customer_phone: input.customerPhone,
      customer_cpf: input.customerCpf,
      payment_method: input.payment.db,
      total_price: input.totalPrice.db,
      status: input.status,
    },
    details: {
      number: input.number,
      status: input.status,
      color: input.color.display,
      wheels: input.wheels.display,
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      payment: input.payment.display,
      totalPrice: input.totalPrice.display,
    } satisfies OrderDetails,
  }
}

export async function insertOrder(db: Kysely<Database>, order: NewOrder): Promise<void> {
  await db
    .insertInto('orders')
    .values(order)
    .onConflict((oc) =>
      oc.column('order_number').doUpdateSet({
        color: order.color,
        wheel_type: order.wheel_type,
        status: order.status,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        customer_cpf: order.customer_cpf,
        payment_method: order.payment_method,
        total_price: order.total_price,
        optionals: order.optionals
      })
    )
    .execute()
}

export async function deleteOrderByNumber(db: Kysely<Database>, orderNumber: string): Promise<void> {
  await db.deleteFrom('orders').where('order_number', '=', orderNumber).execute()
}

export async function deleteOrdersByCpf(db: Kysely<Database>, cpf: string): Promise<void> {
  await db.deleteFrom('orders').where('customer_cpf', '=', cpf).execute()
}
