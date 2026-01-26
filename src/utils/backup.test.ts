import { describe, expect, it, beforeEach } from 'vitest'
import { exportData, importData } from './backup'
import type { Meal } from '../types'

const MEALS_KEY = 'co2-tracker-meals'

const sampleMeal: Meal = {
  id: 'meal-1',
  date: '2025-01-15',
  label: 'Lunch',
  items: [
    { food_item_id: 'potatoes', portions: 1, co2e: 0.03 },
    { food_item_id: 'beef', portions: 1, co2e: 2.6 },
  ],
  total_co2e: 2.63,
  driving_km_equivalent: 10.52,
}

describe('backup', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  describe('exportData', () => {
    it('exports an empty array when no meals are saved', () => {
      const json = exportData()
      const data = JSON.parse(json)

      expect(data.version).toBe(1)
      expect(data.exported_at).toBeTruthy()
      expect(data.meals).toEqual([])
    })

    it('exports all saved meals', () => {
      localStorage.setItem(MEALS_KEY, JSON.stringify([sampleMeal]))

      const json = exportData()
      const data = JSON.parse(json)

      expect(data.meals).toHaveLength(1)
      expect(data.meals[0].id).toBe('meal-1')
    })

    it('includes metadata in the export', () => {
      const json = exportData()
      const data = JSON.parse(json)

      expect(data.version).toBe(1)
      expect(typeof data.exported_at).toBe('string')
      expect(new Date(data.exported_at).getTime()).not.toBeNaN()
    })
  })

  describe('importData', () => {
    it('imports valid backup data and writes to localStorage', () => {
      const backup = {
        version: 1,
        exported_at: '2025-01-15T12:00:00Z',
        meals: [sampleMeal],
      }

      const result = importData(JSON.stringify(backup))

      expect(result).toBe(true)
      const stored = JSON.parse(localStorage.getItem(MEALS_KEY)!)
      expect(stored).toHaveLength(1)
      expect(stored[0].id).toBe('meal-1')
    })

    it('rejects invalid JSON', () => {
      const result = importData('{not valid json')
      expect(result).toBe(false)
    })

    it('rejects data with wrong version', () => {
      const backup = {
        version: 99,
        exported_at: '2025-01-15T12:00:00Z',
        meals: [],
      }
      const result = importData(JSON.stringify(backup))
      expect(result).toBe(false)
    })

    it('rejects data with missing fields', () => {
      const result = importData(JSON.stringify({ foo: 'bar' }))
      expect(result).toBe(false)
    })

    it('rejects data with invalid meal structure', () => {
      const backup = {
        version: 1,
        exported_at: '2025-01-15T12:00:00Z',
        meals: [{ invalid: true }],
      }
      const result = importData(JSON.stringify(backup))
      expect(result).toBe(false)
    })

    it('does not overwrite localStorage on invalid import', () => {
      localStorage.setItem(MEALS_KEY, JSON.stringify([sampleMeal]))

      const result = importData('{bad json')

      expect(result).toBe(false)
      const stored = JSON.parse(localStorage.getItem(MEALS_KEY)!)
      expect(stored).toHaveLength(1) // original data intact
    })

    it('handles empty meals array', () => {
      const backup = {
        version: 1,
        exported_at: '2025-01-15T12:00:00Z',
        meals: [],
      }
      const result = importData(JSON.stringify(backup))
      expect(result).toBe(true)
    })
  })
})
