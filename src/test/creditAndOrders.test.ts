import { describe, it, expect } from 'vitest'
import { determineCreditStatus } from '@/lib/creditDecision'
import { dbOrderToOrder } from '@/hooks/useOrders'
import type { DbOrder } from '@/hooks/useOrders'

// ── determineCreditStatus ────────────────────────────────────

describe('determineCreditStatus', () => {
  it('approves when score is above 700', () => {
    expect(determineCreditStatus(750, 0.2)).toBe('APROVADO')
  })

  it('approves when entry >= 50% even with low score', () => {
    expect(determineCreditStatus(600, 0.5)).toBe('APROVADO')
  })

  it('puts in analysis when score is between 501 and 700 with low entry', () => {
    expect(determineCreditStatus(600, 0.3)).toBe('EM_ANALISE')
  })

  it('rejects when score is 500 or below', () => {
    expect(determineCreditStatus(400, 0.3)).toBe('REPROVADO')
  })

  it('score exactly 700 falls into EM_ANALISE (rule 2 requires strictly > 700)', () => {
    expect(determineCreditStatus(700, 0.3)).toBe('EM_ANALISE')
  })

  it('entry exactly 50% with score 699 triggers rule 1 and approves', () => {
    expect(determineCreditStatus(699, 0.5)).toBe('APROVADO')
  })
})

// ── dbOrderToOrder ───────────────────────────────────────────

const baseDbOrder: DbOrder = {
  id: 'uuid-1',
  order_number: 'VLO-ABC123',
  color: 'glacier-blue',
  wheel_type: 'aero',
  optionals: ['precision-park'],
  customer_name: 'Ana Maria Santos',
  customer_email: 'ana@test.com',
  customer_phone: '11999999999',
  customer_cpf: '000.000.000-00',
  payment_method: 'avista',
  total_price: 45500,
  status: 'APROVADO',
  created_at: '2026-05-04T00:00:00.000Z',
  updated_at: '2026-05-04T00:00:00.000Z',
}

describe('dbOrderToOrder', () => {
  it('splits compound name correctly', () => {
    const order = dbOrderToOrder(baseDbOrder)
    expect(order.customer.name).toBe('Ana')
    expect(order.customer.surname).toBe('Maria Santos')
  })

  it('handles single name with no surname', () => {
    const order = dbOrderToOrder({ ...baseDbOrder, customer_name: 'João' })
    expect(order.customer.name).toBe('João')
    expect(order.customer.surname).toBe('')
  })

  it('converts null optionals from DB to empty array', () => {
    const order = dbOrderToOrder({ ...baseDbOrder, optionals: null })
    expect(order.configuration.optionals).toEqual([])
  })
})
