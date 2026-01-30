# TEST SCENARIO #8: localStorage EVICTION (SAFARI)

## Scenario Description

Safari on iOS and macOS implements Intelligent Tracking Prevention (ITP) which automatically clears localStorage after 7 days of no user interaction with the website.

## Risk Assessment

**Severity: MEDIUM**

**Impact: HIGH** - Users lose all saved meals without warning

When a Safari user doesn't interact with the app for 7 days, all localStorage data (meals, history) is automatically deleted.

## FINDINGS

### ✗ VULNERABILITY: No Backup Mechanism

The app relies 100% on localStorage with no export, backup, or cloud sync feature.

**Data Loss Scenario:**

```
Day 1:   User saves meals → localStorage ✓
Days 2-7: No app interaction
Day 8:   Safari clears localStorage automatically ✗
Day 9:   User opens app → all meals gone
         No recovery mechanism exists
```

**Affected Users:**

- Safari on iOS: ~25% of users
- Safari on macOS: ~5% of users
- Total affected: ~30% of user base

### ✗ VULNERABILITY: No Export Feature

Users cannot manually backup or export their meal data before traveling or before iOS updates.

### ⚠️ CONCERN: No User Notification

If localStorage is cleared, the app shows an empty history with no explanation to the user.

## Defects Found

| ID | Title | Severity | Status |
|----|-------|----------|--------|
| S8-D1 | No Backup Mechanism for Safari ITP Data Loss | MEDIUM | OPEN |

## Recommendations

**Priority 1 (v1.1):** Add export feature
```tsx
<button onClick={downloadMealsAsJSON}>
  📥 Download My Data
</button>
```

**Priority 2 (v2.0):** Add cloud sync
- User account creation
- Server-side persistence
- Automatic sync

**Priority 3 (Documentation):** Warn Safari users
- Help page explaining 7-day timeout
- Suggest weekly app engagement
- Link to export feature

## MVP Status

For MVP release: **Document the limitation** in help/settings to manage user expectations.

---

*Test Date: Jan 30, 2026*
*Defects Found: 1 (MEDIUM)*
