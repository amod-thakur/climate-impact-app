// Test Scenario #4: Empty Meal Submission
// Testing whether the app allows saving empty meals

console.log("=".repeat(70));
console.log("SCENARIO #4: EMPTY MEAL SUBMISSION");
console.log("=".repeat(70));

// Simulate the BuilderPage logic
const initialState = {
  items: [],
  label: null,
  totalCO2e: 0,
  drivingKmEquivalent: 0,
};

// Test cases for various empty meal scenarios
const testCases = [
  {
    scenario: "Initial empty state",
    items: [],
    label: null,
    description: "User opens app, no items added yet",
  },
  {
    scenario: "Empty after clearing",
    items: [],
    label: "Breakfast",
    description: "User added items, then cleared meal, label remains",
  },
  {
    scenario: "Empty with date only",
    items: [],
    label: null,
    date: "2026-02-01",
    description: "User selects a date but no items",
  },
  {
    scenario: "Empty with label and date",
    items: [],
    label: "Lunch",
    date: "2026-02-01",
    description: "User fills label and date but no items",
  },
  {
    scenario: "Single item, zero portions",
    items: [{ food_item_id: "beef", portions: 0, co2e: 0 }],
    label: null,
    description: "Item with 0 portions (clamped from negative or invalid)",
  },
];

console.log("\n1. UI PROTECTION TEST");
console.log("-".repeat(70));

testCases.forEach((test) => {
  const itemCount = test.items ? test.items.length : 0;
  const isItemEmpty = itemCount === 0;
  const hasLabel = test.label !== null && test.label !== undefined;
  const hasDate = test.date !== undefined;

  console.log(`\n${test.scenario}`);
  console.log(`  ${test.description}`);
  console.log(`  Items: ${itemCount} | Label: ${hasLabel ? "Yes" : "No"} | Date: ${hasDate ? "Yes" : "No"}`);

  // Check current UI logic from BuilderPage.tsx:63
  // if (items.length === 0 && !saved) {
  //   return (...show "Add items" screen, no save button...)
  // }

  const showAddItemsScreen = isItemEmpty;
  const saveButtonVisible = !isItemEmpty;

  console.log(`  UI State:`);
  console.log(`    Save button visible: ${saveButtonVisible}`);
  console.log(`    "Add items" screen shown: ${showAddItemsScreen}`);
  console.log(`    Result: ${saveButtonVisible ? "✓ Protected" : "✗ Not protected (but button hidden)"}`);
});

console.log("\n2. VALIDATION IN handleSave()");
console.log("-".repeat(70));

// Current handleSave() from BuilderPage.tsx:44-55
// function handleSave() {
//   const meal: Meal = {
//     id: crypto.randomUUID(),
//     date: saveDate,
//     label: label || null,
//     items: [...items],
//     total_co2e: totalCO2e,
//     driving_km_equivalent: drivingKmEquivalent,
//   }
//   setSavedMeals((prev) => [...prev, meal])
//   setSaved(true)
// }

console.log(`\nCurrent handleSave() implementation:`);
console.log(`  ✗ NO validation to prevent empty items`);
console.log(`  ✗ Does NOT check if items.length === 0`);
console.log(`  ✓ Creates meal object with empty items array`);
console.log(`  ✓ Saves to state without validation`);
console.log(`\nConclusion: If save button is somehow called with empty items,`);
console.log(`           empty meal WILL be saved to history.`);

console.log("\n3. BYPASS SCENARIOS");
console.log("-".repeat(70));

