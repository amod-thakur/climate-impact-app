import { describe, it, expect } from 'vitest'
import {
  toDrivingKm,
  toCanadianDailyPercent,
  formatEquivalent,
} from './equivalents'

describe('toDrivingKm', () => {
  it('converts 1.0 kg CO2e to 4.0 km', () => {
    expect(toDrivingKm(1.0)).toBe(4.0)
  })

  it('converts 0.25 kg CO2e to 1.0 km', () => {
    expect(toDrivingKm(0.25)).toBe(1.0)
  })

  it('converts 0 to 0', () => {
    expect(toDrivingKm(0)).toBe(0)
  })

  it('converts 2.6 kg CO2e (beef) to 10.4 km', () => {
    expect(toDrivingKm(2.6)).toBeCloseTo(10.4, 5)
  })
})

describe('toCanadianDailyPercent', () => {
  it('returns 100 for 3.98 kg CO2e', () => {
    expect(toCanadianDailyPercent(3.98)).toBeCloseTo(100, 5)
  })

  it('returns 50 for ~1.99 kg CO2e', () => {
    expect(toCanadianDailyPercent(1.99)).toBeCloseTo(50, 0)
  })

  it('returns 0 for 0', () => {
    expect(toCanadianDailyPercent(0)).toBe(0)
  })
})

describe('formatEquivalent', () => {
  it('formats very small values in metres', () => {
    // 0.01 kg → 0.04 km → 40 m
    expect(formatEquivalent(0.01)).toBe('like driving 40 m')
  })

  it('formats medium values with one decimal', () => {
    // 1.0 kg → 4.0 km
    expect(formatEquivalent(1.0)).toBe('like driving 4.0 km')
  })

  it('formats large values as rounded km', () => {
    // 2.6 kg → 10.4 km → rounds to 10 km
    expect(formatEquivalent(2.6)).toBe('like driving 10 km')
  })

  it('formats zero', () => {
    expect(formatEquivalent(0)).toBe('like driving 0 m')
  })
})
