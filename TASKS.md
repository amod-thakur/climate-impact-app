# CO2 Food Tracker — Implementation Tasks

Tickets organized by epic. Dependencies listed per ticket. Priority: P0 (must-have
blocker), P1 (must-have), P2 (should-have), P3 (nice-to-have).

Implementation order: Epics 1 → 2 → 3 → 4 → 5 → 6 → 7 (with parallelism within epics
where dependencies allow).

---

## Epic 1: Project Foundation

### T-01 · Scaffold Vite + React + TypeScript project

**Priority:** P0
**Dependencies:** None
**Description:**
Initialize the project using `npm create vite@latest` with the React + TypeScript
template. Verify the dev server starts and a blank page renders.

**Acceptance Criteria:**
- [ ] `npm run dev` starts dev server without errors
- [ ] `npm run build` produces a production bundle
- [ ] TypeScript strict mode enabled in `tsconfig.json`
- [ ] Project structure: `src/`, `public/`, `index.html`

---

### T-02 · Configure Tailwind CSS

**Priority:** P0
**Dependencies:** T-01
**Description:**
Install and configure Tailwind CSS v3 with Vite. Set up the base config with
mobile-first breakpoints. Purge unused styles in production.

**Acceptance Criteria:**
- [ ] Tailwind utility classes render correctly in dev
- [ ] Production build purges unused CSS
- [ ] `tailwind.config.js` exists with content paths set
- [ ] Base styles applied (font, background, text color)

---

### T-03 · Set up client-side routing

**Priority:** P0
**Dependencies:** T-01
**Description:**
Install a lightweight router (Wouter preferred, React Router v6 acceptable). Create
4 route shells that render placeholder text.

**Routes:**
- `/` → ExplorerPage
- `/build` → BuilderPage
- `/history` → HistoryPage
- `/settings` → SettingsPage

**Acceptance Criteria:**
- [ ] All 4 routes render their placeholder component
- [ ] Browser back/forward buttons work
- [ ] Direct URL navigation works (e.g., opening `/build` directly)
- [ ] 404/unknown routes redirect to `/`

---

### T-04 · Set up Vitest + React Testing Library

**Priority:** P1
**Dependencies:** T-01
**Description:**
Install Vitest and React Testing Library. Configure `vitest.config.ts` for the
jsdom environment. Write one smoke test that renders `<App />` without crashing.

**Acceptance Criteria:**
- [ ] `npm test` runs Vitest successfully
- [ ] Smoke test passes: `<App />` renders without error
- [ ] Test coverage reporting available via `npm run test:coverage`
- [ ] `.test.tsx` / `.test.ts` file pattern recognized

---

### T-05 · Configure ESLint + Prettier

**Priority:** P2
**Dependencies:** T-01
**Description:**
Set up ESLint with the recommended TypeScript + React rules. Add Prettier for
formatting. Ensure no conflicts between ESLint and Prettier.

**Acceptance Criteria:**
- [ ] `npm run lint` passes with zero warnings on scaffolded code
- [ ] Prettier formats on save (editor config or script)
- [ ] ESLint catches unused variables and missing React imports
- [ ] `.eslintrc` and `.prettierrc` committed

---

## Epic 2: Data & State Layer

### T-06 · Define TypeScript types for data model

**Priority:** P0
**Dependencies:** T-01
**Description:**
Create `src/types.ts` with all types from the data model in REQUIREMENTS.md §9:
`FoodItem`, `Meal`, `MealItem`, `DailyEstimate`, `FoodCategory`, `SubCategory`,
`WeightBasis`, `GHGType`.

**Acceptance Criteria:**
- [ ] All types from REQUIREMENTS.md §9 defined
- [ ] Union types for `category`, `sub_category`, `weight_basis`, `dominant_ghg`
- [ ] `DailyEstimate` is a derived type (not stored), clearly documented
- [ ] No `any` types

---

### T-07 · Create static food data module (45 items)

**Priority:** P0
**Dependencies:** T-06
**Description:**
Create `src/data/foods.ts` exporting a `FOODS: FoodItem[]` array with all 45 items
from REQUIREMENTS.md §5. Every field populated including `ghg_note`,
`data_source`, and `data_source_url`.

