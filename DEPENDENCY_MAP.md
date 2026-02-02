# Dependency Map — How Files Connect

## Complete Dependency Graph

```
┌─────────────────────────────────────────────────────────────────┐
│                     ENTRY POINT                                 │
│                      main.tsx                                   │
│  (Browser loads this first - creates React app)                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
            ┌────────────────────────────────┐
            │          App.tsx               │
            │  (Root component)              │
            │                                │
            │  Wraps everything with:        │
            │  • MealBuilderProvider         │
            │  • Router (Wouter)             │
            │  • NavBar                      │
            │  • OnboardingModal             │
            └────────────────────────────────┘
             │
             ├─ MealBuilderProvider (from context/)
             │      └─ MealBuilderContext.tsx
             │           └─ useMealBuilder hook
             │
             ├─ Router (from wouter library)
             │
             ├─ NavBar component
             │      └─ Link to pages
             │
             └─ OnboardingModal component
                    └─ useLocalStorage hook


┌─────────────────────────────────────────────────────────────────┐
│              PAGES (one per route)                              │
│                                                                 │
│  Routes defined in App.tsx                                      │
└─────────────────────────────────────────────────────────────────┘

        ┌───────────┬───────────┬───────────┬────────────┐
        │           │           │           │            │
        ▼           ▼           ▼           ▼            ▼
    /           /build      /history    /settings    (unknown)
    │           │           │           │            │
    └───┬───────┘           │           │            │
        │                   │           │            │
        ▼                   ▼           ▼            ▼
   ExplorerPage      BuilderPage   HistoryPage  SettingsPage


┌─────────────────────────────────────────────────────────────────┐
│                   EXPLORER PAGE                                 │
└─────────────────────────────────────────────────────────────────┘

                        ExplorerPage
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
          types.ts    data/foods.ts   components/
                             │         FoodCard.tsx
          interface:          │              │
          FoodCategory    FOODS[]            ├─ types.ts
          FoodItem        (45 items)         │  (FoodItem)
                               │             │
                               ▼             ▼
                          Static data    CO2Badge.tsx
                          bundled with       │
                          app (~3 KB)        └─ Convert to string
                                                 (no dependencies)


┌─────────────────────────────────────────────────────────────────┐
│                   BUILDER PAGE                                  │
└─────────────────────────────────────────────────────────────────┘

                        BuilderPage
                             │
            ┌────────────────┼────────────────┐
            │                │                │
            ▼                ▼                ▼
    useMealBuilderContext  useLocalStorage   findSwap utility
            │                │                │
            │                │                ├─ types.ts
            │                │                │ (MealItem)
            │                │                │
            │                │                ├─ data/foods.ts
            │                │                │ (FOODS[])
            │                │                │
            │                │                └─ Logic:
            │                │                   Find highest-CO2e item
            ▼                ▼                   Find lowest alternative
       MealBuilderContext  localStorage         in same category
            │              (persisted)          Calculate savings
            │              'co2-tracker-meals'   Filter by 0.1 kg threshold
            │
            └─ useMealBuilder hook
                      │
                      ├─ useReducer (reducer function)
                      │     │
                      │     ├─ types.ts (MealBuilderState)
                      │     ├─ types.ts (MealBuilderAction)
                      │     └─ computeDerived() function
                      │          │
                      │          ├─ Sum CO2e
                      │          ├─ Calculate driving km
                      │          └─ Calculate plate balance
                      │
                      └─ useMemo (cache derived state)

            Display:
            ├─ PlateViz component
            │     └─ useMealBuilderContext
            │          └─ plateBalance data
            │
            ├─ CO2Badge component
            │     └─ totalCO2e value
            │
            ├─ SwapCard component
            │     └─ SwapSuggestion object
            │
            └─ Save meal button
                  └─ useLocalStorage (persist to browser)


┌─────────────────────────────────────────────────────────────────┐
│                   HISTORY PAGE                                  │
└─────────────────────────────────────────────────────────────────┘

                        HistoryPage
                             │
                ┌────────────┼────────────┐
                │            │            │
                ▼            ▼            ▼
          types.ts    useLocalStorage   HistoryChart
                      'co2-tracker-meals'  (lazy-loaded)
                             │             │
                             ▼             ▼
                       Meal[] array    Recharts component
                       (from browser)  (recharts library)
                             │
                             ├─ Group by date
                             │
                             ├─ Calculate daily totals
                             │
                             └─ Compare to Canadian average
                                (equivalents utility)


┌─────────────────────────────────────────────────────────────────┐
│                  COMPONENTS (Reusable)                          │
└─────────────────────────────────────────────────────────────────┘

FoodCard.tsx
├─ Props: food (FoodItem), onAdd callback
├─ imports: types.ts
└─ uses: CO2Badge component


CO2Badge.tsx
├─ Props: emissions (number), drivingKm (optional)
├─ Reused by: FoodCard, BuilderPage, HistoryPage
└─ No component dependencies (pure presentation)


PlateViz.tsx
├─ imports: useMealBuilderContext
├─ Displays: plateBalance from context
└─ Technologies: SVG (or Recharts)


SwapCard.tsx
├─ Props: suggestion (SwapSuggestion or null)
├─ imports: utils/swap.ts (SwapSuggestion type)
└─ No component dependencies


HistoryChart.tsx
├─ Props: data (DailyEstimate[])
├─ Library: Recharts (charting)
├─ imports: types.ts
└─ Lazy-loaded (only loaded when viewing /history)


NavBar.tsx
├─ Library: Wouter (Link component)
├─ No state (pure presentation)
└─ Reused by: App.tsx


OnboardingModal.tsx
├─ imports: useLocalStorage
├─ State: 'onboarding_seen' key
└─ Shows once on first visit


┌─────────────────────────────────────────────────────────────────┐
│                     HOOKS (Logic)                               │
└─────────────────────────────────────────────────────────────────┘

useMealBuilder.ts
├─ Core meal-building logic
├─ Returns: items, totalCO2e, actions (addItem, removeItem, etc.)
├─ Uses: useReducer, useMemo
├─ imports: types.ts, data/foods.ts
└─ Wrapped by: MealBuilderContext


useLocalStorage.ts
├─ Generic localStorage hook
├─ Returns: [value, setValue] (like useState)
├─ Persists to: localStorage key
├─ No other dependencies
└─ Used by: BuilderPage, HistoryPage, OnboardingModal


useMealBuilderContext.ts
├─ Safe wrapper around useContext
├─ Returns: MealBuilderContext value
├─ Throws error if used outside provider
└─ Used by: All pages & components that need meal data


┌─────────────────────────────────────────────────────────────────┐
│                   CONTEXT (Shared State)                        │
└─────────────────────────────────────────────────────────────────┘

MealBuilderContext.tsx
├─ Wraps: <MealBuilderProvider>
├─ Creates: useMealBuilder() instance
├─ Provides: value prop with all meal state
├─ Consumed by: All pages via useMealBuilderContext hook
└─ Mounted in: App.tsx (wraps entire app)


mealBuilderContextValue.ts
├─ Defines: MealBuilderContext (createContext)
├─ Type: UseMealBuilderReturn
└─ Imported by: MealBuilderContext.tsx, useMealBuilderContext.ts


┌─────────────────────────────────────────────────────────────────┐
│                      DATA (Static)                              │
└─────────────────────────────────────────────────────────────────┘

foods.ts
├─ Array: FOODS (45 items)
├─ Each item:
│  ├─ id, name, category
│  ├─ portion_weight_grams
│  ├─ co2e_per_portion (pre-calculated)
│  └─ data_source (citation + URL)
├─ Type: FoodItem[] (from types.ts)
├─ Used by: ExplorerPage, BuilderPage, swap.ts, useMealBuilder.ts
└─ Size: ~3 KB gzipped (bundled with app)


┌─────────────────────────────────────────────────────────────────┐
│                    UTILITIES (Logic)                            │
└─────────────────────────────────────────────────────────────────┘

swap.ts
├─ Function: findSwap(mealItems, foods)
├─ Logic:
│  ├─ Find highest-CO2e item in meal
│  ├─ Find lowest-CO2e alternative in same category
│  ├─ Calculate savings (only if > 0.1 kg)
│  └─ Return SwapSuggestion or null
├─ imports: types.ts, data/foods.ts
└─ Used by: BuilderPage (via SwapCard)


equivalents.ts
├─ Functions:
│  ├─ toDrivingKm(co2eKg) — convert to km
│  └─ toCanadianDailyPercent(co2eKg) — compare to average
├─ Constants:
│  ├─ 0.25 kg CO2e per km (average car)
│  └─ 3.98 kg CO2e per day (Canadian average)
└─ Used by: All components showing emissions


backup.ts
├─ Functions:
│  ├─ exportData() — read localStorage, create JSON
│  ├─ triggerDownload() — save file to computer
│  ├─ parseBackup() — read uploaded file
│  └─ importData() — write to localStorage
├─ Used by: SettingsPage
└─ Enables: Backup/restore of meal data


┌─────────────────────────────────────────────────────────────────┐
│                   TYPES (Type Definitions)                      │
└─────────────────────────────────────────────────────────────────┘

types.ts
├─ Enums/Unions:
│  ├─ FoodCategory ('vegetables_fruits' | 'whole_grains' | ...)
│  ├─ SubCategory ('plant' | 'animal' | 'dairy')
│  ├─ WeightBasis ('raw' | 'dry' | 'as_sold')
│  └─ GHGType ('CO2' | 'CH4' | 'N2O')
│
├─ Interfaces:
│  ├─ FoodItem (45 items, static data)
│  ├─ MealItem (item in current meal)
│  ├─ Meal (saved meal with date)
│  ├─ DailyEstimate (grouped by date)
│  ├─ MealBuilderState (reducer state)
│  ├─ UseMealBuilderReturn (what hook returns)
│  └─ SwapSuggestion (swap recommendation)
│
└─ Used by: All source files


┌─────────────────────────────────────────────────────────────────┐
│                    TESTING (*.test files)                       │
└─────────────────────────────────────────────────────────────────┘

For each source file, there's a test file:

useMealBuilder.test.ts
├─ Uses: renderHook, act (React Testing Library)
├─ Tests:
│  ├─ addItem() adds to meal
│  ├─ removeItem() removes from meal
│  ├─ setPortions() updates portions
│  ├─ totalCO2e calculated correctly
│  └─ plateBalance calculated correctly
└─ imports: useMealBuilder, vitest


FoodCard.test.tsx
├─ Uses: render, screen (React Testing Library)
├─ Tests:
│  ├─ Displays food name
│  ├─ Displays CO2e value
│  ├─ Button click calls onAdd callback
│  └─ Props display correctly
└─ imports: FoodCard, vitest


swap.test.ts
├─ Tests:
│  ├─ Finds highest-CO2e item
│  ├─ Finds lowest alternative
│  ├─ Filters by 0.1 kg threshold
│  ├─ Matches sub_category for protein
│  └─ Returns null if no savings
└─ imports: findSwap, vitest


App.test.tsx
├─ Tests: Routing
│  ├─ ExplorerPage at /
│  ├─ BuilderPage at /build
│  ├─ HistoryPage at /history
│  ├─ SettingsPage at /settings
│  └─ Unknown routes redirect to /
└─ Uses: wouter/memory-location for testing routes


integration.test.tsx
├─ Tests: End-to-end flows
│  ├─ Add item from Explorer → BuilderPage
│  ├─ Save meal → appears in HistoryPage
│  ├─ Swap suggestion shows/hides
│  └─ localStorage persists across page reloads
└─ Uses: full App component + Router


┌─────────────────────────────────────────────────────────────────┐
│                  BUILD & CONFIG FILES                           │
└─────────────────────────────────────────────────────────────────┘

package.json
├─ Production dependencies:
│  ├─ react & react-dom (UI framework)
│  ├─ wouter (routing)
│  ├─ recharts (charts)
│  ├─ tailwindcss (styling)
│  └─ vite-plugin-pwa (offline support)
│
└─ Dev dependencies:
   ├─ typescript (type checking)
   ├─ vite (build tool)
   ├─ vitest (testing)
   └─ @testing-library/react (component testing)


vite.config.ts
├─ Plugins:
│  ├─ React plugin (JSX support)
│  ├─ Tailwind CSS plugin (CSS utility)
│  └─ PWA plugin (service worker)
│
├─ Settings:
│  ├─ base: '/leetcode-assistant/' (URL prefix)
│  └─ outDir: 'dist' (build output)
│
└─ Used by: npm run build, npm run dev


tsconfig.json
├─ Compiler options:
│  ├─ target: ES2020
│  ├─ lib: DOM + ES2020
│  ├─ jsx: react-jsx
│  └─ strict: true (strict type checking)
│
└─ Used by: TypeScript compiler


vitest.config.ts
├─ Test runner settings
├─ Coverage configuration
└─ Environment: jsdom (simulates browser)
```

