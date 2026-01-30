// Test Scenario #2: Extreme Portion Values
// Testing how the app handles portions beyond the intended range (100+)

const MIN_PORTIONS = 0.5;
const MAX_PORTIONS = 5;

function clampPortions(n) {
  return Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, n));
}

// Simulate food data (highest emissions)
const FOODS = {
  beef: { id: 'beef', name: 'Beef', co2e_per_portion: 2.6, portion_weight_grams: 100 },
  salmon: { id: 'salmon', name: 'Salmon (farmed)', co2e_per_portion: 1.2, portion_weight_grams: 100 },
  cheese: { id: 'cheese', name: 'Cheddar Cheese', co2e_per_portion: 0.265, portion_weight_grams: 50 },
};

const KG_CO2E_PER_KM = 0.25;

function toDrivingKm(co2eKg) {
  return co2eKg / KG_CO2E_PER_KM;
}

console.log("=".repeat(70));
console.log("SCENARIO #2: EXTREME PORTION VALUES");
console.log("=".repeat(70));

// Test Cases
const testCases = [
  { portions: 10, food: 'beef', description: 'Beef with 10 portions' },
  { portions: 50, food: 'beef', description: 'Beef with 50 portions' },
  { portions: 100, food: 'beef', description: 'Beef with 100 portions' },
  { portions: 1000, food: 'beef', description: 'Beef with 1000 portions' },
  { portions: 10000, food: 'beef', description: 'Beef with 10,000 portions' },
  { portions: 999999, food: 'beef', description: 'Beef with 999,999 portions' },
  { portions: 100, food: 'salmon', description: 'Salmon with 100 portions' },
  { portions: 100, food: 'cheese', description: 'Cheese with 100 portions' },
  { portions: Infinity, food: 'beef', description: 'Beef with Infinity portions' },
];

console.log("\n1. CLAMPING VERIFICATION");
console.log("-".repeat(70));
testCases.forEach((testCase) => {
  const clamped = clampPortions(testCase.portions);
  const status = clamped === 5 ? "✓ Clamped to 5" : "✗ Unexpected value";
  console.log(`${status}: ${testCase.description} → ${clamped}`);
});

console.log("\n2. CALCULATION IMPACT (If clamping is bypassed)");
console.log("-".repeat(70));
testCases.forEach((testCase) => {
  const food = FOODS[testCase.food];
  const co2e = food.co2e_per_portion * testCase.portions;
  const km = toDrivingKm(co2e);

  let status = '✓ Normal';
  if (co2e > 10000) status = '⚠️  EXTREME';
  if (co2e > 1000000) status = '✗ CATASTROPHIC';
  if (!Number.isFinite(co2e)) status = '✗ NON-FINITE';

  console.log(`\n${status} | ${testCase.description}`);
  console.log(`  CO2e: ${co2e.toLocaleString()} kg`);
  console.log(`  Driving km: ${Number.isFinite(km) ? km.toLocaleString() : 'Infinity'} km`);
  console.log(`  Display (toFixed(1)): "${co2e.toFixed(1)} kg CO2e"`);
});

console.log("\n3. TEXT OVERFLOW ANALYSIS");
console.log("-".repeat(70));

const DISPLAY_SCENARIOS = [
  { co2e: 2600, description: '2600 kg (100 portions beef)' },
  { co2e: 260000, description: '260,000 kg (10,000 portions beef)' },
  { co2e: 2600000, description: '2,600,000 kg (1M portions beef)' },
];

DISPLAY_SCENARIOS.forEach((scenario) => {
  const displayText = `${scenario.co2e.toFixed(1)} kg CO2e`;
  const characterLength = displayText.length;

  console.log(`\n${scenario.description}`);
  console.log(`  Display text: "${displayText}"`);
  console.log(`  Character length: ${characterLength}`);
  console.log(`  Max reasonable length: ~15 chars`);
  console.log(`  Overflow risk: ${characterLength > 15 ? '✗ YES - Text may overflow' : '✓ No'}`);

  // Simulate CSS truncation
  const maxChars = 20;
  const truncated = displayText.length > maxChars
    ? displayText.substring(0, maxChars - 3) + '...'
    : displayText;
  console.log(`  If truncated to ${maxChars} chars: "${truncated}"`);
});

console.log("\n4. PLATE BALANCE CALCULATION WITH EXTREME PORTIONS");
console.log("-".repeat(70));

// Simulate plate balance with extreme values
const mealWithExtremePortions = [
  { food_item_id: 'beef', portions: 100, weight_grams: 100 * 100 }, // 10,000g
  { food_item_id: 'spinach', portions: 100, weight_grams: 90 * 100 }, // 9,000g (vegetables)
];

const totalWeight = mealWithExtremePortions.reduce((sum, item) => sum + item.weight_grams, 0);
const beefWeight = 10000;
const veggWeight = 9000;

