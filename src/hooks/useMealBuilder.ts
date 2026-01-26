import { useReducer, useMemo } from 'react'
import type { MealItem, FoodItem, SwapSuggestion } from '../types'
import { FOODS } from '../data/foods'
import { toDrivingKm } from '../utils/equivalents'
import { findSwap } from '../utils/swap'

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

interface MealBuilderState {
  items: MealItem[]
  label: string | null
}

const initialState: MealBuilderState = {
  items: [],
  label: null,
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type MealBuilderAction =
  | { type: 'ADD_ITEM'; foodItemId: string }
  | { type: 'REMOVE_ITEM'; foodItemId: string }
  | { type: 'SET_PORTIONS'; foodItemId: string; portions: number }
  | { type: 'CLEAR_MEAL' }
  | { type: 'SET_LABEL'; label: string | null }

// ---------------------------------------------------------------------------
// Plate balance
// ---------------------------------------------------------------------------

export interface PlateBalance {
  vegetablesFruits: number
  wholeGrains: number
  protein: number
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

const foodMap = new Map<string, FoodItem>(FOODS.map((f) => [f.id, f]))

function clampPortions(p: number): number {
  return Math.min(5, Math.max(0.5, p))
}

function reducer(
  state: MealBuilderState,
  action: MealBuilderAction,
): MealBuilderState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(
        (i) => i.food_item_id === action.foodItemId,
      )
      const food = foodMap.get(action.foodItemId)
      if (!food) return state

      if (existing) {
        const newPortions = clampPortions(existing.portions + 1)
        return {
          ...state,
          items: state.items.map((i) =>
            i.food_item_id === action.foodItemId
              ? {
                  ...i,
                  portions: newPortions,
                  co2e: food.co2e_per_portion * newPortions,
                }
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
            co2e: food.co2e_per_portion,
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
      const food = foodMap.get(action.foodItemId)
      if (!food) return state

      const portions = clampPortions(action.portions)
      return {
        ...state,
        items: state.items.map((i) =>
          i.food_item_id === action.foodItemId
            ? { ...i, portions, co2e: food.co2e_per_portion * portions }
            : i,
        ),
      }
    }

    case 'CLEAR_MEAL':
      return initialState

    case 'SET_LABEL':
      return { ...state, label: action.label }
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseMealBuilderReturn {
  items: MealItem[]
  label: string | null
  totalCO2e: number
  drivingKmEquivalent: number
  plateBalance: PlateBalance
  swapSuggestion: SwapSuggestion | null
  addItem: (foodItemId: string) => void
  removeItem: (foodItemId: string) => void
  setPortions: (foodItemId: string, portions: number) => void
  clearMeal: () => void
  setLabel: (label: string | null) => void
}

export function useMealBuilder(): UseMealBuilderReturn {
  const [state, dispatch] = useReducer(reducer, initialState)

  const totalCO2e = useMemo(
    () => state.items.reduce((sum, i) => sum + i.co2e, 0),
    [state.items],
  )

  const drivingKmEquivalent = useMemo(
    () => toDrivingKm(totalCO2e),
    [totalCO2e],
  )

  const plateBalance = useMemo((): PlateBalance => {
    let vegWeight = 0
    let grainWeight = 0
    let proteinWeight = 0

    for (const item of state.items) {
      const food = foodMap.get(item.food_item_id)
      if (!food) continue
      const weight = food.portion_weight_grams * item.portions
      switch (food.category) {
        case 'vegetables_fruits':
          vegWeight += weight
          break
        case 'whole_grains':
          grainWeight += weight
          break
        case 'protein':
          proteinWeight += weight
          break
        // 'other' items don't count toward plate balance
      }
    }

    const total = vegWeight + grainWeight + proteinWeight
    if (total === 0) {
      return { vegetablesFruits: 0, wholeGrains: 0, protein: 0 }
    }

    return {
      vegetablesFruits: (vegWeight / total) * 100,
      wholeGrains: (grainWeight / total) * 100,
      protein: (proteinWeight / total) * 100,
    }
  }, [state.items])

  const swapSuggestion = useMemo(
    () => findSwap(state.items, FOODS),
    [state.items],
  )

  return {
    items: state.items,
    label: state.label,
    totalCO2e,
    drivingKmEquivalent,
    plateBalance,
    swapSuggestion,
    addItem: (foodItemId) => dispatch({ type: 'ADD_ITEM', foodItemId }),
    removeItem: (foodItemId) => dispatch({ type: 'REMOVE_ITEM', foodItemId }),
    setPortions: (foodItemId, portions) =>
      dispatch({ type: 'SET_PORTIONS', foodItemId, portions }),
    clearMeal: () => dispatch({ type: 'CLEAR_MEAL' }),
    setLabel: (label) => dispatch({ type: 'SET_LABEL', label }),
  }
}
