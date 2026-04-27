import { Insertable, Kysely } from 'kysely'
import type { Database, OrdersTable } from './db'
import type { OrderDetails } from '../actions/orderLookupActions'

export type { Kysely, Database }

type NewOrder = Insertable<OrdersTable>

type TestOrder = {
  db: NewOrder
  details: OrderDetails
}

export const TEST_ORDERS: Record<'APROVADO' | 'REPROVADO' | 'EM_ANALISE', TestOrder> = {
  APROVADO: {
    db: {
      order_number: 'VLO-SE4R01',
      color: 'midnight-black',
      wheel_type: 'sport',
      optionals: null,
      customer_name: 'Nelson Mendes',
      customer_email: 'nelson_mendes@live.com',
      customer_phone: '(11) 99999-0001',
      customer_cpf: '000.000.000-01',
      payment_method: 'avista',
      total_price: 40000,
      status: 'APROVADO'
    },
    details: {
      number: 'VLO-SE4R01',
      status: 'APROVADO',
      color: 'Midnight Black',
      wheels: 'sport Wheels',
      customer: { name: 'Nelson Mendes', email: 'nelson_mendes@live.com' },
      payment: 'À Vista'
    }
  },
  REPROVADO: {
    db: {
      order_number: 'VLO-SE4R02',
      color: 'lunar-white',
      wheel_type: 'sport',
      optionals: null,
      customer_name: 'Lorraine Crispim',
      customer_email: 'lorrainecrispim20@outlook.com',
      customer_phone: '(11) 99999-0002',
      customer_cpf: '000.000.000-02',
      payment_method: 'avista',
      total_price: 40000,
      status: 'REPROVADO'
    },
    details: {
      number: 'VLO-SE4R02',
      status: 'REPROVADO',
      color: 'Lunar White',
      wheels: 'sport Wheels',
      customer: { name: 'Lorraine Crispim', email: 'lorrainecrispim20@outlook.com' },
      payment: 'À Vista'
    }
  },
  EM_ANALISE: {
    db: {
      order_number: 'VLO-SE4R03',
      color: 'glacier-blue',
      wheel_type: 'aero',
      optionals: null,
      customer_name: 'Fernanda Karolina',
      customer_email: 'fernanda@qa.com',
      customer_phone: '(62) 98888-4444',
      customer_cpf: '736.649.410-04',
      payment_method: 'avista',
      total_price: 40000,
      status: 'EM_ANALISE'
    },
    details: {
      number: 'VLO-SE4R03',
      status: 'EM_ANALISE',
      color: 'Glacier Blue',
      wheels: 'aero Wheels',
      customer: { name: 'Fernanda Karolina', email: 'fernanda@qa.com' },
      payment: 'À Vista'
    }
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

export async function deleteTestOrders(db: Kysely<Database>): Promise<void> {
  const orderNumbers = Object.values(TEST_ORDERS).map((o) => o.db.order_number as string)
  await db.deleteFrom('orders').where('order_number', 'in', orderNumbers).execute()
}
