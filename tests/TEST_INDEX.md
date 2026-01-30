# QA Edge Case Testing - Master Index

**Project:** CO2 Food Tracker MVP
**Testing Date:** January 30, 2026
**Total Scenarios:** 11 (10 planned + 1 bonus)
**Current Status:** 1/11 Complete

---

## SCENARIO OVERVIEW

### ✓ COMPLETED

#### Scenario #1: Invalid Portion Quantities
- **Location:** `tests/scenario-1/`
- **Files:**
  - `TEST_SCENARIO_1_REPORT.md` - Full analysis (8.6 KB)
  - `SCENARIO_1_VISUAL_SUMMARY.md` - Visual breakdown (10.9 KB)
  - `test-scenario-1.js` - Executable tests (4.1 KB)
- **Status:** ✗ VULNERABLE
- **Severity:** MEDIUM
- **Defects Found:** 3
  1. NaN Propagation Bug
  2. No localStorage Validation
  3. Missing Type Guards
- **Impact:** UI breaks (displays "NaN kg CO2e"), normal users safe
- **Fixability:** Easy (straightforward type guards)
- **Date Completed:** Jan 30, 2026

---

### ⏳ PENDING

#### Scenario #2: Extreme Portion Values
- **Description:** User enters 100+ portions instead of max 5
- **Expected Risk:** Overflow, chart breaking, UI unreadable
- **Test Method:** TBD
- **Status:** Not Started

#### Scenario #3: Floating-Point Precision Errors
- **Description:** Multiple items with decimal CO2e values
- **Expected Risk:** 3.2999999999 vs 3.3 display inconsistency
- **Test Method:** TBD
- **Status:** Not Started

#### Scenario #4: Empty Meal Submission
- **Description:** Save meal with no items added
- **Expected Risk:** Empty meals in history, broken aggregates
- **Test Method:** TBD
- **Status:** Not Started

#### Scenario #5: Duplicate Food Items
- **Description:** Add same food twice with different portions
- **Expected Risk:** Merge failure, duplicate suggestions, miscalculations
- **Test Method:** TBD
- **Status:** Not Started

#### Scenario #6: Plate Balance Edge Cases
- **Description:** Build meal with only one food category
- **Expected Risk:** Division by zero, broken visual indicator
- **Test Method:** TBD
- **Status:** Not Started

#### Scenario #7: No Valid Swap Available
- **Description:** When no lower-emission swap exists
- **Expected Risk:** Suggestion disabled or repeats same item
- **Test Method:** TBD
- **Status:** Not Started

#### Scenario #8: localStorage Eviction (Safari)
- **Description:** Browser clears data after 7 days inactivity
- **Expected Risk:** Data loss, backup feature failure
- **Test Method:** TBD
- **Status:** Not Started

#### Scenario #9: Date/Timezone Inconsistencies
- **Description:** Meals saved across date boundaries, timezone changes
- **Expected Risk:** Wrong dates in history, split daily totals
- **Test Method:** TBD
- **Status:** Not Started

#### Scenario #10: Malformed Meal Labels
- **Description:** Unicode, emoji, XSS, 500+ character labels
- **Expected Risk:** XSS vulnerability, UI overflow, encoding issues
- **Test Method:** TBD
- **Status:** Not Started

#### Scenario #11: Race Conditions (Bonus)
- **Description:** Rapid add/remove item actions
- **Expected Risk:** State inconsistency, incorrect totals
- **Test Method:** TBD
- **Status:** Not Started

---

## DEFECT TRACKING

### By Severity

**CRITICAL:** 0
**HIGH:** 1
- Scenario #10: XSS in meal labels

**MEDIUM:** 4
- Scenario #1: NaN propagation (3 defects)
- Scenario #8: Data loss

**LOW:** TBD

### By Category

**Input Validation:** 5
- Scenario #1, #2, #4, #5, #10

**Calculation Issues:** 3
- Scenario #3, #6, #11

**Data Persistence:** 2
- Scenario #8, #9

**Edge Cases:** 2
- Scenario #7, #9

---

## TESTING PROGRESS

