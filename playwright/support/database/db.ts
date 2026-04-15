import 'dotenv/config'
import { Generated, Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'

export interface OrdersTable {
  id: Generated<string>
  order_number: string
  color: string
  wheel_type: string
  optionals: string[] | null
  customer_name: string
  customer_email: string
  customer_phone: string
  customer_cpf: string
  payment_method: string
  total_price: number
  status: string
  created_at: Generated<string>
  updated_at: Generated<string>
}

export interface Database {
  orders: OrdersTable
}

export function createDb(): Kysely<Database> {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    throw new Error('DATABASE_URL não configurado.')
  }

  return new Kysely<Database>({
    dialect: new PostgresDialect({
      pool: new Pool({ connectionString })
    })
  })
}
