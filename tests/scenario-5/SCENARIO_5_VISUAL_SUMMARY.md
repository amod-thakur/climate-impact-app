# SCENARIO #5: DUPLICATE FOOD ITEMS - VISUAL SUMMARY

## Overview

When a user adds the same food item multiple times, the app implements a **merge-on-duplicate pattern** that increments portions instead of creating separate entries. This test verifies the pattern works correctly.

---

## KEY FINDING #1: The Merge Pattern Works Correctly

### User Actions

```
Timeline:
┌─────────────────────────────────────────────────────┐
│ 1. Open Food Explorer                               │
│    See "Beef (100g, 2.6 kg CO2e)"                   │
└─────────────────────────────────────────────────────┘
         ↓ Click "+ Add"
┌─────────────────────────────────────────────────────┐
│ 2. Navigate to Meal Builder                         │
│    Beef (1 portion)                                 │
│    2.6 kg CO2e                                      │
└─────────────────────────────────────────────────────┘
         ↓ Click back to Explorer
┌─────────────────────────────────────────────────────┐
│ 3. Click "+ Add" on Beef again                      │
└─────────────────────────────────────────────────────┘
         ↓ Navigate back
┌─────────────────────────────────────────────────────┐
│ 4. Meal Builder updates AUTOMATICALLY               │
│    Beef (2 portions)  ← Merged!                     │
│    5.2 kg CO2e        ← Recalculated                │
└─────────────────────────────────────────────────────┘
```

### Data Model

**What's stored internally:**

```
App State:
┌─────────────────────────────────────────┐
│ items: [                                 │
│   {                                      │
│     food_item_id: "beef",               │
│     portions: 2,         ← Incremented  │
│     co2e: 5.2            ← Recalculated │
│   }                                      │
│ ]                                        │
│ items.length = 1  (NOT 2!)              │
└─────────────────────────────────────────┘
```

**NOT this:**

```
✗ WRONG - Two separate entries:
  items: [
    { food_item_id: "beef", portions: 1, co2e: 2.6 },
    { food_item_id: "beef", portions: 1, co2e: 2.6 }
  ]
```

**Code location:** useMealBuilder.ts:45-71 (ADD_ITEM case)

---

## KEY FINDING #2: Maximum Portion Clamping

### Portion Increment Sequence

```
Starting: Beef with 0 portions
         ↓
Add #1:  Beef with 1 portion
         ↓
Add #2:  Beef with 2 portions
         ↓
Add #3:  Beef with 3 portions
         ↓
Add #4:  Beef with 4 portions
         ↓
Add #5:  Beef with 5 portions (at MAX)
         ↓
Add #6:  Beef with 5 portions (clamped, NOT 6!) ✓
         ↓
Add #7:  Beef with 5 portions (clamped, NOT 7!) ✓
```

### Clamp Function

```tsx
const MAX_PORTIONS = 5
const MIN_PORTIONS = 0.5

function clampPortions(n: number): number {
  return Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, n))
}

// Examples:
clampPortions(-1)   → 0.5   (clamped to MIN)
clampPortions(0.5)  → 0.5   (within bounds)
clampPortions(3)    → 3     (within bounds)
clampPortions(5)    → 5     (at MAX)
clampPortions(6)    → 5     (clamped to MAX)
clampPortions(100)  → 5     (clamped to MAX)
```

### UI Feedback

```
Meal Builder Display:

Beef
─────────────────────
Portions: [◀ 5 ▶]

User clicks ▶ to add:
  5 + 1 = 6 → clamped to 5
  Still shows: [◀ 5 ▶]

No error message, silently caps at max ⚠️
```

---

## KEY FINDING #3: Swap Suggestions Scale Correctly

### Merge Impact on Swap Calculation

```
Scenario: User adds Beef twice

Meal State:
┌──────────────────────────────┐
│ Beef: 2 portions             │
│ CO2e: 2.6 × 2 = 5.2 kg      │
└──────────────────────────────┘

Finding Best Swap:

Step 1: Find highest-emission item
  ✓ Beef with 5.2 kg (highest in meal)

Step 2: Find best alternative in same category
  ✓ Lentils with 0.18 kg per portion

Step 3: Calculate savings (KEY PART)
  Current: beef × 2 portions = 5.2 kg
  Suggested: lentils × 2 portions = 0.36 kg
  Savings: 5.2 - 0.36 = 4.84 kg
           (= 19.4 km driving equivalent)

Display to user:
  "Swap your 2 servings of Beef for
   2 servings of Lentils to save
   4.84 kg CO2e (19.4 km driving)"
```

