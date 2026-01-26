import type { FoodItem, MealItem, SwapSuggestion } from '../types'
import { toDrivingKm } from './equivalents'

/**
 * Find the single best swap suggestion for a meal.
 *
 * Algorithm (REQUIREMENTS.md §8):
 *  1. Identify the meal item with the highest total CO2e contribution.
 *  2. Find the lowest-emission item in the same CFG category from the food
 *     catalogue. For protein items, match on sub_category (plant vs animal vs
 *     dairy) so swaps stay within the same protein type.
 *  3. If the saving is ≤ 0.1 kg CO2e, return null (trivial difference).
 */
export function findSwap(
  mealItems: MealItem[],
  foods: FoodItem[],
): SwapSuggestion | null {
  if (mealItems.length === 0) return null

  // Build a lookup map for food items
  const foodMap = new Map(foods.map((f) => [f.id, f]))

  // Find the meal item with the highest CO2e
  let highestItem: MealItem | null = null
  let highestCo2e = -1
  for (const item of mealItems) {
    if (item.co2e > highestCo2e) {
      highestCo2e = item.co2e
      highestItem = item
    }
  }

  if (!highestItem) return null

  const currentFood = foodMap.get(highestItem.food_item_id)
  if (!currentFood) return null

  // Find the lowest-emission alternative in the same category
  const candidates = foods.filter((f) => {
    if (f.id === currentFood.id) return false
    if (f.category !== currentFood.category) return false
    // For protein, match on sub_category
    if (
      currentFood.category === 'protein' &&
      f.sub_category !== currentFood.sub_category
    ) {
      return false
    }
    return true
  })

  if (candidates.length === 0) return null

  // Find the candidate with the lowest co2e_per_portion
  let bestCandidate = candidates[0]
  for (const c of candidates) {
    if (c.co2e_per_portion < bestCandidate.co2e_per_portion) {
      bestCandidate = c
    }
  }

  // Calculate savings (per portion)
  const co2eSaved =
    currentFood.co2e_per_portion - bestCandidate.co2e_per_portion
  if (co2eSaved <= 0.1) return null

  return {
    current_item: currentFood,
    suggested_item: bestCandidate,
    co2e_saved: co2eSaved,
    driving_km_saved: toDrivingKm(co2eSaved),
  }
}
