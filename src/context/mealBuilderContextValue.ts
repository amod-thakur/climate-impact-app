import { createContext } from 'react'
import type { UseMealBuilderReturn } from '../hooks/useMealBuilder'

export const MealBuilderContext = createContext<UseMealBuilderReturn | null>(null)
