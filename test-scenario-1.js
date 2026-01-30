// Test Scenario #1: Invalid Portion Quantities
// Testing the clampPortions function behavior with edge cases

const MIN_PORTIONS = 0.5;
const MAX_PORTIONS = 5;

function clampPortions(n) {
  return Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, n));
}

console.log("=".repeat(60));
console.log("SCENARIO #1: INVALID PORTION QUANTITIES");
console.log("=".repeat(60));

const testCases = [
  { input: 0, expected: 0.5, description: "Zero portions" },
  { input: -5, expected: 0.5, description: "Negative portions" },
  { input: -0.5, expected: 0.5, description: "Negative decimal" },
  { input: 100, expected: 5, description: "Extremely high (100)" },
  { input: 999, expected: 5, description: "Extremely high (999)" },
  { input: NaN, expected: "NaN", description: "NaN input" },
  { input: Infinity, expected: 5, description: "Infinity input" },
  { input: -Infinity, expected: 0.5, description: "-Infinity input" },
  { input: "abc", expected: "NaN (string coercion)", description: "String input 'abc'" },
  { input: "5", expected: 5, description: "String input '5' (coerced to number)" },
  { input: undefined, expected: "NaN", description: "Undefined input" },
  { input: null, expected: 0.5, description: "Null input (coerced to 0)" },
  { input: true, expected: 0.5, description: "Boolean true (coerced to 1)" },
  { input: false, expected: 0.5, description: "Boolean false (coerced to 0)" },
  { input: {}, expected: "NaN", description: "Object input" },
  { input: [], expected: 0.5, description: "Empty array (coerced to 0)" },
];

console.log("\nTesting clampPortions function:");
console.log("-".repeat(60));

testCases.forEach((testCase) => {
  const result = clampPortions(testCase.input);
  const isNaN = Number.isNaN(result);
  const resultStr = isNaN ? "NaN" : result;
  const passed = isNaN && testCase.expected === "NaN"
    ? "✓ PASS"
    : resultStr === testCase.expected
    ? "✓ PASS"
    : "✗ FAIL";

  console.log(`\n[${passed}] ${testCase.description}`);
  console.log(`  Input:    ${JSON.stringify(testCase.input)}`);
  console.log(`  Expected: ${testCase.expected}`);
  console.log(`  Got:      ${resultStr}`);
});

console.log("\n" + "=".repeat(60));
console.log("FINDINGS:");
console.log("=".repeat(60));

console.log(`
1. ZERO & NEGATIVE VALUES:
   ✓ Clamping works: 0, -5, -0.5 all get clamped to MIN (0.5)

2. EXTREME HIGH VALUES:
   ✓ Clamping works: 100, 999, Infinity all get clamped to MAX (5)

3. NaN/INVALID INPUTS:
   ⚠️  ISSUE FOUND: NaN input returns NaN
       - clampPortions(NaN) = NaN
       - This breaks calculations: co2e = food.co2e_per_portion * NaN = NaN

4. STRING INPUTS:
   ⚠️  ISSUE FOUND: Non-numeric strings return NaN
       - clampPortions("abc") = NaN
       - If reducer receives action.portions as string, it becomes NaN

5. BOOLEAN/NULL/OBJECT INPUTS:
   - null coerces to 0 (then clamped to 0.5) ✓
   - true coerces to 1 (clamped correctly) ✓
   - false coerces to 0 (clamped to 0.5) ✓
   - {} and other objects return NaN ⚠️

RISK ASSESSMENT:
   HIGH RISK: NaN can propagate through calculations
   - If setPortions receives NaN, the meal total becomes NaN
   - MealItem.co2e becomes NaN
   - totalCO2e in plate balance becomes NaN
   - UI displays "NaN kg CO2e"
   - Driving equivalent calculation fails

ATTACK VECTOR:
   The UI uses a controlled dropdown, so direct NaN cannot be entered
   via the UI. However, if:
   - Browser DevTools are used to call setPortions(foodId, NaN)
   - Or if data is corrupted in localStorage
   - Or if Redux Devtools are used to inject invalid state
   Then NaN propagates through the app.

UI OBSERVATIONS FROM CODE:
   - BuilderPage uses <select> with PORTION_STEPS values only
   - No text input for portions exists
   - Portions are set via onChange event on select element
   - Select converts value to Number via Number(e.target.value)

CONCLUSION:
   The UI is well-protected against invalid inputs because:
   1. Dropdown restricts valid values
   2. Number() conversion is used

   However, programmatic calls to setPortions() with invalid values
   can bypass validation and cause NaN to propagate.
`);