### Code Evidence

```ts
// utils/swap.ts:85-86
const suggestedCO2e = lowestAlternative.co2e_per_portion * highestItem.portions
                                                          ↑
                                      Uses the MERGED portions! ✓
```

---

## KEY CONCERN #1: REMOVE Removes ALL Portions

### Unexpected Behavior

```
User Expectation:
┌────────────────────────┐
│ "I added beef twice,   │
│ if I click Remove,     │
│ it should remove just  │
│ the last one I added"  │
└────────────────────────┘

Actual Behavior:
┌────────────────────────┐
│ Meal: Beef 2 portions  │
│ User clicks: Remove    │
│ Result: All beef gone  │
│ (0 portions, removed)  │
└────────────────────────┘
```

### Why This Happens

```tsx
// useMealBuilder.ts:73-79
case 'REMOVE_ITEM':
  return {
    ...state,
    items: state.items.filter(
      (i) => i.food_item_id !== action.foodItemId,
                              ↑
      // Matches on ID, removes entire entry
    ),
  }

// Result:
// Before: items = [{ beef, portions: 2 }]
// After:  items = []  ← ALL GONE
```

### Mitigation

UI provides portion controls instead of relying on removal:

```
Meal Builder UI:
┌─────────────────────────────────┐
│ Beef (100g)                     │
│ Portions: [◀ 2 ▶]  ← Can adjust │
│ CO2e: 5.2 kg                    │
│                                 │
│ [Remove Beef]  ← Removes all    │
└─────────────────────────────────┘

User can:
  - Click ◀ to decrease to 1
  - Click ▶ to increase (up to 5)
  - Click [Remove] to delete entirely
```

---

## KEY CONCERN #2: Storage Validation Gap

### Vulnerability Scenario

```
User Opens DevTools and Manually Edits localStorage:

Before (Normal):
┌──────────────────────────────────┐
│ {                                │
│   "items": [                     │
│     {                            │
│       "food_item_id": "beef",   │
│       "portions": 2,             │
│       "co2e": 5.2                │
│     }                            │
│   ]                              │
│ }                                │
└──────────────────────────────────┘

DevTools Edit (Corruption):
┌──────────────────────────────────┐
│ {                                │
│   "items": [                     │
│     {                            │
│       "food_item_id": "beef",   │ ← Duplicate
│       "portions": 1,             │   food_item_id!
│       "co2e": 2.6                │
│     },                           │
│     {                            │
│       "food_item_id": "beef",   │ ← Same ID
│       "portions": 1,             │   different entry
│       "co2e": 2.6                │
│     }                            │
│   ]                              │
│ }                                │
└──────────────────────────────────┘

Page Reload:
┌──────────────────────────────────┐
│ App loads from localStorage       │
│ NO VALIDATION CHECK              │
│ ✗ Accepts duplicate beef entries │
│ ✗ Data integrity violated        │
└──────────────────────────────────┘
```

### Code Gap

```ts
// Loading meals from localStorage
const saved = localStorage.getItem('co2-tracker-meals')
const meals = JSON.parse(saved)  // ← NO VALIDATION!

// Problems:
// 1. No check for duplicate food_item_ids
// 2. No type validation
// 3. No range validation for portions
// 4. No CO2e recalculation to verify
```

---

## ARCHITECTURE COMPARISON

### Current Pattern: Merge on Duplicate (✓ CORRECT)

```
ADD 'beef'  →  items = [{ beef, portions: 1 }]
ADD 'beef'  →  items = [{ beef, portions: 2 }]
ADD 'beef'  →  items = [{ beef, portions: 3 }]
```

**Advantages:**
- ✓ No duplicate entries
- ✓ Single portion control
- ✓ Simple calculations
- ✓ Matches real-world model

**Disadvantages:**
- ⚠️ User might expect separate entries
- ⚠️ REMOVE removes all, not one

### Alternative Pattern: Separate Entries (✗ WRONG)

```
ADD 'beef'  →  items = [{ beef_1, portions: 1 }]
ADD 'beef'  →  items = [
                { beef_1, portions: 1 },
                { beef_2, portions: 1 }
              ]
ADD 'beef'  →  items = [
                { beef_1, portions: 1 },
                { beef_2, portions: 1 },
                { beef_3, portions: 1 }
              ]
```

**Problems:**
- ✗ Duplicate entries in state
- ✗ Ambiguous REMOVE (which one?)
- ✗ Complex calculations (need to aggregate)
- ✗ Doesn't match real meal model
- ✗ More UI complexity

