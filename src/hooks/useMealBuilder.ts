import { useReducer, useMemo } from 'react'
import type { MealItem, FoodItem, FoodCategory } from '../types'
import { FOODS } from '../data/foods'

// ---------------------------------------------------------------------------
// State & actions
// ---------------------------------------------------------------------------

export interface MealBuilderState {
  items: MealItem[]
  label: string | null
}

type MealBuilderAction =
  | { type: 'ADD_ITEM'; foodItemId: string }
  | { type: 'REMOVE_ITEM'; foodItemId: string }
  | { type: 'SET_PORTIONS'; foodItemId: string; portions: number }
  | { type: 'CLEAR_MEAL' }
  | { type: 'SET_LABEL'; label: string | null }

const INITIAL_STATE: MealBuilderState = { items: [], label: null }

const MIN_PORTIONS = 0.5
const MAX_PORTIONS = 5

function clampPortions(n: number): number {
  return Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, n))
}

function findFood(id: string): FoodItem | undefined {
  return FOODS.find((f) => f.id === id)
}

function computeCO2e(foodItemId: string, portions: number): number {
  const food = findFood(foodItemId)
  if (!food) return 0
  return food.co2e_per_portion * portions
}

function mealReducer(
  state: MealBuilderState,
  action: MealBuilderAction,
): MealBuilderState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.food_item_id === action.foodItemId,
      )
      if (existing) {
        const newPortions = clampPortions(existing.portions + 1)
        return {
          ...state,
          items: state.items.map((i) =>
            i.food_item_id === action.foodItemId
              ? { ...i, portions: newPortions, co2e: computeCO2e(action.foodItemId, newPortions) }
              : i,
          ),
        }
      }
      return {
        ...state,
        items: [
          ...state.items,
          {
            food_item_id: action.foodItemId,
            portions: 1,
            co2e: computeCO2e(action.foodItemId, 1),
          },
        ],
      }
    }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(
          (i) => i.food_item_id !== action.foodItemId,
        ),
      }

    case 'SET_PORTIONS': {
      const portions = clampPortions(action.portions)
      return {
        ...state,
        items: state.items.map((i) =>
          i.food_item_id === action.foodItemId
            ? { ...i, portions, co2e: computeCO2e(action.foodItemId, portions) }
            : i,
        ),
      }
    }

    case 'CLEAR_MEAL':
      return INITIAL_STATE

    case 'SET_LABEL':
      return { ...state, label: action.label }
  }
}

// ---------------------------------------------------------------------------
// Derived state
// ---------------------------------------------------------------------------

interface PlateBalance {
  vegetables_fruits: number
  whole_grains: number
  protein: number
  other: number
}

export interface MealBuilderDerived {
  totalCO2e: number
  drivingKmEquivalent: number
  plateBalance: PlateBalance
}

function computeDerived(items: MealItem[]): MealBuilderDerived {
  const totalCO2e = items.reduce((sum, i) => sum + i.co2e, 0)
  const drivingKmEquivalent = totalCO2e / 0.25

  // Plate balance by weight
  let totalWeight = 0
  const weightByCategory: Record<FoodCategory, number> = {
    vegetables_fruits: 0,
    whole_grains: 0,
    protein: 0,
    other: 0,
  }

  for (const item of items) {
    const food = findFood(item.food_item_id)
    if (!food) continue
    const weight = food.portion_weight_grams * item.portions
    totalWeight += weight
    weightByCategory[food.category] += weight
  }

  const plateBalance: PlateBalance =
    totalWeight === 0
      ? { vegetables_fruits: 0, whole_grains: 0, protein: 0, other: 0 }
      : {
          vegetables_fruits:
            (weightByCategory.vegetables_fruits / totalWeight) * 100,
          whole_grains:
            (weightByCategory.whole_grains / totalWeight) * 100,
          protein: (weightByCategory.protein / totalWeight) * 100,
          other: (weightByCategory.other / totalWeight) * 100,
        }

  return { totalCO2e, drivingKmEquivalent, plateBalance }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseMealBuilderReturn extends MealBuilderDerived {
  items: MealItem[]
  label: string | null
  addItem: (foodItemId: string) => void
  removeItem: (foodItemId: string) => void
  setPortions: (foodItemId: string, portions: number) => void
  clearMeal: () => void
  setLabel: (label: string | null) => void
}

export function useMealBuilder(): UseMealBuilderReturn {
  const [state, dispatch] = useReducer(mealReducer, INITIAL_STATE)

  const derived = useMemo(() => computeDerived(state.items), [state.items])

  return {
    items: state.items,
    label: state.label,
    ...derived,
    addItem: (foodItemId: string) =>
      dispatch({ type: 'ADD_ITEM', foodItemId }),
    removeItem: (foodItemId: string) =>
      dispatch({ type: 'REMOVE_ITEM', foodItemId }),
    setPortions: (foodItemId: string, portions: number) =>
      dispatch({ type: 'SET_PORTIONS', foodItemId, portions }),
    clearMeal: () => dispatch({ type: 'CLEAR_MEAL' }),
    setLabel: (label: string | null) =>
      dispatch({ type: 'SET_LABEL', label }),
  }
}
