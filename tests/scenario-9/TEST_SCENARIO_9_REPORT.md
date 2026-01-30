# TEST SCENARIO #9: DATE/TIMEZONE INCONSISTENCIES

## Scenario Description

Testing what happens when meals are saved across date boundaries or when users travel across timezones.

## Risk Assessment

**Severity: MEDIUM**

The app uses `new Date().toISOString().split('T')[0]` which converts to UTC, not local time.

## FINDINGS

### ✗ VULNERABILITY: Timezone-Aware Date Handling Missing

**Problem Code:**

```ts
const [saveDate, setSaveDate] = useState(() => {
  return new Date().toISOString().split('T')[0]  // ← Uses UTC, not local
})
```

**Impact:**

```
User in UTC-8 at 11:55 PM on 2026-01-30:
  Local time:   2026-01-30 23:55:00
  UTC time:     2026-01-31 07:55:00
  App saves as: 2026-01-31 ← Wrong date!

Result: Meal appears on next day in history
```

### ✗ VULNERABILITY: Timezone Change Not Handled

When users travel, dates don't adjust to new timezone:

```
Step 1: Save meals in EST (UTC-5)
  Meals stored with dates 2026-01-30

Step 2: Travel to JST (UTC+9)
  Local time is 2026-01-31
  Meals still show 2026-01-30
  Daily totals appear split/wrong

Result: User confusion about meal history
```

### ✗ IMPACT: Daily Aggregates Are Wrong

With timezone misalignment:

```
True meals: Jan 30 (breakfast, lunch), Jan 31 (dinner)
Stored as:  Jan 29, Jan 29, Jan 31
Grouped by: Jan 28-Feb 2 range shows wrong grouping
User sees: "My Jan 30 total is wrong"
```

## Defects Found

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| S9-D1 | Timezone-aware date handling missing | MEDIUM | OPEN |

## Fix Recommendation

Replace timezone-naive code:

```ts
// Current (WRONG):
new Date().toISOString().split('T')[0]

// Correct:
new Date().toLocaleDateString('en-CA', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
})

// Or use library:
import { format } from 'date-fns'
format(new Date(), 'yyyy-MM-dd')
```

## MVP Status

For MVP: Add warning if user's timezone is not UTC.

---

*Test Date: Jan 30, 2026*
*Defects Found: 1 (MEDIUM)*
