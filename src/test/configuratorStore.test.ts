import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateTotalPrice,
  calculateInstallment,
  formatPrice,
  useConfiguratorStore,
} from '@/store/configuratorStore'
import type { CarConfiguration, Order } from '@/store/configuratorStore'

const defaultConfig: CarConfiguration = {
  exteriorColor: 'glacier-blue',
  interiorColor: 'carbon-black',
  wheelType: 'aero',
  optionals: [],
}

const makeOrder = (email: string): Order => ({
  id: '1',
  configuration: defaultConfig,
  totalPrice: 40000,
  customer: { name: 'Test', surname: 'User', email, phone: '11999999999', cpf: '000.000.000-00', store: 'SP' },
  paymentMethod: 'avista',
  status: 'APROVADO',
  createdAt: new Date().toISOString(),
})

// ── calculateTotalPrice ──────────────────────────────────────

describe('calculateTotalPrice', () => {
  it('returns base price for default config', () => {
    expect(calculateTotalPrice(defaultConfig)).toBe(40000)
  })

  it('adds sport wheels price', () => {
    expect(calculateTotalPrice({ ...defaultConfig, wheelType: 'sport' })).toBe(42000)
  })

  it('adds precision-park optional price', () => {
    expect(calculateTotalPrice({ ...defaultConfig, optionals: ['precision-park'] })).toBe(45500)
  })

  it('accumulates sport wheels and all optionals', () => {
    expect(calculateTotalPrice({ ...defaultConfig, wheelType: 'sport', optionals: ['precision-park', 'flux-capacitor'] })).toBe(52500)
  })
})

// ── calculateInstallment ─────────────────────────────────────

describe('calculateInstallment', () => {
  it('returns a positive number for a valid total', () => {
    expect(calculateInstallment(40000)).toBeGreaterThan(0)
  })

  it('result is rounded to 2 decimal places', () => {
    const value = calculateInstallment(40000)
    expect(value).toBe(Math.round(value * 100) / 100)
  })
})

// ── formatPrice ──────────────────────────────────────────────

describe('formatPrice', () => {
  it('formats value with BRL currency symbol and Brazilian thousands separator', () => {
    const result = formatPrice(40000)
    expect(result).toContain('R$')
    expect(result).toContain('40.000')
  })
})

// ── store actions ────────────────────────────────────────────

describe('useConfiguratorStore actions', () => {
  beforeEach(() => {
    useConfiguratorStore.setState({
      configuration: { ...defaultConfig },
      viewMode: 'exterior',
      orders: [],
      currentUserEmail: null,
    })
  })

  it('setExteriorColor updates color and sets viewMode to exterior', () => {
    useConfiguratorStore.getState().setExteriorColor('midnight-black')
    const { configuration, viewMode } = useConfiguratorStore.getState()
    expect(configuration.exteriorColor).toBe('midnight-black')
    expect(viewMode).toBe('exterior')
  })

  it('toggleOptional adds the optional on first call and removes it on second', () => {
    const { toggleOptional } = useConfiguratorStore.getState()

    toggleOptional('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).toContain('precision-park')

    toggleOptional('precision-park')
    expect(useConfiguratorStore.getState().configuration.optionals).not.toContain('precision-park')
  })

  it('login returns true and sets currentUserEmail when order exists; logout clears it', () => {
    useConfiguratorStore.setState({ orders: [makeOrder('user@test.com')] })

    const result = useConfiguratorStore.getState().login('user@test.com')
    expect(result).toBe(true)
    expect(useConfiguratorStore.getState().currentUserEmail).toBe('user@test.com')

    useConfiguratorStore.getState().logout()
    expect(useConfiguratorStore.getState().currentUserEmail).toBeNull()
  })
})