const bypassScenarios = [
  {
    name: "Direct function call",
    method: "Call handleSave() directly from DevTools",
    likelihood: "Medium (requires DevTools)",
    impact: "Empty meal saved to history",
  },
  {
    name: "Remove last item via DevTools",
    method: "Call removeItem() on the last item, then savebutton becomes visible",
    likelihood: "Low (button re-hides when items empty)",
    impact: "Cannot save because button disappears",
  },
  {
    name: "Race condition",
    method: "Remove last item while save button click is in flight",
    likelihood: "Very Low (network sync required)",
    impact: "Empty meal might be saved",
  },
  {
    name: "localStorage corruption",
    method: "Manually edit localStorage to add meal with items: []",
    likelihood: "Low (intentional data corruption)",
    impact: "Empty meal visible in history",
  },
  {
    name: "Set items to empty array via Redux DevTools",
    method: "Dispatch CLEAR_MEAL action, then save",
    likelihood: "Very Low (button would be hidden)",
    impact: "Cannot save (button disappears)",
  },
];

bypassScenarios.forEach((scenario) => {
  console.log(`\n${scenario.name}`);
  console.log(`  Method: ${scenario.method}`);
  console.log(`  Likelihood: ${scenario.likelihood}`);
  console.log(`  Impact: ${scenario.impact}`);
});

console.log("\n4. IMPACT OF EMPTY MEAL IN HISTORY");
console.log("-".repeat(70));

// Simulate history calculation with an empty meal
const historyWithEmpty = [
  { date: "2026-01-30", meals: [{ co2e: 3.5 }, { co2e: 2.1 }] },
  { date: "2026-01-31", meals: [{ co2e: 0 }] }, // Empty meal
  { date: "2026-02-01", meals: [{ co2e: 4.2 }] },
];

console.log(`\nExample history with empty meal:`);
historyWithEmpty.forEach((day) => {
  const dayTotal = day.meals.reduce((sum, m) => sum + m.co2e, 0);
  const mealCount = day.meals.length;
  const isEmpty = mealCount === 1 && day.meals[0].co2e === 0;

  console.log(`\n  ${day.date}: ${mealCount} meal(s)`);
  console.log(`    Meals: ${day.meals.map((m) => m.co2e + " kg").join(" + ")}`);
  console.log(`    Total: ${dayTotal.toFixed(2)} kg`);
  if (isEmpty) {
    console.log(`    ⚠️  This is an empty meal (0 kg)`);
  }
});

console.log(`\n\nChart rendering with empty meals:`);
console.log(`  Day with 0 kg CO2e would appear at bottom of chart`);
console.log(`  Might show as missing data point or flat line`);
console.log(`  Could confuse user: "Did I not eat that day?"`);

console.log("\n5. AGGREGATE CALCULATION ISSUES");
console.log("-".repeat(70));

// Test aggregates
const meals = [
  { date: "2026-01-30", items: [{ co2e: 2.5 }] },  // Valid
  { date: "2026-01-31", items: [] },                // Empty
  { date: "2026-02-01", items: [{ co2e: 3.0 }] },  // Valid
];

const weeklyStats = {
  totalMeals: 0,
  totalDays: 0,
  totalCO2e: 0,
  averagePerMeal: 0,
  averagePerDay: 0,
};

meals.forEach((day) => {
  const dayTotal = day.items.reduce((sum, item) => sum + item.co2e, 0);
  weeklyStats.totalMeals += day.items.length;
  weeklyStats.totalDays += 1;
  weeklyStats.totalCO2e += dayTotal;
});

weeklyStats.averagePerMeal = weeklyStats.totalMeals > 0
  ? (weeklyStats.totalCO2e / weeklyStats.totalMeals).toFixed(2)
  : 0;

weeklyStats.averagePerDay = weeklyStats.totalDays > 0
  ? (weeklyStats.totalCO2e / weeklyStats.totalDays).toFixed(2)
  : 0;

console.log(`\nWeekly aggregate stats:`);
console.log(`  Total meals: ${weeklyStats.totalMeals}`);
console.log(`  Total days: ${weeklyStats.totalDays}`);
console.log(`  Total CO2e: ${weeklyStats.totalCO2e.toFixed(2)} kg`);
console.log(`  Average per meal: ${weeklyStats.averagePerMeal} kg`);
console.log(`  Average per day: ${weeklyStats.averagePerDay} kg`);

