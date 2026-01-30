# SCENARIO #6: PLATE BALANCE EDGE CASES - VISUAL SUMMARY

## Division by Zero Protection

```
Empty Meal:
┌─────────────────────────────────────────┐
│ computePlateBalance([])                 │
│   totalWeight = 0                       │
│                                         │
│   if (totalWeight === 0) {              │
│     return { veg: 0, grain: 0, ... }    │
│   }                    ↑                │
│                  Guard prevents         │
│                  division by zero       │
│                                         │
│ Result: [0%, 0%, 0%] ✓                 │
└─────────────────────────────────────────┘
```

## Single-Category Meal: All Vegetables

```
Meal Composition:
  Spinach:     200g (vegetables)
  Tomatoes:    150g (vegetables)
  Carrots:     100g (vegetables)
  ─────────────────────────
  Total:       450g (all vegetables)

Calculation:
  vegetables = 450g / 450g × 100 = 100% ✓
  grains     = 0g   / 450g × 100 = 0%
  protein    = 0g   / 450g × 100 = 0%

Visualization:

Your meal:
███████████████████████████████████████████ 100%
(Single green color fills entire bar)

CFG ideal:
██████████████████  ██████████  ██████████
Veg 50%              Grains 25%  Protein 25%

Legend:
🟩 Vegetables: 100% (ideal 50%)
⬜ Grains: 0% (ideal 25%)
🟥 Protein: 0% (ideal 25%)
```

## Single-Category Meal: All Protein

```
Meal Composition:
  Chicken:     200g (protein)
  Tofu:        200g (protein)
  ─────────────────────────
  Total:       400g (all protein)

Calculation:
  vegetables = 0%
  grains     = 0%
  protein    = 100% ✓

Visualization:

Your meal:
🟥🟥🟥🟥🟥🟥🟥🟥🟥🟥 100%
(Single red color)

CFG ideal:
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩 50%
🟨🟨🟨🟨🟨 25%
🟥🟥🟥🟥🟥 25%
```

## Single-Item Meal

```
Meal:
  Oats: 50g (whole grains)

Result:
  vegetables = 0%
  grains     = 100% ✓
  protein    = 0%

The single item fills 100% of its category
```

## Edge Cases

### Very Low Weight

```
Meal: Carrots × 0.001 portions = 0.1g

Calculation: 0.1g / 0.1g × 100 = 100%
Status: ✓ Works correctly
```

### Zero Weight

```
Meal: (empty)

totalWeight = 0
Guard: if (totalWeight === 0) return zeros
Status: ✓ Protected
```

## Code Structure

```tsx
// PlateViz.tsx:37-65
function computePlateBalance(items: MealItem[]) {
  // ... calculate totalWeight ...

  if (totalWeight === 0) {
    return { veg: 0, grain: 0, protein: 0 }  // ← GUARD
  }

  // Safe to divide because totalWeight > 0
  return {
    veg: (weightByCategory.veg / totalWeight) * 100,
    // ... other categories ...
  }
}
```

## Key Findings

| Aspect | Status | Notes |
|--------|--------|-------|
| Division by zero | ✓ Protected | Line 55 guard |
| Single category | ✓ Correct | Shows 100% |
| Floating-point | ✓ Safe | Uses Math.round |
| Rendering | ✓ Works | Single color bar |
| Ideal comparison | ✓ Useful | Shows imbalance |

## Visual Rendering

Single-category meal bar is unusual but intentional:

```
Normal balanced meal:
🟩🟩🟩🟩🟩  🟨🟨  🟥🟥
50%         25%  25%
(Multiple colors)

Single-category meal:
🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩🟩
100%
(Single color - unusual but clear)
```

## Conclusion

✓ **NO DEFECTS FOUND**

The plate balance calculation is well-designed with:
- Explicit division-by-zero guard
- Accurate percentage calculations
- Safe floating-point handling
- Meaningful visualization even with single category
- Clear comparison to Canada's Food Guide

Status: **EXCELLENT - EXEMPLARY IMPLEMENTATION**