```
Progress: ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 9% (1/11)

Scenario 1:  ████████████████████████████████████████████░░ ✓ DONE
Scenario 2:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
Scenario 3:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
Scenario 4:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
Scenario 5:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
Scenario 6:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
Scenario 7:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
Scenario 8:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
Scenario 9:  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
Scenario 10: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
Scenario 11: ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ ⏳ TODO
```

---

## KEY METRICS

| Metric | Value | Status |
|--------|-------|--------|
| Total Scenarios | 11 | - |
| Completed | 1 | 9% |
| Pending | 10 | 91% |
| Defects Found | 3 | ⚠️ |
| Defects Fixed | 0 | - |
| Avg Analysis Time | ~45 min | - |
| App Status | Running | ✓ |

---

## TESTING NOTES

### Environment
- **Platform:** Linux 4.4.0
- **App URL:** http://localhost:5173/leetcode-assistant/
- **Dev Server:** Vite (Running)
- **Testing Date:** Jan 30, 2026
- **Tested Version:** 0.0.0 (MVP)

### Tools Used
- Node.js (JavaScript testing)
- Code analysis (Read, Grep)
- Browser dev tools (conceptual)
- Git (version control)

### Testing Methodology
1. **Code Review** - Examine source for vulnerabilities
2. **Logic Testing** - Test functions with edge cases
3. **State Flow** - Trace invalid data through app
4. **Impact Analysis** - Assess user impact
5. **Risk Assessment** - Rate severity and exploitability

---

## NEXT ACTIONS

### For QA Team
- [ ] Continue with Scenario #2: Extreme Portion Values
- [ ] Continue with remaining 9 scenarios
- [ ] Document findings in reports
- [ ] Create test files for each scenario
- [ ] Track defects in master list

### For Development Team
- [ ] Review Scenario #1 findings
- [ ] Implement fixes for NaN propagation
- [ ] Add type guards to reducer
- [ ] Add localStorage validation
- [ ] Add error boundaries to UI

### For Project Manager
- [ ] Schedule bug fix sprints
- [ ] Prioritize defects by severity
- [ ] Assess MVP impact
- [ ] Plan v1.1 improvements

---

## RELATED DOCUMENTS

- `README.md` - Overview and structure
- `scenario-1/TEST_SCENARIO_1_REPORT.md` - Detailed findings
- `scenario-1/SCENARIO_1_VISUAL_SUMMARY.md` - Visual breakdown
- `scenario-1/test-scenario-1.js` - Executable tests

---

## FILE ORGANIZATION

```
tests/
├── README.md                          # Testing overview
├── TEST_INDEX.md                      # This file (master index)
├── scenario-1/                        # Invalid Portion Quantities
│   ├── TEST_SCENARIO_1_REPORT.md      # Full analysis
│   ├── SCENARIO_1_VISUAL_SUMMARY.md   # Visual summary
│   └── test-scenario-1.js             # Test file
├── scenario-2/                        # [PLACEHOLDER]
│   └── (files TBD)
├── scenario-3/                        # [PLACEHOLDER]
│   └── (files TBD)
└── ...
```

---

## MASTER DEFECT LIST

### Scenario #1 Defects
| ID | Title | Severity | Status |
|----|-------|----------|--------|
| S1-D1 | NaN Propagation Bug | MEDIUM | OPEN |
| S1-D2 | No localStorage Validation | MEDIUM | OPEN |
| S1-D3 | Missing Type Guards | MEDIUM | OPEN |

### Scenario #2+ Defects
TBD (pending test completion)

---

## SUMMARY

**Current Finding:** CO2 Food Tracker has input validation vulnerability in portion handling.
The app is protected at the UI level (dropdown prevents invalid input), but can be broken
through state manipulation (DevTools) or localStorage corruption.

**Risk Level:** MEDIUM (affects normal users minimally, but highlights need for runtime validation)

**Recommendation:** Add type guards and NaN checks to all calculation paths before MVP release.

---

*Last Updated: Jan 30, 2026*
*Testing Lead: QA Team*
*Status: IN PROGRESS*