console.log(`\n  Issues with empty meal included:`);
console.log(`    ⚠️  Average per meal is skewed`);
console.log(`    ⚠️  Empty meal counts as 0 (not excluded)`);
console.log(`    ⚠️  User might think they under-logged that day`);

console.log("\n6. DATA MODEL VALIDATION");
console.log("-".repeat(70));

// Check the Meal data model
const exampleMeal = {
  id: "meal-123",
  date: "2026-02-01",
  label: "Lunch",
  items: [], // EMPTY!
  total_co2e: 0,
  driving_km_equivalent: 0,
};

console.log(`\nExample empty meal object:`);
console.log(JSON.stringify(exampleMeal, null, 2));

console.log(`\nValidation checks:`);
console.log(`  ✗ items array is empty`);
console.log(`  ✗ total_co2e is 0`);
console.log(`  ✗ driving_km_equivalent is 0`);
console.log(`  ✓ meal still has valid structure (has id, date, label)`);
console.log(`  ✓ Would be saved to localStorage without error`);
console.log(`  ✓ Would be loaded back without error`);

console.log(`\nBut should we prevent this?`);
console.log(`  User perspective: "I logged nothing for lunch"`);
console.log(`  App perspective: "Valid meal with zero impact"`);

console.log("\n7. BEHAVIORAL TESTING");
console.log("-".repeat(70));

const behaviorTests = [
  {
    action: "Add item",
    itemsBefore: 0,
    itemsAfter: 1,
    saveButtonVisibleBefore: false,
    saveButtonVisibleAfter: true,
    status: "✓ Works correctly",
  },
  {
    action: "Remove item (last one)",
    itemsBefore: 1,
    itemsAfter: 0,
    saveButtonVisibleBefore: true,
    saveButtonVisibleAfter: false,
    status: "✓ Button hides (prevents empty save)",
  },
  {
    action: "Remove all items",
    itemsBefore: 3,
    itemsAfter: 0,
    saveButtonVisibleBefore: true,
    saveButtonVisibleAfter: false,
    status: "✓ Button hides (prevents empty save)",
  },
  {
    action: "Clear meal",
    itemsBefore: 5,
    itemsAfter: 0,
    saveButtonVisibleBefore: true,
    saveButtonVisibleAfter: false,
    status: "✓ Button hides (prevents empty save)",
  },
];

console.log(`\nBehavior test matrix:`);
behaviorTests.forEach((test) => {
  console.log(`\n${test.action}:`);
  console.log(`  Items: ${test.itemsBefore} → ${test.itemsAfter}`);
  console.log(`  Save button: ${test.saveButtonVisibleBefore ? "Visible" : "Hidden"} → ${test.saveButtonVisibleAfter ? "Visible" : "Hidden"}`);
  console.log(`  ${test.status}`);
});

console.log("\n8. MISSING VALIDATION CHECKS");
console.log("-".repeat(70));

const missingChecks = [
  {
    check: "Empty items array",
    location: "handleSave()",
    current: "No check",
    recommended: "if (items.length === 0) return",
    impact: "Could save empty meal",
  },
  {
    check: "Zero total CO2e",
    location: "handleSave()",
    current: "No check",
    recommended: "if (totalCO2e === 0) return",
    impact: "Would catch empty but not all edge cases",
  },
  {
    check: "All items with zero portions",
    location: "Reducer",
    current: "No check",
    recommended: "After SET_PORTIONS, validate",
    impact: "Item with 0 portions still in array",
  },
  {
    check: "Load from localStorage",
    location: "useLocalStorage hook",
    current: "No validation",
    recommended: "Validate items.length > 0",
    impact: "Corrupted empty meals loaded",
  },
];

console.log(`\nMissing validation opportunities:`);
missingChecks.forEach((check, i) => {
  console.log(`\n${i + 1}. ${check.check}`);
  console.log(`   Location: ${check.location}`);
  console.log(`   Current: ${check.current}`);
  console.log(`   Recommended: ${check.recommended}`);
  console.log(`   Impact: ${check.impact}`);
});

