# Frontend Development Onboarding Guide
## CO2 Food Tracker — Complete Walkthrough

---

## Part 1: Frontend Fundamentals

### What is Frontend Development?

Frontend development is about building the **user interface** — everything the user sees and interacts with in a browser.

```
┌─────────────────────────────────────────┐
│        FRONTEND (Browser)               │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │   User sees this (UI)           │   │
│  │  ┌───────────────────────────┐  │   │
│  │  │ Buttons, text, forms      │  │   │
│  │  │ Animations, interactions  │  │   │
│  │  └───────────────────────────┘  │   │
│  │                                 │   │
│  │  React manages this:            │   │
│  │  • Update UI when data changes  │   │
│  │  • Handle button clicks         │   │
│  │  • Show/hide content            │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
           ↓
   (data stored in browser's localStorage)
```

### What is React?

React is a **JavaScript library** that makes it easy to:
1. **Build components** — Reusable pieces of UI (like Lego blocks)
2. **Manage state** — Keep track of data that changes
3. **Render efficiently** — Only update parts of the UI that changed

**Key idea:** In React, you write **functions that return UI**. When data changes, React re-renders the UI automatically.

```javascript
// React component example (simplified):
function FoodCard({ name, emissions }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>Emissions: {emissions} kg CO2e</p>
      <button>Add to Meal</button>
    </div>
  )
}
```

---

## Part 2: Project Structure Overview

```
co2-food-tracker/
├── src/                          ← All source code
│   ├── main.tsx                  ← Entry point (starts the app)
│   ├── App.tsx                   ← Root component
│   ├── index.css                 ← Global styles
│   │
│   ├── pages/                    ← Full-page components (routes)
│   │   ├── ExplorerPage.tsx      ← Browse foods
│   │   ├── BuilderPage.tsx       ← Build meals
│   │   ├── HistoryPage.tsx       ← View history
│   │   └── SettingsPage.tsx      ← Settings & backup
│   │
│   ├── components/               ← Reusable UI components
│   │   ├── FoodCard.tsx          ← Card for one food item
│   │   ├── CO2Badge.tsx          ← Emissions display
│   │   ├── PlateViz.tsx          ← Plate proportions chart
│   │   ├── SwapCard.tsx          ← Swap suggestion
│   │   ├── NavBar.tsx            ← Navigation menu
│   │   ├── HistoryChart.tsx      ← Trend chart
│   │   └── OnboardingModal.tsx   ← Welcome screen
│   │
│   ├── hooks/                    ← Custom React hooks (state logic)
│   │   ├── useMealBuilder.ts     ← Meal building logic
│   │   ├── useLocalStorage.ts    ← Save/load from browser
│   │   └── useMealBuilderContext.ts ← Access shared state
│   │
│   ├── context/                  ← Shared state (Context API)
│   │   ├── MealBuilderContext.tsx   ← Provider wrapper
│   │   └── mealBuilderContextValue.ts ← Type definition
│   │
│   ├── data/                     ← Static data
│   │   └── foods.ts             ← 45 food items with emissions data
│   │
│   ├── types.ts                  ← TypeScript type definitions
│   ├── utils/                    ← Helper functions
│   │   ├── swap.ts              ← Swap suggestion logic
│   │   ├── backup.ts            ← Export/import data
│   │   └── equivalents.ts        ← Conversion helpers
│   │
│   └── *.test.tsx/ts            ← Test files (one per source file)
│
├── public/                       ← Static files (icons, manifest)
├── package.json                  ← Dependencies & scripts
├── vite.config.ts               ← Build configuration
├── tsconfig.json                ← TypeScript configuration
└── tailwind.config.js           ← CSS styling configuration
```

### Key Concept: Folder Organization

