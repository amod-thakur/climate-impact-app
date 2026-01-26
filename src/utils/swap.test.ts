import { describe, it, expect } from 'vitest'
import { findSwap } from './swap'
import type { FoodItem, MealItem } from '../types'

// Minimal food items for testing
const foods: FoodItem[] = [
  {
    id: 'beef',
    name: 'Beef',
    category: 'protein',
    sub_category: 'animal',
    portion_description: '75 g cooked',
    portion_weight_grams: 100,
    weight_basis: 'raw',
    co2e_per_kg: 26.0,
    co2e_per_portion: 2.6,
    dominant_ghg: 'CH4',
    ghg_note: 'Test',
    data_source: 'Test',
    data_source_url: 'https://example.com',
  },
  {
    id: 'chicken',
    name: 'Chicken',
    category: 'protein',
    sub_category: 'animal',
    portion_description: '75 g cooked',
    portion_weight_grams: 100,
    weight_basis: 'raw',
    co2e_per_kg: 2.2,
    co2e_per_portion: 0.22,
    dominant_ghg: 'CO2',
    ghg_note: 'Test',
    data_source: 'Test',
    data_source_url: 'https://example.com',
  },
  {
    id: 'lentils',
    name: 'Lentils',
    category: 'protein',
    sub_category: 'plant',
    portion_description: '175 mL cooked',
    portion_weight_grams: 75,
    weight_basis: 'dry',
    co2e_per_kg: 0.9,
    co2e_per_portion: 0.068,
    dominant_ghg: 'N2O',
    ghg_note: 'Test',
    data_source: 'Test',
    data_source_url: 'https://example.com',
  },
  {
    id: 'brown_rice',
    name: 'Brown Rice',
    category: 'whole_grains',
    sub_category: null,
    portion_description: '125 mL cooked',
    portion_weight_grams: 65,
    weight_basis: 'dry',
    co2e_per_kg: 3.0,
    co2e_per_portion: 0.195,
    dominant_ghg: 'CH4',
    ghg_note: 'Test',
    data_source: 'Test',
    data_source_url: 'https://example.com',
  },
  {
    id: 'oats',
    name: 'Oats',
    category: 'whole_grains',
    sub_category: null,
    portion_description: '175 mL cooked',
    portion_weight_grams: 30,
    weight_basis: 'dry',
    co2e_per_kg: 0.6,
    co2e_per_portion: 0.018,
    dominant_ghg: 'N2O',
    ghg_note: 'Test',
    data_source: 'Test',
    data_source_url: 'https://example.com',
  },
  {
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
    ghg_note: 'Test',
    data_source: 'Test',
    data_source_url: 'https://example.com',
  },
  {
    id: 'carrots',
    name: 'Carrots',
    category: 'vegetables_fruits',
    sub_category: null,
    portion_description: '125 mL chopped',
    portion_weight_grams: 80,
    weight_basis: 'raw',
    co2e_per_kg: 0.2,
    co2e_per_portion: 0.016,
    dominant_ghg: 'CO2',
    ghg_note: 'Test',
    data_source: 'Test',
    data_source_url: 'https://example.com',
  },
]

describe('findSwap', () => {
  it('returns null for empty meal', () => {
    expect(findSwap([], foods)).toBeNull()
  })

  it('suggests swapping beef to chicken (same sub_category: animal)', () => {
    const mealItems: MealItem[] = [
      { food_item_id: 'beef', portions: 1, co2e: 2.6 },
    ]
    const result = findSwap(mealItems, foods)
    expect(result).not.toBeNull()
    expect(result!.current_item.id).toBe('beef')
    expect(result!.suggested_item.id).toBe('chicken')
    expect(result!.co2e_saved).toBeCloseTo(2.38, 2)
    expect(result!.driving_km_saved).toBeCloseTo(9.52, 1)
  })

  it('uses sub_category for protein swaps (does not cross plant/animal)', () => {
    const mealItems: MealItem[] = [
      { food_item_id: 'beef', portions: 1, co2e: 2.6 },
    ]
    const result = findSwap(mealItems, foods)
    // Should suggest chicken (animal), not lentils (plant)
    expect(result!.suggested_item.sub_category).toBe('animal')
  })

  it('finds swap for whole_grains (brown rice → oats)', () => {
    const mealItems: MealItem[] = [
      { food_item_id: 'brown_rice', portions: 1, co2e: 0.195 },
    ]
    const result = findSwap(mealItems, foods)
    expect(result).not.toBeNull()
    expect(result!.current_item.id).toBe('brown_rice')
    expect(result!.suggested_item.id).toBe('oats')
    expect(result!.co2e_saved).toBeCloseTo(0.177, 2)
  })

  it('returns null when saving is <= 0.1 kg', () => {
    // Potatoes (0.03) vs Carrots (0.016) — delta = 0.014, below threshold
    const mealItems: MealItem[] = [
      { food_item_id: 'potatoes', portions: 1, co2e: 0.03 },
    ]
    const result = findSwap(mealItems, foods)
    expect(result).toBeNull()
  })

  it('picks the highest-CO2e meal item for swap', () => {
    const mealItems: MealItem[] = [
      { food_item_id: 'chicken', portions: 1, co2e: 0.22 },
      { food_item_id: 'beef', portions: 1, co2e: 2.6 },
    ]
    const result = findSwap(mealItems, foods)
    expect(result!.current_item.id).toBe('beef')
  })

  it('returns null when item is not in foods catalogue', () => {
    const mealItems: MealItem[] = [
      { food_item_id: 'unknown_food', portions: 1, co2e: 5.0 },
    ]
    expect(findSwap(mealItems, foods)).toBeNull()
  })

  it('returns null when no alternative exists in same category', () => {
    // Only one item in the category
    const singleFoods: FoodItem[] = [foods[0]] // just beef
    const mealItems: MealItem[] = [
      { food_item_id: 'beef', portions: 1, co2e: 2.6 },
    ]
    expect(findSwap(mealItems, singleFoods)).toBeNull()
  })
})
