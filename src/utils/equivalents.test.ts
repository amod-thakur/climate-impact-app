import { describe, expect, it } from 'vitest'
import {
  toDrivingKm,
  toCanadianDailyPercent,
  formatEquivalent,
} from './equivalents'

describe('equivalents', () => {
  describe('toDrivingKm', () => {
    it('converts 1.0 kg CO2e to 4.0 km', () => {
      expect(toDrivingKm(1.0)).toBe(4.0)
    })

    it('converts 0.25 kg CO2e to 1.0 km', () => {
      expect(toDrivingKm(0.25)).toBe(1.0)
    })

    it('converts 0 kg CO2e to 0 km', () => {
      expect(toDrivingKm(0)).toBe(0)
    })

    it('converts 2.6 kg CO2e (beef) to 10.4 km', () => {
      expect(toDrivingKm(2.6)).toBeCloseTo(10.4, 1)
    })
  })

  describe('toCanadianDailyPercent', () => {
    it('returns 100 for 3.98 kg CO2e', () => {
      expect(toCanadianDailyPercent(3.98)).toBeCloseTo(100, 1)
    })

    it('returns 0 for 0 kg CO2e', () => {
      expect(toCanadianDailyPercent(0)).toBe(0)
    })

    it('returns ~50 for ~1.99 kg CO2e', () => {
      expect(toCanadianDailyPercent(1.99)).toBeCloseTo(50, 0)
    })
  })

  describe('formatEquivalent', () => {
    it('formats a standard value with driving equivalent', () => {
      const result = formatEquivalent(2.6)
      expect(result).toContain('2.60 kg CO2e')
      expect(result).toContain('driving')
      expect(result).toContain('10.4 km')
    })

    it('omits driving equivalent for very small values', () => {
      const result = formatEquivalent(0.005)
      expect(result).toBe('0.005 kg CO2e')
      expect(result).not.toContain('driving')
    })
  })
})