- **pages/** = Full pages that correspond to URLs (routes)
- **components/** = Reusable pieces (can be used on multiple pages)
- **hooks/** = Logic for managing state and side effects
- **context/** = Shared state across the entire app
- **data/** = Static data that doesn't change
- **utils/** = Helper functions (calculations, formatting, etc.)
- **types.ts** = TypeScript definitions (type safety)

---

## Part 3: Data Flow — How the App Works

### The User Journey

```
1. User visits app
   ↓
2. App loads 45 foods from data/foods.ts
   ↓
3. ExplorerPage displays foods in a searchable list
   ↓
4. User clicks "Add to Meal" on a food
   ↓
5. BuilderPage opens (state updates via useMealBuilder hook)
   ↓
6. User adjusts portions and clicks "Save"
   ↓
7. Meal saved to localStorage
   ↓
8. HistoryPage loads and shows saved meals
```

### State Flow in Detail

```
┌─────────────────────────────────────────────────────────┐
│ MealBuilderContext (App-wide shared state)              │
│                                                         │
│  items: [                                               │
│    { food_item_id: "beef", portions: 1, co2e: 2.6 },   │
│    { food_item_id: "rice", portions: 2, co2e: 0.1 }    │
│  ]                                                      │
│  totalCO2e: 2.7                                         │
│  drivingKmEquivalent: 10.8                              │
│  label: "Dinner"                                        │
└─────────────────────────────────────────────────────────┘
           ↓ (consumed by)
┌─────────────────────────────────────────────────────────┐
│ BuilderPage                                             │
│ • Displays items                                        │
│ • Shows total emissions                                 │
│ • Shows swap suggestion                                 │
│ • Allows save to localStorage                           │
└─────────────────────────────────────────────────────────┘
           ↓ (when user clicks Save)
┌─────────────────────────────────────────────────────────┐
│ localStorage (browser's persistent storage)             │
│                                                         │
│ Key: "co2-tracker-meals"                                │
│ Value: [                                                │
│   {                                                     │
│     id: "uuid-1",                                       │
│     date: "2026-02-01",                                 │
│     items: [...],                                       │
│     total_co2e: 2.7                                     │
│   }                                                     │
│ ]                                                       │
└─────────────────────────────────────────────────────────┘
           ↓ (read by)
┌─────────────────────────────────────────────────────────┐
│ HistoryPage                                             │
│ • Reads meals from localStorage                         │
│ • Groups by date                                        │
│ • Shows chart of emissions over time                    │
└─────────────────────────────────────────────────────────┘
```

---

## Part 4: React Concepts Used in This Project

### 1. Components (Functions that return UI)

A **component** is a JavaScript function that returns JSX (looks like HTML).

```tsx
// src/components/FoodCard.tsx
import type { FoodItem } from '../types'

interface FoodCardProps {
  food: FoodItem
  onAdd: (id: string) => void
}

function FoodCard({ food, onAdd }: FoodCardProps) {
  return (
    <div className="card">
      <h3>{food.name}</h3>
      <p>CO2e: {food.co2e_per_portion} kg</p>
      <button onClick={() => onAdd(food.id)}>
        Add to Meal
      </button>
    </div>
  )
}

export default FoodCard
```

**Key points:**
- `FoodCardProps` = TypeScript interface defining what data the component needs
- `food` and `onAdd` = props (inputs to the component)
- `return (...)` = the UI to render
- `onClick={() => onAdd(food.id)}` = handle button clicks

### 2. State (Data that changes)

**State** = data that can change, and when it changes, the UI updates automatically.

```tsx
import { useState } from 'react'

function SearchBar() {
  const [search, setSearch] = useState('')
  //    ↑ current value    ↑ function to update it

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search foods..."
    />
  )
}
```

**How it works:**
1. User types in input
2. `onChange` fires → calls `setSearch` with new value
3. React re-renders the component with new `search` state
4. Component updates on screen

### 3. Hooks (Functions that manage state/logic)

A **hook** is a function that lets you "hook into" React features.

Common hooks:
- `useState` — manage state
- `useReducer` — manage complex state (like this project)
- `useMemo` — cache computed values
- `useEffect` — run code when component mounts/updates
- `useContext` — access shared state

**Example from this project:**

```tsx
// src/hooks/useMealBuilder.ts
import { useReducer, useMemo } from 'react'

export function useMealBuilder() {
  const [state, dispatch] = useReducer(mealReducer, INITIAL_STATE)
  //                         ↓ complex logic  ↓ starting data

  const derived = useMemo(() => computeDerived(state.items), [state.items])
  //              ↓ cache this computed value (don't recalculate every render)

  return {
    items: state.items,
    totalCO2e: derived.totalCO2e,
    addItem: (id) => dispatch({ type: 'ADD_ITEM', foodItemId: id }),
    removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', foodItemId: id }),
    // ... more actions
  }
}
```

### 4. Context API (Shared State)

When multiple components need access to the same state, use **Context**.

```tsx
// src/context/MealBuilderContext.tsx
import { createContext } from 'react'
import type { UseMealBuilderReturn } from '../hooks/useMealBuilder'

export const MealBuilderContext = createContext<UseMealBuilderReturn | null>(null)

// Provider wrapper (in App.tsx)
<MealBuilderProvider>
  {/* All children can access MealBuilderContext */}
</MealBuilderProvider>

// Consumer (in a page or component)
import { useMealBuilderContext } from '../hooks/useMealBuilderContext'

function BuilderPage() {
  const { items, addItem, totalCO2e } = useMealBuilderContext()
  // ↑ automatically updates when context changes
}
```

### 5. Routing (Multiple Pages)

**Routing** = showing different pages based on the URL.

```tsx
// src/main.tsx
import { Router } from 'wouter'
import App from './App'

<Router base="/leetcode-assistant">
  <App />
</Router>

// src/App.tsx
import { Switch, Route } from 'wouter'

<Switch>
  <Route path="/" component={ExplorerPage} />
  <Route path="/build" component={BuilderPage} />
  <Route path="/history" component={HistoryPage} />
  <Route path="/settings" component={SettingsPage} />
  <Route><Redirect to="/" /></Route>
</Switch>
```

**How it works:**
- `/` → shows ExplorerPage
- `/build` → shows BuilderPage
- etc.
- Clicking a link updates the URL and shows the right page

---

## Part 5: Detailed File Breakdown

### Entry Point & App Setup

#### `src/main.tsx` — The Starting Point
```tsx
import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <Router base="/leetcode-assistant">
    <App />
  </Router>,
)
```

**What it does:**
1. `createRoot()` = prepare React to render
2. `Router` = enable URL-based routing
3. `<App />` = render the main app component

**Dependencies:**
- `react` & `react-dom` — React library
- `wouter` — lightweight routing library
- `App.tsx` — the main component

---

#### `src/App.tsx` — The Root Component
```tsx
import { MealBuilderProvider } from './context/MealBuilderContext'
import { Switch, Route, Redirect } from 'wouter'
import ExplorerPage from './pages/ExplorerPage'
import BuilderPage from './pages/BuilderPage'
import HistoryPage from './pages/HistoryPage'
import SettingsPage from './pages/SettingsPage'
import NavBar from './components/NavBar'
import OnboardingModal from './components/OnboardingModal'

