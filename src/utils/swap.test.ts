import { describe, expect, it } from 'vitest'
import { findSwap } from './swap'
import { FOODS } from '../data/foods'
import type { MealItem } from '../types'

function makeMealItem(
  foodItemId: string,
  portions: number = 1,
): MealItem {
  const food = FOODS.find((f) => f.id === foodItemId)!
  return {
    food_item_id: foodItemId,
    portions,
    co2e: food.co2e_per_portion * portions,
  }
}

describe('findSwap', () => {
  it('returns null for an empty meal', () => {
    expect(findSwap([], FOODS)).toBeNull()
  })

  it('suggests swapping beef to chicken (same sub_category: animal)', () => {
    const items = [makeMealItem('beef'), makeMealItem('potatoes')]
    const suggestion = findSwap(items, FOODS)

    expect(suggestion).not.toBeNull()
    expect(suggestion!.currentItemId).toBe('beef')
    // Chicken is the lowest-emission animal protein
    expect(suggestion!.suggestedItemId).toBe('chicken')
    expect(suggestion!.savingsKg).toBeGreaterThan(0.1)
  })

  it('returns null when delta ≤ 0.1 kg CO2e', () => {
    // Two low-emission veg items — swap delta would be trivial
    const items = [makeMealItem('carrots'), makeMealItem('cabbage')]
    const suggestion = findSwap(items, FOODS)

    expect(suggestion).toBeNull()
  })

  it('identifies the highest-CO2e item in the meal', () => {
    const items = [
      makeMealItem('potatoes'), // 0.03
      makeMealItem('beef'), // 2.6
      makeMealItem('oats'), // 0.018
    ]
    const suggestion = findSwap(items, FOODS)

    expect(suggestion).not.toBeNull()
    expect(suggestion!.currentItemId).toBe('beef')
  })

  it('uses sub_category for protein swaps', () => {
    // Salmon is animal protein; swap should be within animal, not plant
    const items = [makeMealItem('salmon-farmed')]
    const suggestion = findSwap(items, FOODS)

    expect(suggestion).not.toBeNull()
    const suggestedFood = FOODS.find(
      (f) => f.id === suggestion!.suggestedItemId,
    )!
    expect(suggestedFood.sub_category).toBe('animal')
  })

  it('accounts for portion count in savings calculation', () => {
    // 2 portions of beef = 5.2 kg CO2e
    const items = [makeMealItem('beef', 2)]
    const suggestion = findSwap(items, FOODS)

    expect(suggestion).not.toBeNull()
    // Savings should be based on 2 portions, not 1
    expect(suggestion!.currentCO2e).toBeCloseTo(5.2, 1)
    expect(suggestion!.savingsKg).toBeGreaterThan(2.0)
  })

  it('calculates savingsKm correctly', () => {
    const items = [makeMealItem('beef')]
    const suggestion = findSwap(items, FOODS)

    expect(suggestion).not.toBeNull()
    expect(suggestion!.savingsKm).toBeCloseTo(
      suggestion!.savingsKg / 0.25,
      1,
    )
  })

  it('handles a meal with only one item category', () => {
    const items = [makeMealItem('brown-rice')] // 0.195 — highest grain
    const suggestion = findSwap(items, FOODS)

    // Brown rice vs oats: 0.195 - 0.018 = 0.177 > 0.1
    expect(suggestion).not.toBeNull()
    expect(suggestion!.currentItemId).toBe('brown-rice')
  })
})