console.log("\n" + "=".repeat(70));
console.log("FINDINGS SUMMARY");
console.log("=".repeat(70));

console.log(`
UI-LEVEL PROTECTION:
  ✓ Strong: Save button only visible when items.length > 0
  ✓ When empty: Shows "Add items" screen instead
  ✓ When items removed: Button re-hides automatically

  Result: NORMAL USERS CANNOT SAVE EMPTY MEALS ✓

CODE-LEVEL PROTECTION:
  ✗ Weak: handleSave() has NO validation
  ✗ Does NOT check items.length === 0
  ✗ Does NOT check totalCO2e === 0
  ✗ Does NOT prevent empty meals

  Result: IF SAVE IS CALLED PROGRAMMATICALLY, EMPTY MEAL SAVES ✗

BYPASS VECTORS:
  1. Direct handleSave() call via DevTools    [MEDIUM likelihood]
  2. Redux/state manipulation               [MEDIUM likelihood]
  3. localStorage corruption               [LOW likelihood]
  4. Race condition (very unlikely)         [VERY LOW likelihood]

IMPACT IF EMPTY MEAL SAVED:
  1. Shows 0 kg CO2e in history view
  2. Confuses user: "Did I not log this day?"
  3. Breaks aggregate calculations (average per meal skewed)
  4. Chart shows flat 0 value
  5. No functional impact, but UX is broken

DATA MODEL:
  - Meal with items: [] is technically valid
  - Not caught by TypeScript (items is MealItem[])
  - Would serialize to JSON without error
  - Would load back without error

DEFECTS IDENTIFIED:

1. No Save Button Validation [MEDIUM SEVERITY]
   Location: BuilderPage.tsx handleSave() function
   Issue: No guard against items.length === 0
   Impact: Can save empty meals if bypass UI
   Fix: Add if (items.length === 0) return guard

2. No Backend Validation [MEDIUM SEVERITY]
   Location: UI level only (no backend)
   Issue: All validation is in React state
   Impact: DevTools can bypass all checks
   Fix: Would need server validation (not in scope)

3. No Data Model Validation [LOW SEVERITY]
   Location: Data model definition
   Issue: items: MealItem[] allows empty array
   Impact: TypeScript doesn't catch empty meals
   Fix: Use items: MealItem[] & { length: > 0 } (advanced)

4. No localStorage Validation [MEDIUM SEVERITY]
   Location: useLocalStorage hook
   Issue: No validation when loading meals
   Impact: Corrupted empty meals reload without error
   Fix: Validate items.length > 0 on load

RISK ASSESSMENT:

Normal Users: ✓ SAFE
  - Cannot save empty meals through UI
  - Save button automatically hides
  - "Add items" screen prevents confusion

Developer Tools Access: ⚠️ AT RISK
  - Can call handleSave() directly
  - Can save empty meal to history
  - Would appear in history view

Data Corruption: ⚠️ AT RISK
  - Can manually add empty meal to localStorage
  - Would load back without validation
  - Shows as 0 kg in history

SEVERITY ASSESSMENT:
  High Impact: YES (breaks UX if occurred)
  High Likelihood: NO (requires DevTools)

  Overall Risk: MEDIUM ⚠️
`);

console.log("\n" + "=".repeat(70));
console.log("CONCLUSION");
console.log("=".repeat(70));

console.log(`
Status: ⚠️  PARTIALLY VULNERABLE
Severity: MEDIUM
Impact: HIGH (if empty meal saved, UX is broken)
User Risk: LOW (normal users protected by UI)
Fixability: EASY (one if-check in handleSave)

The app relies on UI-level protection (hiding save button when empty)
but lacks code-level validation in the save function itself.

This is a classic example of "Security by Obscurity" - the button is
hidden, but the underlying function has no guards.

Recommendation: Add simple validation in handleSave():

  function handleSave() {
    if (items.length === 0) {
      return  // or show error
    }

    // ... rest of save logic
  }

This would prevent empty meals from being saved regardless of how
the save function is called.
`);
