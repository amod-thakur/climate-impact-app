# React Concepts Used in This Project

## Table of Contents
1. Components & JSX
2. Props (Passing Data)
3. State (useState)
4. Hooks (useReducer, useMemo, useContext)
5. Context API (Shared State)
6. Routing (Multiple Pages)
7. Persistence (localStorage)
8. TypeScript (Type Safety)
9. Testing

---

## 1. Components & JSX

### What is a Component?

A **component** is a JavaScript function that returns UI (JSX). It's like a reusable template.

```tsx
// Basic component
function Welcome() {
  return <h1>Hello, World!</h1>
}

// Component with JSX (looks like HTML, but it's JavaScript)
function Food() {
  return (
    <div className="food-card">
      <h2>Beef</h2>
      <p>2.6 kg CO2e per portion</p>
    </div>
  )
}
```

### JSX Rules

JSX looks like HTML but it's actually JavaScript. Here are the rules:

```tsx
// ✓ Return ONE root element
function Good() {
  return (
    <div>
      <h1>Title</h1>
      <p>Content</p>
    </div>
  )
}

// ✗ Multiple root elements (ERROR)
function Bad() {
  return (
    <h1>Title</h1>
    <p>Content</p>
  )
}

// ✓ Fragment <> </> is an invisible root
function AlsoGood() {
  return (
    <>
      <h1>Title</h1>
      <p>Content</p>
    </>
  )
}
```

### Example from This Project: FoodCard

```tsx
// src/components/FoodCard.tsx
import type { FoodItem } from '../types'

interface FoodCardProps {
  food: FoodItem
  onAdd: (id: string) => void
}

function FoodCard({ food, onAdd }: FoodCardProps) {
  return (
    <div className="card">                    {/* JSX element */}
      <h3>{food.name}</h3>                    {/* Insert variable */}
      <p>{food.portion_description}</p>      {/* "125 mL cooked" */}
      <p>{food.co2e_per_portion} kg CO2e</p> {/* Number formatting */}

      {/* Conditional rendering */}
      {food.dominant_ghg === 'CH4' && (
        <p className="warning">High methane emissions</p>
      )}

      {/* Button with click handler */}
      <button onClick={() => onAdd(food.id)}>
        Add to Meal
      </button>
    </div>
  )
}

export default FoodCard
```

**Key concepts:**
- `interface FoodCardProps` — defines what data the component needs
- `{ food, onAdd }` — destructuring props
- `{food.name}` — insert variable in JSX
- `onClick={() => onAdd(food.id)}` — handle click event
- `&&` — conditional rendering (show if true)

---

## 2. Props (Passing Data)

### What are Props?

**Props** are how you pass data from parent component to child component. Think of them as function parameters.

```tsx
// Parent component
function App() {
  const item = { id: 'beef', name: 'Beef', co2e: 2.6 }

  return (
    <>
      {/* Pass item as prop */}
      <FoodCard food={item} onAdd={(id) => console.log(id)} />

      {/* Pass different values */}
      <FoodCard food={item} onAdd={handleAddMeal} />
    </>
  )
}

// Child component
interface FoodCardProps {
  food: FoodItem
  onAdd: (id: string) => void  // Function prop
}

function FoodCard({ food, onAdd }: FoodCardProps) {
  return (
    <div>
      <h3>{food.name}</h3>
      <button onClick={() => onAdd(food.id)}>Add</button>
    </div>
  )
}
```

### Props Flow (One-Way)

```
Parent Component
     │
     ├─ food={item}
     ├─ onAdd={handleAdd}
     ▼
Child Component (FoodCard)
     │
     ├─ Receives props
     ├─ Uses props in JSX
     └─ Calls onAdd() when user clicks
           │
           ▼
     Goes back to parent
```

### Important: Props are Read-Only

```tsx
// ✗ WRONG - you can't modify props
function FoodCard({ food }: FoodCardProps) {
  food.co2e = 3  // ERROR! Can't change prop
}

// ✓ RIGHT - use state if you need to change data
function FoodCard({ food }: FoodCardProps) {
  const [portions, setPortions] = useState(1)

  return (
    <div>
      <h3>{food.name}</h3>
      <input
        value={portions}
        onChange={(e) => setPortions(parseInt(e.target.value))}
      />
    </div>
  )
}
```

---

## 3. State (useState)

### What is State?

**State** is data that can change. When state changes, React automatically re-renders the component.

```tsx
import { useState } from 'react'

function SearchBar() {
  // Declare state variable
  const [search, setSearch] = useState('')
  //    ↑ current value    ↑ function to update it

  return (
    <>
      {/* Show current value */}
      <p>You searched for: {search}</p>

      {/* Update state on input change */}
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search foods..."
      />
    </>
  )
}
```

