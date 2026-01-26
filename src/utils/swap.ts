/**
 * Single swap suggestion — implements the rule from REQUIREMENTS.md §8.
 *
 * "When a meal is built, identify the item with the highest CO2e contribution.
 *  Find the lowest-emission item in the same CFG category.
 *  Show the savings."
 *
 * For protein items, matching uses `sub_category` (plant vs animal vs dairy)
 * so the suggestion stays within the same food group.
 */

import type { MealItem, FoodItem } from '../types'

export interface SwapSuggestion {
  currentItemId: string
  currentItemName: string
  currentCO2e: number
  suggestedItemId: string
  suggestedItemName: string
  suggestedCO2e: number
  savingsKg: number
  savingsKm: number
}

const MIN_SAVINGS_KG = 0.1

/**
 * Find the single best swap for a meal.
 *
 * Returns `null` when no meaningful swap exists (savings ≤ 0.1 kg CO2e).
 */
export function findSwap(
  mealItems: MealItem[],
  foods: FoodItem[],
): SwapSuggestion | null {
  if (mealItems.length === 0) return null

  const foodMap = new Map(foods.map((f) => [f.id, f]))

  // Find the meal item with the highest total CO2e contribution
  let highestItem: MealItem | null = null
  let highestCO2e = -1

  for (const item of mealItems) {
    if (item.co2e > highestCO2e) {
      highestCO2e = item.co2e
      highestItem = item
    }
  }

  if (!highestItem) return null

  const highestFood = foodMap.get(highestItem.food_item_id)
  if (!highestFood) return null

  // Find the lowest-emission alternative in the same category
  // For protein items, match on sub_category
  let lowestAlternative: FoodItem | null = null
  let lowestPerPortion = Infinity

  for (const food of foods) {
    // Skip the current item
    if (food.id === highestFood.id) continue

    // Must be same category
    if (food.category !== highestFood.category) continue

    // For protein, must match sub_category
    if (
      highestFood.category === 'protein' &&
      food.sub_category !== highestFood.sub_category
    ) {
      continue
    }

    if (food.co2e_per_portion < lowestPerPortion) {
      lowestPerPortion = food.co2e_per_portion
      lowestAlternative = food
    }
  }

  if (!lowestAlternative) return null

  // Calculate savings: difference in CO2e for the same number of portions
  const suggestedCO2e = lowestAlternative.co2e_per_portion * highestItem.portions
  const savingsKg = highestCO2e - suggestedCO2e

  if (savingsKg <= MIN_SAVINGS_KG) return null

  return {
    currentItemId: highestFood.id,
    currentItemName: highestFood.name,
    currentCO2e: highestCO2e,
    suggestedItemId: lowestAlternative.id,
    suggestedItemName: lowestAlternative.name,
    suggestedCO2e,
    savingsKg,
    savingsKm: savingsKg / 0.25,
  }
}
