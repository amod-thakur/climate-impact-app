import { describe, it, expect } from 'vitest'
import { FOODS } from './foods'
import type { FoodCategory } from '../types'

describe('FOODS', () => {
  it('contains exactly 45 items', () => {
    expect(FOODS).toHaveLength(45)
  })

  it('every item has a unique id', () => {
    const ids = FOODS.map((f) => f.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('has 15 vegetables_fruits items', () => {
    const count = FOODS.filter(
      (f) => f.category === 'vegetables_fruits',
    ).length
    expect(count).toBe(15)
  })

  it('has 7 whole_grains items', () => {
    const count = FOODS.filter((f) => f.category === 'whole_grains').length
    expect(count).toBe(7)
  })

  it('has 18 protein items', () => {
    const count = FOODS.filter((f) => f.category === 'protein').length
    expect(count).toBe(18)
  })

  it('has 5 other items', () => {
    const count = FOODS.filter((f) => f.category === 'other').length
    expect(count).toBe(5)
  })

  it('protein sub-categories: 7 plant, 7 animal, 4 dairy', () => {
    const proteins = FOODS.filter((f) => f.category === 'protein')
    expect(proteins.filter((f) => f.sub_category === 'plant')).toHaveLength(7)
    expect(proteins.filter((f) => f.sub_category === 'animal')).toHaveLength(7)
    expect(proteins.filter((f) => f.sub_category === 'dairy')).toHaveLength(4)
  })

  it('non-protein items have sub_category === null', () => {
    const nonProtein = FOODS.filter((f) => f.category !== 'protein')
    for (const item of nonProtein) {
      expect(item.sub_category).toBeNull()
    }
  })

  it('co2e_per_portion matches co2e_per_kg * portion_weight_grams / 1000', () => {
    for (const item of FOODS) {
      const expected = item.co2e_per_kg * (item.portion_weight_grams / 1000)
      expect(item.co2e_per_portion).toBeCloseTo(expected, 2)
    }
  })

  it('every item has all required string fields populated', () => {
    for (const item of FOODS) {
      expect(item.id).toBeTruthy()
      expect(item.name).toBeTruthy()
      expect(item.portion_description).toBeTruthy()
      expect(item.ghg_note).toBeTruthy()
      expect(item.data_source).toBeTruthy()
      expect(item.data_source_url).toBeTruthy()
    }
  })

  it('every data_source_url is a valid URL', () => {
    for (const item of FOODS) {
      expect(() => new URL(item.data_source_url)).not.toThrow()
    }
  })

  it('every item has a valid category', () => {
    const valid: FoodCategory[] = [
      'vegetables_fruits',
      'whole_grains',
      'protein',
      'other',
    ]
    for (const item of FOODS) {
      expect(valid).toContain(item.category)
    }
  })

  it('every item has positive numeric values', () => {
    for (const item of FOODS) {
      expect(item.portion_weight_grams).toBeGreaterThan(0)
      expect(item.co2e_per_kg).toBeGreaterThan(0)
      expect(item.co2e_per_portion).toBeGreaterThan(0)
    }
  })

  it('weight_basis is one of raw, dry, or as_sold', () => {
    for (const item of FOODS) {
      expect(['raw', 'dry', 'as_sold']).toContain(item.weight_basis)
    }
  })

  it('dominant_ghg is one of CO2, CH4, or N2O', () => {
    for (const item of FOODS) {
      expect(['CO2', 'CH4', 'N2O']).toContain(item.dominant_ghg)
    }
  })
})