### How useState Works

```
1. Component renders with search = ''
2. User types in input
3. onChange fires → calls setSearch(newValue)
4. React updates search state
5. React re-renders component (with new search value)
6. User sees updated value in input
7. Repeat from step 2
```

### Example from This Project: ExplorerPage

```tsx
function ExplorerPage() {
  // Multiple state variables
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [sortOrder, setSortOrder] = useState('co2e_asc')

  // When user types in search
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  // When user clicks category tab
  <button onClick={() => setActiveTab('protein')}>
    Protein
  </button>

  // When user selects sort option
  <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
    <option value="co2e_asc">Lowest Emissions</option>
    <option value="alpha">Alphabetical</option>
  </select>
}
```

### State with Objects

```tsx
// ✗ WRONG - don't mutate state directly
function BadComponent() {
  const [user, setUser] = useState({ name: 'John', age: 30 })

  function handleUpdateAge() {
    user.age = 31  // ✗ WRONG - mutates object
    setUser(user)  // React won't detect change
  }
}

// ✓ RIGHT - create new object
function GoodComponent() {
  const [user, setUser] = useState({ name: 'John', age: 30 })

  function handleUpdateAge() {
    setUser({ ...user, age: 31 })  // Create new object
  }
}
```

### State with Arrays

```tsx
// ✗ WRONG - mutating array
function BadMeal() {
  const [items, setItems] = useState([])

  function addItem(id) {
    items.push({ id, portions: 1 })  // ✗ WRONG
    setItems(items)
  }
}

// ✓ RIGHT - create new array
function GoodMeal() {
  const [items, setItems] = useState([])

  function addItem(id) {
    setItems([...items, { id, portions: 1 }])  // Create new array
  }

  function removeItem(id) {
    setItems(items.filter(i => i.id !== id))  // Filter creates new array
  }
}
```

---

## 4. Hooks (Advanced State Management)

### What are Hooks?

**Hooks** are functions that let you "hook into" React features. They all start with `use`.

Common hooks:
- `useState` — simple state
- `useReducer` — complex state
- `useMemo` — cache calculations
- `useEffect` — side effects (API calls, timers)
- `useContext` — access shared state
- `useCallback` — cache functions

### useReducer (Complex State)

`useReducer` is like `useState` but for complex state with many actions.

```tsx
import { useReducer } from 'react'

// 1. Define state shape
interface State {
  items: MealItem[]
  label: string | null
}

// 2. Define action types
type Action =
  | { type: 'ADD_ITEM'; foodItemId: string }
  | { type: 'REMOVE_ITEM'; foodItemId: string }
  | { type: 'SET_PORTIONS'; foodItemId: string; portions: number }
  | { type: 'CLEAR_MEAL' }

// 3. Reducer function (pure function)
function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ADD_ITEM':
      return {
        ...state,
        items: [...state.items, { food_item_id: action.foodItemId, portions: 1, co2e: 0 }]
      }

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(i => i.food_item_id !== action.foodItemId)
      }

    case 'SET_PORTIONS':
      return {
        ...state,
        items: state.items.map(i =>
          i.food_item_id === action.foodItemId
            ? { ...i, portions: action.portions }
            : i
        )
      }

    case 'CLEAR_MEAL':
      return { items: [], label: null }

    default:
      return state
  }
}

// 4. Use in component
function MealBuilder() {
  const [state, dispatch] = useReducer(reducer, { items: [], label: null })

  function handleAdd(id: string) {
    dispatch({ type: 'ADD_ITEM', foodItemId: id })
  }

  function handleRemove(id: string) {
    dispatch({ type: 'REMOVE_ITEM', foodItemId: id })
  }

  function handleSetPortions(id: string, portions: number) {
    dispatch({ type: 'SET_PORTIONS', foodItemId: id, portions })
  }

  return (
    <div>
      {/* Display items */}
      {state.items.map(item => (
        <div key={item.food_item_id}>
          <p>Portions: {item.portions}</p>
          <button onClick={() => handleSetPortions(item.food_item_id, item.portions + 1)}>
            Increase
          </button>
          <button onClick={() => handleRemove(item.food_item_id)}>
            Remove
          </button>
        </div>
      ))}

      <button onClick={() => dispatch({ type: 'CLEAR_MEAL' })}>
        Clear Meal
      </button>
    </div>
  )
}
```

**Why use useReducer?**
- Related state updates (all meal item related)
- Multiple actions affecting same state
- Complex logic (filtering, mapping, calculating)
- Easier to test than multiple useState calls