---

## Quick Reference: Which File to Edit for...

| Task | File to Edit |
|------|--------------|
| Add new food item | `src/data/foods.ts` |
| Change swap suggestion logic | `src/utils/swap.ts` |
| Add new page | `src/pages/NewPage.tsx` + add route in `src/App.tsx` |
| Add new component | `src/components/NewComponent.tsx` |
| Change meal builder logic | `src/hooks/useMealBuilder.ts` |
| Add new type | `src/types.ts` |
| Change styling | `src/index.css` or Tailwind classes in components |
| Add persistence (localStorage) | `src/hooks/useLocalStorage.ts` |
| Add helper function | `src/utils/*.ts` |
| Write test | `src/something.test.tsx` or `src/something.test.ts` |

---

## Data Flow: Click-by-Click Example

**Scenario: User adds "Beef" to meal**

```
1. User in ExplorerPage sees FoodCard for "Beef"
   ↓
2. User clicks "Add to Meal" button
   ↓
3. onClick handler calls onAdd("beef")
   ↓
4. ExplorerPage calls addItem("beef") from context
   ↓
5. addItem dispatch({type: 'ADD_ITEM', foodItemId: 'beef'})
   ↓
6. Reducer function processes action:
   - Check if beef already in items
   - If not: add new MealItem
   - If yes: increment portions
   ↓
7. Reducer returns new state
   ↓
8. useMealBuilder recalculates derived state:
   - totalCO2e = sum of all items
   - drivingKmEquivalent = totalCO2e / 0.25
   - plateBalance = proportions by category
   ↓
9. useMemo caches this derived state
   ↓
10. MealBuilderContext value updates
    ↓
11. All components subscribed to context re-render:
    - BuilderPage (shows new item in list)
    - CO2Badge (shows new total)
    - PlateViz (updates proportions)
    - SwapCard (recalculates suggestion)
    ↓
12. User sees changes immediately on screen
    ↓
13. User clicks "Save Meal"
    ↓
14. BuilderPage calls setSavedMeals (from useLocalStorage)
    ↓
15. useLocalStorage:
    - Updates state in React
    - JSON.stringify the meal
    - localStorage.setItem('co2-tracker-meals', JSON.stringify(...))
    ↓
16. Data persisted to browser storage
    ↓
17. User navigates to /history
    ↓
18. HistoryPage renders
    ↓
19. HistoryPage reads from localStorage:
    - useLocalStorage('co2-tracker-meals', [])
    - Reads saved value from localStorage
    ↓
20. Builds dailyEstimates by grouping meals by date
    ↓
21. Renders meal list and chart
    ↓
22. User sees their saved meals (persisted from step 15!)
```

---

## Understanding State Updates

```
Component                     State Container              Storage
  │                                 │                        │
  ├─ User clicks button             │                        │
  │                                 │                        │
  ├──────────── dispatch({type: ...}) ─────►                │
  │                            reducer                       │
  │                            processes                      │
  │                            updates state                  │
  │                                 │                        │
  │◄───────── new state ─────────────┤                       │
  │           via props/context                              │
  │                                 │                        │
  ├─ Component re-renders           │                        │
  │                                 │                        │
  └─ User sees change              │◄──── if using localStorage:
                                   │      JSON.stringify & save
                                   │                        │
                                   │                        ├─ localStorage
                                   │                        │
                                   └─────────────────────►   └─ "key": "value"
```

