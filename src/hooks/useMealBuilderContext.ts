import { useContext } from 'react'
import { MealBuilderContext } from '../context/mealBuilderContextValue'
import type { UseMealBuilderReturn } from './useMealBuilder'

export function useMealBuilderContext(): UseMealBuilderReturn {
  const ctx = useContext(MealBuilderContext)
  if (!ctx) {
    throw new Error('useMealBuilderContext must be used within MealBuilderProvider')
  }
  return ctx
}