### useMemo (Cache Calculations)

`useMemo` caches the result of an expensive calculation. Re-calculates only when dependencies change.

```tsx
import { useMemo } from 'react'

function BuilderPage() {
  const items = [
    { id: 'beef', portions: 1, co2e: 2.6 },
    { id: 'rice', portions: 2, co2e: 0.1 }
  ]

  // Without useMemo: recalculates every render
  const totalCO2e = items.reduce((sum, i) => sum + i.co2e, 0)  // 2.7 kg

  // With useMemo: only recalculates when items changes
  const cachedTotal = useMemo(() => {
    console.log('Calculating total...')  // Only logs when items changes
    return items.reduce((sum, i) => sum + i.co2e, 0)
  }, [items])  // Dependency array

  return (
    <div>
      <p>Total CO2e: {cachedTotal}</p>
    </div>
  )
}
```

**Dependencies array:**
- `[]` — calculate once, never re-calculate
- `[items]` — re-calculate when `items` changes
- `[items, portions]` — re-calculate when either changes

**Example from this project:**

```tsx
// src/hooks/useMealBuilder.ts
const derived = useMemo(() => computeDerived(state.items), [state.items])
//                                                          ↑ re-compute only when state.items changes

// src/pages/ExplorerPage.tsx
const filteredAndSorted = useMemo(() => {
  let items = FOODS

  if (activeTab !== 'all') {
    items = items.filter(f => f.category === activeTab)
  }

  if (search) {
    items = items.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
  }

  // Sort logic...

  return items
}, [search, activeTab, sort])  // Re-filter/sort when any of these change
```

### useCallback (Cache Functions)

`useCallback` caches a function so it doesn't create a new function every render.

```tsx
import { useCallback } from 'react'

function SearchBar() {
  const [search, setSearch] = useState('')

  // Without useCallback: new function every render
  const handleChange = (e) => {
    setSearch(e.target.value)
  }

  // With useCallback: same function (unless dependencies change)
  const handleChangeOptimized = useCallback((e) => {
    setSearch(e.target.value)
  }, [])  // Empty deps = never changes

  return (
    <input onChange={handleChangeOptimized} />
  )
}
```

**Example from this project:**

```tsx
// src/hooks/useLocalStorage.ts
const setValue = useCallback(
  (value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(nextValue))
      return nextValue
    })
  },
  [key]  // Re-create function if key changes
)
```

---

## 5. Context API (Shared State)

### What is Context?

**Context** lets you share state across many components without passing props through every level.

```
Without Context:
App
├─ Page1 (has state)
│  └─ Component A ← needs state (props drilling)
│     └─ Component B ← needs state (props drilling)
│        └─ Component C ← needs state (props drilling)


With Context:
┌─────────────────────────────────┐
│  MealBuilderContext             │
│  (shared state)                 │
└─────────────────────────────────┘
  ↓
┌─────────────────────────────────┐
│  App wrapped in Provider        │
├─ Page1
│  ├─ Component A (uses hook)
│  ├─ Component B (uses hook)
│  └─ Component C (uses hook)
├─ Page2
│  ├─ Component X (uses hook)
│  └─ Component Y (uses hook)
```

### Creating Context

```tsx
// Step 1: Create context
import { createContext } from 'react'

const MealBuilderContext = createContext<MealBuilderState | null>(null)

// Step 2: Create provider wrapper
function MealBuilderProvider({ children }: { children: React.ReactNode }) {
  const mealBuilder = useMealBuilder()  // Hook with state logic

  return (
    <MealBuilderContext.Provider value={mealBuilder}>
      {children}
    </MealBuilderContext.Provider>
  )
}

// Step 3: Export hook to access context
function useMealBuilderContext() {
  const context = useContext(MealBuilderContext)
  if (!context) {
    throw new Error('Must be used within MealBuilderProvider')
  }
  return context
}

export { MealBuilderProvider, useMealBuilderContext }
```

### Using Context

```tsx
// In your app root (App.tsx)
<MealBuilderProvider>
  <ExplorerPage />
  <BuilderPage />
  <HistoryPage />
</MealBuilderProvider>

// In any child component
function BuilderPage() {
  const { items, addItem, totalCO2e } = useMealBuilderContext()

  return (
    <div>
      <p>Items: {items.length}</p>
      <p>Total: {totalCO2e} kg CO2e</p>
      <button onClick={() => addItem('beef')}>
        Add Beef
      </button>
    </div>
  )
}
```

### Example from This Project

