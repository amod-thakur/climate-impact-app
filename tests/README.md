# QA Edge Case Testing

Comprehensive edge case testing for the CO2 Food Tracker application to identify defects and vulnerabilities.

## Test Structure

```
tests/
├── README.md                          # This file
├── TEST_INDEX.md                      # Master index of all scenarios
└── scenario-1/                        # Invalid Portion Quantities
    ├── TEST_SCENARIO_1_REPORT.md      # Full technical analysis
    ├── SCENARIO_1_VISUAL_SUMMARY.md   # Visual breakdown
    └── test-scenario-1.js             # Executable test file
```

## Testing Approach

- **Manual Code Analysis**: Review source code for vulnerabilities
- **Edge Case Testing**: Test boundary conditions and invalid inputs
- **State Flow Analysis**: Trace how invalid data propagates through the app
- **Impact Assessment**: Evaluate severity and real-world impact
- **Root Cause Analysis**: Identify why defects occur

## Test Execution

### Running Scenario Tests

```bash
# Run JavaScript tests
node tests/scenario-1/test-scenario-1.js

# View detailed reports
cat tests/scenario-1/TEST_SCENARIO_1_REPORT.md
cat tests/scenario-1/SCENARIO_1_VISUAL_SUMMARY.md
```

## Test Scenarios

| # | Scenario | Status | Severity |
|---|----------|--------|----------|
| 1 | Invalid Portion Quantities | ✗ VULNERABLE | MEDIUM |
| 2 | Extreme Portion Values | ⏳ PENDING | - |
| 3 | Floating-Point Precision | ⏳ PENDING | - |
| 4 | Empty Meal Submission | ⏳ PENDING | - |
| 5 | Duplicate Food Items | ⏳ PENDING | - |
| 6 | Plate Balance Edge Cases | ⏳ PENDING | - |
| 7 | No Valid Swap Available | ⏳ PENDING | - |
| 8 | localStorage Eviction (Safari) | ⏳ PENDING | - |
| 9 | Date/Timezone Issues | ⏳ PENDING | - |
| 10 | Malformed Meal Labels | ⏳ PENDING | - |
| 11 | Race Condition (Add/Remove) | ⏳ PENDING | - |

## Defects Found

### SCENARIO 1: Invalid Portion Quantities
**Status:** ✗ VULNERABLE
**Severity:** MEDIUM

**Defects:**
1. NaN Propagation Bug - NaN values break calculations
2. No localStorage Validation - Invalid data not checked on load
3. Missing Type Guards - Reducer accepts invalid types

**Impact:** High (breaks UI), Low (normal users safe)

## Reporting Format

Each scenario includes:
- **REPORT**: Full technical analysis with code evidence
- **VISUAL_SUMMARY**: Easy-to-read breakdown with diagrams
- **TEST_FILE**: Executable test/verification code
- **FINDINGS**: List of defects with severity levels

## Next Steps

1. Complete remaining 10 scenarios
2. Consolidate all defects into master list
3. Prioritize fixes by severity
4. Create GitHub issues for each defect
5. Assign to development team

## Notes

- App runs at: http://localhost:5173/leetcode-assistant/
- All tests conducted in development environment
- No modifications made to source code during testing
- Tests are non-destructive and reversible