function App() {
  return (
    <MealBuilderProvider>
      <div>
        <OnboardingModal />
        <NavBar />
        <main>
          <Switch>
            <Route path="/" component={ExplorerPage} />
            <Route path="/build" component={BuilderPage} />
            <Route path="/history" component={HistoryPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route><Redirect to="/" /></Route>
          </Switch>
        </main>
      </div>
    </MealBuilderProvider>
  )
}

export default App
```

**What it does:**
1. `MealBuilderProvider` = wrap everything with shared state
2. `OnboardingModal` = show welcome screen on first visit
3. `NavBar` = navigation menu (appears on all pages)
4. `Switch/Route` = render the right page based on URL

**Dependencies:**
- `context/MealBuilderContext` — shared state provider
- `pages/*` — all four page components
- `components/NavBar` & `OnboardingModal`

---

### Data Layer

#### `src/data/foods.ts` — Static Food Data
```tsx
export const FOODS: FoodItem[] = [
  {
    id: 'beef',
    name: 'Beef (1 serving)',
    category: 'protein',
    sub_category: 'animal',
    portion_weight_grams: 100,
    co2e_per_kg: 26,
    co2e_per_portion: 2.6,
    // ... more fields with sources
  },
  // ... 44 more foods
]
```

**What it is:**
- Array of 45 food items with emission data
- Bundled with the app (not fetched from server)
- Immutable (never changes at runtime)

**Used by:**
- `ExplorerPage` — displays the list
- `useMealBuilder` — calculates CO2e for meals
- `swap.ts` — finds swap suggestions

**Dependencies:** None (pure data)

---

#### `src/types.ts` — TypeScript Type Definitions
```tsx
export type FoodCategory =
  | 'vegetables_fruits'
  | 'whole_grains'
  | 'protein'
  | 'other'

export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  sub_category: SubCategory | null
  co2e_per_portion: number
  // ... more fields
}

export interface MealItem {
  food_item_id: string
  portions: number
  co2e: number
}

export interface Meal {
  id: string
  date: string
  label: string | null
  items: MealItem[]
  total_co2e: number
}
```

**What it is:**
- TypeScript definitions for all data structures
- Ensures type safety across the app
- Caught by compiler, not runtime

**Used everywhere** — all components import from here

---

### State Management

#### `src/hooks/useMealBuilder.ts` — Core State Logic
```tsx
import { useReducer, useMemo } from 'react'

// State shape
export interface MealBuilderState {
  items: MealItem[]
  label: string | null
}

// Actions
type MealBuilderAction =
  | { type: 'ADD_ITEM'; foodItemId: string }
  | { type: 'REMOVE_ITEM'; foodItemId: string }
  | { type: 'SET_PORTIONS'; foodItemId: string; portions: number }
  | { type: 'CLEAR_MEAL' }
  | { type: 'SET_LABEL'; label: string | null }

// Reducer function (pure function that transforms state)
function mealReducer(state: MealBuilderState, action: MealBuilderAction) {
  switch (action.type) {
    case 'ADD_ITEM': {
      // Find if food already in meal
      const existing = state.items.find(i => i.food_item_id === action.foodItemId)
      if (existing) {
        // Increase portion
        return {
          ...state,
          items: state.items.map(i =>
            i.food_item_id === action.foodItemId
              ? { ...i, portions: existing.portions + 1, co2e: computeCO2e(...) }
              : i
          ),
        }
      }
      // Add new item
      return {
        ...state,
        items: [...state.items, { food_item_id: action.foodItemId, portions: 1, co2e: ... }],
      }
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.food_item_id !== action.foodItemId),
      }
    // ... more cases
  }
}

// Hook that exposes the state and actions
export function useMealBuilder() {
  const [state, dispatch] = useReducer(mealReducer, INITIAL_STATE)

  const derived = useMemo(() => {
    return {
      totalCO2e: state.items.reduce((sum, i) => sum + i.co2e, 0),
      drivingKmEquivalent: totalCO2e / 0.25,
      plateBalance: { /* calculate proportions */ }
    }
  }, [state.items])

  return {
    items: state.items,
    label: state.label,
    ...derived,
    addItem: (id) => dispatch({ type: 'ADD_ITEM', foodItemId: id }),
    removeItem: (id) => dispatch({ type: 'REMOVE_ITEM', foodItemId: id }),
    setPortions: (id, portions) => dispatch({ type: 'SET_PORTIONS', foodItemId: id, portions }),
    clearMeal: () => dispatch({ type: 'CLEAR_MEAL' }),
    setLabel: (label) => dispatch({ type: 'SET_LABEL', label }),
  }
}
```

**Key concepts:**

**useReducer** = for complex state with many actions:
- `state` = current data
- `dispatch` = function to trigger actions
- `reducer` = pure function: (state, action) → new state

**Why useReducer?**
- Multiple related state updates
- Clear history of actions
- Easier to test than multiple `useState` calls

**useMemo** = cache expensive calculations:
- Re-calculate only when dependencies change `[state.items]`
- Prevents unnecessary recalculations

**Dependencies:**
- `types.ts` — FoodItem, MealItem types
- `data/foods.ts` — FOODS array for lookups

---

#### `src/hooks/useLocalStorage.ts` — Persistence
```tsx
import { useState, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // On first load, try to read from localStorage
      const item = localStorage.getItem(key)
      return item !== null ? JSON.parse(item) : initialValue
    } catch {
      // If parse fails, use initial value
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value
      // Save to localStorage
      localStorage.setItem(key, JSON.stringify(nextValue))
      return nextValue
    })
  }, [key])

  return [storedValue, setValue]
}
```

**What it does:**
1. On component mount, load from `localStorage.getItem(key)`
2. When `setValue` is called, save to `localStorage`
3. Automatically JSON-serialize/deserialize

**Used by:**
- `BuilderPage` — save meals with `useLocalStorage('co2-tracker-meals', [])`
- `HistoryPage` — read meals with `useLocalStorage('co2-tracker-meals', [])`
- `OnboardingModal` — remember if user has seen modal

**Why it's a hook:**
- Encapsulates the persistence logic
- Can be reused in any component
- Easy to test

---

#### `src/context/MealBuilderContext.tsx` — Shared State Provider
```tsx
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
```

**What it does:**
- Creates a `useMealBuilder()` instance
- Shares it with all children via Context
- All pages/components can access it with `useContext(MealBuilderContext)`

**Used by:**
- Wrapped around entire app in `App.tsx`
- Accessed by `ExplorerPage`, `BuilderPage`, other components

---

#### `src/hooks/useMealBuilderContext.ts` — Context Consumer Hook
```tsx
import { useContext } from 'react'
import { MealBuilderContext } from '../context/mealBuilderContextValue'