```tsx
// src/context/MealBuilderContext.tsx
export function MealBuilderProvider({ children }: { children: React.ReactNode }) {
  const mealBuilder = useMealBuilder()  // All the complex state logic
  return (
    <MealBuilderContext.Provider value={mealBuilder}>
      {children}
    </MealBuilderContext.Provider>
  )
}

// src/hooks/useMealBuilderContext.ts
export function useMealBuilderContext() {
  const context = useContext(MealBuilderContext)
  if (!context) {
    throw new Error('useMealBuilderContext must be used within MealBuilderProvider')
  }
  return context
}

// src/App.tsx
<MealBuilderProvider>
  {/* All pages can now use useMealBuilderContext() */}
</MealBuilderProvider>

// Any page
function ExplorerPage() {
  const { addItem } = useMealBuilderContext()
  // Can access meal state from anywhere!
}
```

---

## 6. Routing (Multiple Pages)

### What is Routing?

**Routing** means showing different pages based on the URL.

```
URL: http://localhost:5173/
  → Show ExplorerPage

URL: http://localhost:5173/build
  → Show BuilderPage

URL: http://localhost:5173/history
  → Show HistoryPage

URL: http://localhost:5173/settings
  → Show SettingsPage
```

### Setting Up Routes

```tsx
// src/main.tsx
import { Router } from 'wouter'

<Router base="/leetcode-assistant">
  <App />
</Router>

// src/App.tsx
import { Switch, Route, Redirect } from 'wouter'

<Switch>
  <Route path="/" component={ExplorerPage} />
  <Route path="/build" component={BuilderPage} />
  <Route path="/history" component={HistoryPage} />
  <Route path="/settings" component={SettingsPage} />
  <Route>
    <Redirect to="/" />  {/* Unknown routes redirect to / */}
  </Route>
</Switch>
```

### Navigation

```tsx
// Option 1: Link component (no page reload)
import { Link } from 'wouter'

<Link href="/">Go to Explorer</Link>
<Link href="/build">Go to Builder</Link>

// Option 2: useLocation hook (programmatic navigation)
import { useLocation } from 'wouter'

function ExplorerPage() {
  const [, navigate] = useLocation()

  function handleAddToMeal(id: string) {
    addItem(id)
    navigate('/build')  // Go to builder page
  }

  return (
    <button onClick={() => handleAddToMeal('beef')}>
      Add Beef
    </button>
  )
}
```

---

## 7. Persistence (localStorage)

### Basic localStorage

```tsx
// Save
const data = { items: [1, 2, 3] }
localStorage.setItem('meals', JSON.stringify(data))

// Load
const saved = localStorage.getItem('meals')
const data = saved ? JSON.parse(saved) : []

// Remove
localStorage.removeItem('meals')

// Clear all
localStorage.clear()
```

### Custom Hook Pattern (This Project)

```tsx
// src/hooks/useLocalStorage.ts
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // Initialize from localStorage
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  // Update state AND localStorage
  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const nextValue = value instanceof Function ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(nextValue))
      return nextValue
    })
  }, [key])

  return [storedValue, setValue]
}

// Usage (just like useState!)
function BuilderPage() {
  const [meals, setMeals] = useLocalStorage('co2-tracker-meals', [])

  function saveMeal(meal) {
    setMeals([...meals, meal])  // Automatically saves to localStorage
  }

  return <div>Meals: {meals.length}</div>
}
```

---

## 8. TypeScript (Type Safety)

### Basic Types

```tsx
// Primitive types
const name: string = 'John'
const age: number = 30
const active: boolean = true

// Arrays
const numbers: number[] = [1, 2, 3]
const strings: Array<string> = ['a', 'b', 'c']

// Union types (can be one or the other)
const id: string | number = 'abc'  // Can be string
const id2: string | number = 123   // Or number

// Optional (can be undefined)
const middleName?: string = undefined  // OK
```

### Interfaces (Object Types)

```tsx
// Define shape of an object
interface FoodItem {
  id: string
  name: string
  category: 'protein' | 'vegetable'
  co2e_per_portion: number
}

// Use interface
const beef: FoodItem = {
  id: 'beef',
  name: 'Beef',
  category: 'protein',
  co2e_per_portion: 2.6
}

// Type checking catches errors
const chicken: FoodItem = {
  id: 'chicken',
  name: 'Chicken',
  category: 'dairy'  // ERROR! Should be 'protein' or 'vegetable'
}
```

### Component Props with TypeScript

```tsx
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean  // Optional prop
}

function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}

// Type checking:
<Button label="Save" onClick={handleSave} />  // ✓ OK
<Button label="Save" onClick={handleSave} disabled={true} />  // ✓ OK
<Button label="Save" />  // ✗ ERROR - onClick required
<Button label="Save" onClick={handleSave} disabled="yes" />  // ✗ ERROR - disabled must be boolean
```

