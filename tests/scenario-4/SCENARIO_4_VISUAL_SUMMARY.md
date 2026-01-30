# SCENARIO #4: VISUAL TEST SUMMARY

## Test Overview

### What We Tested
Whether the app can save meals with zero items and what happens if an empty meal reaches the history.

### Focus Areas
1. UI protection against empty saves
2. Code-level validation in handleSave()
3. Bypass vectors (DevTools, localStorage)
4. Impact of empty meals on history and aggregates
5. Data model validation

---

## KEY FINDINGS

### 1. ✅ GOOD: UI Protection is Strong
```
UI Protection Layer:
┌──────────────────────────────────────────┐
│ items.length === 0?                      │
│   YES → Show "Add items" screen          │
│         Save button NOT rendered ✓       │
│   NO  → Show meal builder                │
│         Save button visible              │
└──────────────────────────────────────────┘

Result: ✓ Normal users CANNOT save empty meals

When empty, user sees:
┌────────────────────────────────────┐
│      Meal Builder                  │
├────────────────────────────────────┤
│  Add items from the Explorer       │
│  to build a meal.                  │
│                                    │
│  [Browse Foods] button             │
│                                    │
│  (NO "Save to Daily Estimate")     │
└────────────────────────────────────┘
```

### 2. ✗ BAD: handleSave() Has No Validation
```
Current handleSave() Logic:
┌─────────────────────────────────────────┐
│ function handleSave() {                  │
│   const meal = {                         │
│     items: [...items],  ← No check!     │
│     total_co2e: totalCO2e,              │
│     ...                                  │
│   }                                      │
│   setSavedMeals([...meals, meal])  ✗    │
│   // SAVES WITHOUT VALIDATION           │
│ }                                        │
└─────────────────────────────────────────┘

Missing guard:
  ✗ if (items.length === 0) return

Impact:
  If called programmatically → Empty meal saves
```

### 3. ⚠️  Bypass Vector: Direct Function Call
```
Scenario: User removes last item, then calls handleSave()

Timeline:
┌──────────────────────────────────────────┐
│ 1. User has 1 item in meal               │
│    Save button: VISIBLE                  │
├──────────────────────────────────────────┤
│ 2. User clicks "Remove" for last item    │
│    items = []                            │
│    Save button: HIDDEN (re-renders)      │
├──────────────────────────────────────────┤
│ 3. User opens DevTools Console           │
│    Calls: handleSave() directly          │
│    React DevTools allows direct call ⚠️  │
├──────────────────────────────────────────┤
│ 4. handleSave() executes                 │
│    items = [] (from state at step 2)     │
│    No validation check ✗                 │
├──────────────────────────────────────────┤
│ 5. Meal saved to history with:           │
│    items: []                             │
│    total_co2e: 0                         │
│    Result: ✗ EMPTY MEAL SAVED            │
└──────────────────────────────────────────┘

Likelihood: MEDIUM (requires DevTools)
Impact: HIGH (breaks UX and stats)
```

### 4. ⚠️  Bypass Vector: localStorage Corruption
```
Manual Data Corruption:

DevTools → Application → localStorage:
┌────────────────────────────────────────┐
│ co2-tracker-meals: [                   │
│   {                                    │
│     id: "meal-456",                    │
│     items: [                           │
│       { food_item_id: "beef",          │
│         portions: 1, co2e: 2.6 }       │
│     ],                                 │
│     total_co2e: 2.6                    │
│   }                                    │
│ ]                                      │
└────────────────────────────────────────┘
         ↓ (Manually edit)
         ↓
┌────────────────────────────────────────┐
│ co2-tracker-meals: [                   │
│   {                                    │
│     id: "meal-456",                    │
│     items: [],          ← EMPTIED!     │
│     total_co2e: 0       ← ZEROED!      │
│   }                                    │
│ ]                                      │
└────────────────────────────────────────┘
         ↓ (Reload page)
         ↓
App loads and shows corrupted empty meal
No validation → Accepted ✗

Result: ✗ EMPTY MEAL LOADS WITHOUT ERROR
```

### 5. ⚠️  Impact on History View
```
History with Empty Meal:

Daily Estimate for January 2026:
┌─────────────────────────────────┐
│ January 30                       │
│ ├─ Breakfast: 2.1 kg CO2e      │
│ ├─ Lunch: 3.5 kg CO2e          │
│ └─ Total: 5.6 kg CO2e ✓        │
├─────────────────────────────────┤
│ January 31                       │
│ ├─ (empty meal): 0.0 kg ⚠️      │
│ └─ Total: 0.0 kg CO2e ❌        │
├─────────────────────────────────┤
│ February 1                       │
│ ├─ Lunch: 4.2 kg CO2e          │
│ └─ Total: 4.2 kg CO2e ✓        │
└─────────────────────────────────┘

User's Mental Model:
  "Jan 31: Did I forget to log meals?"
  "Or did I eat nothing that day?"
  → Confusion ❌
```

### 6. ⚠️  Impact on Aggregates
```
Impact on Statistics:

Meal History (3 days):
  Day 1: 2.1 + 3.5 = 5.6 kg ✓
  Day 2: (empty) = 0.0 kg ❌
  Day 3: 4.2 kg ✓

Correct Calculation:
  Total meals: 2 (breakfast + lunch only)
  Average per meal: (5.6 + 4.2) / 2 = 4.9 kg

Wrong Calculation (if empty counted):
  Total meals: 3 (including empty!)
  Average per meal: (5.6 + 0 + 4.2) / 3 = 3.27 kg

User sees: "Your average: 3.27 kg/day"
Reality: Should be 4.9 kg/day
Result: ✗ STATISTICS DISTORTED
```