**Acceptance Criteria:**
- [ ] 45 items total: 15 veg/fruit + 7 grains + 23 protein (7 plant + 4 animal + 4 dairy + 5 common additions + 3 animal = check §5 counts)
- [ ] Each item has all `FoodItem` fields populated (no undefined/null except where schema allows)
- [ ] `co2e_per_portion` matches `co2e_per_kg × portion_weight_grams / 1000`
- [ ] All `data_source_url` fields contain valid URLs from §14
- [ ] TypeScript compiles without errors
- [ ] Unit test: `FOODS.length === 45`
- [ ] Unit test: every item has a unique `id`

---

### T-08 · Implement useLocalStorage hook

**Priority:** P0
**Dependencies:** T-01
**Description:**
Create `src/hooks/useLocalStorage.ts` — a generic custom hook that syncs React
state with localStorage. Handles JSON serialization/deserialization.

**API:** `const [value, setValue] = useLocalStorage<T>(key: string, initialValue: T)`

**Acceptance Criteria:**
- [ ] State persists across page refreshes
- [ ] Returns `initialValue` when key doesn't exist in localStorage
- [ ] Handles JSON parse errors gracefully (falls back to initialValue)
- [ ] `setValue` updates both React state and localStorage synchronously
- [ ] Unit tests: set/get/fallback/invalid-JSON scenarios

---

### T-09 · Implement useMealBuilder hook