export function useMealBuilderContext() {
  const context = useContext(MealBuilderContext)
  if (!context) {
    throw new Error('useMealBuilderContext must be used within MealBuilderProvider')
  }
  return context
}
```

**What it does:**
- Safe wrapper to access MealBuilderContext
- Throws error if used outside provider
- Cleaner than `useContext(MealBuilderContext)` in components

**Used by:**
- Any component that needs the meal builder state

---

### Pages

#### `src/pages/ExplorerPage.tsx` — Browse Foods
```tsx
import { useState, useMemo } from 'react'
import { FOODS } from '../data/foods'
import FoodCard from '../components/FoodCard'
import { useMealBuilderContext } from '../hooks/useMealBuilderContext'

function ExplorerPage() {
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [sort, setSortOrder] = useState('co2e_asc')
  const { addItem } = useMealBuilderContext()

  // Filter and sort foods
  const filtered = useMemo(() => {
    let items = FOODS

    if (activeTab !== 'all') {
      items = items.filter(f => f.category === activeTab)
    }

    if (search) {
      items = items.filter(f =>
        f.name.toLowerCase().includes(search.toLowerCase())
      )
    }

    // Sort
    if (sort === 'co2e_asc') {
      items.sort((a, b) => a.co2e_per_portion - b.co2e_per_portion)
    }
    // ... more sort options

    return items
  }, [search, activeTab, sort])

  return (
    <div>
      <h1>Food Explorer</h1>

      {/* Search input */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search foods..."
      />

      {/* Category tabs */}
      <div>
        {['all', 'vegetables_fruits', 'protein', ...].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'active' : ''}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <select value={sort} onChange={(e) => setSortOrder(e.target.value)}>
        <option value="co2e_asc">Emissions Low to High</option>
        <option value="co2e_desc">Emissions High to Low</option>
        {/* ... */}
      </select>

      {/* Display foods */}
      <div>
        {filtered.map(food => (
          <FoodCard
            key={food.id}
            food={food}
            onAdd={addItem}
          />
        ))}
      </div>
    </div>
  )
}
```

**What it does:**
1. Display 45 foods
2. Let user filter by category
3. Let user search by name
4. Let user sort (by emissions, alphabetically, etc.)
5. Show FoodCard for each food
6. When user clicks "Add", call `addItem()` from context

**Dependencies:**
- `data/foods.ts` — the food list
- `components/FoodCard` — display each food
- `hooks/useMealBuilderContext` — access `addItem` function

---

#### `src/pages/BuilderPage.tsx` — Build & Save Meals
```tsx
import { useState, useMemo } from 'react'
import { useMealBuilderContext } from '../hooks/useMealBuilderContext'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { findSwap } from '../utils/swap'
import PlateViz from '../components/PlateViz'
import SwapCard from '../components/SwapCard'
import CO2Badge from '../components/CO2Badge'

function BuilderPage() {
  const {
    items,
    totalCO2e,
    removeItem,
    setPortions,
    clearMeal,
    setLabel,
  } = useMealBuilderContext()

  const [, setSavedMeals] = useLocalStorage('co2-tracker-meals', [])
  const [saveDate, setSaveDate] = useState(todayString())

  // Get swap suggestion
  const swapSuggestion = useMemo(() => findSwap(items, FOODS), [items])

  function handleSave() {
    const meal = {
      id: crypto.randomUUID(),
      date: saveDate,
      items,
      total_co2e: totalCO2e,
    }
    setSavedMeals(prev => [...prev, meal])
    clearMeal()
  }

  if (items.length === 0) {
    return <p>Add items from the Explorer to build a meal</p>
  }

  return (
    <div>
      <h1>Meal Builder</h1>

      {/* Show items in meal */}
      <div>
        {items.map(item => (
          <div key={item.food_item_id}>
            <span>{FOODS.find(f => f.id === item.food_item_id)?.name}</span>
            <input
              type="number"
              value={item.portions}
              onChange={(e) => setPortions(item.food_item_id, parseFloat(e.target.value))}
            />
            <button onClick={() => removeItem(item.food_item_id)}>
              Remove
            </button>
          </div>
        ))}
      </div>

      {/* Show summary */}
      <CO2Badge emissions={totalCO2e} />
      <PlateViz />
      <SwapCard suggestion={swapSuggestion} />

      {/* Save meal */}
      <div>
        <input
          type="date"
          value={saveDate}
          onChange={(e) => setSaveDate(e.target.value)}
        />
        <button onClick={handleSave}>Save Meal</button>
      </div>
    </div>
  )
}
```

**What it does:**
1. Display items in current meal
2. Allow user to adjust portions (which recalculates CO2e)
3. Show meal summary (total emissions, plate balance)
4. Show swap suggestion
5. Allow user to save meal to localStorage with date

**Dependencies:**
- `hooks/useMealBuilderContext` — read/update meal
- `hooks/useLocalStorage` — save meal
- `utils/swap` — get swap suggestion
- `components/PlateViz`, `CO2Badge`, `SwapCard`

---

#### `src/pages/HistoryPage.tsx` — View Saved Meals
```tsx
import { useMemo } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { lazy, Suspense } from 'react'

const HistoryChart = lazy(() => import('../components/HistoryChart'))

function HistoryPage() {
  const [meals] = useLocalStorage('co2-tracker-meals', [])

  // Group meals by date
  const dailyEstimates = useMemo(() => {
    const byDate = new Map()
    for (const meal of meals) {
      const existing = byDate.get(meal.date) ?? []
      existing.push(meal)
      byDate.set(meal.date, existing)
    }

    const estimates = []
    for (const [date, dayMeals] of byDate) {
      estimates.push({
        date,
        meals: dayMeals,
        total_co2e: dayMeals.reduce((sum, m) => sum + m.total_co2e, 0),
      })
    }

    return estimates
  }, [meals])

  if (meals.length === 0) {
    return <p>No saved meals yet</p>
  }

  return (
    <div>
      <h1>History</h1>

      {/* Chart (lazy loaded) */}
      <Suspense fallback={<p>Loading chart...</p>}>
        <HistoryChart data={dailyEstimates} />
      </Suspense>

      {/* List of meals by day */}
      {dailyEstimates.map(day => (
        <div key={day.date}>
          <h3>{day.date}: {day.total_co2e.toFixed(2)} kg CO2e</h3>
          {day.meals.map(meal => (
            <div key={meal.id}>
              <p>{meal.label || 'Meal'}</p>
              {/* Show items */}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
```

**What it does:**
1. Read saved meals from localStorage
2. Group by date
3. Show trend chart (lazy-loaded)
4. Show list of meals by day

**Dependencies:**
- `hooks/useLocalStorage` — read meals
- `components/HistoryChart` — display chart

---

### Components

#### `src/components/FoodCard.tsx` — Food Item Display
```tsx
import type { FoodItem } from '../types'
import CO2Badge from './CO2Badge'

interface FoodCardProps {
  food: FoodItem
  onAdd: (id: string) => void
}

function FoodCard({ food, onAdd }: FoodCardProps) {
  return (
    <div className="card">
      <h3>{food.name}</h3>
      <p>{food.portion_description}</p>
      <CO2Badge
        emissions={food.co2e_per_portion}
        drivingKm={food.co2e_per_portion / 0.25}
      />
      <button onClick={() => onAdd(food.id)}>
        Add to Meal
      </button>
    </div>
  )
}

export default FoodCard
```

**What it does:**
- Display one food item
- Show name, portion size, emissions badge
- Button to add to meal

**Dependencies:**
- `types.ts` — FoodItem type
- `components/CO2Badge` — show emissions

---

#### `src/components/CO2Badge.tsx` — Emissions Display
```tsx
interface CO2BadgeProps {
  emissions: number
  drivingKm?: number
}

function CO2Badge({ emissions, drivingKm }: CO2BadgeProps) {
  return (
    <div className="badge">
      <span className="amount">{emissions.toFixed(2)} kg CO2e</span>
      {drivingKm && (
        <span className="equivalent">
          ≈ {drivingKm.toFixed(1)} km driving
        </span>
      )}
    </div>
  )
}

export default CO2Badge
```

**What it does:**
- Display emissions as kg CO2e
- Show equivalent driving km

**Reused by:**
- FoodCard
- BuilderPage (meal summary)
- HistoryPage (daily totals)

---

#### `src/components/PlateViz.tsx` — Plate Proportions Chart
```tsx
import { useMealBuilderContext } from '../hooks/useMealBuilderContext'

function PlateViz() {
  const { plateBalance } = useMealBuilderContext()

  if (!plateBalance) return null

  return (
    <div className="plate-viz">
      <svg width="200" height="200" viewBox="0 0 200 200">
        {/* Draw pie chart segments */}
        {/* vegetables_fruits: 25% */}
        {/* whole_grains: 25% */}
        {/* protein: 25% */}
        {/* other: 25% */}
      </svg>
      <div className="legend">
        <div>Vegetables & Fruits: {plateBalance.vegetables_fruits.toFixed(0)}%</div>
        <div>Whole Grains: {plateBalance.whole_grains.toFixed(0)}%</div>
        <div>Protein: {plateBalance.protein.toFixed(0)}%</div>
      </div>
    </div>
  )
}

export default PlateViz
```

**What it does:**
- Display meal composition as pie chart
- Show % of each food category

---

#### `src/components/SwapCard.tsx` — Swap Suggestion
```tsx
import type { SwapSuggestion } from '../utils/swap'

interface SwapCardProps {
  suggestion: SwapSuggestion | null
}

function SwapCard({ suggestion }: SwapCardProps) {
  if (!suggestion) return null

  return (
    <div className="card swap-suggestion">
      <h3>Swap Suggestion</h3>
      <p>
        Your highest-impact item is <strong>{suggestion.currentItemName}</strong>
        ({suggestion.currentCO2e.toFixed(2)} kg CO2e).
        Swapping to <strong>{suggestion.suggestedItemName}</strong> would save
        <strong>{suggestion.savingsKg.toFixed(2)} kg CO2e</strong>.
      </p>
    </div>
  )
}

export default SwapCard
```

**What it does:**
- Show recommendation to swap high-emission food for lower-emission alternative
- Only shows if savings > 0.1 kg CO2e

---

#### `src/components/NavBar.tsx` — Navigation Menu
```tsx
import { Link } from 'wouter'

function NavBar() {
  return (
    <nav className="navbar">
      <Link href="/">Explorer</Link>
      <Link href="/build">Builder</Link>
      <Link href="/history">History</Link>
      <Link href="/settings">Settings</Link>
    </nav>
  )
}

export default NavBar
```

**What it does:**
- Display navigation links to all pages
- Uses Wouter's `Link` component for routing

---

### Utilities

#### `src/utils/swap.ts` — Swap Suggestion Logic
```tsx
export function findSwap(mealItems: MealItem[], foods: FoodItem[]): SwapSuggestion | null {
  // 1. Find highest-CO2e item in meal
  let highest = mealItems[0]
  for (const item of mealItems) {
    if (item.co2e > highest.co2e) {
      highest = item
    }
  }

  const highestFood = foods.find(f => f.id === highest.food_item_id)

  // 2. Find lowest-CO2e food in same category (and sub_category if protein)
  let lowest = null
  for (const food of foods) {
    if (food.category !== highestFood.category) continue
    if (highestFood.category === 'protein' && food.sub_category !== highestFood.sub_category) continue
    if (!lowest || food.co2e_per_portion < lowest.co2e_per_portion) {
      lowest = food
    }
  }

  // 3. Calculate savings
  const suggestedCO2e = lowest.co2e_per_portion * highest.portions
  const savingsKg = highest.co2e - suggestedCO2e

  // 4. Only show if savings > 0.1 kg
  if (savingsKg <= 0.1) return null

  return {
    currentItemId: highestFood.id,
    currentItemName: highestFood.name,
    suggestedItemId: lowest.id,
    suggestedItemName: lowest.name,
    savingsKg,
  }
}
```

**What it does:**
- Find the highest-emission item in the meal
- Find the lowest-emission alternative in the same category
- Calculate CO2e savings if swapped
- Only show if savings > 0.1 kg

**Used by:**
- BuilderPage

---

#### `src/utils/equivalents.ts` — Conversion Helpers
```tsx
export function toDrivingKm(co2eKg: number): number {
  return co2eKg / 0.25  // Average car emits 0.25 kg CO2e per km
}

export function toCanadianDailyPercent(co2eKg: number): number {
  const canadianAverage = 3.98  // kg CO2e per day
  return (co2eKg / canadianAverage) * 100
}
```

**What it does:**
- Convert CO2e to driving km equivalent
- Compare daily total to Canadian average

**Used by:**
- Components showing emissions
- HistoryPage for comparisons

---

### Testing

#### Test File Pattern

Each source file has a corresponding `.test.ts` or `.test.tsx` file:

```
src/
├── hooks/
│   ├── useMealBuilder.ts
│   └── useMealBuilder.test.ts    ← tests for useMealBuilder
├── components/
│   ├── FoodCard.tsx
│   └── FoodCard.test.tsx         ← tests for FoodCard
└── utils/
    ├── swap.ts
    └── swap.test.ts              ← tests for swap logic
```

**Example test:**

```tsx
// src/hooks/useMealBuilder.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useMealBuilder } from './useMealBuilder'

describe('useMealBuilder', () => {
  it('should add item to meal', () => {
    const { result } = renderHook(() => useMealBuilder())

    // Initially empty
    expect(result.current.items).toHaveLength(0)

    // Add item
    act(() => {
      result.current.addItem('beef')
    })

    // Now has one item
    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].portions).toBe(1)
  })

  it('should calculate total CO2e', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef')  // 2.6 kg CO2e
    })

    expect(result.current.totalCO2e).toBe(2.6)
  })
})
```

**Key testing libraries:**
- `vitest` — test runner
- `@testing-library/react` — render components for testing
- `act()` — wrap state updates

---

## Part 6: The Complete Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          APP STARTS                             │
│  main.tsx → creates root and renders App.tsx                    │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      App.tsx renders                            │
│  • Wraps app with MealBuilderProvider (shared state)            │
│  • Shows NavBar (navigation)                                    │
│  • Shows OnboardingModal (welcome screen)                       │
│  • Sets up routing (wouter)                                     │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
                    ▼           ▼           ▼
        ┌──────────────────┐ ┌──────────────────┐ ┌──────────────┐
        │ ExplorerPage     │ │  BuilderPage     │ │ HistoryPage  │
        │                  │ │                  │ │              │
        │ • Load FOODS[]   │ │ • Access meal    │ │ • Read meals │
        │ • Display cards  │ │   from context   │ │   from       │
        │ • User searches  │ │ • User clicks    │ │   localStorage
        │   /filters/sorts │ │   "Add to Meal"  │ │ • Group by   │
        │ • User clicks    │ │ • Dispatch       │ │   date       │
        │   "Add to Meal"  │ │   ADD_ITEM       │ │ • Show chart │
        │                  │ │ • User adjusts   │ │              │
        │                  │ │   portions       │ │              │
        │                  │ │ • Dispatch       │ │              │
        │                  │ │   SET_PORTIONS   │ │              │
        │                  │ │ • Shows swap     │ │              │
        │                  │ │   suggestion     │ │              │
        │                  │ │ • User clicks    │ │              │
        │                  │ │   "Save Meal"    │ │              │
        └──────────────────┘ └────────┬─────────┘ └──────────────┘
                                      │
                                      ▼
                    ┌──────────────────────────────┐
                    │ MealBuilderContext           │
                    │ (useReducer reducer)         │
                    │                              │
                    │ Dispatches update:           │
                    │ { type: 'ADD_ITEM', id }     │
                    │ { type: 'SET_PORTIONS', ...} │
                    │ { type: 'REMOVE_ITEM', id } │
                    │ { type: 'CLEAR_MEAL' }       │
                    │                              │
                    │ State updates:               │
                    │ items: [...]                 │
                    │ totalCO2e: (calculated)      │
                    │ plateBalance: (calculated)   │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │ useMealBuilder hook          │
                    │ Computes derived state       │
                    │                              │
                    │ • Sums up CO2e              │
                    │ • Calculates plate balance  │
                    │ • Finds swap suggestion     │
                    │ (useMemo caches this)       │
                    └──────────────────────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                    ▼                             ▼
        ┌────────────────────┐      ┌────────────────────┐
        │ localStorage       │      │ Components update  │
        │                    │      │ (re-render)        │
        │ Key: meals         │      │                    │
        │ Value: [...]       │      │ • BuilderPage sees │
        │                    │      │   updated items    │
        │ Persisted until    │      │ • PlateViz updates │
        │ user clears        │      │ • CO2Badge updates │
        │ browser storage    │      │ • SwapCard updates │
        └────────────────────┘      └────────────────────┘
                                             │
                                             ▼
                                    ┌────────────────────┐
                                    │ User sees update   │
                                    │ on screen          │
                                    │ (immediate)        │
                                    └────────────────────┘
```

---

## Part 7: Learning Path — What to Study First

### Week 1: React Basics
1. **Understand JSX** — HTML-like syntax in JavaScript
   - Read: `src/components/FoodCard.tsx`
   - Exercise: Modify the text displayed

2. **Learn useState** — Simple state management
   - Read: `src/pages/ExplorerPage.tsx` (useState for search/filter)
   - Exercise: Add a new filter (e.g., filter by price range)

3. **Learn Props** — Pass data to components
   - Read: `src/components/FoodCard.tsx` (how it receives food and onAdd)
   - Exercise: Create a new component and pass props to it

### Week 2: Hooks & State
4. **Learn useReducer** — Complex state management
   - Read: `src/hooks/useMealBuilder.ts`
   - Exercise: Add a new action type (e.g., MULTIPLY_PORTIONS)

5. **Learn useMemo** — Caching computations
   - Read: `src/hooks/useMealBuilder.ts` (useMemo for derived state)
   - Exercise: Add caching to ExplorerPage's filter logic

6. **Learn useEffect** — Side effects (but not used in this project much)
   - Read: React documentation

### Week 3: Context & Hooks
7. **Learn Context API** — Share state across components
   - Read: `src/context/MealBuilderContext.tsx`
   - Exercise: Access context in a new component

8. **Learn Custom Hooks** — Extract logic into reusable hooks
   - Read: `src/hooks/useLocalStorage.ts`
   - Exercise: Create a custom hook for search/filter logic

### Week 4: Pages & Routing
9. **Learn Routing** — Multiple pages
   - Read: `src/main.tsx`, `src/App.tsx`
   - Exercise: Add a new page route

10. **Learn Data Persistence** — localStorage
    - Read: `src/hooks/useLocalStorage.ts`
    - Exercise: Persist search history to localStorage

### Week 5: Components & Design
11. **Learn Component Composition** — Build from smaller pieces
    - Read: All components in `src/components/`
    - Exercise: Build a new component using existing ones

12. **Learn TypeScript** — Type safety
    - Read: `src/types.ts`
    - Exercise: Add new types for a new feature

### Week 6: Testing
13. **Learn Testing** — Verify your code works
    - Read: `src/components/FoodCard.test.tsx`
    - Exercise: Write a test for a component

14. **Learn Integration Testing** — Test multiple components together
    - Read: `src/test/integration.test.tsx`
    - Exercise: Write an integration test

---

## Part 8: Key Concepts Reference

### 1. Components
- **What:** Functions that return UI (JSX)
- **When:** Break UI into reusable pieces
- **Example:** `FoodCard`, `CO2Badge`, `NavBar`

### 2. Props
- **What:** Inputs to a component (like function parameters)
- **When:** Pass data from parent to child
- **Example:** `<FoodCard food={item} onAdd={handleAdd} />`

### 3. State (useState)
- **What:** Data that can change; triggers re-render
- **When:** User input, toggles, form data
- **Example:** `const [search, setSearch] = useState('')`

### 4. Reducer (useReducer)
- **What:** Manage complex state with many actions
- **When:** Many related state updates
- **Example:** `const [state, dispatch] = useReducer(reducer, init)`

### 5. Context
- **What:** Share state across many components
- **When:** Global app state (like this project's MealBuilderContext)
- **Example:** `<Provider><Child1 /><Child2 /></Provider>`

### 6. Custom Hooks
- **What:** Functions that encapsulate state/logic
- **When:** Reuse logic in multiple components
- **Example:** `useLocalStorage`, `useMealBuilder`

### 7. Routing
- **What:** Show different pages based on URL
- **When:** Multi-page apps
- **Example:** `<Route path="/build" component={BuilderPage} />`

### 8. localStorage
- **What:** Browser's local data storage (persists across sessions)
- **When:** Save user data
- **Example:** `localStorage.setItem('key', JSON.stringify(data))`

### 9. TypeScript
- **What:** Add type checking to JavaScript
- **When:** Catch errors before runtime
- **Example:** `interface FoodItem { id: string; name: string; }`

### 10. Testing
- **What:** Verify components work correctly
- **When:** Before shipping code
- **Example:** `expect(result.current.items).toHaveLength(1)`

---

## Part 9: Common Patterns in This Codebase

### Pattern 1: Custom Hook for Logic
```tsx
// Extract logic into a hook
export function useMealBuilder() {
  const [state, dispatch] = useReducer(reducer, init)
  return { items, addItem, removeItem, ... }
}

// Use in component
function BuilderPage() {
  const { items, addItem } = useMealBuilder()
}
```

### Pattern 2: Context for Shared State
```tsx
// Create context
const MyContext = createContext(null)

// Provider wrapper
function MyProvider({ children }) {
  const state = useMealBuilder()
  return <MyContext.Provider value={state}>{children}</MyContext.Provider>
}

// Use anywhere
function MyComponent() {
  const state = useContext(MyContext)
}
```

### Pattern 3: Computed State with useMemo
```tsx
const derived = useMemo(() => {
  return {
    totalCO2e: items.reduce((sum, i) => sum + i.co2e, 0),
    // ... other computed values
  }
}, [items])  // Re-compute only when items changes
```

### Pattern 4: localStorage + useState
```tsx
const [meals, setMeals] = useState(() => {
  const saved = localStorage.getItem('key')
  return saved ? JSON.parse(saved) : []
})

// When updating
setMeals(prev => {
  const updated = [...prev, newMeal]
  localStorage.setItem('key', JSON.stringify(updated))
  return updated
})
```

---

## Part 10: Next Steps

1. **Clone the repo locally** (you've already done this!)
2. **Install dependencies:** `npm install`
3. **Start dev server:** `npm run dev`
4. **Open browser:** `http://localhost:5173`
5. **Make a small change:**
   - Modify text in a component
   - Change a color in Tailwind
   - Add a new filter option
6. **Run tests:** `npm test`
7. **Explore each file:**
   - Read through the code
   - Understand how data flows
   - Try to explain each function to yourself

---

## Glossary

| Term | Meaning |
|------|---------|
| **JSX** | HTML-like syntax in JavaScript (`<div>...</div>`) |
| **Component** | Reusable UI function that returns JSX |
| **Props** | Inputs to a component (parameters) |
| **State** | Data that changes and triggers re-renders |
| **Hook** | Function that "hooks into" React features (useState, useEffect, etc.) |
| **Render** | When React draws the component to the screen |
| **Re-render** | When React re-draws because state changed |
| **Context** | Shared state across components |
| **localStorage** | Browser storage API for persistent data |
| **Routing** | Show different pages based on URL |
| **TypeScript** | JavaScript with type checking |
| **Testing** | Verify code works correctly |
| **PWA** | Progressive Web App (works offline) |
| **Build** | Convert source code to production files |
| **Bundle** | All JavaScript/CSS files combined into one or a few files |

