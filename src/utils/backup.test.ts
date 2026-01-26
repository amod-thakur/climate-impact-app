import { describe, it, expect, beforeEach } from 'vitest'
import { exportData, importData } from './backup'
import type { Meal } from '../types'

const sampleMeal: Meal = {
  id: 'meal-1',
  date: '2025-01-15',
  label: 'Lunch',
  items: [{ food_item_id: 'potatoes', portions: 1, co2e: 0.03 }],
  total_co2e: 0.03,
  driving_km_equivalent: 0.12,
}

beforeEach(() => {
  localStorage.clear()
})

describe('exportData', () => {
  it('exports empty meals array when nothing is stored', () => {
    const json = exportData()
    const data = JSON.parse(json)
    expect(data.version).toBe(1)
    expect(data.exported_at).toBeTruthy()
    expect(data.meals).toEqual([])
  })

  it('includes all stored meals', () => {
    localStorage.setItem('meals', JSON.stringify([sampleMeal]))
    const json = exportData()
    const data = JSON.parse(json)
    expect(data.meals).toHaveLength(1)
    expect(data.meals[0].id).toBe('meal-1')
  })

  it('includes all localStorage keys via meals', () => {
    const meals = [sampleMeal, { ...sampleMeal, id: 'meal-2' }]
    localStorage.setItem('meals', JSON.stringify(meals))
    const json = exportData()
    const data = JSON.parse(json)
    expect(data.meals).toHaveLength(2)
  })

  it('produces valid JSON parseable by importData', () => {
    localStorage.setItem('meals', JSON.stringify([sampleMeal]))
    const json = exportData()
    localStorage.clear()
    expect(importData(json)).toBe(true)
  })
})

describe('importData', () => {
  it('imports valid backup data', () => {
    const backup = {
      version: 1,
      exported_at: '2025-01-15T00:00:00.000Z',
      meals: [sampleMeal],
    }
    const result = importData(JSON.stringify(backup))
    expect(result).toBe(true)
    expect(JSON.parse(localStorage.getItem('meals')!)).toHaveLength(1)
  })

  it('rejects invalid JSON', () => {
    expect(importData('{broken')).toBe(false)
  })

  it('rejects missing version', () => {
    const bad = { exported_at: '2025-01-15', meals: [] }
    expect(importData(JSON.stringify(bad))).toBe(false)
  })

  it('rejects wrong version', () => {
    const bad = { version: 2, exported_at: '2025-01-15', meals: [] }
    expect(importData(JSON.stringify(bad))).toBe(false)
  })

  it('rejects missing meals array', () => {
    const bad = { version: 1, exported_at: '2025-01-15' }
    expect(importData(JSON.stringify(bad))).toBe(false)
  })

  it('rejects meals with invalid structure', () => {
    const bad = {
      version: 1,
      exported_at: '2025-01-15',
      meals: [{ not_a_meal: true }],
    }
    expect(importData(JSON.stringify(bad))).toBe(false)
  })

  it('rejects meal items with invalid structure', () => {
    const bad = {
      version: 1,
      exported_at: '2025-01-15',
      meals: [
        {
          id: 'm1',
          date: '2025-01-15',
          label: null,
          items: [{ food_item_id: 123 }], // should be string
          total_co2e: 0,
          driving_km_equivalent: 0,
        },
      ],
    }
    expect(importData(JSON.stringify(bad))).toBe(false)
  })

  it('accepts null label on meals', () => {
    const backup = {
      version: 1,
      exported_at: '2025-01-15',
      meals: [{ ...sampleMeal, label: null }],
    }
    expect(importData(JSON.stringify(backup))).toBe(true)
  })

  it('does not overwrite existing data on failure', () => {
    localStorage.setItem('meals', JSON.stringify([sampleMeal]))
    importData('{broken')
    expect(JSON.parse(localStorage.getItem('meals')!)).toHaveLength(1)
  })
})