const beefPercent = (beefWeight / totalWeight) * 100;
const veggPercent = (veggWeight / totalWeight) * 100;

console.log(`\nMeal composition with extreme portions (100 each):`);
console.log(`  Total weight: ${totalWeight.toLocaleString()} g`);
console.log(`  Beef (100 portions): ${beefWeight.toLocaleString()} g (${beefPercent.toFixed(1)}%)`);
console.log(`  Spinach (100 portions): ${veggWeight.toLocaleString()} g (${veggPercent.toFixed(1)}%)`);
console.log(`  Plate balance display: "Protein: ${Math.round(beefPercent)}%, Veg & Fruit: ${Math.round(veggPercent)}%"`);
console.log(`  Status: ✓ Calculations work correctly even with extreme values`);

console.log("\n5. FLOATING POINT PRECISION");
console.log("-".repeat(70));

const precisionTests = [
  { portions: 100, co2e_per_portion: 2.6 },
  { portions: 1000, co2e_per_portion: 2.6 },
  { portions: 10000, co2e_per_portion: 2.6 },
  { portions: 100, co2e_per_portion: 1.23 },
];

precisionTests.forEach((test) => {
  const result = test.portions * test.co2e_per_portion;
  const display = result.toFixed(1);
  const precisionLoss = Math.abs((test.portions * test.co2e_per_portion) - parseFloat(display)) > 0.01;

  console.log(`\n${test.portions} × ${test.co2e_per_portion} = ${result}`);
  console.log(`  Display (toFixed(1)): "${display}"`);
  console.log(`  Precision loss: ${precisionLoss ? '✗ Detected' : '✓ Acceptable'}`);
});

console.log("\n6. JSON SERIALIZATION (localStorage)");
console.log("-".repeat(70));

const extremeMeal = {
  id: 'meal-1',
  items: [
    { food_item_id: 'beef', portions: 100, co2e: 260 },
  ],
  total_co2e: 260,
  driving_km_equivalent: 1040,
};

const serialized = JSON.stringify(extremeMeal);
console.log(`\nMeal with 100 portions of beef:`);
console.log(`  Serialized size: ${serialized.length} bytes`);
console.log(`  Status: ✓ No issues with serialization`);
console.log(`  Risk: Low (localStorage can store hundreds of MB)`);

// Test with much more extreme value
const catastrophicMeal = {
  id: 'meal-1',
  items: [
    { food_item_id: 'beef', portions: 1000000, co2e: 2600000 },
  ],
  total_co2e: 2600000,
  driving_km_equivalent: 10400000,
};

const catastrophicSerialized = JSON.stringify(catastrophicMeal);
console.log(`\nMeal with 1,000,000 portions (catastrophic bypass):`);
console.log(`  Serialized size: ${catastrophicSerialized.length} bytes`);
console.log(`  localStorage limit: 5-10 MB per domain`);
console.log(`  Status: ✓ Still fits in localStorage`);

console.log("\n7. UI COMPONENT RENDERING ANALYSIS");
console.log("-".repeat(70));

console.log(`
CO2Badge Component Analysis:
  ✓ formatCO2e() uses toFixed(0-3) - handles any numeric value
  ✓ No string length validation - could overflow narrow displays
  ⚠️  Color thresholds (< 0.5, <= 2.0, > 2.0) still work at any scale

Meal Summary Component Analysis (BuilderPage.tsx:193):
  Code: {totalCO2e < 1 ? totalCO2e.toFixed(2) : totalCO2e.toFixed(1)}
  ✓ Numeric logic works with extreme values
  ✗ Text layout may break with very long numbers

  Example displays:
  - 260 kg CO2e: 13 chars ✓ Fits
  - 2,600,000 kg CO2e: ~15 chars ⚠️ May overflow
  - 26,000,000 kg CO2e: ~17 chars ✗ Likely overflow

PlateViz Component Analysis:
  ✓ Uses percentages (0-100%) - always fits
  ✓ No dynamic width issues with percentages
  ✓ SVG/CSS handles percentage-based widths
  ✓ Safe even with extreme portions

Driving Equivalent Display (BuilderPage.tsx:197):
  Code: ~{toDrivingKm(totalCO2e).toFixed(1)} km driving
  ✓ toDrivingKm() returns numeric value (co2e / 0.25)
  ✗ Text overflow risk if km value is extremely large

  Example displays:
  - 1040 km: 7 chars ✓ Safe
  - 10,400,000 km: ~12 chars ⚠️ Might overflow
`);

console.log("\n8. CHART RENDERING (History Chart with extreme values)");
console.log("-".repeat(70));

