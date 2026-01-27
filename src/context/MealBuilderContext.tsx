import { useMealBuilder } from '../hooks/useMealBuilder'
import { MealBuilderContext } from './mealBuilderContextValue'

export function MealBuilderProvider({ children }: { children: React.ReactNode }) {
  const mealBuilder = useMealBuilder()
  return (
    <MealBuilderContext.Provider value={mealBuilder}>
      {children}
    </MealBuilderContext.Provider>
  )
}