---

## UI/UX MISMATCH

### User's Mental Model

```
"Food Explorer is like a shopping cart"

Add Beef → "Beef #1 in my cart"
Add Beef → "Beef #2 in my cart"
View Builder → See 2 separate beefs?
```

### Reality

```
"Meal Builder deduplicates by food_item_id"

Add Beef → portions = 1
Add Beef → portions = 2 (merged, not #2)
View Builder → See "Beef with 2 portions"
```

### Confusion Scenarios

```
Scenario A: User expects separate controls
─────────────────────────────────────────
User thinks: "I can edit first beef and second beef separately"
Reality: Only one control for "Beef (2 portions)"
Result: Confusion when editing


Scenario B: User expects incremental removal
─────────────────────────────────────────
User thinks: "Clicking Remove once removes the last add"
Reality: Clicking Remove removes all beef
Result: Surprise when both disappear


Scenario C: User expects to see multiple entries
─────────────────────────────────────────
User thinks: "I'll see [Beef, Beef] in my meal"
Reality: See [Beef (2 portions)]
Result: "Where did my second entry go?"
```

### Mitigation Suggestions

```
Option 1: Show a tooltip on duplicate add
───────────────────────────────────────
Button: "+ Add"
Hover: "Adding same item increases portions"
Result: User learns the pattern


Option 2: Show a toast message
──────────────────────────────
User clicks "+ Add" on Beef (when already in meal)
Toast: "Increased Beef to 2 portions"
Result: Clear feedback


Option 3: Show merge UI affordance
──────────────────────────────────
Instead of: "Beef (2 portions)"
Show: "Beef (1 + 1 = 2 portions)"
Result: Shows the adds were merged
```

---

## PLATE BALANCE WITH MERGED ITEMS

### Calculation Verification

```
Meal Composition:
┌──────────────────────────────┐
│ Beef: 2 portions × 100g      │
│       = 200g (protein)       │
│                              │
│ Spinach: 3 portions × 100g   │
│          = 300g (vegetables) │
│                              │
│ Total: 500g                  │
└──────────────────────────────┘

Plate Balance Calculation:
┌──────────────────────────────┐
│ Vegetables: 300/500 = 60%    │
│ Protein: 200/500 = 40%       │
│ Whole Grains: 0%             │
│ Other: 0%                    │
└──────────────────────────────┘

Visual (Pie Chart):
        ┌─────────────┐
       /  Vegetables   \
      / (60%)   (40%)  \
     | Spinach │ Beef  |
      \         Protein/
       \       /
        └─────┘
```

**Status: ✓ CORRECT** - Merged items properly counted

---

## SUMMARY TABLE

| Aspect | Status | Finding |
|--------|--------|---------|
| **Merge behavior** | ✓ Good | Works as designed |
| **Portion increment** | ✓ Good | Increments correctly |
| **Maximum clamping** | ✓ Good | Prevents overflow |
| **Swap calculation** | ✓ Good | Scales with portions |
| **Plate balance** | ✓ Good | Counts merged items |
| **REMOVE behavior** | ⚠️ Quirk | Removes all, not one |
| **Storage validation** | ✗ Bad | No duplicate check |
| **UI clarity** | ⚠️ Concern | Merge not obvious |

---

## DEFECTS FOUND

### S5-D1: Storage Validation Gap (MEDIUM)

```
When: Loading meal from localStorage
What: No validation for duplicate food_item_ids
Impact: Corrupted data accepted without error
Fix: Add validation function to check for duplicates
```

### S5-D2: UI/UX Mismatch (LOW)

```
When: User adds same food multiple times
What: UI shows merged entry, user expects separate entries
Impact: User confusion about what happened
Fix: Add tooltip or toast message explaining merge
```

---

## CONCLUSION

**Overall Status: MOSTLY WELL-DESIGNED**

**Verdict:**
- ✓ Merge pattern is CORRECT and INTENTIONAL
- ✓ Calculations work properly with merged items
- ✓ Maximum clamping prevents overflow
- ✗ Storage validation gap (like other scenarios)
- ⚠️ UI/UX could be clearer about merge behavior

**Recommendation: LOW PRIORITY**
- The merge pattern is better than the alternative
- Focus should be on broader storage validation (Issue #1, #4, #5)
- Optional UI improvements for clarity

---

*Visual Summary for Scenario #5: Duplicate Food Items*
*Test Date: Jan 30, 2026*