**Priority:** P0
**Dependencies:** T-06
**Description:**
Create `src/hooks/useMealBuilder.ts` using `useReducer`. Manages the in-memory
state of a meal being built (not persisted — lost on page refresh, that's expected).

**Actions:**
- `ADD_ITEM(foodItemId)` — adds item with 1 portion (or increments if already present)
- `REMOVE_ITEM(foodItemId)` — removes item from meal
- `SET_PORTIONS(foodItemId, portions)` — sets portion count (0.5–5 range)
- `CLEAR_MEAL` — resets to empty meal
- `SET_LABEL(label)` — sets optional meal label

**Derived state (computed, not stored):**
- `totalCO2e` — sum of all items' CO2e
- `drivingKmEquivalent` — totalCO2e / 0.25
- `plateBalance` — % of veg/fruit, grains, protein by weight
- `swapSuggestion` — highest-impact swap (see T-10)

**Acceptance Criteria:**
- [ ] All 5 actions work correctly
- [ ] Portions clamped to 0.5–5 range
- [ ] Derived values recalculate on every state change
- [ ] `CLEAR_MEAL` resets everything including label
- [ ] Unit tests for each action and derived calculation

---

### T-10 · Create utility functions (emissions, equivalents, swap)

**Priority:** P0
**Dependencies:** T-06, T-07
**Description:**
Create utility modules in `src/utils/`:

- **`equivalents.ts`** — `toDrivingKm(co2eKg: number): number` (divides by 0.25),
  `toCanadianDailyPercent(co2eKg: number): number` (divides by 3.98),
  `formatEquivalent(co2eKg: number): string` (returns human-readable driving string)
- **`swap.ts`** — `findSwap(mealItems: MealItem[], foods: FoodItem[]): SwapSuggestion | null`
  Implements the single swap rule from REQUIREMENTS.md §8
- **`backup.ts`** — `exportData(): string` (JSON blob of all localStorage keys),
  `importData(json: string): boolean` (validate + write to localStorage),
  `triggerDownload(json: string, filename: string): void`

**Acceptance Criteria:**
- [ ] `toDrivingKm(1.0)` returns `4.0`
- [ ] `toCanadianDailyPercent(3.98)` returns `100`
- [ ] Swap returns `null` when delta ≤ 0.1 kg
- [ ] Swap finds the highest-CO2e item and suggests lowest in same category
- [ ] Swap uses `sub_category` for protein (plant vs animal vs dairy)
- [ ] Backup export includes all localStorage keys
- [ ] Backup import validates schema before writing
- [ ] Unit tests for all edge cases

---

## Epic 3: Shared UI Components

### T-11 · NavBar component

**Priority:** P1
**Dependencies:** T-02, T-03
**Description:**
Create `src/components/NavBar.tsx` — bottom tab bar on mobile, side navigation on
desktop. 4 tabs: Explorer (home icon), Builder (plate icon), History (chart icon),
Settings (gear icon).

**Acceptance Criteria:**
- [ ] Active tab highlighted
- [ ] Bottom-fixed on mobile (< 768px)
- [ ] Side navigation on desktop (≥ 768px)
- [ ] Tapping a tab navigates to the correct route
- [ ] Accessible: keyboard navigable, proper aria labels

---

### T-12 · CO2Badge component

**Priority:** P1
**Dependencies:** T-02, T-10
**Description:**
Create `src/components/CO2Badge.tsx` — displays a CO2e value with its driving km
equivalent. Used on food cards, meal summaries, and history items.

**Props:** `co2eKg: number`, `size?: "sm" | "md" | "lg"`

**Acceptance Criteria:**
- [ ] Displays CO2e value formatted to 2 decimal places for small values, 1 for large
- [ ] Shows driving km equivalent below/beside the value
- [ ] Three sizes for different contexts
- [ ] Color-coded: green (< 0.5), amber (0.5–2.0), red (> 2.0) per portion

---

### T-13 · FoodCard component

**Priority:** P1
**Dependencies:** T-02, T-06, T-12
**Description:**
Create `src/components/FoodCard.tsx` — displays one food item with its emission
data. Used in the Food Explorer list.

**Props:** `food: FoodItem`, `onAddToMeal: (id: string) => void`

**Acceptance Criteria:**
- [ ] Shows: name, portion description, CO2Badge, dominant GHG label
- [ ] Expandable detail: data source, source URL (link), ghg_note
- [ ] "Add to Meal" button calls `onAddToMeal`
- [ ] Accessible: screen reader reads food name and emission value

---

### T-14 · PlateViz component

**Priority:** P1
**Dependencies:** T-02, T-06
**Description:**
Create `src/components/PlateViz.tsx` — visual representation of CFG plate
proportions for a meal. Shows the actual breakdown of veg/fruit, grains, protein
by weight, compared to the CFG ideal (½, ¼, ¼).

**Props:** `items: MealItem[]` (with resolved FoodItem data)

**Acceptance Criteria:**
- [ ] Renders a plate or bar visual showing 3 segments
- [ ] CFG ideal proportions shown as reference (½ veg, ¼ grain, ¼ protein)
- [ ] Actual meal proportions shown alongside
- [ ] Informational only — no warnings or enforcement
- [ ] Handles empty meal state gracefully
- [ ] Accessible: alt text describes the proportions

---

### T-15 · SwapCard component

**Priority:** P1
**Dependencies:** T-02, T-10
**Description:**
Create `src/components/SwapCard.tsx` — displays the one-swap suggestion from §8.

**Props:** `suggestion: SwapSuggestion | null`

**Acceptance Criteria:**
- [ ] Renders nothing when suggestion is `null`
- [ ] Shows: current item name, suggested item name, CO2e savings, driving km saved
- [ ] Neutral tone: "Swapping to [Y] would save..." (not "you should")
- [ ] Visually distinct from other content (card with subtle highlight)

---

## Epic 4: Core Features (R1–R5)

### T-16 · Food Explorer page (R1)

**Priority:** P0
**Dependencies:** T-07, T-11, T-12, T-13
**Description:**
Build the landing page at `/`. Displays all 45 food items with search, sort, and
category filtering. This is the first thing users see — must deliver the "aha
moment" in < 30 seconds.

**Acceptance Criteria:**
- [ ] All 45 items displayed, grouped by CFG category tabs
- [ ] Default sort: CO2e per portion, lowest to highest
- [ ] Sort options: by emissions (asc/desc), alphabetical, by category
- [ ] Type-ahead search filters items by name in real-time
- [ ] Each item shows CO2Badge + "Add to Meal" button
- [ ] Tapping an item expands to show detail (source, GHG note)
- [ ] Empty search state shows "No items match" message
- [ ] Page loads and renders in < 1 second (static data, no async)

---

### T-17 · Meal Builder page (R2)

**Priority:** P0
**Dependencies:** T-09, T-10, T-12, T-14, T-15
**Description:**
Build the meal builder at `/build`. Users add food items, adjust portions, and
see live-updating CO2e totals with plate balance and swap suggestion.

**Acceptance Criteria:**
- [ ] Shows list of items added to the current meal
- [ ] Each item has a portion adjuster (0.5–5 in 0.5 steps)
- [ ] Remove button per item
- [ ] Live-updating total: CO2e kg + driving km equivalent
- [ ] PlateViz shows CFG plate proportions for this meal
- [ ] SwapCard shows (or hides) based on swap rule
- [ ] "Clear Meal" button resets all items
- [ ] Empty state: "Add items from the Explorer to build a meal"
- [ ] Accessible: portion adjuster usable via keyboard

---

### T-18 · Save to Daily Estimate (R3)

**Priority:** P0
**Dependencies:** T-08, T-17
**Description:**
Add save functionality to the Meal Builder. After building a meal, the user can
save it to a date with an optional label.

**Acceptance Criteria:**
- [ ] "Save to Daily Estimate" button appears when meal has ≥ 1 item
- [ ] Date defaults to today, selectable via date input
- [ ] Optional label: freeform text or quick picks (Breakfast, Lunch, Dinner, Snack)
- [ ] Saving writes to localStorage via useLocalStorage hook
- [ ] Multiple meals can be saved to the same date
- [ ] After save: confirmation message + "Clear & build another" option
- [ ] Saved meal includes all items, portions, total CO2e, and driving km
- [ ] UI says "Daily Estimate" not "Daily Total"

---

### T-19 · History page (R4)

**Priority:** P1
**Dependencies:** T-08, T-12
**Description:**
Build the history view at `/history`. Shows past daily estimates in a list with
a trend chart.

**Acceptance Criteria:**
- [ ] List of past days with saved meals, newest first
- [ ] Each day shows: date, number of meals, total CO2e, driving km equivalent
- [ ] Expandable day detail shows individual meals and their items
- [ ] Line chart (Recharts) of last 7 days and 30 days (toggle)
- [ ] Reference line on chart at 3.98 kg CO2e/day ("Canadian average")
- [ ] Empty state: "No saved estimates yet. Build a meal to get started."
- [ ] Recharts lazy-loaded (React.lazy + Suspense)
- [ ] No targets, no judgments — reference line is purely contextual

---

### T-20 · Onboarding modal (R5)

**Priority:** P1
**Dependencies:** T-02, T-08
**Description:**
Single-screen onboarding modal shown on first app launch. Introduces the concept
and links to Explorer.

**Acceptance Criteria:**
- [ ] Shows on first visit (checks `onboarding_seen` in localStorage)
- [ ] Displays 4 key messages from REQUIREMENTS.md §R5
- [ ] [Start Exploring] button dismisses modal and navigates to `/`
- [ ] Sets `onboarding_seen = true` in localStorage
- [ ] Never shows again after dismissed
- [ ] Accessible: focus trapped in modal, Escape key closes it
- [ ] Dismissible via background click or X button

---

## Epic 5: Settings & Data Durability

### T-21 · Settings page layout

**Priority:** P1
**Dependencies:** T-02, T-03
**Description:**
Build the settings page at `/settings`. Container page for backup, storage status,
and data source links.

**Acceptance Criteria:**
- [ ] Clean layout with sections for: Backup, Storage, About/Sources
- [ ] Links to all data sources from REQUIREMENTS.md §14 (open in new tab)
- [ ] App version displayed (read from package.json or env var)

---

### T-22 · JSON export (backup)

**Priority:** P1
**Dependencies:** T-10, T-21
**Description:**
"Export my data" button on Settings page. Exports all saved meals as a
downloadable JSON file.

**Acceptance Criteria:**
- [ ] Button triggers browser file download
- [ ] File named `co2-tracker-backup-YYYY-MM-DD.json`
- [ ] JSON includes all saved meals + metadata (export date, app version)
- [ ] File is valid JSON, parseable back by the import function
- [ ] Works on Chrome, Safari, Firefox (mobile + desktop)

---

### T-23 · JSON import (restore)

**Priority:** P1
**Dependencies:** T-10, T-21
**Description:**
"Import data" on Settings page. File picker for a previously exported JSON file.
Validates and restores data.

**Acceptance Criteria:**
- [ ] File input accepts `.json` files only
- [ ] Validates schema before importing (rejects malformed data)
- [ ] Shows preview: "This backup contains X meals from Y dates. Import?"
- [ ] On confirm: writes to localStorage, updates app state
- [ ] On invalid file: clear error message, no data overwritten
- [ ] Asks whether to merge with or replace existing data

---

### T-24 · Storage persistence request + warning

**Priority:** P2
**Dependencies:** T-08
**Description:**
On first launch, call `navigator.storage.persist()`. If denied (Safari), show a
one-time warning nudging the user to use Export for backup.

**Acceptance Criteria:**
- [ ] `persist()` called on first launch
- [ ] If granted: no warning shown, `storage_persisted = true` stored
- [ ] If denied: one-time banner "Your browser may clear saved data after inactivity. Use Export in Settings to back up."
- [ ] Banner dismissible, not shown again
- [ ] Handles browsers that don't support `persist()` gracefully

---

## Epic 6: PWA & Offline

### T-25 · Configure vite-plugin-pwa + Workbox

**Priority:** P1
**Dependencies:** T-01
**Description:**
Install `vite-plugin-pwa`. Configure Workbox for precaching all static assets.
CacheFirst strategy for app shell. The app must be 100% functional offline after
first load.

**Acceptance Criteria:**
- [ ] Service worker generated on `npm run build`
- [ ] All static assets (HTML, JS, CSS, icons) precached
- [ ] App loads and works fully offline (airplane mode test)
- [ ] Update detection: new version available prompt when SW updates
- [ ] Dev mode: SW disabled to avoid caching issues during development

---

### T-26 · Web app manifest

**Priority:** P1
**Dependencies:** T-01
**Description:**
Create `manifest.json` with app name, icons, theme color, background color,
display mode (standalone), and start URL (`/`).

**Acceptance Criteria:**
- [ ] App installable on Android (Add to Home Screen prompt)
- [ ] App installable on iOS (via Safari Share → Add to Home Screen)
- [ ] Icons: 192×192 and 512×512 PNG (simple leaf/plate icon placeholder)
- [ ] `theme_color` and `background_color` set
- [ ] `start_url: "/"` and `display: "standalone"`
- [ ] Splash screen renders correctly on install

---

### T-27 · Offline verification test

**Priority:** P2
**Dependencies:** T-25, T-16, T-17, T-18, T-19
**Description:**
End-to-end verification that every feature works offline after first load.

**Acceptance Criteria:**
- [ ] Browse all 45 items offline
- [ ] Build a meal offline
- [ ] Save a meal offline
- [ ] View history offline
- [ ] Export data offline
- [ ] All of the above tested on Chrome + Safari

---

## Epic 7: Quality & Polish

### T-28 · Accessibility audit (WCAG 2.1 AA)

**Priority:** P1
**Dependencies:** T-16, T-17, T-18, T-19, T-20
**Description:**
Audit all pages against WCAG 2.1 AA. Fix all violations.

**Acceptance Criteria:**
- [ ] All interactive elements keyboard-navigable
- [ ] Focus management: modals trap focus, page transitions move focus
- [ ] Color contrast ratios meet AA (4.5:1 text, 3:1 large text)
- [ ] Screen reader: all images have alt text, all buttons have labels
- [ ] Portion adjuster announces current value to screen readers
- [ ] No Axe/Lighthouse accessibility violations at AA level

---

### T-29 · Mobile responsiveness pass

**Priority:** P1
**Dependencies:** T-16, T-17, T-18, T-19
**Description:**
Verify all pages render correctly on mobile viewports (320px–428px). Fix layout
breaks, touch targets, and readability issues.

**Acceptance Criteria:**
- [ ] No horizontal scroll on any page at 320px width
- [ ] Touch targets ≥ 44×44px (WCAG)
- [ ] Text readable without zooming (≥ 16px body text)
- [ ] FoodCard, MealItemRow, and chart all fit in mobile viewport
- [ ] Bottom nav doesn't overlap content

---

### T-30 · Cross-browser testing

**Priority:** P2
**Dependencies:** T-25, T-27
**Description:**
Test on Chrome, Safari, Firefox, Edge (last 2 versions as per NFR). Fix any
browser-specific issues.

**Acceptance Criteria:**
- [ ] All features work on Chrome (desktop + Android)
- [ ] All features work on Safari (desktop + iOS)
- [ ] All features work on Firefox (desktop)
- [ ] All features work on Edge (desktop)
- [ ] PWA install works on Chrome Android + Safari iOS
- [ ] localStorage persistence verified on each browser

---

### T-31 · Performance audit (< 3s on 3G)

**Priority:** P1
**Dependencies:** T-25, T-16
**Description:**
Run Lighthouse audit. Ensure first meaningful paint under 3 seconds on simulated
3G. Optimize if needed (code splitting, image optimization, lazy loading).

**Acceptance Criteria:**
- [ ] Lighthouse Performance score ≥ 90
- [ ] First Contentful Paint < 2s on 3G throttling
- [ ] Time to Interactive < 3s on 3G throttling
- [ ] Bundle size check: critical path < 70 KB gzipped
- [ ] Recharts lazy-loaded, not in critical path
- [ ] No render-blocking resources

---

### T-32 · Integration test suite

**Priority:** P2
**Dependencies:** T-16, T-17, T-18, T-19, T-20
**Description:**
Write integration tests covering the core user flows:

1. Explorer → add item → Builder shows item
2. Build meal → adjust portions → total updates
3. Build meal → save → appears in History
4. Export data → import data → meals restored
5. First visit → onboarding shows → dismiss → doesn't show again

**Acceptance Criteria:**
- [ ] All 5 flows tested with RTL
- [ ] Tests mock localStorage (not actual browser storage)
- [ ] Tests pass in CI (no browser-specific dependencies)
- [ ] Coverage: hooks + utils at 90%+, pages at 70%+

---

## Dependency Graph

```
T-01 (scaffold)
├── T-02 (Tailwind)
│   ├── T-11 (NavBar)
│   ├── T-12 (CO2Badge) ← T-10
│   ├── T-13 (FoodCard) ← T-06, T-12
│   ├── T-14 (PlateViz) ← T-06
│   └── T-15 (SwapCard) ← T-10
├── T-03 (routing)
│   └── T-21 (Settings page)
│       ├── T-22 (export) ← T-10
│       └── T-23 (import) ← T-10
├── T-04 (Vitest)
├── T-05 (ESLint)
├── T-06 (types)
│   ├── T-07 (food data)
│   ├── T-09 (useMealBuilder)
│   └── T-10 (utilities) ← T-07
├── T-08 (useLocalStorage)
│   ├── T-18 (save R3) ← T-17
│   ├── T-20 (onboarding)
│   └── T-24 (persist warning)
├── T-25 (PWA Workbox)
│   └── T-26 (manifest)
│       └── T-27 (offline test) ← all features
└── T-16 (Explorer R1) ← T-07, T-11, T-12, T-13
    └── T-17 (Builder R2) ← T-09, T-14, T-15
        └── T-18 (Save R3)
            └── T-19 (History R4) ← T-08, T-12

Quality (after all features):
T-28 (a11y), T-29 (mobile), T-30 (browsers), T-31 (performance), T-32 (tests)
```

---

## Suggested Implementation Order

Phase 1 — **Foundation** (can be done in one sitting):
`T-01` → `T-02` + `T-03` + `T-04` + `T-05` (parallel) → `T-06`

Phase 2 — **Data & Logic** (no UI yet, fully testable):
`T-07` + `T-08` (parallel) → `T-09` + `T-10` (parallel)

Phase 3 — **Shared Components** (buildable in isolation):
`T-11` + `T-12` + `T-13` + `T-14` + `T-15` (parallel — all independent)

Phase 4 — **Core Pages** (sequential, each builds on previous):
`T-16` (Explorer) → `T-17` (Builder) → `T-18` (Save) → `T-19` (History) → `T-20` (Onboarding)

Phase 5 — **Settings & Durability:**
`T-21` → `T-22` + `T-23` (parallel) → `T-24`

Phase 6 — **PWA:**
`T-25` + `T-26` (parallel) → `T-27`

Phase 7 — **Quality:**
`T-28` + `T-29` + `T-30` + `T-31` (parallel) → `T-32`

---

## Ticket Count Summary

| Epic | Tickets | P0 | P1 | P2 |
|------|---------|----|----|-----|
| 1. Foundation | 5 | 3 | 1 | 1 |
| 2. Data & State | 5 | 5 | 0 | 0 |
| 3. UI Components | 5 | 0 | 5 | 0 |
| 4. Core Features | 5 | 3 | 2 | 0 |
| 5. Settings | 4 | 0 | 3 | 1 |
| 6. PWA | 3 | 0 | 2 | 1 |
| 7. Quality | 5 | 0 | 3 | 2 |
| **Total** | **32** | **11** | **16** | **5** |