### 7. ⚠️  Chart Rendering Confusion
```
History Chart Rendering:

Normal (no empty meals):
    5 kg ├─────╱╲───────╱
    4 kg ├────╱  ╲─────╱
    3 kg ├───╱    ╲───
         │
    0 kg └──────────────
         Jan  Feb  Mar

With empty meal:
    5 kg ├─────╱╲───────╱
    4 kg ├────╱  ╲─────╱
    3 kg ├───╱    ╲───
    1 kg ├─────────╱
    0 kg ├────┴────────── ← Empty meal at bottom
         │
         └──────────────
         Jan  Feb  Mar

User confusion:
  "Why does a line drop to 0 on Feb 1?"
  "Did I eat nothing? Or forget to log?"
  → Unclear what 0 means ❌
```

### 8. ✓ UI Behavior Correct
```
State Transitions:

Add item:       items=0 → items=1
Button:         HIDDEN → VISIBLE ✓

Remove item:    items=1 → items=0
Button:         VISIBLE → HIDDEN ✓

Clear meal:     items=5 → items=0
Button:         VISIBLE → HIDDEN ✓

Result: ✓ UI protection works correctly
```

---

## DEFECT SEVERITY ANALYSIS

```
Defects Found in Scenario #4:
─────────────────────────────────────

1. No Code-Level Validation [MEDIUM]
   Location: handleSave() function
   Impact: If called programmatically, empty meal saves
   Fixability: VERY EASY (1 line: if check)

2. No localStorage Validation [MEDIUM]
   Location: Data loading logic
   Impact: Corrupted empty meals load without error
   Fixability: EASY (validation function)

3. Empty Meals Skew Statistics [MEDIUM]
   Location: Aggregate calculation
   Impact: Average calculations include 0-value days
   Fixability: MEDIUM (exclude empty meals)

4. Chart Confusion [LOW]
   Location: History chart rendering
   Impact: User confused about 0-value days
   Fixability: EASY (add tooltip or mark)

Total Defects: 4 (2 MEDIUM, 2 MEDIUM, 1 LOW)
```

---

## ATTACK SURFACE

```
How to trigger empty meal save:

Method 1: DevTools Console
  ├─ Add 1 item to meal
  ├─ Click "Remove"
  ├─ Open DevTools → Console
  ├─ Use React DevTools to call handleSave()
  └─ Result: Empty meal saved ⚠️

Method 2: localStorage Edit
  ├─ Open DevTools → Application → localStorage
  ├─ Find "co2-tracker-meals" entry
  ├─ Manually edit items: [] to empty array
  ├─ Reload page
  └─ Result: Empty meal loads ⚠️

Method 3: Hypothetical Race Condition
  ├─ Click save button
  ├─ Simultaneously click remove last item
  ├─ Timing-dependent execution
  └─ Result: Might save with stale items

Risk Level: LOW-MEDIUM
  Normal users: Cannot trigger ✓
  With DevTools: Can trigger ⚠️
```

---

## CODE-LEVEL ANALYSIS

```
Current Code:
┌────────────────────────────────┐
│ function handleSave() {         │
│   const meal: Meal = {          │
│     id: crypto.randomUUID(),    │
│     date: saveDate,             │
│     label: label || null,       │
│     items: [...items],  ⚠️      │
│     total_co2e: totalCO2e,      │
│     driving_km_equivalent,      │
│   }                             │
│   setSavedMeals([...prev,meal]) │
│   setSaved(true)                │
│ }                               │
└────────────────────────────────┘

Missing:
┌────────────────────────────────┐
│ if (items.length === 0) {       │
│   return  // PREVENT SAVE       │
│ }                               │
└────────────────────────────────┘

Why it matters:
  ✗ Defensive programming missing
  ✗ Relies only on UI logic
  ✗ No code-level safeguard
  ✓ Easy to fix (1 line)
```

---

## VULNERABILITY CHAIN

```
Attack Chain:

Attacker goal: Save empty meal to history

Exploit sequence:
1. Open app in browser
2. Add 1+ items to meal
3. Remove all items (save button hides)
4. Open DevTools
5. Access React component via React DevTools
6. Call handleSave() directly
7. handleSave() has NO validation
8. Empty meal object created with items: []
9. setSavedMeals() adds it to history
10. Result: Empty meal in history ✗

Mitigations:
  [Current] UI hides button ✓
  [Missing] Code validation ✗
  [Missing] Data validation ✗

One more line of code stops this: ✓
```

---

## SUMMARY ASSESSMENT

| Aspect | Status | Notes |
|--------|--------|-------|
| **UI Protection** | ✓ Good | Button hides when empty |
| **Code Validation** | ✗ Weak | handleSave() has no guard |
| **Data Validation** | ✗ Weak | No check on load |
| **Normal User Safe** | ✓ Yes | Cannot trigger via UI |
| **Developer Safe** | ✗ No | Can bypass with DevTools |
| **Fixability** | ✓ Easy | One if-check, done |

**Overall: PARTIALLY VULNERABLE ⚠️**

---

## CONCLUSION

**Status: ⚠️ PARTIALLY VULNERABLE**
- **Severity:** MEDIUM
- **Impact:** HIGH (if empty meal saved, UX breaks)
- **User Risk:** LOW (normal users protected)
- **Fixability:** VERY EASY (1-line fix)

The app uses UI-level protection (hiding the save button) but lacks code-level validation.

**Recommendation:** Add one-line validation in handleSave():
```tsx
if (items.length === 0) return
```

This takes literally 1 minute and eliminates the entire class of bugs.