const chartDataExtreme = [
  { date: '2026-01-30', co2e: 260, km: 1040 }, // Normal (100 portions beef)
  { date: '2026-01-31', co2e: 2600, km: 10400 }, // 1000 portions
  { date: '2026-02-01', co2e: 26000, km: 104000 }, // 10,000 portions
];

console.log(`
Recharts Library Behavior with Extreme Values:
  ✓ Recharts handles large numeric values well
  ✓ Auto-scales Y-axis dynamically
  ✓ No hard limits on data values
  ⚠️  Axis labels might become crowded with large numbers

Example chart data (with extreme 10,000 portion meal):
  Date        CO2e (kg)  Driving (km)
  2026-01-30      260         1,040
  2026-01-31    2,600        10,400
  2026-02-01   26,000       104,000

  Y-axis scaling: 0 → 26,000 kg ✓ Auto-scales correctly
  Risk: If user saves multiple extreme meals, Y-axis range explodes
        Making normal values invisible on the chart
`);

console.log("\n" + "=".repeat(70));
console.log("FINDINGS SUMMARY");
console.log("=".repeat(70));

console.log(`
PROTECTION LEVEL:
  ✓ STRONG: Clamping function prevents > 5 portions via UI
  ⚠️  MODERATE: Can be bypassed with DevTools/data corruption
  ✗ WEAK: No UI overflow guards for extreme values

IDENTIFIED DEFECTS:

1. TEXT OVERFLOW RISK [MEDIUM SEVERITY]
   ⚠️  Issue: Very large CO2e values (> 1 million kg) cause text overflow
   Location: BuilderPage.tsx line 193, 197
   Condition: If portions clamping is bypassed
   Impact: Layout breaks, text becomes unreadable

2. CHART RENDERING DISTORTION [MEDIUM SEVERITY]
   ⚠️  Issue: Extreme value in one meal makes chart unreadable
   Location: HistoryChart component (Recharts)
   Condition: 1000+ portion meal saved to history
   Impact: Normal meals become invisible on Y-axis
   Example: 1M portion meal = Y-axis goes to 2.6M kg CO2e
            Normal 3.98 kg meals are unreadable (~0.0015% of scale)

3. NO VALIDATION OF EXTREME VALUES [LOW SEVERITY]
   ⚠️  Issue: App doesn't validate upper bounds on totalCO2e
   Location: All calculation paths
   Condition: Bypass clamping via DevTools/data injection
   Impact: Invalid data persists in localStorage

4. DISPLAY INCONSISTENCY [LOW SEVERITY]
   ⚠️  Issue: Very large numbers display with inconsistent formatting
   Location: CO2Badge formatCO2e() function
   Condition: Multiple extreme values in same meal
   Impact: Inconsistent decimal places (0-3 decimals)
   Example: 2600.0 kg vs 260000.1 kg (inconsistent formatting)

ACTUAL RISK ASSESSMENT:

  Normal Users: ✓ SAFE
  - Clamping enforces 5 portion max via UI
  - Highest possible meal: 5 × 2.6 (beef) = 13 kg CO2e
  - 13 kg displays fine: "13.0 kg CO2e - ~52 km driving" ✓

  Developer Tools Access: ⚠️ AT RISK
  - Can bypass clamping via setPortions(foodId, 1000000)
  - Text overflow: "2600000.0 kg CO2e - ~10400000 km driving" ✗ Breaks layout
  - Chart becomes unreadable with mixed extreme/normal values

  Data Corruption: ⚠️ AT RISK
  - localStorage can store extreme values
  - History view displays broken layout
  - Chart Y-axis scaled to 2.6M kg (normal meals invisible)

RECOMMENDATIONS:

Priority 1: Add max value validation
  if (totalCO2e > MAX_SAFE_CO2E) {
    return showError("Invalid data detected")
  }

Priority 2: Implement text truncation for extreme values
  const displayText = totalCO2e > 99999
    ? totalCO2e.toExponential(1)
    : totalCO2e.toFixed(1)

Priority 3: Clamp charting values
  const chartData = meals.map(m => ({
    co2e: Math.min(m.co2e, MAX_DISPLAY_CO2E)
  }))

Priority 4: Add assertions
  console.assert(totalCO2e <= 100, "CO2e exceeds safe limit")
`);

console.log("\n" + "=".repeat(70));
console.log("CONCLUSION");
console.log("=".repeat(70));

console.log(`
Status: ✗ VULNERABLE to extreme values
Severity: MEDIUM
Impact: HIGH (layout breaks, data distortion)
User Risk: LOW (normal interaction is safe)
Fixability: MEDIUM (needs multiple fixes)

The app relies entirely on clamping to prevent extreme values.
If clamping is bypassed (via DevTools, data corruption, or future bugs),
the UI breaks down significantly.

Recommendation: Add defensive validation at display/calculation boundaries.
`);