### Example from This Project

```tsx
// src/types.ts
export interface FoodItem {
  id: string
  name: string
  category: FoodCategory
  sub_category: SubCategory | null
  portion_weight_grams: number
  co2e_per_portion: number
  data_source: string
  data_source_url: string
}

export interface MealItem {
  food_item_id: string
  portions: number
  co2e: number
}

// src/components/FoodCard.tsx
interface FoodCardProps {
  food: FoodItem  // Use interface
  onAdd: (id: string) => void
}

function FoodCard({ food, onAdd }: FoodCardProps) {
  // TypeScript checks:
  // - food must have all FoodItem properties
  // - onAdd must be a function that takes a string
  // - If you access food.misspelled, you get an error
  return <div>{food.name}</div>
}
```

---

## 9. Testing

### What to Test

1. **Components** — Does it render correctly?
2. **Hooks** — Does the logic work?
3. **Utils** — Do helper functions work?
4. **Integration** — Do things work together?

### Testing Components

```tsx
// src/components/FoodCard.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import FoodCard from './FoodCard'

describe('FoodCard', () => {
  // Test 1: Displays food name
  it('should display food name', () => {
    const food = {
      id: 'beef',
      name: 'Beef',
      category: 'protein',
      co2e_per_portion: 2.6,
      // ... other required fields
    }

    render(<FoodCard food={food} onAdd={() => {}} />)

    expect(screen.getByText('Beef')).toBeInTheDocument()
  })

  // Test 2: Calls callback when button clicked
  it('should call onAdd when button is clicked', () => {
    const mockOnAdd = vi.fn()  // Mock function
    const food = { id: 'beef', ... }

    render(<FoodCard food={food} onAdd={mockOnAdd} />)

    const button = screen.getByRole('button', { name: /add/i })
    button.click()

    expect(mockOnAdd).toHaveBeenCalledWith('beef')
  })
})
```

### Testing Hooks

```tsx
// src/hooks/useMealBuilder.test.ts
import { renderHook, act } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { useMealBuilder } from './useMealBuilder'

describe('useMealBuilder', () => {
  // Test 1: Add item
  it('should add item to meal', () => {
    const { result } = renderHook(() => useMealBuilder())

    expect(result.current.items).toHaveLength(0)

    act(() => {
      result.current.addItem('beef')
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.items[0].food_item_id).toBe('beef')
  })

  // Test 2: Calculate total
  it('should calculate total CO2e', () => {
    const { result } = renderHook(() => useMealBuilder())

    act(() => {
      result.current.addItem('beef')  // 2.6 kg
    })

    expect(result.current.totalCO2e).toBe(2.6)
  })
})
```

### Testing Utils

```tsx
// src/utils/swap.test.ts
import { describe, it, expect } from 'vitest'
import { findSwap } from './swap'

describe('findSwap', () => {
  it('should find lowest-emission alternative', () => {
    const mealItems = [
      { food_item_id: 'beef', portions: 1, co2e: 2.6 }
    ]

    const swap = findSwap(mealItems, FOODS)

    expect(swap).not.toBeNull()
    expect(swap?.suggestedItemId).toBe('chicken')  // Lower emissions
    expect(swap?.savingsKg).toBeGreaterThan(0.1)
  })

  it('should return null if no savings', () => {
    const mealItems = [
      { food_item_id: 'potatoes', portions: 1, co2e: 0.03 }
    ]

    const swap = findSwap(mealItems, FOODS)

    expect(swap).toBeNull()  // Already low emissions
  })
})
```

---

## Quick Pattern Reference

### Read and Update State
```tsx
const [value, setValue] = useState(initialValue)
setValue(newValue)
setValue(prev => prev + 1)  // Update based on previous
```

### Conditional Rendering
```tsx
{condition && <Component />}
{condition ? <A /> : <B />}
{values.length > 0 && <List items={values} />}
```

### Mapping Lists
```tsx
{items.map(item => (
  <div key={item.id}>{item.name}</div>
))}
```

### Prevent Default
```tsx
<form onSubmit={(e) => {
  e.preventDefault()
  handleSubmit()
}} />
```

### Handle Input
```tsx
<input
  value={search}
  onChange={(e) => setSearch(e.target.value)}
/>
```

### Access Props Children
```tsx
interface BoxProps {
  children: React.ReactNode
}

function Box({ children }: BoxProps) {
  return <div className="box">{children}</div>
}

// Usage
<Box>
  <p>Content inside box</p>
</Box>
```

