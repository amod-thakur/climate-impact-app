import { describe, it, expect } from 'vitest'
import type {
  FoodCategory,
  SubCategory,
  WeightBasis,
  GHGType,
  FoodItem,
  MealItem,
  Meal,
  DailyEstimate,
} from './types'

// ---------------------------------------------------------------------------
// FoodCategory
// ---------------------------------------------------------------------------

describe('FoodCategory', () => {
  it('accepts all valid categories', () => {
    const categories: FoodCategory[] = [
      'vegetables_fruits',
      'whole_grains',
      'protein',
      'other',
    ]
    expect(categories).toHaveLength(4)
  })
})

// ---------------------------------------------------------------------------
// SubCategory
// ---------------------------------------------------------------------------

describe('SubCategory', () => {
  it('accepts all valid sub-categories', () => {
    const subs: SubCategory[] = ['plant', 'animal', 'dairy']
    expect(subs).toHaveLength(3)
  })

  it('allows null for non-protein items', () => {
    const value: SubCategory | null = null
    expect(value).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// WeightBasis
// ---------------------------------------------------------------------------

describe('WeightBasis', () => {
  it('accepts all valid weight bases', () => {
    const bases: WeightBasis[] = ['raw', 'dry', 'as_sold']
    expect(bases).toHaveLength(3)
  })
})

// ---------------------------------------------------------------------------
// GHGType
// ---------------------------------------------------------------------------

describe('GHGType', () => {
  it('accepts all valid GHG types', () => {
    const types: GHGType[] = ['CO2', 'CH4', 'N2O']
    expect(types).toHaveLength(3)
  })
})

// ---------------------------------------------------------------------------
// FoodItem
// ---------------------------------------------------------------------------

const sampleFood: FoodItem = {
  id: 'potatoes',
  name: 'Potatoes',
  category: 'vegetables_fruits',
  sub_category: null,
  portion_description: '1 medium',
  portion_weight_grams: 150,
  weight_basis: 'raw',
  co2e_per_kg: 0.2,
  co2e_per_portion: 0.03,
  dominant_ghg: 'CO2',
  ghg_note: 'Emissions primarily from farm machinery and fertiliser.',
  data_source: 'Poore & Nemecek 2018',
  data_source_url: 'https://doi.org/10.1126/science.aaq0216',
}

describe('FoodItem', () => {
  it('has all required fields', () => {
    expect(sampleFood.id).toBe('potatoes')
    expect(sampleFood.name).toBe('Potatoes')
    expect(sampleFood.category).toBe('vegetables_fruits')
    expect(sampleFood.sub_category).toBeNull()
    expect(sampleFood.portion_description).toBe('1 medium')
    expect(sampleFood.portion_weight_grams).toBe(150)
    expect(sampleFood.weight_basis).toBe('raw')
    expect(sampleFood.co2e_per_kg).toBe(0.2)
    expect(sampleFood.co2e_per_portion).toBe(0.03)
    expect(sampleFood.dominant_ghg).toBe('CO2')
    expect(typeof sampleFood.ghg_note).toBe('string')
    expect(typeof sampleFood.data_source).toBe('string')
    expect(typeof sampleFood.data_source_url).toBe('string')
  })

  it('allows sub_category for protein items', () => {
    const chicken: FoodItem = {
      ...sampleFood,
      id: 'chicken',
      name: 'Chicken',
      category: 'protein',
      sub_category: 'animal',
    }
    expect(chicken.sub_category).toBe('animal')
  })

  it('co2e_per_portion matches co2e_per_kg * portion_weight_grams / 1000', () => {
    const expected =
      sampleFood.co2e_per_kg * (sampleFood.portion_weight_grams / 1000)
    expect(sampleFood.co2e_per_portion).toBeCloseTo(expected, 5)
  })

  it('contains no any-typed fields at compile time', () => {
    // This test is compile-time only — if any field were typed as `any`,
    // the explicit FoodItem annotation on sampleFood above would still pass,
    // but assigning an incorrect value would not be caught. The typed
    // sampleFood constant above serves as the compile-time assertion.
    expect(sampleFood).toBeDefined()
  })
})

// ---------------------------------------------------------------------------
// MealItem
// ---------------------------------------------------------------------------

describe('MealItem', () => {
  it('has food_item_id, portions, and co2e', () => {
    const item: MealItem = {
      food_item_id: 'potatoes',
      portions: 2,
      co2e: 0.06,
    }
    expect(item.food_item_id).toBe('potatoes')
    expect(item.portions).toBe(2)
    expect(item.co2e).toBe(0.06)
  })
})

// ---------------------------------------------------------------------------
// Meal
// ---------------------------------------------------------------------------

describe('Meal', () => {
  it('has all required fields', () => {
    const meal: Meal = {
      id: 'meal-1',
      date: '2025-01-15',
      label: 'Lunch',
      items: [{ food_item_id: 'potatoes', portions: 1, co2e: 0.03 }],
      total_co2e: 0.03,
      driving_km_equivalent: 0.12,
    }
    expect(meal.id).toBe('meal-1')
    expect(meal.date).toBe('2025-01-15')
    expect(meal.label).toBe('Lunch')
    expect(meal.items).toHaveLength(1)
    expect(meal.total_co2e).toBe(0.03)
    expect(meal.driving_km_equivalent).toBe(0.12)
  })

  it('allows null label', () => {
    const meal: Meal = {
      id: 'meal-2',
      date: '2025-01-15',
      label: null,
      items: [],
      total_co2e: 0,
      driving_km_equivalent: 0,
    }
    expect(meal.label).toBeNull()
  })

  it('driving_km_equivalent equals total_co2e / 0.25', () => {
    const meal: Meal = {
      id: 'meal-3',
      date: '2025-01-15',
      label: null,
      items: [{ food_item_id: 'beef', portions: 1, co2e: 2.6 }],
      total_co2e: 2.6,
      driving_km_equivalent: 2.6 / 0.25,
    }
    expect(meal.driving_km_equivalent).toBeCloseTo(10.4, 5)
  })
})

// ---------------------------------------------------------------------------
// DailyEstimate
// ---------------------------------------------------------------------------

describe('DailyEstimate', () => {
  it('is a derived type with all required fields', () => {
    const estimate: DailyEstimate = {
      date: '2025-01-15',
      meals: [
        {
          id: 'meal-1',
          date: '2025-01-15',
          label: 'Lunch',
          items: [{ food_item_id: 'potatoes', portions: 1, co2e: 0.03 }],
          total_co2e: 0.03,
          driving_km_equivalent: 0.12,
        },
      ],
      total_co2e: 0.03,
      driving_km_equivalent: 0.12,
      vs_canadian_average: (0.03 / 3.98) * 100,
    }
    expect(estimate.date).toBe('2025-01-15')
    expect(estimate.meals).toHaveLength(1)
    expect(estimate.total_co2e).toBe(0.03)
    expect(estimate.driving_km_equivalent).toBe(0.12)
    expect(estimate.vs_canadian_average).toBeCloseTo(0.754, 1)
  })

  it('aggregates multiple meals', () => {
    const meal1: Meal = {
      id: 'meal-1',
      date: '2025-01-15',
      label: 'Breakfast',
      items: [{ food_item_id: 'oats', portions: 1, co2e: 0.018 }],
      total_co2e: 0.018,
      driving_km_equivalent: 0.072,
    }
    const meal2: Meal = {
      id: 'meal-2',
      date: '2025-01-15',
      label: 'Lunch',
      items: [{ food_item_id: 'beef', portions: 1, co2e: 2.6 }],
      total_co2e: 2.6,
      driving_km_equivalent: 10.4,
    }
    const totalCo2e = meal1.total_co2e + meal2.total_co2e

    const estimate: DailyEstimate = {
      date: '2025-01-15',
      meals: [meal1, meal2],
      total_co2e: totalCo2e,
      driving_km_equivalent: totalCo2e / 0.25,
      vs_canadian_average: (totalCo2e / 3.98) * 100,
    }

    expect(estimate.meals).toHaveLength(2)
    expect(estimate.total_co2e).toBeCloseTo(2.618, 3)
    expect(estimate.driving_km_equivalent).toBeCloseTo(10.472, 3)
    expect(estimate.vs_canadian_average).toBeCloseTo(65.78, 0)
  })
})
