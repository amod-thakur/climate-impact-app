import { describe, expect, it } from 'vitest'
import { FOODS } from './foods'
import type { FoodCategory, FoodItem } from '../types'

describe('FOODS static data module', () => {
  it('contains exactly 45 food items', () => {
    expect(FOODS).toHaveLength(45)
  })

  it('every item has a unique id', () => {
    const ids = FOODS.map((f) => f.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(FOODS.length)
  })

  it('every item has all required FoodItem fields populated', () => {
    for (const food of FOODS) {
      expect(food.id).toBeTruthy()
      expect(food.name).toBeTruthy()
      expect(food.category).toBeTruthy()
      expect(food.portion_description).toBeTruthy()
      expect(food.portion_weight_grams).toBeGreaterThan(0)
      expect(food.weight_basis).toBeTruthy()
      expect(food.co2e_per_kg).toBeGreaterThan(0)
      expect(food.co2e_per_portion).toBeGreaterThan(0)
      expect(food.dominant_ghg).toBeTruthy()
      expect(food.ghg_note).toBeTruthy()
      expect(food.data_source).toBeTruthy()
      expect(food.data_source_url).toMatch(/^https?:\/\//)
    }
  })

  it('co2e_per_portion matches co2e_per_kg × portion_weight_grams / 1000', () => {
    for (const food of FOODS) {
      const expected = food.co2e_per_kg * food.portion_weight_grams / 1000
      expect(food.co2e_per_portion).toBeCloseTo(expected, 3)
    }
  })

  describe('category counts', () => {
    it('has 15 vegetables & fruits', () => {
      const count = FOODS.filter((f) => f.category === 'vegetables_fruits').length
      expect(count).toBe(15)
    })

    it('has 7 whole grains', () => {
      const count = FOODS.filter((f) => f.category === 'whole_grains').length
      expect(count).toBe(7)
    })

    it('has 23 protein + other items', () => {
      const protein = FOODS.filter((f) => f.category === 'protein').length
      const other = FOODS.filter((f) => f.category === 'other').length
      expect(protein + other).toBe(23)
    })
  })

  describe('protein sub-categories', () => {
    it('has 7 plant-based proteins', () => {
      const count = FOODS.filter(
        (f) => f.category === 'protein' && f.sub_category === 'plant',
      ).length
      expect(count).toBe(7)
    })

    it('has 7 animal proteins', () => {
      const count = FOODS.filter(
        (f) => f.category === 'protein' && f.sub_category === 'animal',
      ).length
      expect(count).toBe(7)
    })

    it('has 4 dairy proteins', () => {
      const count = FOODS.filter(
        (f) => f.category === 'protein' && f.sub_category === 'dairy',
      ).length
      expect(count).toBe(4)
    })
  })

  describe('sub_category correctness', () => {
    it('non-protein items have null sub_category', () => {
      const nonProtein = FOODS.filter(
        (f) => f.category !== 'protein' && f.category !== 'other',
      )
      for (const food of nonProtein) {
        expect(food.sub_category).toBeNull()
      }
    })

    it('protein items have a non-null sub_category', () => {
      const protein = FOODS.filter((f) => f.category === 'protein')
      for (const food of protein) {
        expect(food.sub_category).not.toBeNull()
        expect(['plant', 'animal', 'dairy']).toContain(food.sub_category)
      }
    })
  })

  describe('specific item spot checks', () => {
    function findById(id: string): FoodItem {
      const item = FOODS.find((f) => f.id === id)
      if (!item) throw new Error(`Item not found: ${id}`)
      return item
    }

    it('beef has Canadian-specific emission factor of 26.0 kg CO2e/kg', () => {
      const beef = findById('beef')
      expect(beef.co2e_per_kg).toBe(26.0)
      expect(beef.co2e_per_portion).toBe(2.6)
      expect(beef.dominant_ghg).toBe('CH4')
      expect(beef.data_source).toBe('NBSA/Holos')
    })

    it('chicken uses CFC LCA 2023 at 2.2 kg CO2e/kg', () => {
      const chicken = findById('chicken')
      expect(chicken.co2e_per_kg).toBe(2.2)
      expect(chicken.data_source).toBe('CFC LCA 2023')
    })

    it('brown rice has CH4 as dominant GHG', () => {
      const rice = findById('brown-rice')
      expect(rice.dominant_ghg).toBe('CH4')
      expect(rice.co2e_per_kg).toBe(3.0)
    })

    it('lentils are plant-based protein', () => {
      const lentils = findById('lentils')
      expect(lentils.category).toBe('protein')
      expect(lentils.sub_category).toBe('plant')
    })

    it('milk uses Canadian dairy LCA', () => {
      const milk = findById('milk-2pct')
      expect(milk.data_source).toBe('Canadian Dairy LCA')
      expect(milk.dominant_ghg).toBe('CH4')
    })

    it('coffee has very low per-kg emissions due to water weight', () => {
      const coffee = findById('coffee-brewed')
      expect(coffee.co2e_per_kg).toBe(0.06)
      expect(coffee.category).toBe('other')
    })
  })

  describe('data quality', () => {
    it('all weight_basis values are valid', () => {
      for (const food of FOODS) {
        expect(['raw', 'dry', 'as_sold']).toContain(food.weight_basis)
      }
    })

    it('all dominant_ghg values are valid', () => {
      for (const food of FOODS) {
        expect(['CO2', 'CH4', 'N2O']).toContain(food.dominant_ghg)
      }
    })

    it('all category values are valid', () => {
      const validCategories: FoodCategory[] = [
        'vegetables_fruits',
        'whole_grains',
        'protein',
        'other',
      ]
      for (const food of FOODS) {
        expect(validCategories).toContain(food.category)
      }
    })

    it('portion weights are realistic (4–258 grams)', () => {
      for (const food of FOODS) {
        expect(food.portion_weight_grams).toBeGreaterThanOrEqual(4)
        expect(food.portion_weight_grams).toBeLessThanOrEqual(258)
      }
    })

    it('emission factors are realistic (0.06–26.0 kg CO2e/kg)', () => {
      for (const food of FOODS) {
        expect(food.co2e_per_kg).toBeGreaterThanOrEqual(0.06)
        expect(food.co2e_per_kg).toBeLessThanOrEqual(26.0)
      }
    })
  })
})
